package com.projet.clientleger.ui.lobby

import android.graphics.drawable.Drawable
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.model.account.AccountInfo
import com.projet.clientleger.data.model.lobby.PlayerInfo

class TeamAdapter(private val players: List<PlayerInfo>,
                  private val removePlayerCallback: (PlayerInfo) -> Unit,
                  private val userInfo: AccountInfo,
                  private val isOwnerIcon: Drawable,
                  private val isBotIcon: Drawable,
                  private val teamColor: Drawable?) : RecyclerView.Adapter<TeamAdapter.ViewHolderPlayer>() {
    var userIsOwner = false

    class ViewHolderPlayer(view: View) : RecyclerView.ViewHolder(view) {
        val avatarView: ImageView = itemView.findViewById(R.id.avatar)
        val usernameTextView: TextView = itemView.findViewById(R.id.username)
        val removePlayerBtn: ImageButton = itemView.findViewById(R.id.removePlayerBtn)
        val attributeIcon: ImageView = itemView.findViewById(R.id.attributeIcon)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolderPlayer {
        val inflater = LayoutInflater.from(parent.context)
        return ViewHolderPlayer(inflater.inflate(R.layout.item_team_playerinfo, parent, false))
    }

    override fun onBindViewHolder(holder: ViewHolderPlayer, position: Int) {
        holder.itemView.background = teamColor
        holder.usernameTextView.text = players[position].username
        holder.avatarView.setImageBitmap(players[position].avatar)
        if (players[position].isBot) {
            holder.removePlayerBtn.visibility = View.INVISIBLE
            holder.attributeIcon.setImageDrawable(isBotIcon)
            holder.attributeIcon.visibility = View.VISIBLE
        } else {
            if (userIsOwner) {
                if (players[position].accountId == userInfo.accountId){
                    holder.attributeIcon.setImageDrawable(isOwnerIcon)
                    holder.removePlayerBtn.visibility = View.INVISIBLE
                    holder.attributeIcon.visibility = View.VISIBLE
                }
                else {
                    holder.attributeIcon.visibility = View.INVISIBLE
                    holder.removePlayerBtn.visibility = View.VISIBLE
                    holder.removePlayerBtn.setOnClickListener { removePlayerCallback.invoke(players[position]) }
                }
            } else {
                holder.attributeIcon.visibility = View.INVISIBLE
                holder.removePlayerBtn.visibility = View.INVISIBLE
            }
        }
    }

    fun updateGameOwner(owner: PlayerInfo?) {
        userIsOwner = if (owner == null)
            false
        else
            owner.accountId == userInfo.accountId
    }

    override fun getItemCount(): Int {
        return players.size
    }
}