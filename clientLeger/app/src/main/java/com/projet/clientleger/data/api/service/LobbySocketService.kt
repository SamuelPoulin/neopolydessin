package com.projet.clientleger.data.api.service

import com.projet.clientleger.BuildConfig
import com.projet.clientleger.data.api.model.Difficulty
import com.projet.clientleger.data.api.model.GameType
import com.projet.clientleger.data.api.model.LobbyInfo
import com.projet.clientleger.data.model.MessageChat
import io.reactivex.rxjava3.core.Observable
import io.socket.client.Ack
import io.socket.client.IO
import org.json.JSONObject
import io.socket.client.Socket
import kotlinx.serialization.json.Json
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
    fun receiveAllLobbies(gameMode: GameType, difficulty: Difficulty){
        socketService.socket.emit("GetListLobby",gameMode.value, difficulty.value, Ack{ received ->
            println("NOUS SOMMES DANS LE SOCKET SERVICE")
            println(received[0])
        })
    }
}