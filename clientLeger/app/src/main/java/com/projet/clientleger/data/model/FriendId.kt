package com.projet.clientleger.data.model

import android.os.Parcelable
import kotlinx.android.parcel.Parcelize
import kotlinx.serialization.Serializable


@Serializable
@Parcelize
data class FriendId(var id: String?, val username: String): Parcelable
