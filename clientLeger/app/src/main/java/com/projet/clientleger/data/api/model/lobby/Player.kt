package com.projet.clientleger.data.api.model.lobby

import android.os.Parcelable
import kotlinx.android.parcel.Parcelize
import kotlinx.serialization.Serializable

@Serializable
@Parcelize
data class Player(val teamNumber: Int = 0, val playerName: String = "", val accountId: String = "", val avatar: String? = "") : Parcelable
