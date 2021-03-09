package com.projet.clientleger.data.model

import android.os.Parcelable
import kotlinx.android.parcel.Parcelize
import kotlinx.serialization.Serializable

@Serializable
@Parcelize
data class Friend(
    var friendId: String,
    var username: String,
    var status: String,
    var received: Boolean): Parcelable
