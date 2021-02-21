package com.projet.clientleger.ui.accountcreation.view

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import com.projet.clientleger.R
import com.projet.clientleger.data.api.model.RegisterModel
import com.projet.clientleger.ui.accountcreation.viewmodel.RegisterViewModel
import kotlinx.android.synthetic.main.activity_account_creation.*

class AccountCreation : AppCompatActivity() {
    private lateinit var vm: RegisterViewModel
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_account_creation)

        vm = ViewModelProvider(this).get(RegisterViewModel::class.java)
        btn_submit.setOnClickListener {
            val registerModel = RegisterModel()
            registerModel.name = "${first_name.text.toString().trim()}  ${last_name.text.toString().trim()}"
            registerModel.username = username.text.toString().trim()
            registerModel.email = email.text.toString().trim()
            registerModel.password = password.text.toString().trim()
            registerModel.passwordConfirm = passwordConfirm.text.toString().trim()

            vm.registerAccount(registerModel)
            vm.registerAccountLiveData?.observe(this, Observer {
                showToast(it)
            })
        }
    }

    private fun showToast(msg: String){
        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
    }


}