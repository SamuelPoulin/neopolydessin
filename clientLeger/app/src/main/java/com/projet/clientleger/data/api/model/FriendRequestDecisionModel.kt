package com.projet.clientleger.data.api.model

import kotlinx.serialization.Serializable

@Serializable
data class FriendRequestDecisionModel(val idOfFriend:String, val decision: String)
