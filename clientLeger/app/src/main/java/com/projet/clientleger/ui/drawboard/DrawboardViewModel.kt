package com.projet.clientleger.ui.drawboard

import android.graphics.Path
import androidx.core.content.ContextCompat
import androidx.databinding.Bindable
import androidx.databinding.Observable
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.projet.clientleger.R
import com.projet.clientleger.data.model.BrushInfo
import com.projet.clientleger.data.model.Coordinate
import com.projet.clientleger.data.model.PenPath
import com.projet.clientleger.data.repository.DrawboardRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import java.util.*
import javax.inject.Inject
import kotlin.collections.ArrayList
import kotlin.math.abs

@HiltViewModel
class DrawboardViewModel @Inject constructor(private val drawboardRepository: DrawboardRepository): ViewModel() {
    var paths: MutableLiveData<ArrayList<PenPath>> = MutableLiveData(ArrayList())
    private lateinit var currentPath: Path
    private lateinit var lastCoordinate: Coordinate
    private val bufferUpdateCoords: ArrayList<Coordinate> = ArrayList()
    lateinit var brushColor: String
    lateinit var bufferBrushColor: String

    init {
        brushColor = "#FF000000"
    }

    companion object{
        const val MIN_STROKE = 5f
        const val MAX_STROKE = 20f
        const val DEFAULT_STROKE = 10f
    }

    fun startPath(coords: Coordinate, strokeWidth: Float){

        currentPath = Path()
        paths.value?.add(PenPath(currentPath, BrushInfo(brushColor, strokeWidth)))
        currentPath.moveTo(coords.x, coords.y)
        currentPath.lineTo(coords.x + 0.1f, coords.y + 0.1f )
        lastCoordinate = coords
        //drawboardRepository.sendStartPath(coords, brushInfo)
    }

    fun updateCurrentPath(coords: Coordinate){
        val dx = abs(coords.x - lastCoordinate.x)
        val dy = abs(coords.y - lastCoordinate.y)
        if(dx >= 2 || dy >= 2){
            currentPath.quadTo(lastCoordinate.x, lastCoordinate.y,
                (coords.x+lastCoordinate.x)/2, (coords.y+lastCoordinate.y)/2)
            lastCoordinate = coords
        }
//        bufferUpdateCoords.add(coords)
//        if(bufferUpdateCoords.size > 10){
//            drawboardRepository.sendUpdatePath(bufferUpdateCoords.toTypedArray())
//        }
    }

    fun endPath(coords: Coordinate){
        drawboardRepository.sendEndPath(coords)
    }

    fun confirmColor(){
        if(bufferBrushColor.isNotEmpty()){
            brushColor = bufferBrushColor
            bufferBrushColor = ""
        }
    }
}