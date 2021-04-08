package com.projet.clientleger.data.api.model.account

import com.projet.clientleger.data.enumData.GameResult
import com.projet.clientleger.data.enumData.GameType
import kotlinx.serialization.Serializable

@Serializable
data class Game(val gameResult: GameResult,
                val startDate:Long,
                val endDate:Long,
                val gameType:GameType,
                val team:ArrayList<Team>)
