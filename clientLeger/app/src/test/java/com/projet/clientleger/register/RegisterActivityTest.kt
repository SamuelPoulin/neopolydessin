package com.projet.clientleger.register

import android.content.Context
import android.view.View
import androidx.core.content.ContextCompat
import androidx.test.ext.junit.rules.activityScenarioRule
import com.projet.clientleger.R
import com.projet.clientleger.ui.register.view.RegisterActivity
import dagger.hilt.android.testing.HiltAndroidRule
import dagger.hilt.android.testing.HiltAndroidTest
import dagger.hilt.android.testing.HiltTestApplication
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.LooperMode
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

    @Test
    fun onCreate_vm(){
        activityScenarioRule.scenario.onActivity { activity ->
            assert(activity.binding.viewmodel != null)
            assert(activity.binding.btnSubmit.hasOnClickListeners())
        }
    }

    @Test
    fun registerAccount_goodRequest(){
        activityScenarioRule.scenario.onActivity { activity ->
            activity.vm.registerUsernameLiveData.value = "a"
            activity.registerAccount()
            assert(activity.vm.registerUsernameLiveData.value!!.isEmpty())
            val accessToken = activity.getSharedPreferences(activity.getString(R.string.user_creds), Context.MODE_PRIVATE).getString("accessToken", "")
            val refreshToken = activity.getSharedPreferences(activity.getString(R.string.user_creds), Context.MODE_PRIVATE).getString("refreshToken", "")
            assertEquals("access", accessToken)
            assertEquals("refresh", refreshToken)
        }
    }

    @Test
    fun registerAccount_badRequest(){
        activityScenarioRule.scenario.onActivity { activity ->
            activity.vm.registerUsernameLiveData.value = "invalid"
            activity.vm.registerPasswordLiveData.value = "pass"
            activity.vm.registerPasswordConfirmLiveData.value = "word"
            activity.registerAccount()
            assert(activity.vm.registerPasswordLiveData.value!!.isEmpty())
            assert(activity.vm.registerPasswordConfirmLiveData.value!!.isEmpty())
            assert(activity.vm.registerUsernameLiveData.value!!.isNotEmpty())
            assert(ShadowToast.getLatestToast() != null)
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

    @Test
    fun passwordMinLengthCheck_notMinLength(){
        activityScenarioRule.scenario.onActivity { activity ->
            activity.binding.passwordMinLengthError.setTextColor(R.color.register_valid)
            activity.passwordMinLengthCheck()
            assert(activity.binding.passwordMinLengthError.currentTextColor == ContextCompat.getColor(activity, R.color.register_error))
        }
    }

    @Test
    fun passwordMinLengthCheck_isMinLength(){
        activityScenarioRule.scenario.onActivity { activity ->
            activity.binding.passwordMinLengthError.setTextColor(R.color.register_error)
            activity.vm.registerPasswordLiveData.value = "aaaaaaaa"
            activity.passwordMinLengthCheck()
            assert(activity.binding.passwordMinLengthError.currentTextColor == ContextCompat.getColor(activity, R.color.register_valid))
        }
    }

    @Test
    fun isDifferentPasswordsCheck_isDiff(){
        activityScenarioRule.scenario.onActivity { activity ->
            activity.binding.passwordMinLengthError.setTextColor(R.color.register_valid)
            activity.vm.registerPasswordLiveData.value = "aaaaaaaa"
            activity.vm.registerPasswordConfirmLiveData.value = "a"
            activity.isDifferentPasswordsCheck()
            assert(activity.binding.differentPasswordError.currentTextColor == ContextCompat.getColor(activity, R.color.register_error))
        }
    }

    @Test
    fun isDifferentPasswordsCheck_isSame(){
        activityScenarioRule.scenario.onActivity { activity ->
            activity.binding.passwordMinLengthError.setTextColor(R.color.register_error)
            activity.vm.registerPasswordLiveData.value = "aaaaaaaa"
            activity.vm.registerPasswordConfirmLiveData.value = "aaaaaaaa"
            activity.isDifferentPasswordsCheck()
            assert(activity.binding.differentPasswordError.currentTextColor == ContextCompat.getColor(activity, R.color.register_valid))
        }
    }

    @Test
    fun passwordNoDigitCheck_noDigit(){
        activityScenarioRule.scenario.onActivity { activity ->
            activity.binding.passwordMinLengthError.setTextColor(R.color.register_valid)
            activity.vm.registerPasswordLiveData.value = "aaaaaaaa"
            activity.passwordNoDigitCheck()
            assert(activity.binding.passwordNoDigitError.currentTextColor == ContextCompat.getColor(activity, R.color.register_error))
        }
    }

    @Test
    fun passwordNoDigitCheck_containsDigit(){
        activityScenarioRule.scenario.onActivity { activity ->
            activity.binding.passwordMinLengthError.setTextColor(R.color.register_error)
            activity.vm.registerPasswordLiveData.value = "aaaaaaa1"
            activity.passwordNoDigitCheck()
            assert(activity.binding.passwordNoDigitError.currentTextColor == ContextCompat.getColor(activity, R.color.register_valid))
        }
    }

    @Test
    fun setTextColorError_changesColorCorrectly(){
        activityScenarioRule.scenario.onActivity { activity ->
            activity.binding.passwordMinLengthError.setTextColor(R.color.register_valid)
            activity.setTextColorError(activity.binding.passwordMinLengthError)
            assert(activity.binding.passwordMinLengthError.currentTextColor == ContextCompat.getColor(activity, R.color.register_error))
        }
    }

    @Test
    fun setTextColorValid_changesColorCorrectly(){
        activityScenarioRule.scenario.onActivity { activity ->
            activity.binding.passwordMinLengthError.setTextColor(R.color.register_error)
            activity.setTextColorValid(activity.binding.passwordMinLengthError)
            assert(activity.binding.passwordMinLengthError.currentTextColor == ContextCompat.getColor(activity, R.color.register_valid))
        }
    }

    @Test
    fun setTextIconError_changesIconCorrectly(){
        activityScenarioRule.scenario.onActivity { activity ->
            activity.binding.passwordMinLengthError.setCompoundDrawables(null, null, null, null)
            activity.setTextIconError(activity.binding.passwordMinLengthError)
            assertEquals(activity.binding.passwordMinLengthError.compoundDrawables[0].constantState, activity.resources.getDrawable(R.drawable.ic_baseline_close_24).constantState)
        }
    }

    @Test
    fun setTextIconValid_changesIconCorrectly(){
        activityScenarioRule.scenario.onActivity { activity ->
            activity.binding.passwordMinLengthError.setCompoundDrawables(null, null, null, null)
            activity.setTextIconValid(activity.binding.passwordMinLengthError)
            assertEquals(activity.binding.passwordMinLengthError.compoundDrawables[0].constantState, activity.resources.getDrawable(R.drawable.ic_baseline_done_24).constantState)
        }
    }

    @Test
    fun test(){
        assert(false)
    }
}