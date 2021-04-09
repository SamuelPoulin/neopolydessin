package com.projet.clientleger.ui.accountmanagement.dashboard

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.api.model.account.Login
import java.text.SimpleDateFormat
import java.util.*

class ConnectionAdapter(private val connections: ArrayList<Login>) : RecyclerView.Adapter<ConnectionAdapter.ViewHolderConnection>() {

    class ViewHolderConnection(view: View) : RecyclerView.ViewHolder(view){
        val connectionStart:TextView = itemView.findViewById(R.id.connectionStart)
        val connectionEnd:TextView = itemView.findViewById(R.id.connectionEnd)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolderConnection {
        val inflater = LayoutInflater.from(parent.context)
        return ViewHolderConnection(inflater.inflate(R.layout.item_connection, parent, false))
    }

    override fun onBindViewHolder(holder: ViewHolderConnection, position: Int) {
        holder.connectionStart.text = formatDate(connections[position].start.toLong())
        if(!connections[position].end.isNullOrBlank()){
            holder.connectionEnd.text = formatDate(connections[position].end!!.toLong())
        }
    }

    override fun getItemCount(): Int {
        return connections.size
    }
    private fun formatDate(time: Long):String{
        val calendar = Calendar.getInstance()
        calendar.timeInMillis = time
        val formatter = SimpleDateFormat("dd/MM hh:mm:ss")
        return formatter.format(calendar.time)
    }
}