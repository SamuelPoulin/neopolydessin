package com.projet.clientleger.ui.drawboard

import android.graphics.Path
import androidx.core.content.ContextCompat
import androidx.databinding.Bindable
import androidx.databinding.Observable
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.projet.clientleger.R
import com.projet.clientleger.data.enum.Difficulty
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

@HiltViewModel
class DrawboardViewModel @Inject constructor(private val drawboardRepository: DrawboardRepository) :
        ViewModel() {
    var paths: MutableLiveData<ArrayList<PenPath>> = MutableLiveData(ArrayList())
    private var currentPath: Path? = null
    private var lastCoordinate: Coordinate? = null
    lateinit var brushColor: String
    lateinit var bufferBrushColor: String

    init {
        brushColor = "#FF000000"
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

    companion object {
        const val MIN_STROKE = 5f
        const val MAX_STROKE = 20f
        const val DEFAULT_STROKE = 10f
    }

    private fun receiveStartPath(startPoint: StartPoint) {
        currentPath = Path()
        paths.value?.add(PenPath(currentPath!!, startPoint.brushInfo))
        currentPath!!.moveTo(startPoint.coord.x, startPoint.coord.y)
        currentPath!!.lineTo(startPoint.coord.x + 0.1f, startPoint.coord.y + 0.1f)
        lastCoordinate = startPoint.coord
        paths.postValue(paths.value)
    }


    fun startPath(coords: Coordinate, strokeWidth: Float) {
        drawboardRepository.sendStartPath(coords, BrushInfo(brushColor, strokeWidth))
    }

    private fun receiveUpdateCurrentPath(coords: Coordinate) {
        if (currentPath == null || lastCoordinate == null)
            return
        currentPath!!.quadTo(lastCoordinate!!.x, lastCoordinate!!.y,
                (coords.x + lastCoordinate!!.x) / 2, (coords.y + lastCoordinate!!.y) / 2
        )
        lastCoordinate = coords
        paths.postValue(paths.value)
    }

    fun updateCurrentPath(coords: Coordinate) {
        var dx = 2f
        var dy = 2f
        if (lastCoordinate != null) {
            dx = abs(coords.x - lastCoordinate!!.x)
            dy = abs(coords.y - lastCoordinate!!.y)
        }
        if (dx >= 2 || dy >= 2) {
            drawboardRepository.sendUpdatePath(coords)
        }
    }

    private fun receiveEndPath(coords: Coordinate) {
        currentPath!!.lineTo(coords.x, coords.y)

        lastCoordinate = null
        currentPath = null
        paths.postValue(paths.value)
    }

    fun endPath(coords: Coordinate) {
        drawboardRepository.sendEndPath(coords)
    }

    fun confirmColor() {
        if (bufferBrushColor.isNotEmpty()) {
            brushColor = bufferBrushColor
            bufferBrushColor = ""
        }
    }
}