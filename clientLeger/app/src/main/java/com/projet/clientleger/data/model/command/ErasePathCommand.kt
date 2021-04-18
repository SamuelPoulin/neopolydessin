package com.projet.clientleger.data.model.command

import com.projet.clientleger.data.repository.DrawboardRepository

class ErasePathCommand(private val pathId: Int,
                       private val drawboardRepository: DrawboardRepository): Command {
    override fun execute() {
        drawboardRepository.sendErasePath(pathId)
    }

    override fun undo() {
        drawboardRepository.sendPath(pathId)
    }
}