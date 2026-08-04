package com.omnisync.agent

import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val tvStatus: TextView = findViewById(R.id.tvStatus)
        val btnStartSync: Button = findViewById(R.id.btnStartSync)

        val serverUrl = Constants.DEFAULT_SERVER_URL
        val deviceName = Build.MODEL

        // AUTOMATICALLY START SERVICE ON LAUNCH (Zero typing required!)
        startSyncService(serverUrl, deviceName)

        tvStatus.text = "Connected & Syncing to Cloud Server:\n$serverUrl"

        btnStartSync.setOnClickListener {
            startSyncService(serverUrl, deviceName)
            Toast.makeText(this, "Sync Service Re-Started!", Toast.LENGTH_SHORT).show()
        }
    }

    private fun startSyncService(serverUrl: String, deviceName: String) {
        val intent = Intent(this, SyncForegroundService::class.java).apply {
            putExtra("SERVER_URL", serverUrl)
            putExtra("DEVICE_NAME", deviceName)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }
    }
}
