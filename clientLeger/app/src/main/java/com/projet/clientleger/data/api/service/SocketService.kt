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
import javax.inject.Inject
import javax.inject.Singleton

//"http://10.0.2.2:3205"

@Singleton
class SocketService @Inject constructor() {

    lateinit var socket: Socket;

    fun connect(accessToken: String) {
        try {
            val options: IO.Options = IO.Options()
            options.auth = mapOf("token" to accessToken)
            options.transports = arrayOf("websocket")
            options.upgrade = false
            //socket = IO.socket(BuildConfig.SERVER_URL, options)
            socket = IO.socket("http://10.0.2.2:3205", options)
        } catch (e: URISyntaxException) {
            println("ERROR SOCKET CONNECTION")
        }
        socket.connect()
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
        socket.emit("SendMsg", obj)
    }

    fun receivePlayerConnection(): Observable<Message> {
        return receiveFromSocket("PlayerConnected") { received ->
            val user: String = try {
                received[0].toString()
            } catch (e: Exception) {
                "utilisteur inconnu"
            }
            Message(user, System.currentTimeMillis())
        }
    }

    fun receivePlayerDisconnection(): Observable<Message> {
        return receiveFromSocket("PlayerDisconnected") { received ->
            val user: String = try {
                received[0].toString()
            } catch (e: Exception) {
                "utilisteur inconnu"
            }
            Message(user, System.currentTimeMillis())
        }
    }

    fun <T> receiveFromSocket(
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
                emitter.onNext(status == "Valid")
            })
        }
    }
}