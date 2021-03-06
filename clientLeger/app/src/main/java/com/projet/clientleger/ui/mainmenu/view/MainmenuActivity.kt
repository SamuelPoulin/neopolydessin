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
import android.widget.*
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.ContextCompat.startActivity
import androidx.core.os.bundleOf
import androidx.fragment.app.commit
import com.google.android.material.textfield.TextInputLayout
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
        "Premi??rement, voici l'onglet te permettant de cr??er une partie.\nCela te permet de cr??er une partie personnalis??e selon tes pr??f??rences, notamment le mode de jeu ainsi que la difficult??"
const val INTRO_JOIN_GAME_MESSAGE =
        "Le bouton Rejoindre Une Partie sert ?? rejoindre une partie d??j?? existante pour jouer avec d'autres utilisateurs de l'application.\ntu peux ??galement rechercher une partie selon tes pr??f??rences de difficult?? et de mode de jeu"
const val INTRO_DASHBOARD_MESSAGE =
        "Le tableau de bord permet de voir toutes les statistiques de ton compte, n'h??sites pas ?? aller regarder cela suite au tutoriel !"
const val INTRO_TOOLBAR_MESSAGE =
        "La barre d'outil permet de se d??connecter et d'acc??der ?? la liste d'amis\nVous pouvez ainsi ajouter et ??crire ?? des amis ici si vous voulez ??tre en mesure de jouer avec eux"
const val INTRO_CHATBOX_MESSAGE =
        "Vous pouvez ??galement ??crire aux autres utilisateurs connect??s ?? l'application par le bo??te de chat ici"
const val INTRO_START_GAME_MESSAGE =
        "Nous allons maintenant apprendre comment jouer !\nAppuyez sur Cr??er une partie pour commencer"

@AndroidEntryPoint
class MainmenuActivity : AppCompatActivity(), IAcceptGameInviteListener {
    var selectedGameType: GameType? = GameType.CLASSIC
    var selectedDifficulty: Difficulty? = Difficulty.EASY
    lateinit var binding: ActivityMainmenuBinding
    val vm: MainMenuViewModel by viewModels()
    var isPrivate: Boolean = false

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
            val intent = Intent(this, SearchLobbyActivity::class.java)
            startActivity(intent)
        }
        binding.createGameBtn.setOnClickListener {
            vm.playSound(SoundId.CLICK.value)
            if (vm.isTutorialActive()) {
                val intent = Intent(this, GameTutorialActivity::class.java)
                startActivity(intent)
            } else {
                showGameDialog()
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
        //sequence.add(SequenceModel(INTRO_CHATBOX_MESSAGE, binding.chatRoot, this, false))
        sequence.add(SequenceModel(INTRO_START_GAME_MESSAGE, binding.createGameBtn, this, true))
        vm.createShowcaseSequence(sequence)
    }

    private fun showGameDialog() {
        selectedGameType = GameType.CLASSIC
        selectedDifficulty = Difficulty.EASY
        val visibility: Int
        val action: String
        val title: String
        visibility = View.VISIBLE
        action = resources.getString(R.string.start)
        title = resources.getString(R.string.createGame)
        val dialogView = layoutInflater.inflate(R.layout.dialog_gamemode, null)
        val dialog = AlertDialog.Builder(this).setView(dialogView).create()
        dialog.show()


        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        dialog.name.visibility = visibility
        dialog.name.editText?.setText("Partie de ${vm.getUsername()}")
        dialog.privacyBtn.visibility = visibility
        dialog.actionBtn.text = action
        dialog.title.text = title

        setupGamemodeSpinner(dialogView)
        setupDifficultySpinner(dialogView)

        dialogView.actionBtn.setOnClickListener {
            vm.playSound(SoundId.CONNECTED.value)
            val intent = Intent(this, LobbyActivity::class.java)
            intent.putExtra("gameName", getGameName(dialog))
            intent.putExtra("isPrivate", false)

            intent.putExtra("gameType", selectedGameType)
            intent.putExtra("difficulty", selectedDifficulty)
            startActivity(intent)
            dialog.dismiss()
        }

        dialogView.privacyBtn.setOnClickListener {
            togglePrivacy(it as Button)
        }

        dialogView.cancelButton.setOnClickListener {
            vm.playSound(SoundId.ERROR.value)
            dialog.dismiss()
        }
    }

    private fun togglePrivacy(buttonView: Button) {
        isPrivate = !isPrivate
        if (isPrivate) {
            buttonView.setBackgroundColor(ContextCompat.getColor(this, R.color.red))
            buttonView.text = "Partie priv??e"
        } else {
            buttonView.setBackgroundColor(ContextCompat.getColor(this, R.color.green))
            buttonView.text = "Partie publique"
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
                ArrayAdapter(this, R.layout.item_dropdown, resources.getStringArray(R.array.gamemodes))
        val dropdownGamemode = dialogView.findViewById<TextInputLayout>(R.id.gamemodeDropdown).editText as AutoCompleteTextView
        dropdownGamemode.setAdapter(adapterGamemode)

        dropdownGamemode.setOnItemClickListener { parent, view, position, id ->
            vm.playSound(SoundId.SELECTED.value)
            selectedGameType =
                    GameType.fromFrenchToEnum(adapterGamemode.getItem(position).toString())
            if(selectedGameType == GameType.SPRINT_SOLO)
                dialogView.privacyBtn.visibility = View.INVISIBLE
            else
                dialogView.privacyBtn.visibility = View.VISIBLE
        }
    }

    private fun setupDifficultySpinner(dialogView: View) {
        val adapterDifficulty =
                ArrayAdapter(this, R.layout.item_dropdown, resources.getStringArray(R.array.difficulty))
        val dropdownDifficulty = dialogView.findViewById<TextInputLayout>(R.id.difficultyDropdown).editText as AutoCompleteTextView
        dropdownDifficulty.setAdapter(adapterDifficulty)

        dropdownDifficulty.setOnItemClickListener { parent, view, position, id ->
            vm.playSound(SoundId.SELECTED.value)
            selectedDifficulty =
                    Difficulty.fromFrenchToEnum(adapterDifficulty.getItem(position).toString())
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