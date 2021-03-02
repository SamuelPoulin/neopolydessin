package com.projet.clientleger.ui.accountmanagement.view

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.databinding.DataBindingUtil.setContentView
import com.projet.clientleger.R
import com.projet.clientleger.databinding.ActivityAccountManagementBinding
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class AccountManagementActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAccountManagementBinding
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_account_management)
    }
}