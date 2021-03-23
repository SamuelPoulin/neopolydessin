package com.projet.clientleger.data.model

import android.os.Parcelable
import kotlinx.android.parcel.Parcelize
import kotlinx.serialization.Serializable

@Serializable
@Parcelize
data class PlayerInfo(val teamNumber: Int, val playerName: String, val accountId: String) : Parcelable
