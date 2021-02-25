package com.projet.clientleger.data.api.model

data class RegisterResponse(
    val isSucessful: Boolean, val message: String,
    override var accessToken: String,
    override var refreshToken: String
) : IRegisterDataResponse