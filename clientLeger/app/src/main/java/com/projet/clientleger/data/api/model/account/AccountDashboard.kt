package com.projet.clientleger.data.api.model.account

import kotlinx.serialization.Serializable

@Serializable
data class AccountDashboard(val _id: String,
                            val firstName: String,
                            val lastName: String,
                            val username: String,
                            val email: String,
                            val logins:Logins,
                            val gameHistory: GameHistory,
                            val createdDate: Long,
                            val avatar: String)
