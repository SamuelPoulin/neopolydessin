package com.projet.clientleger.data.model.command

import com.projet.clientleger.data.model.PenPath

class CommandFactory(private val drawPathCallback: (penPath: PenPath) -> Unit, private val erasePathCallback: (pathId: Int) -> Unit) {

    fun createDrawPathCommand(penPath: PenPath): DrawPathCommand{
        return DrawPathCommand(penPath, drawPathCallback, erasePathCallback)
    }

    fun createErasePathCommand(penPath: PenPath): ErasePathCommand {
        return ErasePathCommand(penPath, drawPathCallback, erasePathCallback)
    }
}