package com.projet.clientleger.data.api.service
import android.app.Service
import android.content.Intent
import android.os.IBinder
import io.socket.client.IO
import io.socket.client.Socket
import java.net.URISyntaxException

const val SOCKET_ROUTE = ""
class SocketService: Service() {
    private var mSocket: Socket? = try { IO.socket(SOCKET_ROUTE)} catch (e: URISyntaxException) { null }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onCreate() {
        super.onCreate()
        mSocket?.connect()
    }
}