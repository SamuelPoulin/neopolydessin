package com.projet.clientleger.data.enumData

enum class GameState(val value: String) {
    LOBBY("lobby"),
    IN_GAME("game"),
    DRAWING("draw"),
    REPLY("reply"),
    GAME_OVER("over");

    companion object{
        fun stringToEnum(state: String): GameState?{
            return when(state){
                LOBBY.value -> LOBBY
                IN_GAME.value -> IN_GAME
                DRAWING.value -> DRAWING
                REPLY.value -> REPLY
                GAME_OVER.value -> GAME_OVER
                else -> null
            }
        }
    }
}