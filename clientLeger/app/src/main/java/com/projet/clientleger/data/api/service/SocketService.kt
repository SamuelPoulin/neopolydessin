package com.projet.clientleger.data.api.service
import android.os.Handler
import android.os.Looper
import com.projet.clientleger.data.model.MessageChat
import io.socket.client.IO
import io.socket.client.Socket
import io.socket.emitter.Emitter
import kotlinx.serialization.json.Json
import org.json.JSONObject
import java.net.URISyntaxException

//"http://10.0.2.2:3205"
//"http://p3-204-dev.duckdns.org/"
const val SOCKET_ROUTE = "http://p3-204-dev.duckdns.org/"
object SocketService{
    private var mSocket: Socket? = try {
        val options: IO.Options = IO.Options()
        options.transports = arrayOf("websocket")
        options.upgrade = false
        IO.socket(SOCKET_ROUTE, options)
    } catch (e: URISyntaxException) { null }
    init {
        mSocket?.on("connect", Emitter.Listener { println("socket started-----------------------------------------------------------------------------------------------" + mSocket?.connected()) })
        mSocket?.on("disconnect", Emitter.Listener { println("socket stopped-----------------------------------------------------------------------------------------------" + mSocket?.connected()) })
        mSocket?.on("ReceiveMsg") { args ->
            val msg = Json.decodeFromString(MessageChat.serializer(), (args[0] as JSONObject).toString())
            println("$mSocket: msg received-$msg-------------------------------")
            Handler(Looper.getMainLooper()).post { chatListener["receiveMsg"]?.invoke(msg) }
        }
        println("SocketCreation: $mSocket------------------------------------------------------------------------------")
        mSocket?.connect()
    }
        private var chatListener: HashMap<String, ((Any?) -> Unit)?> = HashMap<String, ((Any?) -> Unit)?>()

        fun sendMessage(msg: MessageChat) {
            println("SocketSendMessage------------------------------------------")
            val obj: JSONObject = JSONObject()
            obj.put("user", msg.user)
            obj.put("content", msg.content)
            obj.put("timestamp", msg.timestamp)
            mSocket?.emit("SendMsg", obj)
        }

        fun setCallbacks(fctName: String, fct: (Any?) -> Unit ) {
            chatListener[fctName] = fct
            println("setCallbakcs-$chatListener------------------------------------")
        }

        fun clearCallbacks() {
            chatListener.clear()
            println("clearCallbakcs-$chatListener------------------------------------")
        }
}