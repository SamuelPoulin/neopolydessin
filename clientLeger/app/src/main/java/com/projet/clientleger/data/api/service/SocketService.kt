package com.projet.clientleger.data.api.service
import android.app.Service
import android.content.Intent
import android.os.Binder
import android.os.IBinder
import com.projet.clientleger.data.model.MessageChat
import com.projet.clientleger.utils.ChatListener
import io.socket.client.IO
import io.socket.client.Socket
import io.socket.emitter.Emitter
import kotlinx.serialization.json.Json
import org.json.JSONObject
import java.net.URISyntaxException

//"http://10.0.2.2:3205"
//"http://p3-204-dev.duckdns.org/"
const val SOCKET_ROUTE = "http://p3-204-dev.duckdns.org/"
class SocketService: Service() {
    private var mSocket: Socket? = try {
        val options: IO.Options = IO.Options()
        options.transports = arrayOf("websocket")
        options.upgrade = false
        IO.socket(SOCKET_ROUTE, options)
    } catch (e: URISyntaxException) { null }

    private var chatListener: ChatListener? = null
    private val binder: IBinder = LocalBinder()

    inner class LocalBinder : Binder() {
        // Return this instance of MyService so clients can call public methods
        fun getService(): SocketService = this@SocketService
    }

    override fun onBind(intent: Intent?): IBinder? {
        return binder
    }

    override fun onCreate() {
        super.onCreate()
        println("------------------------------------------------------------------------------$mSocket")
        mSocket?.on("connect", Emitter.Listener { println("socket started-----------------------------------------------------------------------------------------------" + mSocket?.connected()) })
        mSocket?.on("disconnect", Emitter.Listener { println("socket stopped-----------------------------------------------------------------------------------------------" + mSocket?.connected()) })
        //mSocket?.on("ReceiveMsg", Emitter.Listener { parameter -> {println(parameter)} })
        mSocket?.on("ReceiveMsg") { args -> run { println("$mSocket---------------------------------------------------- msg received-" + Json.decodeFromString(MessageChat.serializer(), (args[0] as JSONObject).toString()))
            chatListener?.receiveMsg()} }
        mSocket?.connect()
        //println("socket started-----------------------------------------------------------------------------------------------" + mSocket?.connected())
    }

    override fun onDestroy() {
        super.onDestroy()
        println("------------------------------------------------------------------------------$mSocket --------------------- destroy")
    }

    fun setCallbacks(listener: ChatListener?){
        chatListener = listener
        println("setCallbakcs-$chatListener------------------------------------")
    }

}