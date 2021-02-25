package com.projet.clientleger.ui.accountcreation.view

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.databinding.DataBindingUtil
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import com.projet.clientleger.R
import com.projet.clientleger.databinding.ActivityAccountCreationBinding
import com.projet.clientleger.ui.accountcreation.viewmodel.RegisterViewModel
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.android.synthetic.main.activity_account_creation.*
import kotlinx.coroutines.launch

@AndroidEntryPoint
class AccountCreation : AppCompatActivity() {
    private lateinit var vm: RegisterViewModel
    private lateinit var binding: ActivityAccountCreationBinding
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        vm = ViewModelProvider(this).get(RegisterViewModel::class.java)
        binding = DataBindingUtil.setContentView(this, R.layout.activity_account_creation)
        binding.loadingBar.visibility = View.GONE
        binding.lifecycleOwner = this
        setupInputsObservable()
        btn_submit.setOnClickListener {
            binding.btnSubmit.text = ""
            binding.loadingBar.visibility = View.VISIBLE
            lifecycleScope.launch {
                val res = vm.registerAccount()
                loadingBar.visibility = View.GONE
                if (res.isSucessful)
                    vm.clearForm()
                else {
                    vm.clearPasswords()
                    showToast(res.message)
                }
                binding.btnSubmit.text = getString(R.string.register_btn)
            }
        }
        binding.viewmodel = vm
    }

    private fun showToast(msg: String) {
        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
    }

    private fun setupInputsObservable() {
        vm.registerFistNameLiveData.observe(this, {
            binding.btnSubmit.isEnabled = vm.isValidFilled()
        })
        vm.registerLastNameLiveData.observe(this, {
            binding.btnSubmit.isEnabled = vm.isValidFilled()
        })
        vm.registerUsernameLiveData.observe(this, {
            binding.btnSubmit.isEnabled = vm.isValidFilled()
        })
        vm.registerEmailLiveData.observe(this, {
            binding.btnSubmit.isEnabled = vm.isValidFilled()
            if (vm.isInvalidEmail())
                binding.email.error = "Email must respect email pattern"
            else
                binding.email.error = null
        })
        vm.registerPasswordLiveData.observe(this, {
            binding.btnSubmit.isEnabled = vm.isValidFilled()
            passwordNoDigitCheck()
            isDifferentPasswordsCheck()
            passwordMinLengthCheck()
        })
        vm.registerPasswordConfirmLiveData.observe(this, {
            binding.btnSubmit.isEnabled = vm.isValidFilled()
            isDifferentPasswordsCheck()
        })
    }

    private fun passwordMinLengthCheck() {
        if (vm.passwordIsMinLength()) {
            binding.passwordMinLengthError.setTextColor(
                ContextCompat.getColor(
                    this,
                    R.color.register_error
                )
            )
            binding.passwordMinLengthError.setCompoundDrawablesWithIntrinsicBounds(
                R.drawable.ic_baseline_close_24,
                0,
                0,
                0
            )
        } else {
            binding.passwordMinLengthError.setTextColor(
                ContextCompat.getColor(
                    this,
                    R.color.register_valid
                )
            )
            binding.passwordMinLengthError.setCompoundDrawablesWithIntrinsicBounds(
                R.drawable.ic_baseline_done_24,
                0,
                0,
                0
            )
        }
    }

    private fun isDifferentPasswordsCheck() {
        if (vm.isDifferentPasswords()) {
            binding.differentPasswordError.setTextColor(
                ContextCompat.getColor(
                    this,
                    R.color.register_error
                )
            )
            binding.differentPasswordError.setCompoundDrawablesWithIntrinsicBounds(
                R.drawable.ic_baseline_close_24,
                0,
                0,
                0
            )
        } else {
            binding.differentPasswordError.setTextColor(
                ContextCompat.getColor(
                    this,
                    R.color.register_valid
                )
            )
            binding.differentPasswordError.setCompoundDrawablesWithIntrinsicBounds(
                R.drawable.ic_baseline_done_24,
                0,
                0,
                0
            )
        }
    }

    private fun passwordNoDigitCheck() {
        if (vm.passwordContainsNoDigit()) {
            binding.passwordNoDigitError.setTextColor(
                ContextCompat.getColor(
                    this,
                    R.color.register_error
                )
            )
            binding.passwordNoDigitError.setCompoundDrawablesWithIntrinsicBounds(
                R.drawable.ic_baseline_close_24,
                0,
                0,
                0
            )
        } else {
            binding.passwordNoDigitError.setTextColor(
                ContextCompat.getColor(
                    this,
                    R.color.register_valid
                )
            )
            binding.passwordNoDigitError.setCompoundDrawablesWithIntrinsicBounds(
                R.drawable.ic_baseline_done_24,
                0,
                0,
                0
            )
        }
    }
}