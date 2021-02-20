package com.projet.clientleger.data.api.service

import android.app.Service
import android.content.Intent
import android.os.*
import com.projet.clientleger.BuildConfig
import com.projet.clientleger.data.model.Message
import com.projet.clientleger.data.model.MessageChat
import io.reactivex.rxjava3.core.Observable
import io.socket.client.Ack
import io.socket.client.IO
import io.socket.client.Socket
import kotlinx.serialization.json.Json
import org.json.JSONObject
import java.net.URISyntaxException

//"http://10.0.2.2:3205"
//"http://p3-204-dev.duckdns.org/"
const val SOCKET_ROUTE = "http://p3-204-dev.duckdns.org/"

class SocketService : Service() {

    lateinit var socket: Socket;
    private val binder = LocalBinder()

    inner class LocalBinder : Binder() {
        fun getService(): SocketService {
            return this@SocketService;
        }
    }

    override fun onBind(intent: Intent?): IBinder? {
        return binder;
    }

    override fun onCreate() {
        super.onCreate()
        try {
            val options: IO.Options = IO.Options()
            options.transports = arrayOf("websocket")
            options.upgrade = false
            socket = IO.socket(BuildConfig.SERVER_URL, options)
            println(BuildConfig.SERVER_URL)
        } catch (e: URISyntaxException) {
            null
        }
        socket.connect()
        println("socket connected!!!!!!")
    }

    fun receiveMessage(): Observable<MessageChat> {
        return receiveFromSocket("ReceiveMsg") { received ->
            Json.decodeFromString(
                MessageChat.serializer(),
                (received[0] as JSONObject).toString()
            )
        }
    }

    fun sendMessage(msg: MessageChat) {
        val obj: JSONObject = JSONObject()
        obj.put("user", msg.user)
        obj.put("content", msg.content)
        obj.put("timestamp", msg.timestamp)
        socket?.emit("SendMsg", obj)
    }

    fun receivePlayerConnection(): Observable<Message> {
        return receiveFromSocket("PlayerConnected") { received ->
            val user: String = try {
                received[0].toString()
            }catch(e: Exception){
                "utilisteur inconnu"
            }
            Message(user, System.currentTimeMillis())
        }
    }

    fun receivePlayerDisconnection(): Observable<Message> {
        return receiveFromSocket("PlayerDisconnected") { received ->
            val user: String = try {
                received[0].toString()
            }catch(e: Exception){
                "utilisteur inconnu"
            }
            Message(user, System.currentTimeMillis())
        }
    }

    private fun <T> receiveFromSocket(
        endpoint: String,
        parser: (received: Array<Any>) -> T
    ): Observable<T> {
        return Observable.create { emitter ->
            socket.on(endpoint) { received ->
                emitter.onNext(
                    parser(received)
                )
            }
        }
    }

    fun usernameConnexion(username: String): Observable<Boolean> {
        return Observable.create { emitter ->
            socket.emit("newPlayer", username, Ack { args ->
                val resp = args[0] as JSONObject
                val status = resp["status"] as String
                println(status)
                emitter.onNext(status == "Valid")
            })

        }

    }

    override fun onDestroy() {
        socket.disconnect()
        super.onDestroy()
    }
}