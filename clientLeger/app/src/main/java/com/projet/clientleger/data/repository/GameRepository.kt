package com.projet.clientleger.data.repository

import com.projet.clientleger.data.api.service.GameSocketService
import javax.inject.Inject

open class GameRepository @Inject constructor(private val gameSocketService: GameSocketService) {
}