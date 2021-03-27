package com.projet.clientleger.data.model

import kotlinx.serialization.Serializable
import kotlin.math.pow
import kotlin.math.sqrt

@Serializable
data class Coordinate(val x: Float, val y: Float){
    operator fun minus(coord: Coordinate) = Coordinate(x-coord.x, y-coord.y)
    operator fun times(time: Int) = Coordinate(x * time, y * time)
    operator fun times(time: Float) = Coordinate(x * time, y * time)
    operator fun plus(coord: Coordinate) = Coordinate(x+coord.x, y+coord.y)
    fun distance(): Float{
        return sqrt(x.pow(2) + y.pow(2))
    }
    fun normalized(): Coordinate{
        val norm = distance()
        return Coordinate(x/norm, y/norm)
    }
}

