package com.projet.clientleger.ui.accountmanagement.view

import android.annotation.SuppressLint
import android.os.Bundle
import android.widget.Button
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.databinding.DataBindingUtil.setContentView
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentManager
import androidx.lifecycle.lifecycleScope
import com.projet.clientleger.R
import com.projet.clientleger.data.api.model.account.Account
import com.projet.clientleger.data.enumData.SoundId
import com.projet.clientleger.data.model.account.UpdateAccountModel
import com.projet.clientleger.databinding.ActivityAccountManagementBinding
import com.projet.clientleger.ui.accountmanagement.dashboard.view.DOUBLE_DIGIT
import com.projet.clientleger.ui.accountmanagement.dashboard.view.DashboardFragment
import com.projet.clientleger.ui.accountmanagement.dashboard.view.SECONDS_IN_MIN
import com.projet.clientleger.ui.accountmanagement.profile.ProfileFragment
import com.projet.clientleger.ui.accountmanagement.settings.SettingsFragment
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import kotlin.math.floor

@AndroidEntryPoint
class AccountManagementActivity : AppCompatActivity() {
    private val fragmentManager: FragmentManager = supportFragmentManager
    lateinit var binding: ActivityAccountManagementBinding
    private val vm:AccountManagementViewModel by viewModels()

    @Inject
    lateinit var dashboardFragment: DashboardFragment

    @Inject
    lateinit var profileFragment: ProfileFragment

    @Inject
    lateinit var settingsFragment: SettingsFragment

    @SuppressLint("SetTextI18n")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // binding setup
        binding = ActivityAccountManagementBinding.inflate(layoutInflater)
        setContentView(binding.root)
        binding.lifecycleOwner = this

        fragmentManager.beginTransaction().add(R.id.fragmentContainer, dashboardFragment, "fragment").commit()
        binding.toggleGroup.addOnButtonCheckedListener { toggleButton, checkedId, isChecked ->
            if (isChecked) {
                vm.playSound(SoundId.CLICK.value)
                when (checkedId) {
                    R.id.dashboardBtn -> changeFragment(dashboardFragment)
                    R.id.userProfileBtn -> changeFragment(profileFragment)
                    R.id.accountSettings -> changeFragment(settingsFragment)
                }
            }
        }
        lifecycleScope.launch{
            vm.getAccountInfos()
            binding.username.text = vm.accountInfos.username
            binding.name.text = "${vm.accountInfos.firstName} ${vm.accountInfos.lastName} "
            binding.email.text = vm.accountInfos.email
            dashboardFragment.applyAccountValues(vm.accountInfos)
        }
        binding.logoutBtn.setOnClickListener {
            finish()
        }
    }
    fun fetchAccountInfos(){
        lifecycleScope.launch{
            vm.getAccountInfos()
            binding.username.text = vm.accountInfos.username
            binding.name.text = "${vm.accountInfos.firstName} ${vm.accountInfos.lastName} "
            binding.email.text = vm.accountInfos.email
        }
    }

    private fun changeFragment(fragment: Fragment) {
        val fragmentFound = fragmentManager.findFragmentByTag("fragment")
        if(fragmentFound != fragment) {
            fragmentManager.beginTransaction()
                .replace(R.id.fragmentContainer, fragment, "fragment")
                .commit()
        }
    }
    suspend fun changeProfileInfos(account:UpdateAccountModel){
        vm.updateAccountInfos(account)
    }
    fun formatTimeMinSecFormat(timer: Float):String{
        val time = timer.toLong()
        val min = floor((TimeUnit.MILLISECONDS.toSeconds(time) / SECONDS_IN_MIN).toDouble()).toInt()
        val sec = TimeUnit.MILLISECONDS.toSeconds(time) / SECONDS_IN_MIN
        var result = "$min:$sec"
        if(sec < DOUBLE_DIGIT){
            result = "$min:0$sec"
        }
        return result
    }
}