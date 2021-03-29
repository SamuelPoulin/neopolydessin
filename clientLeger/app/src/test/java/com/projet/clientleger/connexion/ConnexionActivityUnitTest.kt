package com.projet.clientleger.connexion

import android.content.Intent
import androidx.test.ext.junit.rules.activityScenarioRule
import com.projet.clientleger.ui.connexion.view.ConnexionActivity
import com.projet.clientleger.ui.mainmenu.view.MainmenuActivity
import com.projet.clientleger.ui.register.view.RegisterActivity
import dagger.hilt.android.testing.HiltAndroidRule
import dagger.hilt.android.testing.HiltAndroidTest
import dagger.hilt.android.testing.HiltTestApplication
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.junit.Assert
import org.robolectric.RobolectricTestRunner
import org.robolectric.Shadows
import org.robolectric.annotation.Config
import org.robolectric.annotation.LooperMode
import org.robolectric.shadows.ShadowToast

@Config(application = HiltTestApplication::class, sdk = [28])
@RunWith(RobolectricTestRunner::class)
//@LooperMode(LooperMode.Mode.PAUSED)
@HiltAndroidTest
class ConnexionActivityUnitTest {
    @get:Rule
    var hiltRule = HiltAndroidRule(this)

    @get:Rule
    var activityScenarioRule = activityScenarioRule<ConnexionActivity>()

    @Test
    fun onCreate_ButtonsListener(){
        activityScenarioRule.scenario.onActivity {
            assert(it.binding.connectBtn.hasOnClickListeners())
            assert(it.binding.forgottenPasswordBtn.hasOnClickListeners())
            assert(it.binding.createAccountBtn.hasOnClickListeners())
        }
    }

    @Test
    fun connectBtn_validRequest(){
        activityScenarioRule.scenario.onActivity {
            val expectedIntent = Intent(it, MainmenuActivity::class.java).apply { putExtra("username", "http_ok") }
            Shadows.shadowOf(it).nextStartedActivity
            it.binding.connectionUsername.setText("http_ok")
            it.binding.connectBtn.callOnClick()
            val intentToTest = Shadows.shadowOf(it).nextStartedActivity
            Assert.assertEquals(intentToTest.component, expectedIntent.component)
            Assert.assertEquals(intentToTest.hasExtra("username"), expectedIntent.hasExtra("username"))
        }
    }

    @Test
    fun connectBtn_invalidRequest(){
        activityScenarioRule.scenario.onActivity {
            it.binding.connectionUsername.setText("invalid")
            it.binding.connectBtn.callOnClick()
            assert(ShadowToast.getLatestToast() != null)
        }
    }

    @Test
    fun createAccountBtn(){
        activityScenarioRule.scenario.onActivity {
            val expectedIntent = Intent(it, RegisterActivity::class.java)
            it.binding.createAccountBtn.callOnClick()
            val intentToTest = Shadows.shadowOf(it).nextStartedActivity
            Assert.assertEquals(expectedIntent.component, intentToTest.component)
        }
    }
}