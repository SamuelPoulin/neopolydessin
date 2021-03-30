package com.projet.clientleger.data.api.socket

import com.projet.clientleger.data.api.model.lobby.Player
import com.projet.clientleger.data.endpoint.GameSocketEndPoints
import io.reactivex.rxjava3.core.Observable
import kotlinx.serialization.json.Json
import org.json.JSONArray
import javax.inject.Inject

class GameSocketService @Inject constructor(private val socketService: SocketService) {
    fun receiveTimer():Observable<Long>{
        return socketService.receiveFromSocket(GameSocketEndPoints.SET_TIME.value){ (timer) ->
            timer as Long
        }
    }
    fun receiveRoles():Observable<ArrayList<Player>>{
        return Observable.create {
            socketService.receiveFromSocket(GameSocketEndPoints.RECEIVE_ROLES.value) { res ->
                val jsonList = res[0] as JSONArray
                val list = ArrayList<Player>()
                for(i in 0 until jsonList.length()){
                    list.add(Json.decodeFromString(Player.serializer(), jsonList.get(i).toString()))
                }
                it.onNext(list)
            }
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
}