package com.projet.clientleger.ui.accountmanagement.view

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.provider.MediaStore
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentManager
import androidx.lifecycle.lifecycleScope
import com.projet.clientleger.R
import com.projet.clientleger.data.enumData.SoundId
import com.projet.clientleger.data.model.account.UpdateAccountModel
import com.projet.clientleger.databinding.ActivityAccountManagementBinding
import com.projet.clientleger.ui.IAcceptGameInviteListener
import com.projet.clientleger.ui.accountmanagement.dashboard.view.DOUBLE_DIGIT
import com.projet.clientleger.ui.accountmanagement.dashboard.view.DashboardFragment
import com.projet.clientleger.ui.accountmanagement.dashboard.view.SECONDS_IN_MIN
import com.projet.clientleger.ui.accountmanagement.profile.ProfileFragment
import com.projet.clientleger.ui.lobby.view.LobbyActivity
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.launch
import okhttp3.MediaType
import okhttp3.MultipartBody
import java.io.File
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import kotlin.math.floor

@AndroidEntryPoint
class AccountManagementActivity : AppCompatActivity(), IAcceptGameInviteListener {
    private val fragmentManager: FragmentManager = supportFragmentManager
    lateinit var binding: ActivityAccountManagementBinding
    private val vm:AccountManagementViewModel by viewModels()

    @Inject
    lateinit var dashboardFragment: DashboardFragment

    @Inject
    lateinit var profileFragment: ProfileFragment

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
                }
            }
        }
        lifecycleScope.launch{
            vm.getAccountInfos()
            binding.avatar.setImageBitmap(vm.getAvatarBitmap())
            binding.username.text = vm.accountInfos.username
            binding.name.text = "${vm.accountInfos.firstName} ${vm.accountInfos.lastName} "
            binding.email.text = vm.accountInfos.email
            dashboardFragment.applyAccountValues(vm.accountInfos)
        }
        binding.logoutBtn.setOnClickListener {
            finish()
        }
        val resultLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            if (result.resultCode == Activity.RESULT_OK) {
                val data: Intent? = result.data
                val imageUri = data!!.data!!
                val projection: Array<String> = arrayOf(MediaStore.Images.Media.DATA)
                val cursor = contentResolver.query(imageUri, projection, null, null, null)
                cursor?.let {
                    it.moveToFirst()
                    val index = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA)
                    val filePath = it.getString(index)
                    it.close()
                    val file = File(filePath)
                    val filePart = MultipartBody.Part.createFormData("file", file.name, MultipartBody.create(MediaType.parse("image/*"), file))
                    lifecycleScope.launch{
                        vm.uploadAvatar(filePart).subscribe{ isSuccess ->
                            if (isSuccess)
                                binding.avatar.setImageBitmap(vm.getAvatarBitmap())
                            else
                                Toast.makeText(this@AccountManagementActivity, "Erreur lors de l'envoie de l'avatar, veuillez réessayer!", Toast.LENGTH_LONG).show()
                        }
                    }
                }
            }
        }
        binding.avatar.setOnClickListener {
            val photoPickerIntent = Intent(Intent.ACTION_PICK)
            photoPickerIntent.type = "image/*"
            resultLauncher.launch(photoPickerIntent)
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
    override fun acceptInvite(info: Pair<String, String>) {
        intent = Intent(this, LobbyActivity::class.java)
        intent.putExtra("lobbyId", info.second)
        intent.putExtra("isJoining", true)
        startActivity(intent)
        finish()
    }
}