package com.projet.clientleger.ui.connexion.view

import android.os.Bundle
import android.view.View
import android.view.ViewManager
import android.widget.LinearLayout
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.model.GameInfo
import kotlinx.android.synthetic.main.activity_search_lobby.*
import kotlinx.android.synthetic.main.fragment_chat.*
import java.util.concurrent.ExecutionException

class SearchLobbyActivity : AppCompatActivity() {

    private var games: ArrayList<GameInfo> = ArrayList<GameInfo>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_search_lobby)

        val rvGames = findViewById<View>(R.id.rvGames) as RecyclerView
        val adapter = GameLobbyInfoAdapter(games)
        rvGames.layoutManager = LinearLayoutManager(this, LinearLayoutManager.VERTICAL,false)
        rvGames.adapter = adapter

        games.add(GameInfo("123141", "name", "Jesus", "gamemode", "capacity"))
        rvGames.adapter?.notifyItemInserted(games.size-1)
        rvGames.scrollToPosition(games.size-1)

        games.add(GameInfo("1231311", "name", "gros gars", "gamemode", "capacity"))
        rvGames.adapter?.notifyItemInserted(games.size-1)
        rvGames.scrollToPosition(games.size-1)

        games.add(GameInfo("123", "name", "owner", "gamemode", "capacity"))
        rvGames.adapter?.notifyItemInserted(games.size-1)
        rvGames.scrollToPosition(games.size-1)

        removeGameWithID("123")

    }
    private fun removeGameWithID(id:String){
        //algo pour trouver les items par tag (pour remove). sera plus facile lorsqu'on aura une map
        //val tag = "tag"
        for((index,game) in games.withIndex()){
            if(game.lobbyid == id){
                println("TAG TROUVÉ")
                games.remove(game)
                rvGames.adapter?.notifyItemRemoved(index)
                rvGames.adapter?.notifyItemRangeChanged(index,games.size)
                break
            }
        }
    }

    private fun addGameLobby(game:GameInfo){
        games.add(game)
        rvGames.adapter?.notifyItemInserted(games.size-1)
        rvGames.scrollToPosition(games.size-1)
    }
}