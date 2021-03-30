package com.projet.clientleger.data.api.model.account

import kotlinx.serialization.Serializable

@Serializable
data class FriendInfo(val status: String, val _id: String, val friendid: String, val received: Boolean)
