package com.projet.clientleger.data.api.service

import android.graphics.Path
import com.projet.clientleger.data.enum.DrawingSocketEndpoints
import com.projet.clientleger.data.model.BrushInfo
import com.projet.clientleger.data.model.Coordinate
import com.projet.clientleger.data.model.PenPath
import io.reactivex.rxjava3.core.Observable
import javax.inject.Inject

class DrawingSocketService @Inject constructor(val socketService: SocketService){

    fun sendStartPath(coords: Coordinate, brushInfo: BrushInfo){
        socketService.socket.emit(DrawingSocketEndpoints.START_PATH.endpoint, coords, brushInfo)
    }

    fun sendUpdatePath(listCoords: Array<Coordinate>){
        socketService.socket.emit(DrawingSocketEndpoints.UPDATE_PATH.endpoint, listCoords)
    }

    fun sendEndPath(endCoords: Coordinate){
        socketService.socket.emit(DrawingSocketEndpoints.END_PATH.endpoint, endCoords)
    }
}