package com.projet.clientleger.data.api.service

import android.os.Handler
import android.os.Looper
import com.projet.clientleger.data.model.GameInfo
import io.socket.client.IO
import io.socket.client.Socket
import io.socket.emitter.Emitter
import kotlinx.serialization.json.Json
import org.json.JSONObject
import java.net.URISyntaxException

//"http://10.0.2.2:3205"
//"http://p3-204-dev.duckdns.org/"
const val GAME_INFO_SOCKET_ROUTE = "http://p3-204-dev.duckdns.org/"
object GameInfoSocketService{
    private var mSocket: Socket? = try {
        val options: IO.Options = IO.Options()
        options.transports = arrayOf("websocket")
        options.upgrade = false
        IO.socket(GAME_INFO_SOCKET_ROUTE, options)
    } catch (e: URISyntaxException) { null }
    init {
        mSocket?.on("connect", Emitter.Listener { println("socket started-----------------------------------------------------------------------------------------------" + mSocket?.connected()) })
        mSocket?.on("disconnect", Emitter.Listener { println("socket stopped-----------------------------------------------------------------------------------------------" + mSocket?.connected()) })
        mSocket?.on("ReceiveGames") { args ->
            val games = Json.decodeFromString(GameInfo.serializer(), (args[0] as JSONObject).toString())
            println("$mSocket: game received-$games-------------------------------")
            Handler(Looper.getMainLooper()).post { chatListener["receiveGames"]?.invoke(games) }
        }
        mSocket?.on("AddGame") { args ->
            val game = Json.decodeFromString(GameInfo.serializer(), (args[0] as JSONObject).toString())
            println("$mSocket: game received-$game-------------------------------")
            Handler(Looper.getMainLooper()).post { chatListener["addGame"]?.invoke(game) }
        }
        println("SocketCreation: $mSocket------------------------------------------------------------------------------")
        mSocket?.connect()
    }
    private var chatListener: HashMap<String, ((Any?) -> Unit)?> = HashMap<String, ((Any?) -> Unit)?>()

    fun setCallbacks(fctName: String, fct: (Any?) -> Unit ) {
        chatListener[fctName] = fct
        println("setCallbakcs-$chatListener------------------------------------")
    }

    fun clearCallbacks() {
        chatListener.clear()
        println("clearCallbakcs-$chatListener------------------------------------")
    }
}