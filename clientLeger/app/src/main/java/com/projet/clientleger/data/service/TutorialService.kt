package com.projet.clientleger.data.service

import android.app.Activity
import android.graphics.Color
import android.graphics.Rect
import android.graphics.Typeface
import android.view.View
import com.projet.clientleger.R
import javax.inject.Inject
import javax.inject.Singleton
import com.projet.clientleger.data.api.model.SequenceModel
import uk.co.deanwild.materialshowcaseview.IShowcaseListener
import uk.co.deanwild.materialshowcaseview.MaterialShowcaseSequence
import uk.co.deanwild.materialshowcaseview.MaterialShowcaseView
import uk.co.deanwild.materialshowcaseview.ShowcaseConfig
import uk.co.deanwild.materialshowcaseview.shape.RectangleShape
const val QUIT_TUTORIAL_LABEL = "Terminer le tutoriel"
const val NEXT_LABEL = "Suivant"
const val BASE_DELAY = 300
@Singleton
class TutorialService @Inject constructor() {
    private var isTutorialActive:Boolean = false

    fun isTutorialActive():Boolean{
        return isTutorialActive
    }
    fun finishTutorial(){
        isTutorialActive = false
    }
    fun createGameShowcaseSequence(models:ArrayList<SequenceModel>){
        val sequence = MaterialShowcaseSequence(models[0].activity)
        val config = ShowcaseConfig()
        sequence.setConfig(config)
        for(i in 0 until models.size){
            if(i<models.size - 1 && models[i].isInteractive){
                sequence.addSequenceItem(addInteractiveShowcaseInSequence(models[i]))
            }
            else if(i == models.size - 1){
                sequence.addSequenceItem(addLastGameShowcase(models[i]))
            }
            else{
                sequence.addSequenceItem(addGameShowcase(models[i]))
            }
        }
        sequence.start()
        isTutorialActive = true
    }
    fun createMenuShowcaseSequence(models:ArrayList<SequenceModel>){
        isTutorialActive = true
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
            .setSkipText(QUIT_TUTORIAL_LABEL)
                .setListener(object:IShowcaseListener{
                    override fun onShowcaseDisplayed(showcaseView: MaterialShowcaseView?) {
                        isTutorialActive = true
                    }

                    override fun onShowcaseDismissed(showcaseView: MaterialShowcaseView?) {
                        isTutorialActive = false
                    }

                })
            .setTarget(model.target)
            .setDismissOnTargetTouch(true)
            .setTargetTouchable(true)
            .setContentText(model.message)
            .setDelay(BASE_DELAY)
            .build()
    }
    private fun addLastGameShowcase(model:SequenceModel):MaterialShowcaseView{
        return MaterialShowcaseView.Builder(model.activity)
                .renderOverNavigationBar()
                .setShape(RectangleShape(Rect()))
                .setSkipText(QUIT_TUTORIAL_LABEL)
                .setTarget(model.target)
                .setListener(object:IShowcaseListener{
                    override fun onShowcaseDisplayed(showcaseView: MaterialShowcaseView?) {
                        isTutorialActive = true
                    }

                    override fun onShowcaseDismissed(showcaseView: MaterialShowcaseView?) {
                        isTutorialActive = true
                    }

                })
                .setDismissOnTargetTouch(true)
                .setTargetTouchable(true)
                .setContentText(model.message)
                .setDelay(BASE_DELAY)
                .build()
    }
    private fun addInteractiveShowcaseInSequence(model:SequenceModel):MaterialShowcaseView{
        return MaterialShowcaseView.Builder(model.activity)
                .renderOverNavigationBar()
                .setShape(RectangleShape(Rect()))
                .setSkipText(QUIT_TUTORIAL_LABEL)
                .setListener(object:IShowcaseListener{
                    override fun onShowcaseDisplayed(showcaseView: MaterialShowcaseView?) {
                        isTutorialActive = true
                    }

                    override fun onShowcaseDismissed(showcaseView: MaterialShowcaseView?) {
                        isTutorialActive = true

                    }

                })
                .setTarget(model.target)
                .setDismissOnTargetTouch(true)
                .setTargetTouchable(true)
                .setContentText(model.message)
                .setDelay(BASE_DELAY)
                .build()
    }
    private fun addShowcase(model:SequenceModel):MaterialShowcaseView{
        return MaterialShowcaseView.Builder(model.activity)
            .renderOverNavigationBar()
            .setShape(RectangleShape(Rect()))
            .setDismissText(NEXT_LABEL)
            .setDismissTextColor(Color.GREEN)
            .setSkipText(QUIT_TUTORIAL_LABEL)
                .setListener(object:IShowcaseListener{
                    override fun onShowcaseDisplayed(showcaseView: MaterialShowcaseView?) {
                        isTutorialActive = true
                    }

                    override fun onShowcaseDismissed(showcaseView: MaterialShowcaseView?) {
                        isTutorialActive = false
                    }

                })
            .setTarget(model.target)
            .setContentText(model.message)
            .setDelay(BASE_DELAY)
            .build()
    }
    private fun addGameShowcase(model:SequenceModel):MaterialShowcaseView{
        return MaterialShowcaseView.Builder(model.activity)
                .renderOverNavigationBar()
                .setShape(RectangleShape(Rect()))
                .setDismissText(NEXT_LABEL)
                .setDismissTextColor(Color.GREEN)
                .setSkipText(QUIT_TUTORIAL_LABEL)
                .setListener(object:IShowcaseListener{
                    override fun onShowcaseDisplayed(showcaseView: MaterialShowcaseView?) {
                        isTutorialActive = true
                    }

                    override fun onShowcaseDismissed(showcaseView: MaterialShowcaseView?) {
                        isTutorialActive = true
                    }

                })
                .setTarget(model.target)
                .setContentText(model.message)
                .setDelay(BASE_DELAY)
                .build()
    }
}