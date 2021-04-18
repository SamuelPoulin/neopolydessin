package com.projet.clientleger.ui.roomslist

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R

class RoomsAdatper(private val rooms: ArrayList<String>,
                   private val joinCallback: (String) -> Unit,
                   private val deleteCallback: (String) -> Unit) : RecyclerView.Adapter<RoomsAdatper.ViewHolderRoom>() {
    class ViewHolderRoom(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val roomName: TextView = itemView.findViewById(R.id.roomName)
        val joinBtn: Button = itemView.findViewById(R.id.joinBtn)
        val deleteBtn: Button = itemView.findViewById(R.id.deleteBtn)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolderRoom {
        val inflater = LayoutInflater.from(parent.context)
        return ViewHolderRoom(inflater.inflate(R.layout.item_room, parent, false))
    }

    override fun onBindViewHolder(holder: ViewHolderRoom, position: Int) {
        val room = rooms[position]
        if (room.length > 12)
            holder.roomName.text = room.subSequence(0, 10).toString() + "..."
        else
            holder.roomName.text = room

        holder.joinBtn.setOnClickListener {
            joinCallback.invoke(room)
        }
        holder.deleteBtn.setOnClickListener {
            deleteCallback.invoke(room)
        }
    }

    override fun getItemCount(): Int {
        return rooms.size
    }

}