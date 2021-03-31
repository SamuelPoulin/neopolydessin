package com.projet.clientleger.data.api.model

import kotlinx.serialization.Serializable

@Serializable
data class Timer(
        val serverTime:Long,
        val  timestamp:Long,
)
