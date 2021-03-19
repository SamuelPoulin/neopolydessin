package com.projet.clientleger.data.model

import com.projet.clientleger.data.api.model.LobbyInfo
import kotlinx.serialization.Serializable

@Serializable
data class LobbyList(val list: List<LobbyInfo>)
