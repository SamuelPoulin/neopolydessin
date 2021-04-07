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
    ): View? {
        binding = ProfileFragmentBinding.inflate(inflater, container, false)
        binding!!.confirmBtn.setOnClickListener {
            val updateAccountModel = UpdateAccountModel(
                binding!!.firstNameBox.text.toString(),
                binding!!.lastNameBox.text.toString(),
                binding!!.usernameBox.text.toString(),
                binding!!.emailBox.text.toString())

            lifecycleScope.launch {
                binding!!.confirmBtn.isEnabled = false
                activity.changeProfileInfos(updateAccountModel)
                binding!!.confirmBtn.isEnabled = true
            }
        }
        return binding!!.root
    }

    override fun onAttach(context: Context) {
        super.onAttach(context)
        activity = context as AccountManagementActivity
    }

}