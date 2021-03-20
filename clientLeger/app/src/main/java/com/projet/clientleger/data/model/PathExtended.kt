package com.projet.clientleger.data.model

import android.graphics.Path
import com.projet.clientleger.ui.drawboard.DrawboardViewModel
import java.util.*
import kotlin.collections.ArrayList

data class PathExtended(val basicData: PathBasicData, val graphicPath: Path = Path(), val extendedCoords: ArrayList<Coordinate> = ArrayList()){

    init {
        println("init: ${basicData.coords.isNotEmpty()}")
        if(basicData.coords.isNotEmpty()){
            if(extendedCoords.isEmpty())
            fillExtendedCoords()

            fillGraphicPath()
            println(extendedCoords)
        }
    }

    private fun fillExtendedCoords(){
        extendedCoords.add(basicData.coords.first())
        for(i in 1 until  basicData.coords.size){
            addCoordToExtendedCoords(basicData.coords[i])
        }
    }

    private fun fillGraphicPath(){
        graphicPath.moveTo(basicData.coords[0].x, basicData.coords[0].y)
        for(i in 1 until basicData.coords.size){
            val lastCoord = basicData.coords[i-1]
            val currentCoord = basicData.coords[i]
            graphicPath.quadTo(lastCoord.x,
                    lastCoord.y,
                    (currentCoord.x + lastCoord.x)/2,
                    (currentCoord.y + lastCoord.y)/2)
        }
        graphicPath.lineTo(basicData.coords.last().x, basicData.coords.last().y)
    }

    fun getLastCoord(): Coordinate?{
        if(basicData.coords.isEmpty())
            return null
        return basicData.coords.last()
    }

    fun addStartCoord(coord: Coordinate){
        basicData.coords.add(coord)
        graphicPath.moveTo(coord.x, coord.y)
        graphicPath.lineTo(coord.x, coord.y)
        extendedCoords.add(coord)
    }

    fun addCoord(coord: Coordinate){
        if(basicData.coords.isEmpty())
            return

        addCoordToGraphicPath(coord)
        addCoordToExtendedCoords(coord)
        basicData.coords.add(coord)
    }

    fun addEndCoord(coord: Coordinate){
        basicData.coords.add(coord)
        graphicPath.lineTo(coord.x, coord.y)
        addCoordToGraphicPath(coord)
    }

    private fun addCoordToExtendedCoords(coord: Coordinate){
        val lastCoord = basicData.coords.last()
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
        val lastCoord = basicData.coords.last()
        graphicPath.quadTo(lastCoord.x,
                lastCoord.y,
                (coord.x + lastCoord.x)/2,
                (coord.y + lastCoord.y)/2)
    }

}
