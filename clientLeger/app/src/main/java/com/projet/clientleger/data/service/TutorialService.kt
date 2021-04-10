package com.projet.clientleger.data.service

import android.graphics.Color
import android.graphics.Typeface
import android.view.View
import com.codertainment.materialintro.shape.Focus
import com.codertainment.materialintro.shape.FocusGravity
import com.codertainment.materialintro.shape.ShapeType
import com.projet.clientleger.R
import javax.inject.Inject
import javax.inject.Singleton
import com.codertainment.materialintro.view.MaterialIntroView
import com.codertainment.materialintro.utils.materialIntro

@Singleton
class TutorialService @Inject constructor() {
    //var isTutorialActive:Boolean = false

    /*fun userGuide(message:String, target: View){
        materialIntro(show = true) {
            isFadeInAnimationEnabled = true
            isFadeOutAnimationEnabled = true
            fadeAnimationDurationMillis = 300
            focusType = Focus.ALL
            focusGravity = FocusGravity.CENTER
            dismissOnTouch = false
            isInfoEnabled = true
            infoText = message
            infoTextColor = Color.BLACK
            infoTextSize = 18f
            infoTextAlignment = View.TEXT_ALIGNMENT_CENTER
            infoTextTypeface = Typeface.DEFAULT_BOLD
            infoCardBackgroundColor = Color.WHITE
            isHelpIconEnabled = true
            helpIconResource = R.drawable.ic_pencil
            helpIconColor = Color.BLUE
            isDotViewEnabled = false
            //viewId = "unique_id" // or automatically picked from view's tag
            targetView = target
            isPerformClick = true
            showOnlyOnce = false
            shapeType = ShapeType.RECTANGLE
            dismissOnTouch = true
        }
        isTutorialActive = true
    }*/
}