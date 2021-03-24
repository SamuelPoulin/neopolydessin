package com.projet.clientleger.data.api.service

import javax.inject.Inject

class GameSocketService @Inject constructor(private val socketService: SocketService) {
    fun receiveTimer(){}
    fun receiveRoles(){}
    fun receiveKeyWord(){}
}