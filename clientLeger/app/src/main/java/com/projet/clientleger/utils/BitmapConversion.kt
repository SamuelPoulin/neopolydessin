package com.projet.clientleger.utils

import android.content.Context
import android.graphics.*
import androidx.core.content.ContextCompat

object BitmapConversion {
    fun vectorDrawableToBitmap(context: Context, drawableId: Int): Bitmap{
        val drawable = ContextCompat.getDrawable(context, drawableId)!!
        val bitmap = Bitmap.createBitmap(drawable.intrinsicWidth, drawable.intrinsicHeight, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        drawable.setBounds(0, 0, canvas.width, canvas.height)
        drawable.draw(canvas)
        return bitmap
    }

    fun toRoundedBitmap(bitmap: Bitmap): Bitmap{
        val roundedBitmap = Bitmap.createBitmap(bitmap.width, bitmap.height, Bitmap.Config.ARGB_8888)
        val shader = BitmapShader(bitmap, Shader.TileMode.CLAMP, Shader.TileMode.CLAMP)
        val paint = Paint()
        val canvas = Canvas(roundedBitmap)
        paint.isAntiAlias = true
        paint.shader = shader
        val rect = RectF(0f, 0f, bitmap.width.toFloat(), bitmap.height.toFloat())
        canvas.drawRoundRect(rect, bitmap.width.toFloat(), bitmap.width.toFloat(), paint)
        return roundedBitmap
    }

}