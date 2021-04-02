package com.projet.clientleger.data.api.socket

import android.graphics.Bitmap
import com.projet.clientleger.data.api.model.Timer
import com.projet.clientleger.data.api.model.lobby.Player
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
            println("Timer recu dans Socket: ${timer.toString()}")
            Json.decodeFromString(Timer.serializer(), timer.toString())
        }
    }
    fun receiveRoles():Observable<ArrayList<Player>>{
        return socketService.receiveFromSocket(GameSocketEndPoints.RECEIVE_ROLES.value) { res ->
                println("Roles recu dans Socket: ${res.toString()}")
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
            println("mot recu dans Socket: ${word.toString()}")
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
    }
    fun receiveTeamScores():Observable<ArrayList<Int>>{
        return socketService.receiveFromSocket(GameSocketEndPoints.RECEIVE_TEAM_SCORES.value){ res ->
            println("Scores d'équipes recus dans socket : ${res.toString()}")
            val receivedList = res[0] as JSONArray
            val list = ArrayList<Int>()
            for(i in 0 until receivedList.length()){
                val score = receivedList.get(i).toString().toInt()
                list.add(score)
            }
            list
        }
    }

//    fun getPlayersAvatar(players: ArrayList<PlayerInfo>): ArrayList<PlayerInfo>{
//        for(player in players)
//        {
//            var avatar: Bitmap? = null
//
//        }
//    }
}