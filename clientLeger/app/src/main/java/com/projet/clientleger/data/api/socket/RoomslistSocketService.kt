package com.projet.clientleger.data.api.socket

import com.projet.clientleger.data.endpoint.RoomslistSocketEndpoints
import com.projet.clientleger.data.service.ChatStorageService
import com.projet.clientleger.data.service.GENERAL_ROOM_ID
import com.projet.clientleger.ui.chat.ChatViewModel
import com.projet.clientleger.ui.lobby.viewmodel.LobbyViewModel
import io.reactivex.rxjava3.annotations.NonNull
import io.reactivex.rxjava3.core.Observable
import io.socket.client.Ack
import org.json.JSONArray
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class RoomslistSocketService @Inject constructor(val socketService: SocketService){
    fun getRooms(): Observable<ArrayList<String>>{
        return Observable.create { emitter ->
            socketService.socket.emit(RoomslistSocketEndpoints.GET_ROOMS.value, Ack { (rooms) ->
                val list = ArrayList<String>()
                val jsonList = rooms as JSONArray
                for (i in 0 until jsonList.length()){
                    if(jsonList[i] as String != GENERAL_ROOM_ID)
                        list.add(jsonList[i] as String)
                }
                emitter.onNext(list)
            })
        }
    }

    fun joinRoom(roomName: String): Observable<Boolean>{
        return Observable.create { emitter ->
            socketService.socket.emit(RoomslistSocketEndpoints.JOIN_ROOM.value, roomName, Ack { (success) ->
                emitter.onNext(success as Boolean)
            })
        }
    }

    fun receiveUpdateRooms(): Observable<ArrayList<String>> {
        return socketService.receiveFromSocket(RoomslistSocketEndpoints.RECEIVE_UPDATED_ROOMS.value){ (rooms) ->
            val list = ArrayList<String>()
            val jsonList = rooms as JSONArray
            for (i in 0 until jsonList.length()){
                if(jsonList[i] as String != GENERAL_ROOM_ID)
                    list.add(jsonList[i] as String)
            }
            list
        }
    }

    fun deleteRoom(roomName: String){
        socketService.socket.emit(RoomslistSocketEndpoints.DELETE_ROOM.value, roomName, Ack{(isSuccess) -> println("isSuccess: $isSuccess")})
    }

    fun createRoom(roomName: String){
        socketService.socket.emit(RoomslistSocketEndpoints.CREATE_ROOM.value, roomName, Ack{})
    }
}