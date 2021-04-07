package com.projet.clientleger.data.api.model.account

data class AccountDashboard(val _id: String,
                            val firstName: String,
                            val lastName: String,
                            val username: String,
                            val email: String,
                            val friends: ArrayList<FriendInfo>,
                            val createdDate: Long,
                            val avatar: String)
