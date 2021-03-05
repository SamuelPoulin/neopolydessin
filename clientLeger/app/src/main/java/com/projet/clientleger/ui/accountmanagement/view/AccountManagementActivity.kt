package com.projet.clientleger.ui.accountmanagement.view

import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity
import androidx.databinding.DataBindingUtil.setContentView
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentManager
import com.projet.clientleger.R
import com.projet.clientleger.databinding.ActivityAccountManagementBinding
import com.projet.clientleger.ui.accountmanagement.dashboard.view.DashboardFragment
import com.projet.clientleger.ui.accountmanagement.profile.ProfileFragment
import com.projet.clientleger.ui.accountmanagement.settings.SettingsFragment
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class AccountManagementActivity : AppCompatActivity() {
    private val fragmentManager: FragmentManager = supportFragmentManager
    lateinit var binding: ActivityAccountManagementBinding

    @Inject
    lateinit var dashboardFragment: DashboardFragment

    @Inject
    lateinit var profileFragment: ProfileFragment

    @Inject
    lateinit var settingsFragment: SettingsFragment

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // binding setup
        binding = ActivityAccountManagementBinding.inflate(layoutInflater)
        setContentView(binding.root)
        binding.lifecycleOwner = this

        fragmentManager.beginTransaction().add(R.id.fragmentContainer, dashboardFragment, "fragment").commit()
        binding.toggleGroup.addOnButtonCheckedListener { toggleButton, checkedId, isChecked ->
            if (isChecked) {
                when (checkedId) {
                    R.id.dashboardBtn -> changeFragment(dashboardFragment)
                    R.id.userProfileBtn -> changeFragment(profileFragment)
                    R.id.accountSettings -> changeFragment(settingsFragment)
                }
            }
        }
    }

    fun changeFragment(fragment: Fragment) {
        val fragmentFound = fragmentManager.findFragmentByTag("fragment")
        if(fragmentFound != fragment) {
            fragmentManager.beginTransaction()
                .replace(R.id.fragmentContainer, fragment, "fragment")
                .commit()
        }
    }

}