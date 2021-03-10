package com.projet.clientleger.data.model

import android.os.Parcelable
import kotlinx.android.parcel.Parcelize

@Parcelize
data class Friend(
    var friendId: String,
    var username: String,
    var status: String,
    var received: Boolean): Parcelable
