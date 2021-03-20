package com.projet.clientleger.ui.drawboard

import android.graphics.Path
import android.graphics.RectF
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.enum.DrawTool
import com.projet.clientleger.data.model.*
import com.projet.clientleger.data.model.command.DrawPathCommand
import com.projet.clientleger.data.model.command.ErasePathCommand
import com.projet.clientleger.data.repository.DrawboardRepository
import com.projet.clientleger.data.service.DrawingCommandsService
import dagger.hilt.android.lifecycle.HiltViewModel
import java.util.*
import javax.inject.Inject
import kotlin.collections.ArrayList
import kotlin.math.abs
import kotlin.random.Random

@HiltViewModel
class DrawboardViewModel @Inject constructor(private val drawboardRepository: DrawboardRepository, private val drawingCommandsService: DrawingCommandsService) :
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
    var paths: MutableLiveData<ArrayList<PathExtended>> = MutableLiveData(ArrayList())
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
        drawboardRepository.receivePath().subscribe {
            addPath(it)
        }
        drawboardRepository.receiveErase().subscribe{
            deletePath(it)
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

    private fun receiveStartPath(startPoint: PathBasicData) {
        val newPath = PathExtended(PathBasicData(startPoint.pathId,startPoint.brushInfo))
        newPath.addStartCoord(startPoint.coords.first())
        paths.value?.add(newPath)
        paths.postValue(paths.value)
    }

    fun redo(){
        drawingCommandsService.redo()
    }

    fun undo(){
        drawingCommandsService.undo()
    }

    fun startPath(coord: Coordinate) {
        drawboardRepository.sendStartPath(coord, currentBrushInfo)
    }

    private fun receiveUpdateCurrentPath(coord: Coordinate) {
        paths.value?.last()?.addCoord(coord)
        paths.postValue(paths.value)
    }

    fun updateCurrentPath(coords: Coordinate) {
        var dx = MIN_DELTA_UPDATE
        var dy = MIN_DELTA_UPDATE
        if(paths.value!!.isNotEmpty()) {
            val lastCoordinate = paths.value!!.last().getLastCoord()
            if (lastCoordinate != null) {
                dx = abs(coords.x - lastCoordinate.x)
                dy = abs(coords.y - lastCoordinate.y)
            }
        }
        if (dx >= MIN_DELTA_UPDATE || dy >= MIN_DELTA_UPDATE) {
            drawboardRepository.sendUpdatePath(coords)
        }
    }

    private fun receiveEndPath(coord: Coordinate) {
        paths.value?.last()?.addEndCoord(coord)
        paths.postValue(paths.value)
    }



    private fun addPath(pathBasicData: PathBasicData){
        val pathExtended = PathExtended(pathBasicData)
        paths.value!!.add(pathExtended)
        paths.value!!.sortBy { it.basicData.pathId }
        paths.postValue(paths.value)
    }

    private fun deletePath(pathId: Int){
        for(i in 0 until paths.value!!.size){
            paths.value!!.removeIf{
                it.basicData.pathId == pathId
            }
        }
        paths.postValue(paths.value)
    }

    fun endPath(coord: Coordinate) {
        drawboardRepository.sendEndPath(coord)
        drawingCommandsService.add(DrawPathCommand(paths.value!!.last().basicData.pathId, drawboardRepository))
    }

    fun confirmColor(): String {
        if (bufferBrushColor.isNotEmpty()) {
            currentBrushInfo.color = bufferBrushColor
            bufferBrushColor = ""
        }
        return currentBrushInfo.color
    }

    fun erase(coord: Coordinate){
        val pathId = detectPathCollision(coord)
        if(pathId != -1){
            drawboardRepository.sendErasePath(pathId)
            drawingCommandsService.add(ErasePathCommand(pathId, drawboardRepository))
        }
    }

    private fun detectPathCollision(coord: Coordinate) : Int{
        val rectF = RectF()
        val path = Path()
        path.moveTo(coord.x - eraserWidth, coord.y - eraserWidth)
        path.moveTo(coord.x + eraserWidth, coord.y - eraserWidth)
        path.moveTo(coord.x + eraserWidth, coord.y + eraserWidth)
        path.moveTo(coord.x - eraserWidth, coord.y + eraserWidth)
        path.close()
        path.computeBounds(rectF, true)

        for(i in paths.value!!.size-1 downTo 0){
            for(buffCoord in paths.value!![i].extendedCoords){
                if(rectF.contains(buffCoord.x, buffCoord.y)) {
                    println("${Random.nextInt()} Collision detected with rect at index $i")
                    return paths.value!![i].basicData.pathId
                }
            }
        }
        return -1
    }
}