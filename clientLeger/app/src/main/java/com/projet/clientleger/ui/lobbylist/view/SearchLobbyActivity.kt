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
import com.projet.clientleger.data.api.model.lobby.Lobby
import com.projet.clientleger.data.enumData.Difficulty
import com.projet.clientleger.data.enumData.GameType
import com.projet.clientleger.ui.lobby.view.LobbyActivity
import com.projet.clientleger.ui.lobbylist.viewmodel.SearchLobbyViewModel
import com.projet.clientleger.ui.mainmenu.view.MainmenuActivity
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.android.synthetic.main.activity_search_lobby.*
import kotlinx.coroutines.launch

@AndroidEntryPoint
class SearchLobbyActivity : AppCompatActivity() {

    private val vm: SearchLobbyViewModel by viewModels()
    private var lobbyList = ArrayList<Lobby>()
    private lateinit var selectedGameType: GameType
    private lateinit var selectedDifficulty: Difficulty

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_search_lobby)

        val rvGames = findViewById<View>(R.id.rvGames) as RecyclerView
        val adapter = GameLobbyInfoAdapter(lobbyList, ::joinLobby)
        selectedGameType = intent.getSerializableExtra("gameType") as GameType
        selectedDifficulty = intent.getSerializableExtra("difficulty") as Difficulty
        rvGames.layoutManager = LinearLayoutManager(this, LinearLayoutManager.VERTICAL,false)
        rvGames.adapter = adapter
        setSubscriptions()

        logoutBtn.setOnClickListener {
            val intent = Intent(this,MainmenuActivity::class.java)
            startActivity(intent)
        }
    }
    private fun setSubscriptions(){
        lifecycleScope.launch {
            vm.receiveAllLobbies(selectedGameType, selectedDifficulty).subscribe({
                lifecycleScope.launch {
                    lobbyList.addAll(it.list)
                    rvGames.adapter?.notifyDataSetChanged()
                }
            },
                    { error ->
                        println(error)
                    })
        }
    }
    private fun removeGameWithID(id:String){
        //algo pour trouver les items par tag (pour remove). sera plus facile lorsqu'on aura une map
        for((index,lobby) in lobbyList.withIndex()){
            if(lobby.lobbyId == id){
                lobbyList.remove(lobby)
                rvGames.adapter?.notifyItemRemoved(index)
                rvGames.adapter?.notifyItemRangeChanged(index,lobbyList.size)
                break
            }
        }
    }

    private fun addGameLobby(lobby: Lobby){
        lobbyList.add(lobby)
        rvGames.adapter?.notifyItemInserted(lobbyList.size-1)
        rvGames.scrollToPosition(lobbyList.size-1)
    }

    private fun joinLobby(lobbyId: String){
        val intent = Intent(this, LobbyActivity::class.java).apply{
            putExtra("isJoining", true)
            putExtra("lobbyId", lobbyId)
            putExtra("gameType",selectedGameType)
            putExtra("difficulty", selectedDifficulty)
        }
        startActivity(intent)
    }
}