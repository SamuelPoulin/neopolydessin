package com.projet.clientleger.ui.accountmanagement.dashboard

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.api.model.account.Game
import com.projet.clientleger.data.api.model.account.Login
import org.w3c.dom.Text
import java.text.SimpleDateFormat
import java.util.*

class GameHistoryAdapter(private val games: ArrayList<Game>) : RecyclerView.Adapter<GameHistoryAdapter.ViewHolderGame>() {

    class ViewHolderGame(view: View) : RecyclerView.ViewHolder(view){
        val gameResult:TextView = itemView.findViewById(R.id.gameOutcome)
        val date:TextView = itemView.findViewById(R.id.date)
        val gameDuration:TextView = itemView.findViewById(R.id.gameDuration)
        val gameType:TextView = itemView.findViewById(R.id.gameType)
        val players:TextView = itemView.findViewById(R.id.players)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolderGame {
        val inflater = LayoutInflater.from(parent.context)
        return ViewHolderGame(inflater.inflate(R.layout.item_game_history, parent, false))
    }

    override fun onBindViewHolder(holder: ViewHolderGame, position: Int) {
        holder.gameResult.text = games[position].gameResult
        holder.date.text = "4 avril"
        holder.gameDuration.text = "2:02"
        holder.gameType.text = games[position].gameType
        holder.players.text = addAllPlayers(games[position])
    }
    private fun addAllPlayers(game:Game):String{
        var players = ""
        for(j in 0 until game.team.size){
            for(i in 0 until game.team[0].playerNames.size){
                players += game.team[0].playerNames[i]
                if(i != 0 || j != 0){
                    players += "\n"
                }
            }
        }
        return players
    }

    override fun getItemCount(): Int {
        return games.size
    }
    private fun formatDate(time: Long):String{
        val calendar = Calendar.getInstance()
        calendar.timeInMillis = time
        val formatter = SimpleDateFormat("dd/MM hh:mm:ss")
        return formatter.format(calendar.time)
    }
}