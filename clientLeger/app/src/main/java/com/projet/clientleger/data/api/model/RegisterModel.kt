package com.projet.clientleger.data.api.model

data class RegisterModel(
    var firstName: String?="",
    var lastName: String?="",
    var username: String? = "",
    var email: String? = "",
    var password: String? = "",
    var passwordConfirm: String? = ""
)
