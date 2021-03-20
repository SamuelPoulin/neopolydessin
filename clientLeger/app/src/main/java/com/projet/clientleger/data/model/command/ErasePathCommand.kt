package com.projet.clientleger.data.model.command

import com.projet.clientleger.data.model.PenPath

class ErasePathCommand(private val pathId: Int,
                       private val drawPathCallback: (penPath: PenPath) -> Unit,
                       private val erasePathCallback: (pathId: Int) -> PenPath?): DrawingCommand(drawPathCallback, erasePathCallback) {
    private var penPath: PenPath? = null
    override fun execute() {
        penPath = erasePathCallback.invoke(pathId)
    }

    override fun undo() {
        penPath?.let { drawPathCallback.invoke(it) }
    }
}