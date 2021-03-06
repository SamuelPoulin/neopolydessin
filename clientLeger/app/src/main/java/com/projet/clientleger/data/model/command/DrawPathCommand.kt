package com.projet.clientleger.data.model.command

import com.projet.clientleger.data.repository.DrawboardRepository
import com.projet.clientleger.data.service.TutorialService

class DrawPathCommand(private val pathId: Int, private val drawboardRepository: DrawboardRepository): Command {
    override fun execute() {
        drawboardRepository.sendPath(pathId)
    }

    override fun undo() {
        drawboardRepository.sendErasePath(pathId)
    }
}