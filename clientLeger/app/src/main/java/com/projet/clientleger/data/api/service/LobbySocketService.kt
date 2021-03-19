package com.projet.clientleger.data.api.service

import com.projet.clientleger.BuildConfig
import com.projet.clientleger.data.api.model.Difficulty
import com.projet.clientleger.data.api.model.GameType
import com.projet.clientleger.data.api.model.LobbyInfo
import com.projet.clientleger.data.enum.LobbySocketEndpoints
import com.projet.clientleger.data.model.LobbyList
import com.projet.clientleger.data.model.MessageChat
import io.reactivex.rxjava3.core.Observable
import io.socket.client.Ack
import io.socket.client.IO
import org.json.JSONObject
import io.socket.client.Socket
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import org.json.JSONArray
import java.net.URISyntaxException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LobbySocketService @Inject constructor(private val socketService: SocketService) {

    fun createGame(gameMode:GameType,difficulty:Difficulty, isPrivate:Boolean) {
        socketService.socket.emit("CreateLobby", gameMode.value, difficulty.value, isPrivate)
    }
    //deja dans le lobby, un joueur rejoins le lobby
    fun receivePlayersInfo(): Observable<String> {
        return socketService.receiveFromSocket("PlayerConnected"){received ->
            received[0].toString()
        }
    }
    fun receiveAllLobbies(gameMode: GameType, difficulty: Difficulty) : Observable<LobbyList>{
        return Observable.create{
            emitter -> socketService.socket.emit("GetListLobby",gameMode.value, difficulty.value, Ack{ res ->
            val jsonList = res[0] as JSONArray
            val list = ArrayList<LobbyInfo>()
            for(i in 0 until jsonList.length()){
                list.add(Json.decodeFromString(LobbyInfo.serializer(), jsonList.get(i).toString()))
            }
            emitter.onNext(LobbyList(list))
        })
        }
    }

    fun receiveJoinedLobbyInfo() : Observable<LobbyInfo>{
        return socketService.receiveFromSocket(LobbySocketEndpoints.RECEIVE_LOBBY_INFO.value) { res ->
            Json.decodeFromString(LobbyInfo.serializer(), res[0].toString())
        }
    }

    fun joinLobby(lobbyId: String){
        socketService.socket.emit(LobbySocketEndpoints.JOIN_LOBBY.value, lobbyId)
    }

    fun startGame(){
        socketService.socket.emit(LobbySocketEndpoints.START_GAME.value)
    }

    fun receiveStartGame() : Observable<Any>{
        return socketService.receiveFromSocket(LobbySocketEndpoints.RECEIVE_START_GAME.value) {}
    }
}