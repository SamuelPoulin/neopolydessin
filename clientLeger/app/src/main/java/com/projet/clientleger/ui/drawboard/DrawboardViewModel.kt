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
    private lateinit var currentPath: Path
    private lateinit var lastCoordinate: Coordinate
    private val bufferUpdateCoords: ArrayList<Coordinate> = ArrayList()
    lateinit var brushColor: String
    lateinit var bufferBrushColor: String

    init {
        brushColor = "#FF000000"
        drawboardRepository.receiveStartPath().subscribe {
            startPath(it)
        }
        drawboardRepository.receiveUpdatePath().subscribe {
            updateCurrentPath(it)
        }
    }

    companion object {
        const val MIN_STROKE = 5f
        const val MAX_STROKE = 20f
        const val DEFAULT_STROKE = 10f
    }

    private fun startPath(startPoint: StartPoint) {
        println("receive startpath ${LocalDateTime.now()}")
        currentPath = Path()
        paths.value?.add(PenPath(currentPath, startPoint.brushInfo))
        currentPath.moveTo(startPoint.coord.x, startPoint.coord.y)
        currentPath.lineTo(startPoint.coord.x + 0.1f, startPoint.coord.y + 0.1f)
        lastCoordinate = startPoint.coord
        paths.postValue(paths.value)
    }


    fun startPath(coords: Coordinate, strokeWidth: Float) {
        println("Send startpath ${LocalDateTime.now()}")
        lastCoordinate = coords
        drawboardRepository.sendStartPath(coords, BrushInfo(brushColor, strokeWidth))
    }

    private fun updateCurrentPath(coords: ArrayList<Coordinate>) {
        println("receive update ${LocalDateTime.now()}")
        for (coord in coords) {
            currentPath.quadTo(
                lastCoordinate.x, lastCoordinate.y,
                (coord.x + lastCoordinate.x) / 2, (coord.y + lastCoordinate.y) / 2
            )
        }
        lastCoordinate = coords.last()
        paths.postValue(paths.value)
    }

    fun updateCurrentPath(coords: Coordinate) {
        println("send update ${LocalDateTime.now()}")
        val dx = abs(coords.x - lastCoordinate.x)
        val dy = abs(coords.y - lastCoordinate.y)
        if (dx >= 2 || dy >= 2) {
            bufferUpdateCoords.add(coords)
            drawboardRepository.sendUpdatePath(bufferUpdateCoords)
            bufferUpdateCoords.clear()
        }
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

    fun createLobby(gameType: GameType, difficulty: Difficulty, isPrivate: Boolean) {
        drawboardRepository.createLobby(gameType, difficulty, isPrivate)
    }
}