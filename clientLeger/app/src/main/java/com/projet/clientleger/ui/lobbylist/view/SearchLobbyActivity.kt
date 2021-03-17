package com.projet.clientleger.ui.lobbylist.view

import android.os.Bundle
import android.view.View
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.api.model.Difficulty
import com.projet.clientleger.data.api.model.GameType
import com.projet.clientleger.data.api.model.LobbyInfo
import com.projet.clientleger.data.model.GameInfo
import com.projet.clientleger.ui.lobby.viewmodel.LobbyViewModel
import com.projet.clientleger.ui.lobbylist.viewmodel.SearchLobbyViewModel
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.android.synthetic.main.activity_search_lobby.*

@AndroidEntryPoint
class SearchLobbyActivity : AppCompatActivity() {

    private val vm: SearchLobbyViewModel by viewModels()
    private var lobbyList = ArrayList<LobbyInfo>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_search_lobby)

        val rvGames = findViewById<View>(R.id.rvGames) as RecyclerView
        val adapter = GameLobbyInfoAdapter(lobbyList)
        rvGames.layoutManager = LinearLayoutManager(this, LinearLayoutManager.VERTICAL,false)
        rvGames.adapter = adapter

        vm.receiveAllLobbies(GameType.CLASSIC, Difficulty.EASY).subscribe{
            println("received: $it")
            lobbyList.addAll(it.list)
            rvGames.adapter?.notifyDataSetChanged()
        }

    }
    private fun removeGameWithID(id:String){
        //algo pour trouver les items par tag (pour remove). sera plus facile lorsqu'on aura une map
        //val tag = "tag"
        for((index,lobby) in lobbyList.withIndex()){
            if(lobby.lobbyId == id){
                println("TAG TROUVÉ")
                lobbyList.remove(lobby)
                rvGames.adapter?.notifyItemRemoved(index)
                rvGames.adapter?.notifyItemRangeChanged(index,lobbyList.size)
                break
            }
        }
    }

    private fun addGameLobby(lobby:LobbyInfo){
        lobbyList.add(lobby)
        rvGames.adapter?.notifyItemInserted(lobbyList.size-1)
        rvGames.scrollToPosition(lobbyList.size-1)
    }
}