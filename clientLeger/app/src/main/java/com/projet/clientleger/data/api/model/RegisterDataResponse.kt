package com.projet.clientleger.data.api.model

data class RegisterDataResponse(
    override var accessToken: String,
    override var refreshToken: String
) : IRegisterDataResponse
