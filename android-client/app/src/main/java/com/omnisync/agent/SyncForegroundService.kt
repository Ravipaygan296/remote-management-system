package com.omnisync.agent

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat
import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONObject

class SyncForegroundService : Service() {

    private var socket: Socket? = null
    private val CHANNEL_ID = "OmniSyncChannel"
    private val reconnectHandler = Handler(Looper.getMainLooper())
    private var serverUrl = Constants.DEFAULT_SERVER_URL
    private var deviceName = Build.MODEL

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        serverUrl = intent?.getStringExtra("SERVER_URL") ?: Constants.DEFAULT_SERVER_URL
        deviceName = intent?.getStringExtra("DEVICE_NAME") ?: Build.MODEL

        // Start persistent quiet notification - no popup alerts
        val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("OmniSync Sync Active")
            .setContentText("Background sync running — $deviceName")
            .setSmallIcon(android.R.drawable.stat_notify_sync_noanim)
            .setOngoing(true)          // Cannot be dismissed by user swipe
            .setPriority(NotificationCompat.PRIORITY_MIN)  // Collapsed/silent in shade
            .build()

        startForeground(1001, notification)

        // Connect socket and start sync
        connectSocket()

        // Auto-reconnect heartbeat every 30 seconds if disconnected
        scheduleReconnect()

        return START_STICKY
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
            val data = JSONObject().apply {
                put("deviceId", "device_${Build.SERIAL.takeLast(6)}")
                put("deviceName", deviceName)
                put("model", Build.MODEL)
                put("brand", Build.BRAND)
                put("os", "Android ${Build.VERSION.RELEASE}")
                put("batteryLevel", getBatteryLevel())
                put("status", "online")
                put("timestamp", System.currentTimeMillis())
            }
            socket?.emit("device_ping", data)
            socket?.emit("join_device", "device_${Build.SERIAL.takeLast(6)}")
        } catch (e: Exception) {
            e.printStackTrace()
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

    private fun getBatteryLevel(): Int {
        val batteryManager = getSystemService(Context.BATTERY_SERVICE) as android.os.BatteryManager
        return batteryManager.getIntProperty(android.os.BatteryManager.BATTERY_PROPERTY_CAPACITY)
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
                NotificationManager.IMPORTANCE_MIN  // Silent — no sound or vibration
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
        socket?.disconnect()
        // Restart self if killed
        val restartIntent = Intent(this, SyncForegroundService::class.java)
        startService(restartIntent)
        super.onDestroy()
    }
}
