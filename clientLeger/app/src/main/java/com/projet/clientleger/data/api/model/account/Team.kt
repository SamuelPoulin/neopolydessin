package com.projet.clientleger.data.api.model.account

import kotlinx.serialization.Serializable

@Serializable
data class Team(val score:Int,
                val playerNames: ArrayList<String>)
