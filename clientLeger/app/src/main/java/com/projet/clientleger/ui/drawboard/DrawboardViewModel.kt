package com.projet.clientleger.ui.drawboard

import android.graphics.Path
import android.graphics.RectF
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.projet.clientleger.data.enumData.DrawTool
import com.projet.clientleger.data.model.*
import com.projet.clientleger.data.model.command.DrawPathCommand
import com.projet.clientleger.data.model.command.ErasePathCommand
import com.projet.clientleger.data.repository.DrawboardRepository
import com.projet.clientleger.data.service.AudioService
import com.projet.clientleger.data.service.DrawingCommandsService
import com.projet.clientleger.data.service.TutorialService
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlin.collections.ArrayList
import kotlin.math.abs

@HiltViewModel
class DrawboardViewModel @Inject constructor(private val drawboardRepository: DrawboardRepository, private val drawingCommandsService: DrawingCommandsService,private val tutorialService: TutorialService,private val audioService: AudioService) :
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
    var paths: MutableLiveData<ArrayList<BufferedPathData>> = MutableLiveData(ArrayList())
    var currentBrushInfo: BrushInfo = BrushInfo(DEFAULT_COLOR, DEFAULT_STROKE)
    var eraserWidth: Float = DEFAULT_ERASER_SIZE
    lateinit var bufferBrushColor: String
    var currentTool = DEFAULT_TOOL
    var isUndoPossibleLiveData:MutableLiveData<Boolean> = MutableLiveData()
    var isRedoPossibleLiveData:MutableLiveData<Boolean> = MutableLiveData()
    var localStartPathCpt = 0
    var currentPath: BufferedPathData? = null

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

    fun boardwipe(){
        paths.value!!.clear()
        paths.postValue(paths.value)
        drawingCommandsService.clear()
    }

    fun switchCurrentTool(tool:String){
        when(tool){
            "eraser" -> currentTool = DrawTool.ERASER
            "pencil" -> currentTool = DrawTool.PEN
        }
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

    private fun receiveStartPath(startPoint: PathData) {
        val newPath = BufferedPathData(startPoint)
        newPath.addStartCoord(startPoint.coords.first())
        paths.value?.let { list ->
            var insertIndex = 0
            if(list.isNotEmpty())
                insertIndex = list.indexOfFirst { it.data.z >= newPath.data.z }
            if(insertIndex < 0)
                insertIndex = list.size - 1
            list.add(insertIndex, newPath)
        }
        currentPath = newPath
        paths.postValue(paths.value)
    }
    fun startLocalPath(coord:Coordinate){
        localStartPathCpt++
        val list = ArrayList<Coordinate>()
        list.add(coord)
        receiveStartPath(PathData(localStartPathCpt,0,currentBrushInfo.clone(),list))
    }


    fun redo(){
        drawingCommandsService.redo()
        isUndoPossibleLiveData.postValue(true)
    }

    fun undo(){
        drawingCommandsService.undo()
        isRedoPossibleLiveData.postValue(true)
    }

    fun startPath(coord: Coordinate) {
        drawboardRepository.sendStartPath(coord, currentBrushInfo)
    }

    fun receiveUpdateCurrentPath(coord: Coordinate) {
        if(paths.value!!.isNotEmpty()){
            currentPath?.addCoord(coord)
            paths.postValue(paths.value)
        }
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
    fun receiveEndPath(coord: Coordinate) {
        currentPath?.addEndCoord(coord)
        paths.postValue(paths.value)
    }

    private fun addPath(pathData: PathData){
        val pathExtended = BufferedPathData(pathData)
        paths.value!!.add(pathExtended)
        paths.value!!.sortBy { it.data.z }
        paths.postValue(paths.value)
    }

    private fun deletePath(pathId: Int){
        for(i in 0 until paths.value!!.size){
            paths.value!!.removeIf{
                it.data.pathId == pathId
            }
        }
        paths.postValue(paths.value)
    }

    fun endPath(coord: Coordinate) {
        drawboardRepository.sendEndPath(coord)
        drawingCommandsService.add(DrawPathCommand(paths.value!!.last().data.pathId, drawboardRepository))
        isUndoPossibleLiveData.postValue(true)
        isRedoPossibleLiveData.postValue(false)
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
        isUndoPossibleLiveData.postValue(true)
    }
    fun localErase(coord:Coordinate){
        val pathId = detectPathCollision(coord)
        if(pathId != -1){
            deletePath(pathId)
            drawingCommandsService.add(ErasePathCommand(pathId, drawboardRepository))
        }
        isUndoPossibleLiveData.postValue(true)
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
                    return paths.value!![i].data.pathId
                }
            }
        }
        return -1
    }
    fun isTutorialActive():Boolean{
        return tutorialService.isTutorialActive()
    }
    fun playSound(soundId:Int){
        audioService.playSound(soundId)
    }

    fun unsubscribe(){
        drawboardRepository.unsubscribe()
    }
}