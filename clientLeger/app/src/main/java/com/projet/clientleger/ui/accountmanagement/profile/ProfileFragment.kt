package com.projet.clientleger.ui.accountmanagement.profile

import android.content.Context
import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import com.projet.clientleger.R
import com.projet.clientleger.data.model.account.UpdateAccountModel
import com.projet.clientleger.databinding.DashboardFragmentBinding
import com.projet.clientleger.databinding.ProfileFragmentBinding
import com.projet.clientleger.ui.accountmanagement.view.AccountManagementActivity
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class ProfileFragment @Inject constructor(): Fragment() {
    val vm: ProfileViewModel by viewModels()
    private var binding: ProfileFragmentBinding? = null
    lateinit var activity:AccountManagementActivity

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        binding = ProfileFragmentBinding.inflate(inflater, container, false)
        binding!!.confirmBtn.setOnClickListener {
            sendNewInfos()
        }
        return binding!!.root
    }

    override fun onAttach(context: Context) {
        super.onAttach(context)
        activity = context as AccountManagementActivity
    }
    private fun sendNewInfos(){
        var firstName: String? = binding!!.firstNameBox.text.toString()
        var lastName: String? = binding!!.lastNameBox.text.toString()
        var username: String? = binding!!.usernameBox.text.toString()
        var email: String? = binding!!.emailBox.text.toString()
        if(firstName!!.isEmpty())
            firstName = null
        if(lastName!!.isEmpty())
            lastName = null
        if(username!!.isEmpty())
            username = null
        if(email!!.isEmpty())
            email = null
        val updateAccountModel = UpdateAccountModel(
                firstName,
                lastName,
                username,
                email)

        lifecycleScope.launch {
            binding!!.confirmBtn.isEnabled = false
            activity.changeProfileInfos(updateAccountModel)
            activity.fetchAccountInfos()
            clearBoxes()
            binding!!.confirmBtn.isEnabled = true
        }
    }
    private fun clearBoxes(){
        binding!!.firstNameBox.text.clear()
        binding!!.lastNameBox.text.clear()
        binding!!.usernameBox.text.clear()
        binding!!.emailBox.text.clear()
    }

}