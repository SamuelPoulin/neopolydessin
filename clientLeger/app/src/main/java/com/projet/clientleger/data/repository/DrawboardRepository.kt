package com.projet.clientleger.data.repository

import com.projet.clientleger.data.api.service.DrawingSocketService
import com.projet.clientleger.data.enum.Difficulty
import com.projet.clientleger.data.enum.GameType
import com.projet.clientleger.data.model.BrushInfo
import com.projet.clientleger.data.model.Coordinate
import com.projet.clientleger.data.model.PenPath
import com.projet.clientleger.data.model.StartPoint
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

    fun receiveStartPath(): Observable<StartPoint> {
        return drawingSocketService.receiveStartPath()
    }

    fun receiveUpdatePath(): Observable<Coordinate> {
        return drawingSocketService.receiveUpdatePath()
    }

    fun receiveEndPath(): Observable<Coordinate> {
        return drawingSocketService.receiveEndPath()
    }

    fun receievPath(): Observable<PenPath>{
        return drawingSocketService.receivePath()
    }

    fun sendErasePath(pathId: Int){
        drawingSocketService.sendErasePath(pathId)
    }
}