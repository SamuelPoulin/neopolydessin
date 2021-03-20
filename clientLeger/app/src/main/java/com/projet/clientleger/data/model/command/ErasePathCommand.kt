package com.projet.clientleger.data.model.command

import com.projet.clientleger.data.model.PenPath

class ErasePathCommand(private val penPath: PenPath,
                       private val drawPathCallback: (penPath: PenPath) -> Unit,
                       private val erasePathCallback: (pathId: Int) -> Unit): DrawingCommand(drawPathCallback, erasePathCallback) {
    override fun execute() {
        erasePathCallback.invoke(penPath.pathId)
    }

    override fun undo() {
        drawPathCallback.invoke(penPath)
    }
}