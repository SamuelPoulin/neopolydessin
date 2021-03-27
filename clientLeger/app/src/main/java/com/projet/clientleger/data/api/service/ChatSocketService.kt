package com.projet.clientleger.data.api.service

import com.projet.clientleger.data.endpoint.ChatSocketEndpoints
import com.projet.clientleger.data.enumData.GuessStatus
import com.projet.clientleger.data.model.PlayerInfo
import com.projet.clientleger.data.model.chat.Message
import com.projet.clientleger.data.model.chat.MessageChat
import com.projet.clientleger.data.model.chat.MessageGuess
import com.projet.clientleger.data.model.chat.MessageSystem
import io.reactivex.rxjava3.core.Observable
import io.socket.client.Ack
import kotlinx.serialization.json.Json
import org.json.JSONObject
import javax.inject.Inject

class ChatSocketService @Inject constructor(private val socketService: SocketService) {
    fun receiveMessage(): Observable<MessageChat> {
        return socketService.receiveFromSocket(ChatSocketEndpoints.RECEIVE_MSG.value){ (message) ->
            Json.decodeFromString(MessageChat.serializer(), message.toString())
        }
    }

    fun receivePlayerConnection(): Observable<MessageSystem>{
        return socketService.receiveFromSocket(ChatSocketEndpoints.RECEIVE_PLAYER_CONNECTION.value){ (playerInfo, timestamp) ->
            println(playerInfo)
            val info = Json.decodeFromString(PlayerInfo.serializer(), playerInfo.toString())
            MessageSystem(info.playerName, timestamp as Long)
        }
    }

    fun receivePlayerDisconnection(): Observable<MessageSystem>{
        return socketService.receiveFromSocket(ChatSocketEndpoints.RECEIVE_PLAYER_DISCONNECT.value){ (username, timestamp) ->
            MessageSystem(username.toString(), timestamp as Long)
        }
    }

    fun sendMessage(msg: Message){
        val obj = JSONObject()
        obj.put("content", msg.content)
        socketService.socket.emit(ChatSocketEndpoints.SEND_MSG.value, obj)
    }

    fun sendGuess(guess: String): Observable<MessageGuess>{
        return Observable.create{ emitter ->
            socketService.socket.emit(ChatSocketEndpoints.SEND_GUESS.value, guess, Ack{ (messageGuess) ->
                val msg = Json.decodeFromString(MessageGuess.serializer(), messageGuess.toString())
                emitter.onNext(msg)
            })
        }
    }

}