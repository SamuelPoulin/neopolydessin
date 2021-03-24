package com.projet.clientleger.data.enum

enum class DrawTool(val value: String) {
    PEN("Pen"),
    ERASER("Eraser");

    fun switchTool(): DrawTool{
        return if(this == PEN)
            ERASER
        else
            PEN
    }
}