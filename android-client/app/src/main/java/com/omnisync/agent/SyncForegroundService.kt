package com.omnisync.agent

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Build
import android.os.Environment
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.StatFs
import android.os.BatteryManager
import android.provider.Settings
import androidx.core.app.NotificationCompat
import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONObject

class SyncForegroundService : Service() {

    private var socket: Socket? = null
    private val CHANNEL_ID = "OmniSyncChannel"
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
                sendDevicePing()
            }

            socket?.on("remote_command") { args ->
                if (args.isNotEmpty()) {
                    handleRemoteCommand(args[0] as JSONObject)
                }
            }

            socket?.on(Socket.EVENT_DISCONNECT) {
                // Will auto reconnect via Socket.IO reconnection logic
            }

            socket?.connect()

        } catch (e: Exception) {
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
                put("status", "online")
                put("lastSeen", "Just now (Live)")
                put("timestamp", System.currentTimeMillis())
            }
            socket?.emit("device_ping", data)
            socket?.emit("join_device", deviceId)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

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
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> {
                    if (capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_NOT_METERED)) "5G" else "4G/5G Cellular"
                }
                capabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> "Ethernet"
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
            "get_battery" -> {
                val data = JSONObject().apply {
                    put("battery", getBatteryLevel())
                }
                socket?.emit("device_response", data)
            }
        }
    }

    private fun schedulePeriodicPing() {
        pingHandler.postDelayed({
            if (socket != null && socket!!.connected()) {
                sendDevicePing()
            }
            schedulePeriodicPing()
        }, 15_000) // Send live telemetry every 15 seconds
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
