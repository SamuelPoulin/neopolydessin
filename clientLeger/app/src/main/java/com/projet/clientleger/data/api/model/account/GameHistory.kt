package com.projet.clientleger.data.api.model.account

import kotlinx.serialization.Serializable

@Serializable
data class GameHistory(val games:ArrayList<Game>,
                       val nbGamePlayed:String,
                       val winPercentage:Float,
                       val averageGameTime:Float,
                       val totalTimePlayed:Long,
                       val bestScoreSolo:Int,
                       val bestScoreCoop:Int)
