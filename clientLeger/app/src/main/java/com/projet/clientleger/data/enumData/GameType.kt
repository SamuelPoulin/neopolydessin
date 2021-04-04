package com.projet.clientleger.data.enumData

import java.util.*

enum class GameType(val value:String) {
    CLASSIC("classic"),
    SPRINT_SOLO("sprintSolo"),
    SPRINT_COOP("sprintCoop");

    fun toFrenchString(): String{
        return when(this){
            CLASSIC -> FR_CLASSIC
            SPRINT_SOLO -> FR_SOLO
            SPRINT_COOP -> FR_COOP
        }
    }

    companion object{
        const val FR_CLASSIC = "Classique"
        const val FR_SOLO = "Sprint Solo"
        const val FR_COOP = "Sprint Co-op"

        fun fromFrenchToEnum(gameType: String): GameType{
            return when (gameType){
                FR_SOLO -> SPRINT_SOLO
                FR_COOP -> SPRINT_COOP
                else -> CLASSIC
            }
        }

        fun stringToEnum(gameType: String): GameType{
            return when(gameType) {
                CLASSIC.value -> CLASSIC
                SPRINT_SOLO.value ->SPRINT_SOLO
                else -> SPRINT_COOP
            }

        }
    }
}