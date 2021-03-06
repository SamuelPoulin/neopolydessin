package com.projet.clientleger.data.model.friendslist

import android.os.Parcelable
import kotlinx.android.parcel.Parcelize
import kotlinx.serialization.Serializable

@Serializable
@Parcelize
data class Friend(
        var friendId: FriendId?,
        var status: String,
        var received: Boolean,
        var isOnline: Boolean): Parcelable
