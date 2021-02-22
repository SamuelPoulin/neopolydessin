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
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // setContentView(R.layout.activity_account_creation)


        val binding = DataBindingUtil.setContentView<ActivityAccountCreationBinding>(this, R.layout.activity_account_creation)
        binding.lifecycleOwner = this
        vm = ViewModelProvider(this).get(RegisterViewModel::class.java)
        vm.registerFistNameLiveData.observe(this, {
            binding.btnSubmit.isEnabled = vm.isFormFilled()
        })
        vm.registerLastNameLiveData.observe(this, {
            binding.btnSubmit.isEnabled = vm.isFormFilled()
        })
        vm.registerUsernameLiveData.observe(this, {
            binding.btnSubmit.isEnabled = vm.isFormFilled()
        })
        vm.registerEmailLiveData.observe(this, {
            binding.btnSubmit.isEnabled = vm.isFormFilled()
        })
        vm.registerPasswordLiveData.observe(this, {
            binding.btnSubmit.isEnabled = vm.isFormFilled()
        })
        vm.registerPasswordConfirmLiveData.observe(this, {
            binding.btnSubmit.isEnabled = vm.isFormFilled()
        })
        btn_submit.setOnClickListener {
            vm.registerAccount()
            vm.registerAccountLiveData?.observe(this, {
                showToast(it)
            })
        }
        binding.viewmodel = vm
    }

    private fun showToast(msg: String){
        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
    }
}