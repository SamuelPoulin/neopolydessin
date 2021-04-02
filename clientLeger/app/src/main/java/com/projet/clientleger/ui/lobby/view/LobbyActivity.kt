package com.projet.clientleger.ui.lobby.view

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.enumData.Difficulty
import com.projet.clientleger.data.enumData.GameType
import com.projet.clientleger.data.model.lobby.PlayerInfo
import com.projet.clientleger.databinding.ActivityLobbyBinding
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
//        vm.receivePlayersInfo()
//                .subscribe { username ->
//                    lifecycleScope.launch {
//                        addPlayerToGame(username.toString())
//                    }
//                }

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
            manager.orientation = RecyclerView.HORIZONTAL
            rvTeams[i].layoutManager = manager
            rvTeams[i].adapter = TeamAdapter(teams[i], ::kickPlayer)

            vm.teams[i].observe(this){
                teams[i].clear()
                teams[i].addAll(it)
                rvTeams[i].adapter?.notifyDataSetChanged()
            }
        }
        vm.fillTeams(BitmapConversion.vectorDrawableToBitmap(this, R.drawable.ic_missing_player))
        intent.getSerializableExtra("gameType") as GameType
        val gameType = intent.getSerializableExtra("gameType") as GameType
        binding.gamemode.text = gameType.toFrenchString()
        binding.difficulty.text = (intent.getSerializableExtra("difficulty") as Difficulty).toFrenchString()
        //binding.startGameButton.visibility = View.INVISIBLE

        if(gameType == GameType.SPRINT_SOLO){
            println("MODE DE JEU SOLOOOOOOOOOOOOOOOOOOOOOOOOOOOO")

        }

        setSubscriptions()

//        val fragment :ChatFragment = ChatFragment.newInstance()
//
//        if(savedInstanceState == null){
//            supportFragmentManager
//                .beginTransaction()
//                .add(R.id.chat_root,fragment,"chat_fragment")
//                .commit()
//        }
    }

    private fun setupButtons(){
        binding.startGameButton.setOnClickListener {
            startGame()
        }
        binding.exitGame.setOnClickListener {
            vm.leaveLobby()
            finish()
        }
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