package com.projet.clientleger.data.enumData

enum class Difficulty(val value: String) {
    EASY("easy"),
    INTERMEDIATE("intermediate"),
    HARD("hard");

    fun toFrenchString(): String{
        return when(this){
            EASY -> "Facile"
            INTERMEDIATE -> "Intermediaire"
            HARD -> "Difficile"
        }
    }

    companion object{
        fun fromFrenchToEnum(difficulty: String): Difficulty{
            return when(difficulty){
                "Facile" -> EASY
                "Intermediaire" -> INTERMEDIATE
                else -> HARD
            }
        }
    }
}