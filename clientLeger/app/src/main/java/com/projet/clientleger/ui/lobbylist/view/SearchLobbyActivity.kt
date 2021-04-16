package com.projet.clientleger.ui.lobbylist.view

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.fragment.app.commit
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.api.model.lobby.Lobby
import com.projet.clientleger.data.enumData.Difficulty
import com.projet.clientleger.data.enumData.GameType
import com.projet.clientleger.data.enumData.SoundId
import com.projet.clientleger.data.model.lobby.LobbyInfo
import com.projet.clientleger.databinding.ActivitySearchLobbyBinding
import com.projet.clientleger.ui.IAcceptGameInviteListener
import com.projet.clientleger.ui.friendslist.FriendslistFragment
import com.projet.clientleger.ui.lobby.view.LobbyActivity
import com.projet.clientleger.ui.lobbylist.viewmodel.SearchLobbyViewModel
import com.projet.clientleger.ui.mainmenu.view.MainmenuActivity
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class SearchLobbyActivity : AppCompatActivity(), IAcceptGameInviteListener {

    private val vm: SearchLobbyViewModel by viewModels()
    private var lobbyList = ArrayList<LobbyInfo>()
    private lateinit var binding: ActivitySearchLobbyBinding
    @Inject
    lateinit var friendslistFragment: FriendslistFragment

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySearchLobbyBinding.inflate(layoutInflater)
        setContentView(binding.root)
        binding.lifecycleOwner = this

        getIntentData()
        setupLobbiesRv()
        setupToolbar()

        vm.lobbies.observe(this){
            lobbyList.clear()
            lobbyList.addAll(it)
            binding.rvGames.adapter?.notifyDataSetChanged()
        }

        supportFragmentManager.commit{
            add(R.id.friendslistContainer, friendslistFragment, "friendslist")
        }

        vm.init()
    }

    private fun setupLobbiesRv(){
        binding.rvGames.layoutManager = LinearLayoutManager(this, LinearLayoutManager.VERTICAL,false)
        binding.rvGames.adapter = GameLobbyInfoAdapter(lobbyList, ::joinLobby)
    }

    private fun getIntentData(){
        vm.selectedGameType = intent.getSerializableExtra("gameType") as GameType? ?: GameType.CLASSIC
        vm.selectedDifficulty = intent.getSerializableExtra("difficulty") as Difficulty? ?: Difficulty.EASY
    }

    private fun setupToolbar(){
        binding.toolbar.title = "Liste de parties"
        binding.toolbar.setTitleTextColor(ContextCompat.getColor(this, R.color.white))

        binding.toolbar.setOnMenuItemClickListener { item ->
            when (item.itemId) {
                R.id.friendslistBtn -> friendslistFragment.toggleVisibility()
                R.id.addFriendBtn -> friendslistFragment.showAddFriendDialog()
            }
            true
        }

        binding.toolbar.setNavigationIcon(R.drawable.ic_logout)
        binding.toolbar.setNavigationOnClickListener {
            vm.playSound(SoundId.ERROR.value)
            finish()
        }
    }

    private fun joinLobby(lobbyInfo: LobbyInfo){
        vm.playSound(SoundId.CONNECTED.value)
        val intent = Intent(this, LobbyActivity::class.java).apply{
            putExtra("isJoining", true)
            putExtra("lobbyId", lobbyInfo.lobbyId)
            putExtra("gameType", lobbyInfo.gameType)
            putExtra("difficulty", lobbyInfo.difficulty)
            putExtra("gameName", lobbyInfo.lobbyName)
        }
        startActivity(intent)
        finish()
    }

    override fun onDestroy() {
        vm.unsubscribe()
        super.onDestroy()
    }
    override fun acceptInvite(info: Pair<String, String>) {
        intent = Intent(this, LobbyActivity::class.java)
        intent.putExtra("lobbyId", info.second)
        intent.putExtra("isJoining", true)
        startActivity(intent)
        finish()
    }
}