package com.projet.clientleger.data.api.model.account

import kotlinx.serialization.Serializable

@Serializable
data class GameHistory(val games:ArrayList<Game>,
                       val nbGamesPlayed:Int,
                       val winPercentage:Float,
                       val averageGameTime:Long,
                       val totalTimePlayed:Long,
                       val bestScoreSolo:Int,
                       val bestScoreCoop:Int)
