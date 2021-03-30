package com.projet.clientleger.data.api.socket

import com.projet.clientleger.data.api.model.Difficulty
import com.projet.clientleger.data.api.model.GameType
import com.projet.clientleger.data.api.model.LobbyInfo
import com.projet.clientleger.data.api.model.PlayerRole
import com.projet.clientleger.data.endpoint.LobbySocketEndpoints
import com.projet.clientleger.data.model.LobbyList
import com.projet.clientleger.data.api.model.lobby.Player
import io.reactivex.rxjava3.core.Observable
import io.socket.client.Ack
import kotlinx.serialization.json.Json
import org.json.JSONArray
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LobbySocketService @Inject constructor(private val socketService: SocketService) {

    fun createGame(gameMode:GameType,difficulty:Difficulty, isPrivate:Boolean) {
        socketService.socket.emit(LobbySocketEndpoints.CREATE_LOBBY.value, "",gameMode.value, difficulty.value, isPrivate)
    }
    //deja dans le lobby, un joueur rejoins le lobby
    fun receivePlayersInfo(): Observable<String> {
        return socketService.receiveFromSocket("PlayerConnected"){received ->
            received[0].toString()
        }
    }
    fun receiveAllLobbies(gameMode: GameType, difficulty: Difficulty) : Observable<LobbyList>{
        return Observable.create{
            emitter -> socketService.socket.emit("getListLobby",gameMode.value, difficulty.value, Ack{ res ->
            val jsonList = res[0] as JSONArray
            val list = ArrayList<LobbyInfo>()
            for(i in 0 until jsonList.length()){
                list.add(Json.decodeFromString(LobbyInfo.serializer(), jsonList.get(i).toString()))
            }
            emitter.onNext(LobbyList(list))
        })
        }
    }

    fun receiveJoinedLobbyInfo() : Observable<ArrayList<Player>>{
        return socketService.receiveFromSocket(LobbySocketEndpoints.RECEIVE_LOBBY_INFO.value) { (players) ->
            val list = ArrayList<Player>()
            val jsonList = players as JSONArray
            for(i in 0 until jsonList.length())
                list.add(Json.decodeFromString(Player.serializer(), jsonList.get(i).toString()))
            list
        }
    }

    fun joinLobby(lobbyId: String){
        socketService.socket.emit(LobbySocketEndpoints.JOIN_LOBBY.value, lobbyId)
    }

    fun startGame(){
        socketService.socket.emit(LobbySocketEndpoints.START_GAME.value)
    }

    fun receiveStartGame() : Observable<ArrayList<PlayerRole>>{
        return Observable.create {
            socketService.receiveFromSocket(LobbySocketEndpoints.RECEIVE_START_GAME.value) { res ->
                val jsonList =res[0] as JSONArray
                val list = ArrayList<PlayerRole>()
                for(i in 0 until jsonList.length()){
                    list.add(Json.decodeFromString(PlayerRole.serializer(), jsonList.get(i).toString()))
                }
            }
        }
    }
}