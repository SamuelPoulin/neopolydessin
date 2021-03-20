package com.projet.clientleger.data.model.command

import com.projet.clientleger.data.model.PenPath

abstract class DrawingCommand(drawPathCallback: (penPath: PenPath) -> Unit, erasePathCallback: (pathId: Int) -> PenPath?): Command {
}