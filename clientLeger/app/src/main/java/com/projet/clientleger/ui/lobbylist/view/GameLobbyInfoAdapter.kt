package com.projet.clientleger.ui.lobbylist.view

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.api.model.LobbyInfo
import com.projet.clientleger.data.model.GameInfo

class GameLobbyInfoAdapter(private val lobbyList: List<LobbyInfo>,
private val joinLobbyCallback: (String) -> Unit): RecyclerView.Adapter<GameLobbyInfoAdapter.ViewHolder>() {
    class ViewHolder(listItemView: View) : RecyclerView.ViewHolder(listItemView) {
        val lobbyLinearLayout: LinearLayout = itemView.findViewById<LinearLayout>(R.id.lobbyGame)
        val lobbyNameTextView: TextView = itemView.findViewById<TextView>(R.id.lobbyName)
        val gameOwnerTextView: TextView = itemView.findViewById<TextView>(R.id.gameOwner)
        val gameModeTextView: TextView = itemView.findViewById<TextView>(R.id.gameMode)
        val gameCapacityTextView: TextView = itemView.findViewById<TextView>(R.id.gameCapacity)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val inflater = LayoutInflater.from(parent.context)
        // Inflate the custom layout
        val contactView = inflater.inflate(R.layout.item_lobbyinfo, parent, false)
        // Return a new holder instance
        return ViewHolder(contactView)
    }

    override fun onBindViewHolder(viewHolder: ViewHolder, position: Int) {
        viewHolder.lobbyNameTextView.text = lobbyList[position].lobbyName
        viewHolder.gameOwnerTextView.text = lobbyList[position].ownerUsername
        viewHolder.gameModeTextView.text = lobbyList[position].gameType
        viewHolder.gameCapacityTextView.text = lobbyList[position].nbPlayerInLobby.toString()
        viewHolder.itemView.findViewById<Button>(R.id.joinGamebtn).setOnClickListener { joinLobbyCallback.invoke(lobbyList[position].lobbyId) }
    }
    override fun getItemCount(): Int {
        return lobbyList.size
    }
}
