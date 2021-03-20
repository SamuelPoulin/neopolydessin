package com.projet.clientleger.data.model.command

import com.projet.clientleger.data.model.PenPath

class CommandFactory(private val drawPathCallback: (penPath: PenPath) -> Unit,
                     private val erasePathCallback: (pathId: Int) -> PenPath?) {

    fun createDrawPathCommand(penPath: PenPath): DrawPathCommand{
        return DrawPathCommand(penPath, drawPathCallback, erasePathCallback)
    }

    fun createErasePathCommand(pathId: Int): ErasePathCommand {
        return ErasePathCommand(pathId, drawPathCallback, erasePathCallback)
    }
}