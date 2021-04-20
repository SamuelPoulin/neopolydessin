package com.projet.clientleger.ui.game.view

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.graphics.Color
import android.graphics.Rect
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.os.IBinder
import android.util.AttributeSet
import android.view.View
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.os.bundleOf
import androidx.fragment.app.commit
import androidx.fragment.app.setFragmentResultListener
import androidx.recyclerview.widget.LinearLayoutManager
import com.projet.clientleger.R
import com.projet.clientleger.data.api.model.SequenceModel
import com.projet.clientleger.data.enumData.PlayerRole
import com.projet.clientleger.data.enumData.TabType
import com.projet.clientleger.data.model.chat.TabInfo
import com.projet.clientleger.data.model.lobby.PlayerInfo
import com.projet.clientleger.data.service.ChatStorageService
import com.projet.clientleger.databinding.ActivityGameBinding
import com.projet.clientleger.ui.chat.ChatFragment
import com.projet.clientleger.ui.chat.ChatViewModel
import com.projet.clientleger.ui.drawboard.DrawboardFragment
import com.projet.clientleger.ui.game.PlayersAdapter
import com.projet.clientleger.ui.game.viewmodel.GameViewModel
import com.projet.clientleger.ui.lobby.viewmodel.LobbyViewModel
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.android.synthetic.main.dialog_button_quit_game.*
import kotlinx.android.synthetic.main.dialog_gamemode.*
import javax.inject.Inject

const val GAME_WELCOME = "Bienvenue dans le tutoriel de partie de Polydessin !"
const val GAME_INFOS_INTRO = "Voici le panneau contenant toutes les informations importante à la partie." +
        "\nPremièrement, on peut y trouver le décompte de la partie. Ce décompte représente le temps avant un changement de devineur" +
        "\nPar la suite, on a l'icône de crayon représentant que vous êtes actuellement le dessinateur" +
        "\nFinalement, on a les informations des joueurs dans la partie ainsi que le score d'équipe"
const val CHAT_INTRO = "La boîte de Chat permet non seulement de communiquer avec les autres joueurs dans la partie," +
        "\nmais également à deviner ce que tes coéquipiers dessinent. Quand la barre de texte est verte il est temps de deviner ! "
const val DRAWBOARD_INTRO = "Nous passons maintenant à la partie intéressante de la partie, c'est-à-dire le dessin !"
const val INTRO_CONCLUSION = "Félicitation, vous avez terminé le tutoriel de Polydessin!" +
        "\nVous pouvez rester et vous familiariser avec le jeu, mais prenez en compte que les boutons Annuler et Refaire ne sont pas disponibles dans le tutoriel" +
        "\nPour revenir au menu principal et commencer à jouer, appuyez sur le bouton quitter en bas à gauche de l'écran"
const val DRAWBOARD_CONCLUSION = "Félicitation, vous avez officiellement dessiné votre premier sur Polydessin! " +
        "Nous allons maintenant changer de rôle, vous devez désormais deviner le dessin"
const val CHAT_TUTORIAL_SUCESS = "Vous avez deviné notre mot avec succès, bravo ! " +
        "Voila qui conclue alors notre tutoriel, vous pouvez rester et vous amuser avec le dessin " +
        "autant que vous voulez. Quand vous serez prêt à partir, appuyez sur le bouton quitter en bas à gauche de l'écran"
@AndroidEntryPoint
class GameTutorialActivity: AppCompatActivity()  {
    private val vm: GameViewModel by viewModels()
    lateinit var binding: ActivityGameBinding
    private val team1: ArrayList<PlayerInfo> = ArrayList()

    private var chatService: ChatStorageService? = null


