package com.projet.clientleger.data.model.command

interface Command {
    fun execute()
    fun undo()
}