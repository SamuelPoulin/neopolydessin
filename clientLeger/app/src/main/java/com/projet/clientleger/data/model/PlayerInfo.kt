package com.projet.clientleger.data.model

import kotlinx.serialization.Serializable

@Serializable
data class PlayerInfo(val teamNumber: Int, val playerName: String, val accountId: String)
