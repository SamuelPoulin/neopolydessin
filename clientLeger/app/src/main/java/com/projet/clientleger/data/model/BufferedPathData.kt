package com.projet.clientleger.data.model

import android.graphics.Path
import com.projet.clientleger.ui.drawboard.DrawboardViewModel
import kotlin.collections.ArrayList

data class BufferedPathData(val data: PathData, val graphicPath: Path = Path(), val extendedCoords: ArrayList<Coordinate> = ArrayList()){

    init {
        if(data.coords.isNotEmpty()){
            if(extendedCoords.isEmpty())
            fillExtendedCoords()

            fillGraphicPath()
        }
    }

    private fun fillExtendedCoords(){
        extendedCoords.add(data.coords.first())
        for(i in 1 until  data.coords.size){
            addCoordToExtendedCoords(data.coords[i])
        }
    }

    private fun fillGraphicPath(){
        graphicPath.moveTo(data.coords[0].x, data.coords[0].y)
        for(i in 1 until data.coords.size){
            val lastCoord = data.coords[i-1]
            val currentCoord = data.coords[i]
            graphicPath.quadTo(lastCoord.x,
                    lastCoord.y,
                    (currentCoord.x + lastCoord.x)/2,
                    (currentCoord.y + lastCoord.y)/2)
        }
        graphicPath.lineTo(data.coords.last().x, data.coords.last().y)
    }

    fun getLastCoord(): Coordinate?{
        if(data.coords.isEmpty())
            return null
        return data.coords.last()
    }

    fun addStartCoord(coord: Coordinate){
        data.coords.add(coord)
        graphicPath.moveTo(coord.x, coord.y)
        graphicPath.lineTo(coord.x, coord.y)
        extendedCoords.add(coord)
    }

    fun addCoord(coord: Coordinate){
        if(data.coords.isEmpty())
            return

        addCoordToGraphicPath(coord)
        addCoordToExtendedCoords(coord)
        data.coords.add(coord)
    }

    fun addEndCoord(coord: Coordinate){
        data.coords.add(coord)
        graphicPath.lineTo(coord.x, coord.y)
        addCoordToGraphicPath(coord)
    }

    private fun addCoordToExtendedCoords(coord: Coordinate){
        val lastCoord = data.coords.last()
        var direction = (coord-lastCoord)
        val numBufferNeeded = (direction.distance()/ DrawboardViewModel.MIN_ERASER_WIDTH).toInt()

        direction = direction.normalized()
        var baseBuffCoord = lastCoord
        for(i in 1..numBufferNeeded){
            val buffCoord = baseBuffCoord + direction*DrawboardViewModel.MIN_ERASER_WIDTH
            extendedCoords.add(buffCoord)
            baseBuffCoord = buffCoord
        }

        extendedCoords.add(coord)
    }

    private fun addCoordToGraphicPath(coord:Coordinate){
        val lastCoord = data.coords.last()
        graphicPath.quadTo(lastCoord.x,
                lastCoord.y,
                (coord.x + lastCoord.x)/2,
                (coord.y + lastCoord.y)/2)
    }

}
