package com.projet.clientleger.data.api.model.account

import com.projet.clientleger.data.enumData.GameResult
import com.projet.clientleger.data.enumData.GameType
import kotlinx.serialization.Serializable

@Serializable
data class Game(val gameResult: String,
                val startDate:Long,
                val endDate:Long,
                val gameType:String,
                val team:ArrayList<Team>)
