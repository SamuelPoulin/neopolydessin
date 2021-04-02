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
import com.projet.clientleger.data.model.lobby.LobbyInfo
import com.projet.clientleger.databinding.ActivitySearchLobbyBinding
import com.projet.clientleger.ui.lobby.view.LobbyActivity
import com.projet.clientleger.ui.lobbylist.viewmodel.SearchLobbyViewModel
import com.projet.clientleger.ui.mainmenu.view.MainmenuActivity
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class SearchLobbyActivity : AppCompatActivity() {

    private val vm: SearchLobbyViewModel by viewModels()
    private var lobbyList = ArrayList<LobbyInfo>()
    private lateinit var binding: ActivitySearchLobbyBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySearchLobbyBinding.inflate(layoutInflater)
        setContentView(binding.root)
        binding.lifecycleOwner = this

        val selectedGameType = intent.getSerializableExtra("gameType") as GameType
        val selectedDifficulty = intent.getSerializableExtra("difficulty") as Difficulty
        binding.rvGames.layoutManager = LinearLayoutManager(this, LinearLayoutManager.VERTICAL,false)
        binding.rvGames.adapter = GameLobbyInfoAdapter(lobbyList, ::joinLobby)

        vm.lobbies.observe(this){
            lobbyList.clear()
            lobbyList.addAll(it)
            binding.rvGames.adapter?.notifyDataSetChanged()
        }

        binding.logoutBtn.setOnClickListener {
            val intent = Intent(this,MainmenuActivity::class.java)
            startActivity(intent)
        }

        vm.init(selectedGameType, selectedDifficulty)

    }

    private fun removeGameWithID(id:String){
        //algo pour trouver les items par tag (pour remove). sera plus facile lorsqu'on aura une map
        for((index,lobby) in lobbyList.withIndex()){
            if(lobby.lobbyId == id){
                lobbyList.remove(lobby)
                binding.rvGames.adapter?.notifyItemRemoved(index)
                binding.rvGames.adapter?.notifyItemRangeChanged(index,lobbyList.size)
                break
            }
        }
    }

//    private fun addGameLobby(lobby: Lobby){
//        lobbyList.add(lobby)
//        rvGames.adapter?.notifyItemInserted(lobbyList.size-1)
//        rvGames.scrollToPosition(lobbyList.size-1)
//    }

    private fun joinLobby(lobbyId: String){
        val intent = Intent(this, LobbyActivity::class.java).apply{
            putExtra("isJoining", true)
            putExtra("lobbyId", lobbyId)
            putExtra("gameType",vm.selectedGameType)
            putExtra("difficulty", vm.selectedDifficulty)
        }
        startActivity(intent)
    }
}