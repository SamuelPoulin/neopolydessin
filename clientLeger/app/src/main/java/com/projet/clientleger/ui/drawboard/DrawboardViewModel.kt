package com.projet.clientleger.ui.drawboard

import android.graphics.Path
import androidx.core.content.ContextCompat
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import com.projet.clientleger.R
import com.projet.clientleger.data.model.Coordinate
import com.projet.clientleger.data.model.PenPath
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlin.math.abs

@HiltViewModel
class DrawboardViewModel @Inject constructor(): ViewModel() {
    var paths: MutableLiveData<ArrayList<PenPath>> = MutableLiveData(ArrayList())
    private lateinit var currentPath: Path
    private lateinit var lastCoordinate: Coordinate

    fun startPath(coords: Coordinate, color: Int){
        currentPath = Path()
        paths.value?.add(PenPath(color, 20f, currentPath))
        currentPath.moveTo(coords.x, coords.y)
        currentPath.lineTo(coords.x + 0.1f, coords.y + 0.1f )
        lastCoordinate = coords
    }

    fun updateCurrentPath(coords: Coordinate){
        val dx = abs(coords.x - lastCoordinate.x)
        val dy = abs(coords.y - lastCoordinate.y)
        if(dx >= 2 || dy >= 2){
            currentPath.quadTo(lastCoordinate.x, lastCoordinate.y,
                (coords.x+lastCoordinate.x)/2, (coords.y+lastCoordinate.y)/2)
            lastCoordinate = coords
        }
    }
}