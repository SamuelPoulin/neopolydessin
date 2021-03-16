package com.projet.clientleger.data.api.model

data class TeamInfo(val teamNumber:Int, val playerNames:Array<String>) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as TeamInfo

        if (!playerNames.contentEquals(other.playerNames)) return false

        return true
    }

    override fun hashCode(): Int {
        return playerNames.contentHashCode()
    }
}