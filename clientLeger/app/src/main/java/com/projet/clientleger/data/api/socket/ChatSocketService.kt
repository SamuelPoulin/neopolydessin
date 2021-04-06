package com.projet.clientleger.data.api.socket

import com.projet.clientleger.data.api.model.chat.GuessMessage
import com.projet.clientleger.data.api.model.chat.PrivateMessage
import com.projet.clientleger.data.api.model.chat.ReceivedPrivateMessage
import com.projet.clientleger.data.endpoint.ChatSocketEndpoints
import com.projet.clientleger.data.api.model.lobby.Player
import com.projet.clientleger.data.model.chat.Message
import com.projet.clientleger.data.model.chat.MessageChat
import com.projet.clientleger.data.model.chat.GuessMessageInfo
import com.projet.clientleger.data.model.chat.MessageSystem
import io.reactivex.rxjava3.core.Observable
import io.socket.client.Ack
import kotlinx.serialization.decodeFromString
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
            val info = Json.decodeFromString(Player.serializer(), playerInfo.toString())
            MessageSystem(info.username, timestamp as Long)
        }
    }

    fun receivePlayerDisconnection(): Observable<MessageSystem>{
        return socketService.receiveFromSocket(ChatSocketEndpoints.RECEIVE_PLAYER_DISCONNECT.value){ (username, timestamp) ->
            MessageSystem(username.toString(), timestamp as Long)
        }
    }

    fun receivePrivateMessage(): Observable<ReceivedPrivateMessage> {
        return socketService.receiveFromSocket(ChatSocketEndpoints.RECEIVE_PRIVATE_MSG.value){ (privateMsg) ->
            Json.decodeFromString(ReceivedPrivateMessage.serializer(), privateMsg.toString())
        }
    }

    fun sendPrivateMessage(msgContent: String, friendId: String){
        val obj = JSONObject()
        obj.put("content", msgContent)
        obj.put("receiverAccountId", friendId)
        socketService.socket.emit(ChatSocketEndpoints.SEND_PRIVATE_MSG.value, obj)
    }

    fun sendMessage(msg: Message){
        val obj = JSONObject()
        obj.put("content", msg.content)
        socketService.socket.emit(ChatSocketEndpoints.SEND_MSG.value, obj)
    }

    fun sendGuess(guess: String){
            socketService.socket.emit(ChatSocketEndpoints.SEND_GUESS.value, guess)
    }

    fun receiveGuessClassic(): Observable<GuessMessageInfo>{
        return socketService.receiveFromSocket(ChatSocketEndpoints.RECEIVE_GUESS_CLASSIC.value){(guessMessage) ->
            Json.decodeFromString(GuessMessage.serializer(), guessMessage.toString()).toInfo()
        }
    }

    fun clearSubscriptions(){
        for(endpoint in ChatSocketEndpoints.values())
            socketService.socket.off(endpoint.value)
    }

}