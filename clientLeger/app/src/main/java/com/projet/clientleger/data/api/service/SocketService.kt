package com.projet.clientleger.data.api.service

import com.projet.clientleger.BuildConfig
import com.projet.clientleger.data.model.chat.Message
import com.projet.clientleger.data.model.chat.MessageChat
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
}