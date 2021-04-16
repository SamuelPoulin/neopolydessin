package com.projet.clientleger.ui.lobby.view

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.graphics.drawable.Drawable
import android.os.Bundle
import android.os.IBinder
import android.view.View
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.os.bundleOf
import androidx.fragment.app.commit
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.enumData.Difficulty
import com.projet.clientleger.data.enumData.GameType
import com.projet.clientleger.data.enumData.TabType
import com.projet.clientleger.data.model.chat.TabInfo
import com.projet.clientleger.data.enumData.SoundId
import com.projet.clientleger.data.model.lobby.LobbyInfo
import com.projet.clientleger.data.model.lobby.PlayerInfo
import com.projet.clientleger.data.service.ChatStorageService
import com.projet.clientleger.databinding.ActivityLobbyBinding
import com.projet.clientleger.ui.IAcceptGameInviteListener
import com.projet.clientleger.ui.chat.ChatViewModel
import com.projet.clientleger.ui.friendslist.FriendslistFragment
import com.projet.clientleger.ui.game.view.GameActivity
import com.projet.clientleger.ui.game.viewmodel.GameViewModel
import com.projet.clientleger.ui.lobby.TeamAdapter
import com.projet.clientleger.ui.lobby.viewmodel.LobbyViewModel
import com.projet.clientleger.utils.BitmapConversion
import dagger.hilt.android.AndroidEntryPoint
import java.io.Serializable
import javax.inject.Inject

@AndroidEntryPoint
class LobbyActivity : AppCompatActivity(), IAcceptGameInviteListener {
    private val vm: LobbyViewModel by viewModels()
    lateinit var binding: ActivityLobbyBinding
    private val teams: Array<ArrayList<PlayerInfo>> = arrayOf(ArrayList(), ArrayList())
    private lateinit var rvTeams: Array<RecyclerView>
    var nextActivityIntent: Intent? = null
    var loadingDialog: AlertDialog? = null

    @Inject
    lateinit var friendslistFragment: FriendslistFragment
    private var chatService: ChatStorageService? = null

