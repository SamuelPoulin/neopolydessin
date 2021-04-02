package com.projet.clientleger.data.api.socket

import com.projet.clientleger.data.api.model.lobby.Lobby
import com.projet.clientleger.data.endpoint.LobbySocketEndpoints
import com.projet.clientleger.data.api.model.lobby.Player
import com.projet.clientleger.data.enumData.Difficulty
import com.projet.clientleger.data.enumData.GameType
import com.projet.clientleger.data.model.lobby.LobbyInfo
import io.reactivex.rxjava3.core.Observable
import io.socket.client.Ack
import kotlinx.serialization.json.Json
import org.json.JSONArray
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LobbySocketService @Inject constructor(private val socketService: SocketService) {

    fun createGame(lobbyName: String, gameType: GameType, difficulty: Difficulty, isPrivate:Boolean) {
        socketService.socket.emit(LobbySocketEndpoints.CREATE_LOBBY.value, lobbyName, gameType.value, difficulty.value, isPrivate)
    }
    //deja dans le lobby, un joueur rejoins le lobby
    fun receivePlayerJoin(): Observable<Player> {
        return socketService.receiveFromSocket(LobbySocketEndpoints.RECEIVE_PLAYER_JOIN.value){(received) ->
            Json.decodeFromString(Player.serializer(), received.toString())
        }
    }

    fun unsubscribeLobby(){
        socketService.socket.off(LobbySocketEndpoints.RECEIVE_PLAYER_LEAVE.value)
        socketService.socket.off(LobbySocketEndpoints.RECEIVE_PLAYER_LEAVE.value)
        socketService.socket.off(LobbySocketEndpoints.RECEIVE_LOBBY_INFO.value)
        socketService.socket.off(LobbySocketEndpoints.RECEIVE_START_GAME.value)
    }
    fun unsubscribeLobbyList(){
        socketService.socket.off(LobbySocketEndpoints.RECEIVE_ALL_LOBBIES.value)
        socketService.socket.off(LobbySocketEndpoints.RECEIVE_UPDATE_LOBBY_LIST.value)
    }

    fun receivePlayerLeave(): Observable<String>{
        return socketService.receiveFromSocket(LobbySocketEndpoints.RECEIVE_PLAYER_LEAVE.value){(username, timestamp) ->
            username as String
        }
    }

    fun leaveLobby(){
        socketService.socket.emit(LobbySocketEndpoints.LEAVE_LOBBY.value)
    }

    fun receiveAllLobbies(gameType: GameType, difficulty: Difficulty) : Observable<ArrayList<LobbyInfo>>{
        return Observable.create{
            emitter -> socketService.socket.emit(LobbySocketEndpoints.RECEIVE_ALL_LOBBIES.value,gameType.value, difficulty.value, Ack{ res ->
            val jsonList = res[0] as JSONArray
            val list = ArrayList<LobbyInfo>()
            for(i in 0 until jsonList.length()){
                val lobby = Json.decodeFromString(Lobby.serializer(), jsonList.get(i).toString())
                list.add(lobby.toInfo())
            }
            emitter.onNext(list)
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


    fun receiveStartGame() : Observable<String>{
        return socketService.receiveFromSocket(LobbySocketEndpoints.RECEIVE_START_GAME.value) {""}
    }

    fun receiveUpdateLobbyList(): Observable<ArrayList<LobbyInfo>>{
        return socketService.receiveFromSocket(LobbySocketEndpoints.RECEIVE_UPDATE_LOBBY_LIST.value){(lobbies) ->
            val jsonList = lobbies as JSONArray
            val list = ArrayList<LobbyInfo>()
            for(i in 0 until jsonList.length()){
                val lobby = Json.decodeFromString(Lobby.serializer(), jsonList.get(i).toString())
                list.add(lobby.toInfo())
            }
            list
        }
    }

}