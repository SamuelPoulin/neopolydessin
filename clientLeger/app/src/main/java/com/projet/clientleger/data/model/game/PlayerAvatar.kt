package com.projet.clientleger.data.model.game

import android.graphics.Bitmap
import android.os.Parcelable
import kotlinx.android.parcel.Parcelize
import kotlinx.serialization.Serializable

@Serializable
data class PlayerAvatar(val username: String, val avatarId: String)
