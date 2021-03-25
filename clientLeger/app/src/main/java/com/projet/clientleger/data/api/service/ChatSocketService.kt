package com.projet.clientleger.data.api.service

import com.projet.clientleger.data.endpoint.ChatSocketEndpoints
import com.projet.clientleger.data.model.chat.Message
import com.projet.clientleger.data.model.chat.MessageChat
import io.reactivex.rxjava3.core.Observable
import kotlinx.serialization.json.Json
import org.json.JSONObject
import javax.inject.Inject

class ChatSocketService @Inject constructor(private val socketService: SocketService) {
    fun receiveMessage(): Observable<MessageChat> {
        return socketService.receiveFromSocket(ChatSocketEndpoints.RECEIVE_MSG.value){ (message) ->
            Json.decodeFromString(MessageChat.serializer(), message.toString())
        }
    }

    fun receivePlayerConnection(): Observable<Message>{
        return socketService.receiveFromSocket(ChatSocketEndpoints.RECEIVE_PLAYER_CONNECTION.value){ (user) ->
            val userString: String = try {
                user.toString()
            } catch (e: Exception) {
                "utilisteur inconnu"
            }
            Message(userString, 0)
        }
    }

    fun receivePlayerDisconnection(): Observable<Message>{
        return socketService.receiveFromSocket(ChatSocketEndpoints.RECEIVE_PLAYER_DISCONNECT.value){ (user) ->
            val userString: String = try {
                user.toString()
            } catch (e: Exception) {
                "utilisteur inconnu"
            }
            Message(userString, 0)
        }
    }

    fun sendMessage(msg: MessageChat){
        val obj = JSONObject()
        obj.put("user", msg.user)
        obj.put("content", msg.content)
        obj.put("timestamp", msg.timestamp)
        socketService.socket.emit(ChatSocketEndpoints.SEND_MSG.value, obj)
    }
}