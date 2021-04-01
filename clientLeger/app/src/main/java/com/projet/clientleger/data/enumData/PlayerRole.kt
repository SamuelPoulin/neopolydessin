package com.projet.clientleger.data.enumData

enum class PlayerRole(val value: String) {
    DRAWER("active"),
    GUESSER("guesser"),
    PASSIVE("passive");

    companion object {
        fun stringToRole(sRole: String): PlayerRole {
        return when(sRole)
        {
            DRAWER.value -> DRAWER
            GUESSER.value -> GUESSER
            else -> PASSIVE
        }
    }
}
}