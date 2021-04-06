package com.projet.clientleger.data.api.model

import android.os.Parcelable
import kotlinx.android.parcel.Parcelize
import kotlinx.serialization.Serializable

@Parcelize
@Serializable
data class TeamScore(
        val teamNumber:Int,
        val  score:Int,
):Parcelable