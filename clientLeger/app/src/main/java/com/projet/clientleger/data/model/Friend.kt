package com.projet.clientleger.data.model

import com.projet.clientleger.data.enum.FriendStatus

data class Friend(val id: String, val username: String, val status: FriendStatus, val received: Boolean)
