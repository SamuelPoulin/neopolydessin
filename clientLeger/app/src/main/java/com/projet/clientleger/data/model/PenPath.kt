package com.projet.clientleger.data.model

import android.graphics.Path
import java.util.*
import kotlin.collections.ArrayList

data class PenPath(val pathId:Int, val path: Path?, val brushInfo: BrushInfo, val pathCoords: ArrayList<Coordinate> = ArrayList(), val visualCoords: ArrayList<Coordinate> = ArrayList())
