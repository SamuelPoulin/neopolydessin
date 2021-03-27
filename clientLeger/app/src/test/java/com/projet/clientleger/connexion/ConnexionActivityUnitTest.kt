package com.projet.clientleger.connexion

import androidx.test.ext.junit.rules.activityScenarioRule
import com.projet.clientleger.ui.connexion.view.ConnexionActivity
import com.projet.clientleger.ui.register.view.RegisterActivity
import dagger.hilt.android.testing.HiltAndroidRule
import dagger.hilt.android.testing.HiltAndroidTest
import dagger.hilt.android.testing.HiltTestApplication
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import org.robolectric.annotation.LooperMode

@Config(application = HiltTestApplication::class, sdk = [28])
@RunWith(RobolectricTestRunner::class)
@LooperMode(LooperMode.Mode.PAUSED)
@HiltAndroidTest
class ConnexionActivityUnitTest {
    @get:Rule
    var hiltRule = HiltAndroidRule(this)

    @get:Rule
    var activityScenarioRule = activityScenarioRule<ConnexionActivity>()

    @Test
    fun onCreate_ButtonsListener
}