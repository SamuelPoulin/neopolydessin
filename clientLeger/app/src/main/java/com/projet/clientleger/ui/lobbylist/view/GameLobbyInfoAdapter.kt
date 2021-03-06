package com.projet.clientleger.ui.lobbylist.view

import android.annotation.SuppressLint
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.api.model.lobby.Lobby
import com.projet.clientleger.data.model.lobby.LobbyInfo
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

const val MAX_GAME_SIZE:Int = 4

class GameLobbyInfoAdapter(private val lobbyList: List<LobbyInfo>,
                           private val joinLobbyCallback: (LobbyInfo) -> Unit): RecyclerView.Adapter<GameLobbyInfoAdapter.ViewHolder>() {
    class ViewHolder(listItemView: View) : RecyclerView.ViewHolder(listItemView) {
        val lobbyNameTextView: TextView = itemView.findViewById(R.id.lobbyName)
        val gameModeTextView: TextView = itemView.findViewById(R.id.gameMode)
        val gameCapacityTextView: TextView = itemView.findViewById(R.id.gameCapacity)
        val difficultyTextView: TextView = itemView.findViewById(R.id.difficulty)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        // Inflate the custom layout
        val contactView = inflater.inflate(R.layout.item_lobbyinfo, parent, false)
        // Return a new holder instance
        return ViewHolder(contactView)
    }

    @SuppressLint("SetTextI18n")
    override fun onBindViewHolder(viewHolder: ViewHolder, position: Int) {
        val lobbyInfo = lobbyList[position]
        if(lobbyInfo.isPrivate){
            viewHolder.itemView.findViewById<TextView>(R.id.emptyListMsg).visibility = View.VISIBLE
            viewHolder.itemView.findViewById<LinearLayout>(R.id.infoContainer).visibility = View.GONE
        } else {
            viewHolder.itemView.findViewById<TextView>(R.id.emptyListMsg).visibility = View.GONE
            viewHolder.itemView.findViewById<LinearLayout>(R.id.infoContainer).visibility = View.VISIBLE
            viewHolder.lobbyNameTextView.text = lobbyInfo.lobbyName
            viewHolder.gameModeTextView.text = lobbyInfo.gameType.toFrenchString()
            viewHolder.difficultyTextView.text = lobbyInfo.difficulty.toFrenchString()
            viewHolder.gameCapacityTextView.text = "${lobbyInfo.nbPlayerInLobby} / ${lobbyInfo.maxSize}"
            viewHolder.itemView.findViewById<Button>(R.id.joinGamebtn).setOnClickListener { joinLobbyCallback.invoke(lobbyInfo) }
            disableFullGame(viewHolder,position)
        }
    }

    private fun disableFullGame(viewHolder: ViewHolder, position: Int){
        if(lobbyList[position].nbPlayerInLobby >= MAX_GAME_SIZE){
            viewHolder.itemView.findViewById<Button>(R.id.joinGamebtn).isEnabled = false
        }
    }

    override fun getItemCount(): Int {
        return lobbyList.size
    }
}
