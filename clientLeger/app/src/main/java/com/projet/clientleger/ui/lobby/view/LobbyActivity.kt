package com.projet.clientleger.ui.lobby.view

import android.content.Intent
import android.graphics.drawable.Drawable
import android.os.Bundle
import android.view.View
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.fragment.app.commit
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.enumData.Difficulty
import com.projet.clientleger.data.enumData.GameType
import com.projet.clientleger.data.model.lobby.LobbyInfo
import com.projet.clientleger.data.model.lobby.PlayerInfo
import com.projet.clientleger.databinding.ActivityLobbyBinding
import com.projet.clientleger.ui.friendslist.FriendslistFragment
import com.projet.clientleger.ui.game.view.GameActivity
import com.projet.clientleger.ui.lobby.TeamAdapter
import com.projet.clientleger.ui.lobby.viewmodel.LobbyViewModel
import com.projet.clientleger.utils.BitmapConversion
import dagger.hilt.android.AndroidEntryPoint
import java.io.Serializable
import javax.inject.Inject

@AndroidEntryPoint
class LobbyActivity : AppCompatActivity() {
    private val vm: LobbyViewModel by viewModels()
    lateinit var binding: ActivityLobbyBinding
    private val teams: Array<ArrayList<PlayerInfo>> = arrayOf(ArrayList(), ArrayList())
    private lateinit var rvTeams: Array<RecyclerView>
    var nextActivityIntent: Intent? = null
    var loadingDialog: AlertDialog? = null
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

        binding.chatRoot.visibility = View.GONE

        fetchIntentData()

        setupButtons()
        setSubscriptions()

        if(intent.getBooleanExtra("isJoining", false)){
            vm.joinGame()
        } else{
            vm.createGame()
        }
        setupToolbar()
        setupTeamsRv()

        setupUiMode()

        supportFragmentManager.commit{
            add(R.id.friendslistContainer, friendslistFragment, "friendslist")
        }
    }

    private fun setupToolbar(){
        binding.toolbar.title = vm.gameName
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
            leaveLobby()
        }
    }

    private fun fetchIntentData(){
        vm.lobbyId = intent.getStringExtra("lobbyId") ?: ""
        vm.gameName = intent.getStringExtra("gameName") ?: "partie inconnue"
        vm.gameType = (intent.getSerializableExtra("gameType") as GameType?) ?: GameType.CLASSIC
        vm.difficulty = (intent.getSerializableExtra("difficulty") as Difficulty?) ?: Difficulty.EASY
        vm.isPrivate = intent.getBooleanExtra("isPrivate", false)
    }

    override fun onBackPressed() {
        loadingDialog?.let {
            leaveLobby()
        }
    }

    private fun setupUiMode(){
        if(vm.gameType != GameType.CLASSIC){
            binding.leftPeopleIcon.setImageDrawable(ContextCompat.getDrawable(this, R.drawable.ic_coop_group))
            binding.rightPeopleIcon.visibility = View.GONE
            binding.teamLabel.text = getString(R.string.coopTeamLabel)
            binding.teamLabel2.visibility = View.GONE
            binding.teamContent2.visibility = View.GONE
        }

        binding.gameType.text = vm.gameType.toFrenchString()
        binding.difficulty.text = vm.difficulty.toFrenchString()
        binding.startGameButton.visibility = View.INVISIBLE
    }

    private fun leaveLobby(){
        vm.leaveLobby()
        finish()
    }

    private fun setupTeamsRv(){
        loadingDialog = setupLoadingDialog()

        rvTeams = arrayOf(binding.teamContent1, binding.teamContent2)
        for(i in rvTeams.indices){
            rvTeams[i].layoutManager = LinearLayoutManager(this)
            val teamBackground: Drawable? = if(vm.gameType != GameType.CLASSIC)
                null
            else{
                when(i){
                    0 -> ContextCompat.getDrawable(this, R.drawable.blue_team_playerinfo_background)!!
                    else -> ContextCompat.getDrawable(this, R.drawable.red_team_playerinfo_background)!!
                }
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
                loadingDialog?.let { dialog ->
                    if(dialog.isShowing && players.find { it.accountId.isNotEmpty() } != null)
                    {
                        dialog.dismiss()
                    }
                }

            }

            vm.defaultImage = BitmapConversion.vectorDrawableToBitmap(this, R.drawable.ic_missing_player)
        }
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
        vm.unsubscribe()
        if(nextActivityIntent == null)
            vm.clearAvatarStorage()
        super.onDestroy()
    }
}