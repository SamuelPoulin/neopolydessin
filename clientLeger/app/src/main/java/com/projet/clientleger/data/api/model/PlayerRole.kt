package com.projet.clientleger.data.api.model

import android.os.Parcelable
import kotlinx.android.parcel.Parcelize
import kotlinx.serialization.Serializable

@Serializable
@Parcelize
data class PlayerRole(var playerName:String, var playerStatus:String):Parcelable