    private val chatConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            chatService = (service as ChatStorageService.LocalBinder).getService()
            chatService?.addNewConvo(TabInfo(LobbyViewModel.GAME_TAB_NAME, ChatViewModel.GAME_TAB_ID, TabType.GAME), true)
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            chatService = null
        }
    }

    private fun setSubscriptions() {
        vm.receiveStartGame().subscribe {
            vm.playSound(SoundId.START_GAME.value)
            goToGame()
        }

        vm.receiveKick().subscribe{
            leaveLobby(false)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        vm.defaultImage = BitmapConversion.vectorDrawableToBitmap(this, R.drawable.ic_missing_player)
        binding = ActivityLobbyBinding.inflate(layoutInflater)
        setContentView(binding.root)
        binding.lifecycleOwner = this

        fetchIntentData()

        setupButtons()
        setSubscriptions()

        if (intent.getBooleanExtra("isJoining", false)) {
            vm.joinLobby().subscribe {
                updateUiInfo(it)
                if (it.gameType != GameType.SPRINT_SOLO)
                    supportFragmentManager.setFragmentResult("canInvite", bundleOf("boolean" to true))
            }
        } else {
            vm.createGame().subscribe {
                updateUiInfo(it)
                if (it.gameType != GameType.SPRINT_SOLO)
                    supportFragmentManager.setFragmentResult("canInvite", bundleOf("boolean" to true))
            }
        }
        setupToolbar()
        setupTeamsRv()
        setupUiMode()
//        if(vm.isTutorialActive()){
//            //vm.addShowcase("Nous sommes maintenant dans le lobby \n Maintenant que le lobby est créé, nous allons pouvoir démarrer la partie", binding.startGameButton,this)
//        }
    }

    override fun onStart() {
        super.onStart()
        Intent(this, ChatStorageService::class.java).also { intent ->
            bindService(intent, chatConnection, Context.BIND_IMPORTANT)
        }
    }

    override fun onStop() {
        super.onStop()
        unbindService(chatConnection)
    }

    private fun setupToolbar() {
        binding.toolbar.title = vm.gameName
        binding.toolbar.setTitleTextColor(ContextCompat.getColor(this, R.color.white))

        binding.toolbar.setNavigationIcon(R.drawable.ic_logout)
        binding.toolbar.setNavigationOnClickListener {
            vm.playSound(SoundId.ERROR.value)
            leaveLobby(true)
        }
    }

    private fun updateUiInfo(lobbyInfo: LobbyInfo) {
        vm.lobbyId = lobbyInfo.lobbyId
        vm.gameName = lobbyInfo.lobbyName
        binding.toolbar.title = vm.gameName
        vm.gameType = lobbyInfo.gameType
        vm.difficulty = lobbyInfo.difficulty
        vm.isPrivate = lobbyInfo.isPrivate
    }

    private fun fetchIntentData() {
        vm.lobbyId = intent.getStringExtra("lobbyId") ?: ""
        vm.gameName = intent.getStringExtra("gameName") ?: "partie inconnue"
        vm.gameType = (intent.getSerializableExtra("gameType") as GameType?) ?: GameType.CLASSIC
        vm.difficulty = (intent.getSerializableExtra("difficulty") as Difficulty?)
                ?: Difficulty.EASY
        vm.isPrivate = intent.getBooleanExtra("isPrivate", false)
    }

    override fun onBackPressed() {
        loadingDialog?.let {
            leaveLobby(true)
        }
    }

    private fun setupUiMode() {
        if (vm.gameType != GameType.CLASSIC) {
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

    private fun leaveLobby(requestNeeded: Boolean = true) {
        vm.playSound(SoundId.ERROR.value)
        if(requestNeeded)
            vm.leaveLobby()
        chatService?.removeConvo(ChatViewModel.GAME_TAB_ID)
        finish()
    }

    private fun setupTeamsRv() {
        loadingDialog = setupLoadingDialog()

        rvTeams = arrayOf(binding.teamContent1, binding.teamContent2)
        for (i in rvTeams.indices) {
            rvTeams[i].layoutManager = LinearLayoutManager(this)
            val teamBackground: Drawable = if (vm.gameType != GameType.CLASSIC)
                ContextCompat.getDrawable(this, R.drawable.blue_team_playerinfo_background)!!
            else {
                when (i) {
                    0 -> ContextCompat.getDrawable(this, R.drawable.blue_team_playerinfo_background)!!
                    else -> ContextCompat.getDrawable(this, R.drawable.red_team_playerinfo_background)!!
                }
            }

            rvTeams[i].adapter = TeamAdapter(teams[i], vm::kickPlayer,
                    vm.getAccountInfo(),
                    ContextCompat.getDrawable(this, R.drawable.ic_is_owner)!!,
                    ContextCompat.getDrawable(this, R.drawable.ic_bot_player)!!,
                    teamBackground, vm.gameType == GameType.CLASSIC)

            vm.teams[i].observe(this) { players ->
                val owner = players.find { it.isOwner }
                if (owner != null) {
                    for (team in rvTeams) {
                        team.adapter?.let { teamAdapter ->
                            (teamAdapter as TeamAdapter).updateGameOwner(owner)
                            binding.startGameButton.visibility = when (owner.accountId == vm.getAccountInfo().accountId) {
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
                    if (dialog.isShowing && players.find { it.accountId.isNotEmpty() } != null) {
                        dialog.dismiss()
                    }
                }

            }
        }
    }

    private fun setupLoadingDialog(): AlertDialog {
        val dialogView = layoutInflater.inflate(R.layout.dialolg_loading, null)
        val dialog = AlertDialog.Builder(this).setView(dialogView).create()
        dialog.setCanceledOnTouchOutside(false)
        dialog.show()
        return dialog
    }

    private fun setupButtons() {
        binding.startGameButton.setOnClickListener {
            startGame()
        }

    }

    private fun startGame() {
        vm.playSound(SoundId.CLICK.value)
        vm.startGame()
    }

    private fun goToGame() {
        vm.unsubscribe()
        val intent = Intent(this, GameActivity::class.java).apply {
            putExtra("gameType", vm.gameType)
        }
        nextActivityIntent = intent
        startActivity(intent)
        finish()
    }

    override fun onDestroy() {
        supportFragmentManager.setFragmentResult("canInvite", bundleOf("boolean" to false))
        vm.unsubscribe()
        if (nextActivityIntent == null)
            vm.clearAvatarStorage()
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