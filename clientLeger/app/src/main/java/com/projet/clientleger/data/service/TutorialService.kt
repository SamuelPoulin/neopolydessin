package com.projet.clientleger.data.service

import android.app.Activity
import android.graphics.Color
import android.graphics.Rect
import android.graphics.Typeface
import android.view.View
import com.codertainment.materialintro.shape.Focus
import com.codertainment.materialintro.shape.FocusGravity
import com.codertainment.materialintro.shape.Shape
import com.codertainment.materialintro.shape.ShapeType
import com.projet.clientleger.R
import javax.inject.Inject
import javax.inject.Singleton
import com.codertainment.materialintro.view.MaterialIntroView
import com.codertainment.materialintro.utils.materialIntro
import com.projet.clientleger.data.api.model.SequenceModel
import uk.co.deanwild.materialshowcaseview.MaterialShowcaseSequence
import uk.co.deanwild.materialshowcaseview.MaterialShowcaseView
import uk.co.deanwild.materialshowcaseview.ShowcaseConfig
import uk.co.deanwild.materialshowcaseview.shape.RectangleShape

@Singleton
class TutorialService @Inject constructor() {
    private var isTutorialActive:Boolean = false

    fun userGuide(model:SequenceModel){
            MaterialShowcaseView.Builder(model.activity)
                    .renderOverNavigationBar()
                    .setShape(RectangleShape(Rect()))
                    .setSkipText("quitter le tutoriel?")
                    .setTarget(model.target)
                    .setDismissOnTargetTouch(true)
                    .setTargetTouchable(true)
                    .setContentText(model.message)
                    .setDelay(300)
                    .show()
        isTutorialActive = true
        }
    fun isTutorialActive():Boolean{
        return isTutorialActive
    }
    fun createShowcaseSequence(models:ArrayList<SequenceModel>){
        val sequence = MaterialShowcaseSequence(models[0].activity)
        val config = ShowcaseConfig()
        sequence.setConfig(config)
        for(i in 0 until models.size){
            if(i<models.size - 1){
                sequence.addSequenceItem(addShowcase(models[i]))
            }
            else{
                sequence.addSequenceItem(addLastShowcaseInSequence(models[i]))
            }
        }
        sequence.start()
    }
    private fun addLastShowcaseInSequence(model:SequenceModel):MaterialShowcaseView{
        return MaterialShowcaseView.Builder(model.activity)
            .renderOverNavigationBar()
            .setShape(RectangleShape(Rect()))
            .setSkipText("Quitter le tutoriel")
            .setTarget(model.target)
            .setDismissOnTargetTouch(true)
            .setTargetTouchable(true)
            .setContentText(model.message)
            .setDelay(300)
            .build()

    }
    private fun addShowcase(model:SequenceModel):MaterialShowcaseView{
        return MaterialShowcaseView.Builder(model.activity)
            .renderOverNavigationBar()
            .setShape(RectangleShape(Rect()))
            .setDismissText("J'ai Compris !")
            .setDismissTextColor(Color.GREEN)
            .setSkipText("Quitter le tutoriel")
            .setTarget(model.target)
            .setContentText(model.message)
            .setDelay(300)
            .build()
    }
}