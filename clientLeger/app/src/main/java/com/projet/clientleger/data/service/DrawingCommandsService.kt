package com.projet.clientleger.data.service

import com.projet.clientleger.data.model.command.Command
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DrawingCommandsService @Inject constructor() {
    private val doneCommands: ArrayList<Command> = ArrayList()
    private val undoneCommands: ArrayList<Command> = ArrayList()

    fun addAndExecute(command: Command){
        add(command)
        command.execute()
    }

    fun add(command: Command){
        undoneCommands.clear()
        doneCommands.add(command)
    }

    fun undo(){
        if(doneCommands.isEmpty())
            return
        val command = doneCommands.removeLast()
        undoneCommands.add(command)
        command.undo()
    }


    fun redo(){
        if(undoneCommands.isEmpty())
            return
        val command = undoneCommands.removeLast()
        command.execute()
    }

    fun clear(){
        doneCommands.clear()
        undoneCommands.clear()
    }
}