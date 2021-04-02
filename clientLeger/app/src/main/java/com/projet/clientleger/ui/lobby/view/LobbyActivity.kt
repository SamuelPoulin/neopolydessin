package com.projet.clientleger.ui.lobby.view

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.enumData.Difficulty
import com.projet.clientleger.data.enumData.GameType
import com.projet.clientleger.data.model.lobby.PlayerInfo
import com.projet.clientleger.databinding.ActivityLobbyBinding
import com.projet.clientleger.ui.chat.ChatFragment
import com.projet.clientleger.ui.game.view.GameActivity
import com.projet.clientleger.ui.lobby.TeamAdapter
import com.projet.clientleger.ui.lobby.viewmodel.LobbyViewModel
import com.projet.clientleger.utils.BitmapConversion
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class LobbyActivity : AppCompatActivity() {
    private val vm: LobbyViewModel by viewModels()
    lateinit var binding: ActivityLobbyBinding
    private var playerCount:Int = 0
    private val playersView = ArrayList<ConstraintLayout>()
    private val teams: Array<ArrayList<PlayerInfo>> = arrayOf(ArrayList(), ArrayList())
    private lateinit var rvTeams: Array<RecyclerView>
    var nextActivityIntent: Intent? = null

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
        if(intent.getBooleanExtra("isJoining", false)){
            intent.getStringExtra("lobbyId")?.let { vm.joinGame(it) }
        }

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
                        }
                    }
                }
                teams[i].clear()
                teams[i].addAll(players)
                rvTeams[i].adapter?.notifyDataSetChanged()
            }
        }
        vm.fillTeams(BitmapConversion.vectorDrawableToBitmap(this, R.drawable.ic_missing_player))
        intent.getSerializableExtra("gameType") as GameType
        binding.gameType.text = (intent.getSerializableExtra("gameType") as GameType).toFrenchString()
        binding.difficulty.text = (intent.getSerializableExtra("difficulty") as Difficulty).toFrenchString()
        binding.startGameButton.visibility = View.INVISIBLE
        setSubscriptions()
    }

    private fun setupButtons(){
        binding.startGameButton.setOnClickListener {
            startGame()
        }
//        binding.exitGame.setOnClickListener {
//            vm.leaveLobby()
//            goToMainMenu()
//        }
    }
    private fun startGame(){
        vm.startGame()
    }
    private fun goToMainMenu(){
        finish()
    }
    private fun goToGame(){
        val intent = Intent(this, GameActivity::class.java)
        nextActivityIntent = intent
        startActivity(intent)
        finish()
    }
    private fun kickPlayer(player:PlayerInfo){
        println("kic: ${player.username}")
    }

    override fun onDestroy() {
        if(nextActivityIntent == null)
            vm.clearAvatarStorage()
        super.onDestroy()
    }
}