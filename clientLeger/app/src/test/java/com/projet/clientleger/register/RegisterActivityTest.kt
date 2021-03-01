package com.projet.clientleger.register

import android.content.Context
import android.os.Looper
import android.view.View
import com.projet.clientleger.ui.register.view.RegisterActivity
import dagger.hilt.android.testing.HiltAndroidRule
import dagger.hilt.android.testing.HiltAndroidTest
import dagger.hilt.android.testing.HiltTestApplication
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.Robolectric
import org.robolectric.annotation.LooperMode
import org.robolectric.Shadows.shadowOf
import androidx.test.core.app.ActivityScenario
import androidx.test.ext.junit.rules.ActivityScenarioRule
import androidx.test.ext.junit.rules.activityScenarioRule
import com.projet.clientleger.R
import kotlinx.android.synthetic.main.activity_register.*
import org.robolectric.shadows.ShadowToast

@Config(application = HiltTestApplication::class, sdk = [28])
@RunWith(RobolectricTestRunner::class)
@LooperMode(LooperMode.Mode.PAUSED)
@HiltAndroidTest
class RegisterActivityTest {
    @get:Rule
    var hiltRule = HiltAndroidRule(this)

    @get:Rule
    var activityScenarioRule = activityScenarioRule<RegisterActivity>()


    private lateinit var registerActivity: RegisterActivity

    @Test
    fun onCreate_vm(){
        activityScenarioRule.scenario.onActivity { activity ->
            assert(activity.binding.viewmodel != null)
            assert(activity.binding.btnSubmit.hasOnClickListeners())
        }
    }

    @Test
    fun loadingBtn_notLoading(){
        activityScenarioRule.scenario.onActivity { activity ->
            activity.loadingBtn(false)
            assert(activity.binding.loadingBar.visibility == View.GONE)
            assert(activity.binding.btnSubmit.text.isNotEmpty())
        }
    }

    @Test
    fun loadingBtn_loading(){
        activityScenarioRule.scenario.onActivity { activity ->
            activity.loadingBtn(true)
            assert(activity.binding.loadingBar.visibility == View.VISIBLE)
            assert(activity.binding.btnSubmit.text.isEmpty())
        }
    }

    @Test
    fun setUserTokens_tokensInSharedPreferences(){
        activityScenarioRule.scenario.onActivity { activity ->
            activity.setUserTokens("a", "b")
            val accessToken = activity.getSharedPreferences(activity.getString(R.string.user_creds), Context.MODE_PRIVATE).getString("accessToken", "")
            val refreshToken = activity.getSharedPreferences(activity.getString(R.string.user_creds), Context.MODE_PRIVATE).getString("refreshToken", "")
            assert(accessToken == "a" && refreshToken == "b")
        }
    }

    @Test
    fun showToast_createsToastWithRightMessage(){
        activityScenarioRule.scenario.onActivity { activity ->
            activity.showToast("testMsg")
            assert(ShadowToast.getLatestToast() != null)
            assert(ShadowToast.getTextOfLatestToast() == "testMsg")
        }
    }

    @Test
    fun setupInputsObservable_observesCorrectly(){
        activityScenarioRule.scenario.onActivity { activity ->
            activity.setupInputsObservable()
            assert(activity.vm.registerFistNameLiveData.hasObservers())
            assert(activity.vm.registerLastNameLiveData.hasObservers())
            assert(activity.vm.registerUsernameLiveData.hasObservers())
            assert(activity.vm.registerEmailLiveData.hasObservers())
            assert(activity.vm.registerPasswordLiveData.hasObservers())
            assert(activity.vm.registerPasswordConfirmLiveData.hasObservers())
        }
    }
}