package com.projet.clientleger.data.repository

import com.projet.clientleger.data.api.socket.DrawingSocketService
import com.projet.clientleger.data.model.*
import io.reactivex.rxjava3.core.Observable
import javax.inject.Inject

class DrawboardRepository @Inject constructor(private val drawingSocketService: DrawingSocketService) {
    fun sendStartPath(coords: Coordinate, brushInfo: BrushInfo) {
        drawingSocketService.sendStartPath(coords, brushInfo)
    }
    fun sendUpdatePath(coords: Coordinate){
        drawingSocketService.sendUpdatePath(coords)
    }
    fun sendEndPath(endCoords: Coordinate){
        drawingSocketService.sendEndPath(endCoords)
    }

    fun receiveStartPath(): Observable<PathData> {
        return drawingSocketService.receiveStartPath()
    }

    fun receiveUpdatePath(): Observable<Coordinate> {
        return drawingSocketService.receiveUpdatePath()
    }

    fun receiveEndPath(): Observable<Coordinate> {
        return drawingSocketService.receiveEndPath()
    }

    fun receivePath(): Observable<PathData>{
        return drawingSocketService.receivePath()
    }

    fun receiveErase(): Observable<Int>{
        return drawingSocketService.receiveErasePath()
    }

    fun sendErasePath(pathId: Int){
        drawingSocketService.sendErasePath(pathId)
    }

    fun sendPath(pathId: Int){
        drawingSocketService.sendPath(pathId)
    }

    fun unsubscribe(){
        drawingSocketService.unsubscribe()
    }
}