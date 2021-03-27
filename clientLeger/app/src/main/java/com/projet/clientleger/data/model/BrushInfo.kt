package com.projet.clientleger.data.model

import kotlinx.serialization.Serializable

@Serializable
data class BrushInfo(var color: String, var strokeWidth: Float){
    fun clone(): BrushInfo{
        return BrushInfo(color, strokeWidth)
    }
}
