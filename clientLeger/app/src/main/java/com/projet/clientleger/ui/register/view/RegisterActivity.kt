package com.projet.clientleger.ui.register.view

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.view.MenuItem
import android.view.View
import android.widget.TextView
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.edit
import androidx.databinding.DataBindingUtil
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import com.projet.clientleger.R
import com.projet.clientleger.databinding.ActivityRegisterBinding
import com.projet.clientleger.ui.connexion.view.ConnexionActivity
import com.projet.clientleger.ui.mainmenu.view.MainmenuActivity
import com.projet.clientleger.ui.register.viewmodel.RegisterViewModel
import dagger.hilt.android.AndroidEntryPoint

import kotlinx.coroutines.launch

@AndroidEntryPoint
class RegisterActivity : AppCompatActivity() {
    val vm: RegisterViewModel by viewModels()
    lateinit var binding: ActivityRegisterBinding
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        supportActionBar?.setDisplayHomeAsUpEnabled(true) //ViewModelProvider(this).get(RegisterViewModel::class.java)
        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)
        binding.lifecycleOwner = this
        loadingBtn(false)
        setupInputsObservable()
        binding.btnSubmit.setOnClickListener {
            registerAccount()
        }
        binding.viewmodel = vm
    }

    fun registerAccount() {
        loadingBtn(true)
        lifecycleScope.launch {
            val res = vm.registerAccount()
            if (res.isSucessful) {
                vm.clearForm()
                setUserTokens(res.accessToken, res.refreshToken)
                gotoMainmenu()
            } else {
                vm.clearPasswords()
                showToast(res.message)
            }
            loadingBtn(false)
        }
    }

    private fun gotoMainmenu(){
        startActivity(Intent(this, MainmenuActivity::class.java))
    }

    fun loadingBtn(isLoading: Boolean) {
        if (isLoading) {
            binding.btnSubmit.text = ""
            binding.loadingBar.visibility = View.VISIBLE
        } else {
            binding.loadingBar.visibility = View.GONE
            binding.btnSubmit.text = getString(R.string.register_btn)
        }
    }

    fun setUserTokens(accessToken: String, refreshToken: String) {
        getSharedPreferences(
            getString(R.string.user_creds),
            Context.MODE_PRIVATE
        ).edit {
            putString("accessToken", accessToken)
            putString("refreshToken", refreshToken)
            apply()
        }
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        this.finish()
        startActivity(Intent(this, ConnexionActivity::class.java))
        return super.onOptionsItemSelected(item)
    }

    fun showToast(msg: String) {
        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
    }

    fun setupInputsObservable() {
        vm.registerFistNameLiveData.observe(this) {
            binding.btnSubmit.isEnabled = vm.isValidFilled()
        }
        vm.registerLastNameLiveData.observe(this) {
            binding.btnSubmit.isEnabled = vm.isValidFilled()
        }
        vm.registerUsernameLiveData.observe(this) {
            binding.btnSubmit.isEnabled = vm.isValidFilled()
        }
        vm.registerEmailLiveData.observe(this) {
            binding.btnSubmit.isEnabled = vm.isValidFilled()
            if (vm.isInvalidEmail())
                binding.email.error = "Email must respect email pattern"
            else
                binding.email.error = null
        }
        vm.registerPasswordLiveData.observe(this) {
            binding.btnSubmit.isEnabled = vm.isValidFilled()
            passwordNoDigitCheck()
            isDifferentPasswordsCheck()
            passwordMinLengthCheck()
        }
        vm.registerPasswordConfirmLiveData.observe(this) {
            binding.btnSubmit.isEnabled = vm.isValidFilled()
            isDifferentPasswordsCheck()
        }
    }

    fun passwordMinLengthCheck() {
        if (vm.passwordIsNotMinLength()) {
            setTextColorError(binding.passwordMinLengthError)
            setTextIconError(binding.passwordMinLengthError)
        } else {
            setTextColorValid(binding.passwordMinLengthError)
            setTextIconValid(binding.passwordMinLengthError)
        }
    }

    fun isDifferentPasswordsCheck() {
        if (vm.isDifferentPasswords()) {
            setTextColorError(binding.differentPasswordError)
            setTextIconError(binding.differentPasswordError)
        } else {
            setTextColorValid(binding.differentPasswordError)
            setTextIconValid(binding.differentPasswordError)
        }
    }

    fun passwordNoDigitCheck() {
        if (vm.passwordContainsNoDigit()) {
            setTextColorError(binding.passwordNoDigitError)
            setTextIconError(binding.passwordNoDigitError)
        } else {
            setTextColorValid(binding.passwordNoDigitError)
            setTextIconValid(binding.passwordNoDigitError)
        }
    }

    fun setTextColorError(textView: TextView) {
        textView.setTextColor(
            ContextCompat.getColor(
                this,
                R.color.register_error
            )
        )
    }

    fun setTextColorValid(textView: TextView) {
        textView.setTextColor(
            ContextCompat.getColor(
                this,
                R.color.register_valid
            )
        )
    }

    fun setTextIconError(textView: TextView) {
        textView.setCompoundDrawablesWithIntrinsicBounds(
            R.drawable.ic_baseline_close_24,
            0,
            0,
            0
        )
    }

    fun setTextIconValid(textView: TextView) {
        textView.setCompoundDrawablesWithIntrinsicBounds(
            R.drawable.ic_baseline_done_24,
            0,
            0,
            0
        )
    }

}