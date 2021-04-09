package com.projet.clientleger.data.api.socket

import com.projet.clientleger.data.api.model.chat.*
import com.projet.clientleger.data.endpoint.ChatSocketEndpoints
import com.projet.clientleger.data.api.model.lobby.Player
import com.projet.clientleger.data.model.chat.*
import io.reactivex.rxjava3.annotations.NonNull
import io.reactivex.rxjava3.core.Observable
import io.socket.client.Ack
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import org.json.JSONObject
import javax.inject.Inject

class ChatSocketService @Inject constructor(private val socketService: SocketService) {
    fun receiveMessage(): Observable<MessageChat> {
        return socketService.receiveFromSocket(ChatSocketEndpoints.RECEIVE_MSG.value) { (message) ->
            Json.decodeFromString(MessageChat.serializer(), message.toString())
        }
    }

    fun receivePlayerConnection(): Observable<MessageSystem> {
        return socketService.receiveFromSocket(ChatSocketEndpoints.RECEIVE_PLAYER_CONNECTION.value) { (playerInfo, timestamp) ->
            val info = Json.decodeFromString(Player.serializer(), playerInfo.toString())
            MessageSystem(info.username, timestamp as Long)
        }
    }

    fun receivePlayerDisconnection(): Observable<MessageSystem> {
        return socketService.receiveFromSocket(ChatSocketEndpoints.RECEIVE_PLAYER_DISCONNECT.value) { (username, timestamp) ->
            MessageSystem(username.toString(), timestamp as Long)
        }
    }

    fun receivePrivateMessage(): Observable<ReceivedPrivateMessage> {
        return socketService.receiveFromSocket(ChatSocketEndpoints.RECEIVE_PRIVATE_MSG.value) { (privateMsg) ->
            Json.decodeFromString(ReceivedPrivateMessage.serializer(), privateMsg.toString())
        }
    }

    fun sendPrivateMessage(msgContent: String, friendId: String) {
        val obj = JSONObject()
        obj.put("content", msgContent)
        obj.put("receiverAccountId", friendId)
        socketService.socket.emit(ChatSocketEndpoints.SEND_PRIVATE_MSG.value, obj)
    }

    fun sendMessage(msg: Message) {
        val obj = JSONObject()
        obj.put("content", msg.content)
        socketService.socket.emit(ChatSocketEndpoints.SEND_MSG.value, obj)
    }

    fun sendGuess(guess: String) {
        socketService.socket.emit(ChatSocketEndpoints.SEND_GUESS.value, guess)
    }

    fun receiveGuessClassic(): Observable<GuessMessageInfo> {
        return socketService.receiveFromSocket(ChatSocketEndpoints.RECEIVE_GUESS_CLASSIC.value) { (guessMessage) ->
            Json.decodeFromString(GuessMessage.serializer(), guessMessage.toString()).toInfo()
        }
    }

    fun receiveGuessSoloCoop(): Observable<GuessMessageSoloCoopInfo> {
        return socketService.receiveFromSocket(ChatSocketEndpoints.RECEIVE_GUESS_SOLO_COOP.value) { (guessMessage) ->
            Json.decodeFromString(GuessMessageSoloCoop.serializer(), guessMessage.toString()).toInfo()
        }
    }

    fun receiveRoomMessage(): Observable<IMessage> {
        return socketService.receiveFromSocket(ChatSocketEndpoints.RECEIVE_MESSAGE_ROOM.value) { (roomMessage) ->
            val roomMessageObj = roomMessage as JSONObject
            if (roomMessageObj.has("senderAccountId"))
                Json.decodeFromString(RoomMessage.serializer(), roomMessage.toString())
            else
                Json.decodeFromString(RoomSystemMessage.serializer(), roomMessage.toString())
        }
    }

    fun clearSubscriptions() {
        for (endpoint in ChatSocketEndpoints.values())
            socketService.socket.off(endpoint.value)
    }

    fun getRoomHistory(): Observable<ChatRoomHistory> {
        return Observable.create { emitter ->
            socketService.socket.emit(ChatSocketEndpoints.GET_ROOM_HISTORY.value, Ack{ historyObj ->
                val history = Json.decodeFromString(ChatRoomHistory.serializer(), historyObj.toString())
                emitter.onNext(history)
            })
        }
    }

    fun sendRoomMessage(roomName: String, content: String){
        val obj = JSONObject()
        val msgObj = JSONObject()
        msgObj.put("content", content)
        obj.put("roomName", roomName)
        obj.put("message", msgObj)
        socketService.socket.emit(ChatSocketEndpoints.SEND_ROOM_MESSAGE.value, obj)
    }
}
