package com.projet.clientleger.data.enumData

enum class ReasonEndGame(val value:String) {
    PLAYER_DISCONNECTED("playerDisconnected"),
    WINNING_SCORE_REACHED("winningScoreReached"),
    TIME_RUN_OUT("timeRunOut");

    fun findDialogMessage(): String{
        return when(this){
            PLAYER_DISCONNECTED -> "La partie est terminée car un joueur a quitté"
            WINNING_SCORE_REACHED -> "Partie terminée ! Score limite atteint !"
            TIME_RUN_OUT -> "Temps Écoulé, la partie est terminée !"
        }
    }
    companion object{
        fun stringToEnum(reason: String): ReasonEndGame{
            return when(reason) {
                PLAYER_DISCONNECTED.value -> PLAYER_DISCONNECTED
                WINNING_SCORE_REACHED.value -> WINNING_SCORE_REACHED
                else -> TIME_RUN_OUT
            }
        }
    }
}
