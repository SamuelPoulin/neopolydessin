package com.projet.clientleger.data.enumData

enum class GuessStatus(val value: String) {
    CORRECT("correct"),
    CLOSE("close"),
    WRONG("wrong");

    companion object {
        fun sToEnum(status: String): GuessStatus {
        return when(status)
        {
            CORRECT.value -> CORRECT
            CLOSE.value -> CLOSE
            WRONG.value -> WRONG
            else -> WRONG
        }
    }
}
}