    private val chatConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            chatService = (service as ChatStorageService.LocalBinder).getService()
            chatService?.addNewConvo(TabInfo(LobbyViewModel.GAME_TAB_NAME,ChatViewModel.GAME_TAB_ID,TabType.GAME),true)
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            chatService = null
        }
    }

    @Inject
    lateinit var drawboardFragment:DrawboardFragment

    @Inject
    lateinit var chatFragment:ChatFragment

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityGameBinding.inflate(layoutInflater)
        setContentView(binding.root)
        binding.lifecycleOwner = this
        binding.root.viewTreeObserver.addOnGlobalLayoutListener {
            val rect = Rect()
            binding.root.getWindowVisibleDisplayFrame(rect)
            val heightDiff = binding.root.height - rect.bottom
            supportFragmentManager.setFragmentResult("keyboardEvent", bundleOf("height" to heightDiff))
        }
        supportFragmentManager.setFragmentResult("isDrawing", bundleOf("boolean" to true))

        setupTeamsUi()
        binding.team1Rv.layoutManager = LinearLayoutManager(this)
        binding.team1Rv.adapter = PlayersAdapter(team1)

        binding.logoutBtn.setOnClickListener {
            showQuitGameDialog(QUIT_GAME_MESSAGE, false)
        }
        binding.currentRole.setImageResource(R.drawable.ic_drawer)

        supportFragmentManager.commit{
            add(R.id.drawboardContainer, drawboardFragment)
            add(R.id.chatRoot,chatFragment)
        }

        supportFragmentManager.setFragmentResultListener("ready",this){requestKey, bundle ->
            startTutorialSequence()
        }
        binding.continueTutorial.setOnClickListener {
            continueTutorial()
        }
        supportFragmentManager.setFragmentResultListener("finishTutorial",this){ requestKey, bundle ->
            finishTutorial()
        }
    }

    override fun onStart() {
        super.onStart()
        if(chatService == null) {
            Intent(this, ChatStorageService::class.java).also { intent ->
                bindService(intent, chatConnection, Context.BIND_IMPORTANT)
            }
        }
    }

    override fun onStop() {
        super.onStop()
        chatService?.let {
            unbindService(chatConnection)
        }

    }

    private fun startTutorialSequence(){
        val models:ArrayList<SequenceModel> = ArrayList()
        models.add(SequenceModel(GAME_WELCOME,binding.drawboardContainer,this,false))
        models.add(SequenceModel(GAME_INFOS_INTRO,binding.team,this,false))
        models.add(SequenceModel(CHAT_INTRO,binding.chatRoot,this,false))
        models.add(SequenceModel(DRAWBOARD_INTRO,binding.drawboardContainer,this,false))
        val drawBoardSequenceModels = drawboardFragment.getTutorialSequence()
        for(i in 0 until drawBoardSequenceModels.size){
            models.add(drawBoardSequenceModels[i])
        }
        vm.createSequence(models)
    }
    private fun continueTutorial(){
        binding.continueTutorial.visibility = View.INVISIBLE
        binding.currentRole.setImageResource(R.drawable.ic_guessing)
        supportFragmentManager.setFragmentResult("isGuessing", bundleOf("boolean" to true))
        val models:ArrayList<SequenceModel> = ArrayList()
        models.add(SequenceModel(DRAWBOARD_CONCLUSION,binding.drawboardContainer,this,false))
        val chatSequenceModels = chatFragment.getTutorialSequence()
        for(i in 0 until chatSequenceModels.size){
            models.add(chatSequenceModels[i])
        }
        vm.createSequence(models)
    }

    private fun setupTeamsUi(){
        team1.add(PlayerInfo(username = vm.getUsername()))
        binding.team1Rv.adapter?.notifyDataSetChanged()
        binding.team1Score.text = "0"
        binding.team2Label.visibility = View.GONE
        binding.team2Score.visibility = View.GONE
    }

    private fun showQuitGameDialog(message:String, isMessageFromServer:Boolean){
        val dialogView = layoutInflater.inflate(R.layout.dialog_button_quit_game, null)
        val dialog = AlertDialog.Builder(this).setView(dialogView).create()
        dialog.show()
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        dialog.titleMessage.text = message

        dialog.quitBtn.setOnClickListener {
            dialog.dismiss()
            supportFragmentManager.setFragmentResult(
                "closeGameChat",
                bundleOf("tabName" to LobbyViewModel.GAME_TAB_NAME)
            )
            supportFragmentManager.setFragmentResult(
                "activityChange",
                bundleOf("currentActivity" to "lobby")
            )
            vm.finishTutorial()
            finish()
        }
            dialog.continueBtn.setOnClickListener {
                dialog.dismiss()
            }
    }
    private fun finishTutorial(){
        val models:ArrayList<SequenceModel> = ArrayList()
        models.add(SequenceModel(CHAT_TUTORIAL_SUCESS,binding.chatRoot,this,false))
        vm.createSequence(models)
    }

    override fun onDestroy() {
        super.onDestroy()
        finish()
    }
}