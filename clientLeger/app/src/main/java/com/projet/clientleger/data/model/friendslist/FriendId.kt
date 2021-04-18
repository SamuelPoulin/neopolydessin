package com.projet.clientleger.data.model.friendslist

import android.os.Parcelable
import kotlinx.android.parcel.Parcelize
import kotlinx.serialization.Serializable


@Serializable
@Parcelize
data class FriendId(var _id: String?, val username: String, val avatar: String): Parcelable
