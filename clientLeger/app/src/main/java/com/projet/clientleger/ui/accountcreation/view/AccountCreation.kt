package com.projet.clientleger.ui.accountcreation.view

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.databinding.DataBindingUtil
import androidx.lifecycle.ViewModelProvider
import com.projet.clientleger.R
import com.projet.clientleger.databinding.ActivityAccountCreationBinding
import com.projet.clientleger.ui.accountcreation.viewmodel.RegisterViewModel
import kotlinx.android.synthetic.main.activity_account_creation.*

class AccountCreation : AppCompatActivity() {
    private lateinit var vm: RegisterViewModel
    private lateinit var binding: ActivityAccountCreationBinding
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)


        binding = DataBindingUtil.setContentView(this, R.layout.activity_account_creation)
        binding.lifecycleOwner = this
        vm = ViewModelProvider(this).get(RegisterViewModel::class.java)
        setupInputsObservable()
        btn_submit.setOnClickListener {
            vm.registerAccount()
            vm.registerAccountLiveData?.observe(this, {
                showToast(it.message)
                if (it.isSuccessful) {
                    vm.clearForm()
                } else
                    vm.clearPasswords()
            })
        }
        binding.viewmodel = vm
    }

    private fun showToast(msg: String) {
        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
    }

    private fun setupInputsObservable(){
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
            if (vm.isInvalidPassword())
                binding.password.error = "Password must be at least 6 characters"
            else
                binding.password.error = null
        })
        vm.registerPasswordConfirmLiveData.observe(this, {
            binding.btnSubmit.isEnabled = vm.isValidFilled()
            if (vm.isInvalidPasswordConfirm())
                binding.passwordConfirm.error = "Password must be at least 6 characters"
            else
                binding.passwordConfirm.error = null
        })
    }
}