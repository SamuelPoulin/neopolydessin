package com.projet.clientleger.ui.mainmenu.view

import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.ColorDrawable
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.SoundPool
import android.os.Bundle
import android.view.View
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Spinner
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat.startActivity
import androidx.core.os.bundleOf
import androidx.fragment.app.commit
import com.projet.clientleger.DaggerPolydessinApplication_HiltComponents_SingletonC.builder
import com.projet.clientleger.R
import com.projet.clientleger.data.api.model.SequenceModel
import com.projet.clientleger.data.enumData.Difficulty
import com.projet.clientleger.data.enumData.GameType
import com.projet.clientleger.data.service.ChatStorageService
import com.projet.clientleger.data.enumData.SoundId
import com.projet.clientleger.data.service.AudioService
import com.projet.clientleger.data.service.TutorialService
import com.projet.clientleger.databinding.ActivityMainmenuBinding
import com.projet.clientleger.ui.IAcceptGameInviteListener
import com.projet.clientleger.ui.accountmanagement.view.AccountManagementActivity
import com.projet.clientleger.ui.friendslist.FriendslistFragment
import com.projet.clientleger.ui.game.view.GameTutorialActivity
import com.projet.clientleger.ui.lobby.view.LobbyActivity
import com.projet.clientleger.ui.lobbylist.view.SearchLobbyActivity
import com.projet.clientleger.ui.mainmenu.MainMenuViewModel
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.android.synthetic.main.dialog_gamemode.*
import kotlinx.android.synthetic.main.dialog_gamemode.view.*
import javax.inject.Inject

const val WELCOME_MESSAGE =
    "Bienvenue dans Polydessin ! \ndans ce tutoriel, nous allons vous montrer comment utiliser l'application comme un pro !"
const val INTRO_CREATE_GAME_MESSAGE =
    "Premièrement, voici l'onglet te permettant de créer une partie.\nCela te permet de créer une partie personnalisée selon tes préférences, notamment le mode de jeu ainsi que la difficulté"
const val INTRO_JOIN_GAME_MESSAGE =
    "Le bouton Rejoindre Une Partie sert à rejoindre une partie déjà existante pour jouer avec d'autres utilisateurs de l'application.\ntu peux également rechercher une partie selon tes préférences de difficulté et de mode de jeu"
const val INTRO_DASHBOARD_MESSAGE =
    "Le tableau de bord permet de voir toutes les statistiques de ton compte, n'hésites pas à aller regarder cela suite au tutoriel !"
const val INTRO_TOOLBAR_MESSAGE =
    "La barre d'outil permet de se déconnecter et d'accéder à la liste d'amis\nVous pouvez ainsi ajouter et écrire à des amis ici si vous voulez être en mesure de jouer avec eux"
const val INTRO_CHATBOX_MESSAGE =
    "Vous pouvez également écrire aux autres utilisateurs connectés à l'application par le boîte de chat ici"
const val INTRO_START_GAME_MESSAGE =
    "Nous allons maintenant apprendre comment jouer !\nAppuyez sur Créer une partie pour commencer"

@AndroidEntryPoint
class MainmenuActivity : AppCompatActivity(), IAcceptGameInviteListener {
    var selectedGameType: GameType = GameType.CLASSIC
    var selectedDifficulty: Difficulty = Difficulty.EASY
    lateinit var binding: ActivityMainmenuBinding
    val vm: MainMenuViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainmenuBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.activity = this

        binding.accountBtn.setOnClickListener {
            val intent = Intent(this, AccountManagementActivity::class.java)
            startActivity(intent)
        }

        startService(Intent(this, ChatStorageService::class.java))

