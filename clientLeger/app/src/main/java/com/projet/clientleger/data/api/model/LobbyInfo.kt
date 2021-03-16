package com.projet.clientleger.data.api.model

data class LobbyInfo(val lobbyId:String, val teamsInfo:Array<TeamInfo>, val gameType:GameType) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as LobbyInfo

        if (!teamsInfo.contentEquals(other.teamsInfo)) return false

        return true
    }

    override fun hashCode(): Int {
        return teamsInfo.contentHashCode()
    }
}
