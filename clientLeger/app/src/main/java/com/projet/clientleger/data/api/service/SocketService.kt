package com.projet.clientleger.data.api.service
import android.app.Service
import android.content.Intent
import android.os.IBinder


class SocketService: Service() {
    override fun onBind(intent: Intent?): IBinder? {
        return null
    }


}