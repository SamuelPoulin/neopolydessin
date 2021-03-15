package com.projet.clientleger.ui.mainmenu.view

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.os.IBinder
import android.util.DisplayMetrics
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.view.WindowManager
import android.widget.ArrayAdapter
import android.widget.Spinner
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.edit
import androidx.core.content.res.ResourcesCompat
import androidx.fragment.app.FragmentManager
import androidx.fragment.app.FragmentTransaction
import androidx.fragment.app.commit
import com.projet.clientleger.R
import com.projet.clientleger.data.api.service.SocketService
import com.projet.clientleger.databinding.ActivityMainmenuBinding
import com.projet.clientleger.ui.chat.ChatFragment
import com.projet.clientleger.ui.friendslist.FriendslistFragment
import com.projet.clientleger.ui.mainmenu.MainMenuViewModel
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.android.synthetic.main.dialog_gamemode.*
import kotlinx.android.synthetic.main.dialog_gamemode.view.*
import javax.inject.Inject


@AndroidEntryPoint
class MainmenuActivity : AppCompatActivity() {

    val fragmentManager: FragmentManager = supportFragmentManager
    lateinit var binding: ActivityMainmenuBinding

    val vm: MainMenuViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainmenuBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.activity = this

        binding.toolbar.setOnMenuItemClickListener { item ->
            when (item.itemId) {
                R.id.friendslistBtn -> toggleFriendslist()
            }
            true
        }

        vm.connectSocket(getSharedPreferences(
                getString(R.string.user_creds),
                Context.MODE_PRIVATE
        ).getString("accessToken", "")!!)
    }

    override fun onBackPressed() {
        super.onBackPressed()
    }

    fun toggleFriendslist() {
        binding.friendslistContainer.visibility =
                when (binding.friendslistContainer.visibility) {
                    View.VISIBLE -> View.GONE
                    View.GONE -> View.VISIBLE
                    else -> View.GONE
                }
    }

    fun showGameDialog(isCreating: Boolean) {
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

        val adapterGamemode = ArrayAdapter(this, R.layout.spinner_item, resources.getStringArray(R.array.gamemodes))
        adapterGamemode.setDropDownViewResource(R.layout.spinner_dropdown_item)
        val spinner = dialogView.findViewById<Spinner>(R.id.gamemodeSpinner)
        spinner.adapter = adapterGamemode

        val adapterDifficulty = ArrayAdapter(this, R.layout.spinner_item, resources.getStringArray(R.array.difficulty))
        adapterDifficulty.setDropDownViewResource(R.layout.spinner_dropdown_item)
        dialogView.findViewById<Spinner>(R.id.difficultySpinner).adapter = adapterDifficulty

        dialogView.actionBtn.setOnClickListener {
            vm.createGame(dialogView.gameName.text.toString(), gamemodeSpinner.transitionName, difficultySpinner.transitionName)
        }
    }
}