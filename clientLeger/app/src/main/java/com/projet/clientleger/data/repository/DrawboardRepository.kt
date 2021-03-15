package com.projet.clientleger.data.repository

import com.projet.clientleger.data.api.service.DrawingSocketService
import com.projet.clientleger.data.model.BrushInfo
import com.projet.clientleger.data.model.Coordinate
import javax.inject.Inject

class DrawboardRepository @Inject constructor(private val drawingSocketService: DrawingSocketService) {
    fun sendStartPath(coords: Coordinate, brushInfo: BrushInfo) {
        drawingSocketService.sendStartPath(coords, brushInfo)
    }
    fun sendUpdatePath(listCoords: Array<Coordinate>){
        drawingSocketService.sendUpdatePath(listCoords)
    }
    fun sendEndPath(endCoords: Coordinate){
        drawingSocketService.sendEndPath(endCoords)
    }
}