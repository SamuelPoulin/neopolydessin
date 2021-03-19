package com.projet.clientleger.ui.drawboard

import android.graphics.Path
import android.graphics.RectF
import android.graphics.Region
import android.os.Process
import androidx.core.content.ContextCompat
import androidx.databinding.Bindable
import androidx.databinding.Observable
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.projet.clientleger.R
import com.projet.clientleger.data.enum.Difficulty
import com.projet.clientleger.data.enum.DrawTool
import com.projet.clientleger.data.enum.GameType
import com.projet.clientleger.data.model.BrushInfo
import com.projet.clientleger.data.model.Coordinate
import com.projet.clientleger.data.model.PenPath
import com.projet.clientleger.data.model.StartPoint
import com.projet.clientleger.data.repository.DrawboardRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import java.time.LocalDateTime
import java.util.*
import javax.inject.Inject
import kotlin.collections.ArrayList
import kotlin.math.abs
import kotlin.random.Random

@HiltViewModel
class DrawboardViewModel @Inject constructor(private val drawboardRepository: DrawboardRepository) :
        ViewModel() {
    companion object {
        val DEFAULT_TOOL = DrawTool.PEN
        const val MIN_DELTA_UPDATE = 5f
        const val MIN_STROKE = 5f
        const val MAX_STROKE = 20f
        const val MIN_ERASER_WIDTH = 15f
        const val MAX_ERASER_WIDTH = 30f
        const val DEFAULT_STROKE = 10f
        const val DEFAULT_ERASER_SIZE = 22f
        const val DEFAULT_COLOR = "#FF000000" //Black
    }
    var paths: MutableLiveData<ArrayList<PenPath>> = MutableLiveData(ArrayList())
    private var currentPath: Path? = null
    private var lastCoordinate: Coordinate? = null
    var currentBrushInfo: BrushInfo = BrushInfo(DEFAULT_COLOR, DEFAULT_STROKE)
    var eraserWidth: Float = DEFAULT_ERASER_SIZE
    lateinit var bufferBrushColor: String
    var currentTool = DEFAULT_TOOL

    init {
        drawboardRepository.receiveStartPath().subscribe {
            receiveStartPath(it)
        }
        drawboardRepository.receiveUpdatePath().subscribe {
            receiveUpdateCurrentPath(it)
        }
        drawboardRepository.receiveEndPath().subscribe {
            receiveEndPath(it)
        }
    }

    fun switchCurrentTool(){
        currentTool = currentTool.switchTool()
    }

    fun getCurrentToolWidth(): Float{
        return when(currentTool){
            DrawTool.PEN -> currentBrushInfo.strokeWidth
            DrawTool.ERASER -> eraserWidth
        }
    }

    fun getCurrentToolMinWidth():Float{
        return when(currentTool){
            DrawTool.PEN -> MIN_STROKE
            DrawTool.ERASER -> MIN_ERASER_WIDTH
        }
    }

    fun getCurrentToolMaxWidth(): Float{
        return when(currentTool){
            DrawTool.PEN -> MAX_STROKE
            DrawTool.ERASER -> MAX_ERASER_WIDTH
        }
    }

    fun updateWidth(value: Float){
        when(currentTool){
            DrawTool.PEN -> currentBrushInfo.strokeWidth = value
            DrawTool.ERASER -> eraserWidth = value
        }
    }

    private fun receiveStartPath(startPoint: StartPoint) {
        currentPath = Path()
        val newPath = PenPath(currentPath!!, startPoint.brushInfo)
        newPath.pathCoords.add(startPoint.coord)
        newPath.visualCoords.add(startPoint.coord)
        paths.value?.add(newPath)
        currentPath!!.moveTo(startPoint.coord.x, startPoint.coord.y)
        currentPath!!.lineTo(startPoint.coord.x + 0.1f, startPoint.coord.y + 0.1f)
        lastCoordinate = startPoint.coord
        paths.postValue(paths.value)
    }


    fun startPath(coords: Coordinate) {
        //drawboardRepository.sendStartPath(coords, BrushInfo(brushColor, strokeWidth))
        receiveStartPath(StartPoint(coords, currentBrushInfo.clone()))
    }

    private fun receiveUpdateCurrentPath(coord: Coordinate) {
        if (currentPath == null || lastCoordinate == null)
            return
        currentPath!!.quadTo(lastCoordinate!!.x, lastCoordinate!!.y,
                (coord.x + lastCoordinate!!.x) / 2, (coord.y + lastCoordinate!!.y) / 2
        )
       // currentPath!!.lineTo(coord.x, coord.y)
        paths.value?.last()?.visualCoords?.add(coord)
        addBufferCoords(coord)
        lastCoordinate = coord
        paths.postValue(paths.value)
    }

    private fun addBufferCoords(coord: Coordinate){
        var direction = (coord-lastCoordinate!!)
        val numBufferNeeded = (direction.distance()/eraserWidth).toInt()
        direction = direction.normalized()
        var baseBuffCoord = lastCoordinate!!
        for(i in 1..numBufferNeeded){
            val buffCoord = baseBuffCoord + direction*eraserWidth
            paths.value!!.last().pathCoords.add(buffCoord)
            baseBuffCoord = buffCoord
        }
        paths.value!!.last().pathCoords.add(coord)
    }

    fun updateCurrentPath(coords: Coordinate) {
        var dx = MIN_DELTA_UPDATE
        var dy = MIN_DELTA_UPDATE
        if (lastCoordinate != null) {
            dx = abs(coords.x - lastCoordinate!!.x)
            dy = abs(coords.y - lastCoordinate!!.y)
        }
        if (dx >= MIN_DELTA_UPDATE || dy >= MIN_DELTA_UPDATE) {
            //drawboardRepository.sendUpdatePath(coords)
            receiveUpdateCurrentPath(coords)
        }
    }

    private fun receiveEndPath(coord: Coordinate) {
        currentPath!!.lineTo(coord.x, coord.y)
        paths.value?.last()?.visualCoords?.add(coord)
        addBufferCoords(coord)
        lastCoordinate = null
        currentPath = null
        paths.postValue(paths.value)
    }

    fun endPath(coords: Coordinate) {
        //drawboardRepository.sendEndPath(coords)
        receiveEndPath(coords)
    }

    fun confirmColor(): String {
        if (bufferBrushColor.isNotEmpty()) {
            currentBrushInfo.color = bufferBrushColor
            bufferBrushColor = ""
        }
        return currentBrushInfo.color
    }

    fun erase(coord: Coordinate){
        detectPathCollision(coord)
    }

    private fun detectPathCollision(coord: Coordinate){
        val rectF = RectF()
        val path = Path()
        path.moveTo(coord.x - eraserWidth, coord.y - eraserWidth)
        path.moveTo(coord.x + eraserWidth, coord.y - eraserWidth)
        path.moveTo(coord.x + eraserWidth, coord.y + eraserWidth)
        path.moveTo(coord.x - eraserWidth, coord.y + eraserWidth)
        path.close()
        path.computeBounds(rectF, true)

        breakLoop@for(i in paths.value!!.size-1 downTo 0){
            for(coordPath in paths.value!![i].pathCoords){
                if(rectF.contains(coordPath.x, coordPath.y)) {
                    println("${Random.nextInt()} Collision detected with rect at index $i")
                    break@breakLoop
                }
            }
        }
    }
}