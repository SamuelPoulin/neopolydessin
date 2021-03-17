package com.projet.clientleger.ui.lobbylist.view

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.api.model.Difficulty
import com.projet.clientleger.data.api.model.GameCreationInfosModel
import com.projet.clientleger.data.api.model.GameType
import com.projet.clientleger.data.api.model.LobbyInfo
import com.projet.clientleger.data.model.GameInfo
import com.projet.clientleger.ui.lobby.view.LobbyActivity
import com.projet.clientleger.ui.lobby.viewmodel.LobbyViewModel
import com.projet.clientleger.ui.lobbylist.viewmodel.SearchLobbyViewModel
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.android.synthetic.main.activity_search_lobby.*
import kotlinx.coroutines.launch
import java.io.Serializable

@AndroidEntryPoint
class SearchLobbyActivity : AppCompatActivity() {

    private val vm: SearchLobbyViewModel by viewModels()
    private var lobbyList = ArrayList<LobbyInfo>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_search_lobby)

        val rvGames = findViewById<View>(R.id.rvGames) as RecyclerView
        val adapter = GameLobbyInfoAdapter(lobbyList, ::joinLobby)
        rvGames.layoutManager = LinearLayoutManager(this, LinearLayoutManager.VERTICAL,false)
        rvGames.adapter = adapter

        lifecycleScope.launch {
            vm.receiveAllLobbies(GameType.CLASSIC, Difficulty.EASY).subscribe({
                lifecycleScope.launch {
                    lobbyList.addAll(it.list)
                    rvGames.adapter?.notifyDataSetChanged()
                }
            },
                { error ->
                    println(error)
                })
        }

        vm.receiveJoinedLobbyInfo().subscribe{
            val intent = Intent(this, LobbyActivity::class.java).apply{
                putExtra("LOBBY_INFO",it)
                putExtra("GAME_INFO", GameCreationInfosModel("me", "Classic", "Easy", false) as Serializable)
            }
            startActivity(intent)
        }

    }
    private fun removeGameWithID(id:String){
        //algo pour trouver les items par tag (pour remove). sera plus facile lorsqu'on aura une map
        //val tag = "tag"
        for((index,lobby) in lobbyList.withIndex()){
            if(lobby.lobbyId == id){
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

    private fun joinLobby(lobbyId: String){
        vm.joinLobby(lobbyId)
    }
}