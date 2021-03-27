package com.projet.clientleger.ui.drawboard

import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.View
import androidx.core.content.ContextCompat
import com.projet.clientleger.R
import com.projet.clientleger.data.model.BufferedPathData
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class DrawingView : View {
    private var paths = ArrayList<BufferedPathData>()
    private lateinit var pathPaint: Paint


    constructor(context: Context) : super(context) {
        init()
    }

    constructor(context: Context, attrs: AttributeSet) : super(context, attrs) {
        init()
    }

    constructor(context: Context, attrs: AttributeSet, defStyle: Int) : super(
        context,
        attrs,
        defStyle
    ) {
        init()
    }

    fun updatePaths(newList: ArrayList<BufferedPathData>){
        paths = newList
        invalidate()
    }

    private fun init() {
        pathPaint = Paint()
        pathPaint.style = Paint.Style.STROKE
        pathPaint.strokeJoin = Paint.Join.ROUND
        pathPaint.strokeCap = Paint.Cap.ROUND
        pathPaint.isAntiAlias = true
    }

    override fun onDraw(canvas: Canvas) {
        canvas.save()
        canvas.drawColor(ContextCompat.getColor(context,R.color.white))
        for(path in paths){
            pathPaint.color =  Color.parseColor(path.data.brushInfo.color)
            pathPaint.strokeWidth = path.data.brushInfo.strokeWidth
            canvas.drawPath(path.graphicPath, pathPaint)
        }
        canvas.restore()
    }

}