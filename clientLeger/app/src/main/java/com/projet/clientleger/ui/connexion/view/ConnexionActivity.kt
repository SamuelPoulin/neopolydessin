package com.projet.clientleger.ui.connexion.view

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.edit
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import com.projet.clientleger.R
import com.projet.clientleger.data.api.model.RegisterDataResponse
import com.projet.clientleger.data.repository.ConnectionRepository
import com.projet.clientleger.ui.connexion.viewmodel.ConnexionViewModel
import com.projet.clientleger.ui.mainmenu.view.MainmenuActivity
import com.projet.clientleger.ui.register.view.RegisterActivity
import com.projet.clientleger.ui.register.viewmodel.RegisterViewModel
import dagger.hilt.android.AndroidEntryPoint
import dagger.hilt.android.HiltAndroidApp
import kotlinx.android.synthetic.main.connexion_activity.*
import kotlinx.android.synthetic.main.fragment_chat.*
import kotlinx.coroutines.launch

@AndroidEntryPoint
class ConnexionActivity : AppCompatActivity() {
    private val vm: ConnexionViewModel by viewModels()
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.connexion_activity)
        setupButtons()
    }


    private fun setupButtons(){
        connectBtn.setOnClickListener {
            connectBtn()
        }
        forgottenPasswordBtn.setOnClickListener{
            forgottenPasswordBtn()
        }
        createAccountBtn.setOnClickListener {
            createAccountBtn()
        }
    }

    private fun connectBtn(){
        println(connectionUsername.text)
        println(connectionPassword.text)

        connectBtn.isEnabled = false
        lifecycleScope.launch {
            val res = vm.connectAccount(connectionUsername.text.toString(),connectionPassword.text.toString())
            if (res.isSucessful) {
                connectionUsername.text.clear()
                connectionPassword.text.clear()
                setUserTokens(res.accessToken, res.refreshToken)
                vm.connectSocket(res.accessToken)
                goToMainMenu()
            } else {
                showToast(res.message)
            }
        }
        connectBtn.isEnabled = true
    }
    private fun showToast(msg: String) {
        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
    }
    private fun setUserTokens(accessToken: String, refreshToken: String) {
        getSharedPreferences(
                getString(R.string.user_creds),
                Context.MODE_PRIVATE
        ).edit {
            putString("accessToken", accessToken)
            putString("refreshToken", refreshToken)
            apply()
        }
    }
    private fun forgottenPasswordBtn(){
        //TODO: bouton de récupération de mot de passe non-implémenté
    }
    private fun createAccountBtn(){
        val intent = Intent(this, RegisterActivity::class.java)
        startActivity(intent)
    }
    private fun goToMainMenu(){
        val intent = Intent(this, MainmenuActivity::class.java)
        startActivity(intent)
    }
}