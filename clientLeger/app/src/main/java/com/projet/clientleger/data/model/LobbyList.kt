package com.projet.clientleger.data.model

import com.projet.clientleger.data.api.model.lobby.Lobby
import kotlinx.serialization.Serializable

@Serializable
data class LobbyList(val list: List<Lobby>)
