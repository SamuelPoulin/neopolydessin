package com.projet.clientleger.data.model.command

import com.projet.clientleger.data.model.PenPath

class DrawPathCommand(private val penPath: PenPath,
                      private val drawPathCallback: (penPath: PenPath) -> Unit,
                      private val erasePathCallback: (pathId: Int) -> Unit): DrawingCommand(drawPathCallback, erasePathCallback) {
    override fun execute() {
        drawPathCallback.invoke(penPath)
    }

    override fun undo() {
        erasePathCallback.invoke(penPath.pathId)
    }
}