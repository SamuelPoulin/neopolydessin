package com.projet.clientleger.data.enumData

import java.util.*

enum class GameType(val value:String) {
    CLASSIC("classic"),
    SPRINT_SOLO("sprintSolo"),
    SPRINT_COOP("sprintCoop");

    fun toFrenchString(): String{
        return when(this){
            CLASSIC -> "Classique"
            SPRINT_SOLO -> "Solo"
            SPRINT_COOP -> "Coop"
        }
    }

    companion object{
        fun fromFrenchToEnum(gameType: String): GameType{
            return when (gameType){
                "Solo" -> SPRINT_SOLO
                "Coop" -> SPRINT_COOP
                else -> CLASSIC
            }
        }
    }
}