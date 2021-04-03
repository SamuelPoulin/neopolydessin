package com.projet.clientleger.ui.lobby.view

import android.app.Dialog
import android.app.ProgressDialog
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.content.ContextCompat
import androidx.fragment.app.commit
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.enumData.Difficulty
import com.projet.clientleger.data.enumData.GameType
import com.projet.clientleger.data.model.lobby.PlayerInfo
import com.projet.clientleger.databinding.ActivityLobbyBinding
import com.projet.clientleger.ui.chat.ChatFragment
import com.projet.clientleger.ui.friendslist.FriendslistFragment
import com.projet.clientleger.ui.game.view.GameActivity
import com.projet.clientleger.ui.lobby.TeamAdapter
import com.projet.clientleger.ui.lobby.viewmodel.LobbyViewModel
import com.projet.clientleger.utils.BitmapConversion
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class LobbyActivity : AppCompatActivity() {
    private val vm: LobbyViewModel by viewModels()
    lateinit var binding: ActivityLobbyBinding
    private val teams: Array<ArrayList<PlayerInfo>> = arrayOf(ArrayList(), ArrayList())
    private lateinit var rvTeams: Array<RecyclerView>
    var nextActivityIntent: Intent? = null
    @Inject
    lateinit var friendslistFragment: FriendslistFragment


    private fun setSubscriptions() {
        vm.receiveStartGame().subscribe{
            goToGame()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLobbyBinding.inflate(layoutInflater)
        setContentView(binding.root)
        binding.lifecycleOwner = this


        setupButtons()

        val selectedGameType = (intent.getSerializableExtra("gameType") as GameType)
        val selectedDifficulty = (intent.getSerializableExtra("difficulty") as Difficulty)

        if(intent.getBooleanExtra("isJoining", false)){
            intent.getStringExtra("lobbyId")?.let { vm.joinGame(it) }
        } else{
            val gameName = intent.getStringExtra("gameName")
            val isPrivate = intent.getBooleanExtra("isPrivate", false)
            vm.createGame(gameName!!, selectedGameType, selectedDifficulty, isPrivate)
        }

        val loadingDialog = setupLoadingDialog()

        rvTeams = arrayOf(binding.teamContent1, binding.teamContent2)
        for(i in rvTeams.indices){
            val manager = LinearLayoutManager(this)
            manager.orientation = RecyclerView.VERTICAL
            rvTeams[i].layoutManager = manager
            val teamBackground = when(i){
                0 -> ContextCompat.getDrawable(this, R.drawable.blue_team_playerinfo_background)!!
                else -> ContextCompat.getDrawable(this, R.drawable.red_team_playerinfo_background)!!
            }
            rvTeams[i].adapter = TeamAdapter(teams[i], ::kickPlayer,
                    vm.getAccountInfo(),
                    ContextCompat.getDrawable(this, R.drawable.ic_is_owner)!!,
                    ContextCompat.getDrawable(this, R.drawable.ic_bot_player)!!,
                    teamBackground)

            vm.teams[i].observe(this){ players ->
                val owner = players.find { it.isOwner }
                if(owner != null) {
                    for (team in rvTeams) {
                        team.adapter?.let { teamAdapter ->
                            (teamAdapter as TeamAdapter).updateGameOwner(owner)
                            binding.startGameButton.visibility = when(owner.accountId == vm.getAccountInfo().accountId) {
                                true -> View.VISIBLE
                                false -> View.INVISIBLE
                            }
                        }
                    }
                }
                teams[i].clear()
                teams[i].addAll(players)
                rvTeams[i].adapter?.notifyDataSetChanged()
                if(loadingDialog.isShowing && players.find { it.accountId.isNotEmpty() } != null)
                {
                    loadingDialog.dismiss()
                }
            }

            vm.defaultImage = BitmapConversion.vectorDrawableToBitmap(this, R.drawable.ic_missing_player)
        }

        binding.gameType.text = selectedGameType.toFrenchString()
        binding.difficulty.text = selectedDifficulty.toFrenchString()
        binding.startGameButton.visibility = View.INVISIBLE

        if(selectedGameType == GameType.SPRINT_SOLO){
            println("MODE DE JEU SOLOOOOOOOOOOOOOOOOOOOOOOOOOOOO")

        }
        setSubscriptions()

        binding.toolbar.setOnMenuItemClickListener { item ->
            when (item.itemId) {
                R.id.friendslistBtn -> friendslistFragment.toggleVisibility()
                R.id.addFriendBtn -> friendslistFragment.showAddFriendDialog()
            }
            true
        }
        supportFragmentManager.commit{
            add(R.id.friendslistContainer, friendslistFragment, "friendslist")
        }
//        binding.toolbar.setNavigationIcon(R.drawable.back)
    }

    private fun setupLoadingDialog(): AlertDialog {
        val dialogView = layoutInflater.inflate(R.layout.dialolg_loading, null)
        val dialog = AlertDialog.Builder(this).setView(dialogView).create()
        dialog.setCanceledOnTouchOutside(false)
        dialog.show()
        return dialog
    }

    private fun setupButtons(){
        binding.startGameButton.setOnClickListener {
            startGame()
        }

//        binding.exitGame.setOnClickListener {
//            vm.leaveLobby()
//            finish()
//        }

    }
    private fun startGame(){
        vm.startGame()
    }
    private fun goToGame(){
        vm.unsubscribe()
        val intent = Intent(this, GameActivity::class.java)
        nextActivityIntent = intent
        startActivity(intent)
        finish()
    }
    private fun kickPlayer(player:PlayerInfo){
        println("kic: ${player.username}")
    }

    override fun onDestroy() {
        println("Lobby détruit")
        vm.unsubscribe()
        if(nextActivityIntent == null)
            vm.clearAvatarStorage()
        super.onDestroy()
    }
}