        binding.toolbar.setNavigationIcon(R.drawable.ic_logout)
        binding.toolbar.setNavigationOnClickListener {
            vm.playSound(SoundId.ERROR.value)
            finish()
        }
        binding.accountBtn.setOnClickListener {
            vm.playSound(SoundId.CLICK.value)
            goToDashBoard()
        }
        binding.joinGamebtn.setOnClickListener {
            vm.playSound(SoundId.CLICK.value)
            showGameDialog(false)
        }
        binding.createGameBtn.setOnClickListener {
            vm.playSound(SoundId.CLICK.value)
            if (vm.isTutorialActive()) {
                val intent = Intent(this, GameTutorialActivity::class.java)
                startActivity(intent)
            } else {
                showGameDialog(true)
            }
        }
        binding.userGuideBtn.setOnClickListener {
            vm.playSound(SoundId.CLICK.value)
            startTutorial()
        }
    }

    private fun goToDashBoard() {
        val intent = Intent(this, AccountManagementActivity::class.java)
        startActivity(intent)
    }

    private fun startTutorial() {
        val sequence: ArrayList<SequenceModel> = ArrayList()
        sequence.add(SequenceModel(WELCOME_MESSAGE, binding.logo, this, false))
        sequence.add(SequenceModel(INTRO_CREATE_GAME_MESSAGE, binding.createGameBtn, this, false))
        sequence.add(SequenceModel(INTRO_JOIN_GAME_MESSAGE, binding.joinGamebtn, this, false))
        sequence.add(SequenceModel(INTRO_DASHBOARD_MESSAGE, binding.accountBtn, this, false))
        sequence.add(SequenceModel(INTRO_TOOLBAR_MESSAGE, binding.toolbar, this, false))
        sequence.add(SequenceModel(INTRO_CHATBOX_MESSAGE, binding.chatRoot, this, false))
        sequence.add(SequenceModel(INTRO_START_GAME_MESSAGE, binding.createGameBtn, this, true))
        vm.createShowcaseSequence(sequence)
    }

    private fun showGameDialog(isCreating: Boolean) {
        val visibility: Int
        val action: String
        val title: String
        if (isCreating) {
            visibility = View.VISIBLE
            action = resources.getString(R.string.create)
            title = resources.getString(R.string.createGame)
        } else {
            visibility = View.GONE
            action = resources.getString(R.string.join)
            title = resources.getString(R.string.joinGame)
        }
        val dialogView = layoutInflater.inflate(R.layout.dialog_gamemode, null)
        val dialog = AlertDialog.Builder(this).setView(dialogView).create()
        dialog.show()


        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        dialog.name.visibility = visibility
        dialog.actionBtn.text = action
        dialog.title.text = title

        setupGamemodeSpinner(dialogView)
        setupDifficultySpinner(dialogView)

        dialogView.actionBtn.setOnClickListener {
            val intent: Intent
            if (isCreating) {
                vm.playSound(SoundId.CONNECTED.value)
                intent = Intent(this, LobbyActivity::class.java)
                intent.putExtra("gameName", getGameName(dialog))
                intent.putExtra("isPrivate", false)
            } else {
                vm.playSound(SoundId.CONFIRM.value)
                intent = Intent(this, SearchLobbyActivity::class.java)
            }

            intent.putExtra("gameType", selectedGameType)
            intent.putExtra("difficulty", selectedDifficulty)
            startActivity(intent)
            dialog.dismiss()
        }

        dialogView.cancelButton.setOnClickListener {
            vm.playSound(SoundId.ERROR.value)
            dialog.dismiss()
        }
    }

    private fun getGameName(dialog: AlertDialog): String {
        var gameName = "Partie de ${vm.getUsername()}"
        if (dialog.gameName.text.toString() != "") {
            gameName = dialog.gameName.text.toString()
        }
        return gameName
    }

    private fun setupGamemodeSpinner(dialogView: View) {
        val adapterGamemode =
            ArrayAdapter(this, R.layout.spinner_item, resources.getStringArray(R.array.gamemodes))
        adapterGamemode.setDropDownViewResource(R.layout.spinner_dropdown_item)
        val spinnerGamemode = dialogView.findViewById<Spinner>(R.id.gamemodeSpinner)
        spinnerGamemode.adapter = adapterGamemode

        spinnerGamemode.onItemSelectedListener = object :
            AdapterView.OnItemSelectedListener {
            override fun onItemSelected(
                parent: AdapterView<*>,
                view: View, position: Int, id: Long
            ) {
                vm.playSound(SoundId.SELECTED.value)
                selectedGameType =
                    GameType.fromFrenchToEnum(adapterGamemode.getItem(position).toString())
            }

            override fun onNothingSelected(parent: AdapterView<*>) {}
        }
    }

    private fun setupDifficultySpinner(dialogView: View) {
        val adapterDifficulty =
            ArrayAdapter(this, R.layout.spinner_item, resources.getStringArray(R.array.difficulty))
        adapterDifficulty.setDropDownViewResource(R.layout.spinner_dropdown_item)
        val spinnerDifficulty = dialogView.findViewById<Spinner>(R.id.difficultySpinner)
        spinnerDifficulty.adapter = adapterDifficulty

        spinnerDifficulty.onItemSelectedListener = object :
            AdapterView.OnItemSelectedListener {
            override fun onItemSelected(
                parent: AdapterView<*>,
                view: View, position: Int, id: Long
            ) {
                vm.playSound(SoundId.SELECTED.value)
                selectedDifficulty =
                    Difficulty.fromFrenchToEnum(adapterDifficulty.getItem(position).toString())
            }

            override fun onNothingSelected(parent: AdapterView<*>) {}
        }
    }

    override fun onDestroy() {
        stopService(Intent(this, ChatStorageService::class.java))
        vm.disconnect()
        super.onDestroy()
    }

    override fun acceptInvite(info: Pair<String, String>) {
        intent = Intent(this, LobbyActivity::class.java)
        intent.putExtra("lobbyId", info.second)
        intent.putExtra("isJoining", true)
        startActivity(intent)
    }
}