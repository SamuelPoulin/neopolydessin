package com.projet.clientleger.data.enumData

enum class GameRole(val value: String) {
    DRAWER("active"),
    GUESSER("guesser"),
    PASSIVE("passive");

    companion object {
        fun stringToRole(sRole: String): GameRole {
        return when(sRole)
        {
            DRAWER.value -> DRAWER
            GUESSER.value -> GUESSER
            PASSIVE.value -> PASSIVE
            else -> PASSIVE
        }
    }
}
}