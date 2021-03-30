package com.projet.clientleger.data.api.model

import android.os.Parcelable
import kotlinx.android.parcel.Parcelize
import kotlinx.serialization.Serializable

@Serializable
@Parcelize
data class PlayerRole(val playerName:String, val playerStatus:PlayerStatus):Parcelable
