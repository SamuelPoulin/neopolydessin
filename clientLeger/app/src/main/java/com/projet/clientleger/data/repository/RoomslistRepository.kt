package com.projet.clientleger.data.repository

import com.projet.clientleger.data.api.socket.RoomslistSocketService
import io.reactivex.rxjava3.core.Observable
import javax.inject.Inject

class RoomslistRepository @Inject constructor(private val roomsListSocketService: RoomslistSocketService){
    fun getRooms(): Observable<ArrayList<String>> {
        return roomsListSocketService.getRooms()
    }

    fun joinRooms(roomName: String): Observable<Boolean>{
        return roomsListSocketService.joinRoom(roomName)
    }

    fun receiveUpdateRooms(): Observable<ArrayList<String>> {
        return roomsListSocketService.receiveUpdateRooms()
    }

    fun deleteRoom(roomName: String){
        roomsListSocketService.deleteRoom(roomName)
    }

    fun createRoom(roomName: String){
        roomsListSocketService.createRoom(roomName)
    }

    fun leaveRoom(roomName: String){
        roomsListSocketService.leaveRoom(roomName)
    }
}