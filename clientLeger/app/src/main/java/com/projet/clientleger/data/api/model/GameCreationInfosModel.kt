package com.projet.clientleger.data.api.model

import java.io.Serializable

data class GameCreationInfosModel(val gameCreator:String, val gameMode:String,val difficulty:String,val isPrivate:Boolean):Serializable