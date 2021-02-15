package com.projet.clientleger.ui.connexion.view

import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.model.GameInfo
import kotlinx.android.synthetic.main.activity_search_lobby.*
import kotlinx.android.synthetic.main.fragment_chat.*

class SearchLobbyActivity : AppCompatActivity() {

    private var games: ArrayList<GameInfo> = ArrayList<GameInfo>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_search_lobby)


        //games.add(GameInfo("lobby","Jean","normal","9/10"))

        val rvGames = findViewById<View>(R.id.rvGames) as RecyclerView
        val adapter = GameLobbyInfoAdapter(games)
        rvGames.layoutManager = LinearLayoutManager(this, LinearLayoutManager.VERTICAL,false)
        rvGames.adapter = adapter
    }
    private fun addGameLobby(game:GameInfo){
        games.add(game)
        rvGames.adapter?.notifyItemInserted(games.size-1)
        rvGames.scrollToPosition(games.size-1)
    }
}