package com.omnisync.agent

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED ||
            intent.action == "android.intent.action.QUICKBOOT_POWERON") {

            // Auto-start sync service when phone reboots - no user interaction needed
            val serviceIntent = Intent(context, SyncForegroundService::class.java).apply {
                putExtra("SERVER_URL", Constants.DEFAULT_SERVER_URL)
                putExtra("DEVICE_NAME", Build.MODEL)
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
        }
    }
}
