package com.projet.clientleger.data.model.friendslist

import kotlinx.serialization.Serializable

@Serializable
data class Friendslist(val _id: String?, val friends: List<Friend>)