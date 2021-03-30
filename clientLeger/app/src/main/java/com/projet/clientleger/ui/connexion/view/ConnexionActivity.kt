package com.projet.clientleger.ui.connexion.view

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.edit
import androidx.lifecycle.lifecycleScope
import com.projet.clientleger.R
import com.projet.clientleger.databinding.ConnexionActivityBinding
import com.projet.clientleger.ui.connexion.viewmodel.ConnexionViewModel
import com.projet.clientleger.ui.mainmenu.view.MainmenuActivity
import com.projet.clientleger.ui.register.view.RegisterActivity
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch

@AndroidEntryPoint
class ConnexionActivity : AppCompatActivity() {
    private val vm: ConnexionViewModel by viewModels()
    lateinit var binding: ConnexionActivityBinding
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ConnexionActivityBinding.inflate(layoutInflater)
        setContentView(binding.root)
        binding.lifecycleOwner = this
        setupButtons()
    }


    private fun setupButtons(){
        binding.connectBtn.setOnClickListener {
            connectBtn()
        }
        binding.forgottenPasswordBtn.setOnClickListener{
            forgottenPasswordBtn()
        }
        binding.createAccountBtn.setOnClickListener {
            createAccountBtn()
        }
    }

    private fun connectBtn(){
        binding.connectBtn.isEnabled = false
        lifecycleScope.launch {
            val res = vm.connectAccount(binding.connectionUsername.text.toString(),binding.connectionPassword.text.toString())
            binding.connectionPassword.text.clear()
            if (res.isSucessful) {
                binding.connectionUsername.text.clear()
                goToMainMenu()
            } else {
                showToast(res.message)
            }
            binding.connectBtn.isEnabled = true
        }
    }

    private fun showToast(msg: String) {
        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
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