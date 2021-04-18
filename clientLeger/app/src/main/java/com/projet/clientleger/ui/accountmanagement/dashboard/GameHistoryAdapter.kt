package com.projet.clientleger.ui.accountmanagement.dashboard

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.SessionManager
import com.projet.clientleger.data.api.model.account.Game
import com.projet.clientleger.data.api.model.account.Login
import org.w3c.dom.Text
import java.text.SimpleDateFormat
import java.util.*

class GameHistoryAdapter(private val games: ArrayList<Game>, private val sessionManager: SessionManager) : RecyclerView.Adapter<GameHistoryAdapter.ViewHolderGame>() {

    class ViewHolderGame(view: View) : RecyclerView.ViewHolder(view){
        val gameResult:TextView = itemView.findViewById(R.id.gameOutcome)
        val date:TextView = itemView.findViewById(R.id.date)
        val gameDuration:TextView = itemView.findViewById(R.id.gameDuration)
        val gameType:TextView = itemView.findViewById(R.id.gameType)
        val players:TextView = itemView.findViewById(R.id.players)
        val gameScore:TextView = itemView.findViewById(R.id.gameScore)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolderGame {
        val inflater = LayoutInflater.from(parent.context)
        return ViewHolderGame(inflater.inflate(R.layout.item_game_history, parent, false))
    }

    override fun onBindViewHolder(holder: ViewHolderGame, position: Int) {
        holder.gameResult.text = games[position].gameResult
        holder.date.text = formatDate(games[position].startDate)
        holder.gameDuration.text = formatTimestamp(games[position].endDate - games[position].startDate)
        holder.gameType.text = games[position].gameType
        holder.players.text = addAllPlayers(games[position])
        holder.gameScore.text = findPlayerScore(games[position])


    }
    private fun addAllPlayers(game:Game):String{
        var players = ""
        for(j in 0 until game.team.size){
            for(i in 0 until game.team[j].playerNames.size){
                if(i != 0 || j != 0){
                    players += "\n"
                }
                players += game.team[j].playerNames[i]
            }
        }
        return players
    }
    private fun findPlayerScore(game:Game):String{
        var score = 0
        for(j in 0 until game.team.size){
            for(i in 0 until game.team[j].playerNames.size){
                if(game.team[j].playerNames[i] == sessionManager.getUsername()){
                    score = game.team[j].score
                }
            }
        }
        return score.toString()
    }

    override fun getItemCount(): Int {
        return games.size
    }
    private fun formatDate(time: Long):String{
        val calendar = Calendar.getInstance()
        calendar.timeInMillis = time
        val formatter = SimpleDateFormat("MM/dd")
        return formatter.format(calendar.time)
    }
    private fun formatTimestamp(time:Long):String{
        val calendar = Calendar.getInstance()
        calendar.timeInMillis = time
        val formatter = SimpleDateFormat("mm:ss")
        return formatter.format(calendar.time)
    }
}