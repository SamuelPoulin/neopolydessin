package com.projet.clientleger.data.api.service
import android.app.Service
import android.content.Intent
import android.os.IBinder
import io.socket.client.IO
import io.socket.client.Socket
import java.net.URISyntaxException

//"http://p3-204-dev.duckdns.org/"
const val SOCKET_ROUTE = "192.168.50.1"
class SocketService: Service() {
    private var mSocket: Socket? = try { IO.socket(SOCKET_ROUTE)} catch (e: URISyntaxException) { null }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    override fun onCreate() {
        super.onCreate()
        println(mSocket)
        mSocket?.connect()
        println("socket started-----------------------------------------------------------------------------------------------")
    }
}