package com.projet.clientleger.data.api.socket

import android.graphics.Bitmap
import com.projet.clientleger.data.api.model.TeamScore
import com.projet.clientleger.data.api.model.Timer
import com.projet.clientleger.data.api.model.lobby.Player
import com.projet.clientleger.data.endpoint.DrawingSocketEndpoints
import com.projet.clientleger.data.endpoint.GameSocketEndPoints
import com.projet.clientleger.data.enumData.ReasonEndGame
import com.projet.clientleger.data.model.lobby.PlayerInfo
import io.reactivex.rxjava3.core.Observable
import kotlinx.serialization.json.Json
import org.json.JSONArray
import javax.inject.Inject

class GameSocketService @Inject constructor(private val socketService: SocketService) {
    fun receiveTimer():Observable<Timer>{
        return socketService.receiveFromSocket(GameSocketEndPoints.SET_TIME.value){ (timer) ->
            Json.decodeFromString(Timer.serializer(), timer.toString())
        }
    }
    fun receiveRoles():Observable<ArrayList<Player>>{
        return socketService.receiveFromSocket(GameSocketEndPoints.RECEIVE_ROLES.value) { res ->
                val jsonList = res[0] as JSONArray
                val list = ArrayList<Player>()
                for(i in 0 until jsonList.length()){
                    val player = Json.decodeFromString(Player.serializer(), jsonList.get(i).toString())
                    list.add(player)
                }
            list
        }
    }

    fun receiveKeyWord():Observable<String>{
        return socketService.receiveFromSocket(GameSocketEndPoints.RECEIVE_WORD_GUESS.value){ (word) ->
            word as String
        }
    }
    fun onPlayerReady(){
        socketService.socket.emit(GameSocketEndPoints.PLAYER_READY.value)
    }
    fun receiveEndGameNotice():Observable<String>{
        return socketService.receiveFromSocket((GameSocketEndPoints.END_GAME_TRIGGER.value)){(message) ->
            message as String
        }
    }
    fun unsubscribe(){
        socketService.socket.off(GameSocketEndPoints.END_GAME_TRIGGER.value)
        socketService.socket.off(GameSocketEndPoints.RECEIVE_ROLES.value)
        socketService.socket.off(GameSocketEndPoints.RECEIVE_WORD_GUESS.value)
        socketService.socket.off(GameSocketEndPoints.SET_TIME.value)
        socketService.socket.off(GameSocketEndPoints.END_GAME_TRIGGER.value)
        socketService.socket.off(GameSocketEndPoints.UPDATE_GAME_STATE.value)
        socketService.socket.off(GameSocketEndPoints.RECEIVE_TEAM_SCORES.value)
    }

    fun onLeaveGame(){
        socketService.socket.emit(GameSocketEndPoints.ON_LEAVE.value)
    }
    fun receiveTeamScores():Observable<ArrayList<TeamScore>>{
        return socketService.receiveFromSocket(GameSocketEndPoints.RECEIVE_TEAM_SCORES.value){ res ->
            val receivedList = res[0] as JSONArray
            val list = ArrayList<TeamScore>()
            for(i in 0 until receivedList.length()){
                val score = Json.decodeFromString(TeamScore.serializer(), receivedList.get(i).toString())
                list.add(score)
            }
            list
        }
    }
    fun receiveGameState():Observable<String>{
        return socketService.receiveFromSocket(GameSocketEndPoints.UPDATE_GAME_STATE.value){ (state) ->
            state as String
        }
    }
}