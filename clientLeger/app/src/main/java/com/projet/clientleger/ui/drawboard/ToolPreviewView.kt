package com.projet.clientleger.ui.drawboard

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.View
import androidx.core.content.ContextCompat
import com.projet.clientleger.R
import com.projet.clientleger.data.enumData.DrawTool
import com.projet.clientleger.data.model.Coordinate
import dagger.hilt.android.AndroidEntryPoint


@AndroidEntryPoint
class ToolPreviewView : View {
    private val ERASER_PREVIEW_BORDER_WIDTH = 5f
    private lateinit var pathPaint: Paint
    private var width: Float = 5f
    private var currentToolType: DrawTool = DrawTool.PEN
    private var penColor: String = DrawboardViewModel.DEFAULT_COLOR

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

    fun changeTool(newTool: DrawTool, width: Float){
        currentToolType = newTool
        this.width = width
        invalidate()
    }

    fun updatePenColor(color: String){
        penColor = color
        invalidate()
    }


    fun updateWidth(width: Float){
        this.width = width
        invalidate()
    }

    private fun init() {
        pathPaint = Paint()
        pathPaint.style = Paint.Style.STROKE
        pathPaint.strokeJoin = Paint.Join.ROUND
        pathPaint.strokeCap = Paint.Cap.ROUND
        pathPaint.isAntiAlias = true
        pathPaint.color =  Color.parseColor("#000000")
    }

    @SuppressLint("DrawAllocation")
    override fun onDraw(canvas: Canvas) {
        canvas.save()
        canvas.drawColor(ContextCompat.getColor(context,R.color.white))
        when(currentToolType){
            DrawTool.PEN -> {
                pathPaint.strokeWidth = width
                pathPaint.color = Color.parseColor(penColor)
                val path = Path()
                path.moveTo(measuredWidth/2f, measuredHeight/2f)
                path.rLineTo(0.01f, 0.01f)
                canvas.drawPath(path, pathPaint)
            }
            DrawTool.ERASER -> {
                val centerCoord = Coordinate(measuredWidth/2f, measuredHeight/2f)
                pathPaint.color =  Color.parseColor("#000000")
                pathPaint.strokeWidth = ERASER_PREVIEW_BORDER_WIDTH
                val rect = Rect((centerCoord.x-width).toInt(), (centerCoord.y - width).toInt(), (centerCoord.x+width).toInt(), (centerCoord.y+width).toInt())
                canvas.drawRect(rect, pathPaint)
            }
        }
        canvas.restore()
    }

}