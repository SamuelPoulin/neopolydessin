package com.projet.clientleger.data.model

import android.graphics.Path

data class PathData(val pathId:Int,
                    val brushInfo: BrushInfo,
                    val coords: ArrayList<Coordinate> = ArrayList())
