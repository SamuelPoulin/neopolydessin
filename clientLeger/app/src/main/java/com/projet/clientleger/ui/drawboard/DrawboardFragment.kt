package com.projet.clientleger.ui.drawboard

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.core.os.bundleOf
import androidx.fragment.app.Fragment
import androidx.fragment.app.setFragmentResult
import androidx.fragment.app.setFragmentResultListener
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import com.google.android.material.slider.Slider
import com.projet.clientleger.R
import com.projet.clientleger.data.api.model.SequenceModel
import com.projet.clientleger.data.enumData.DrawTool
import com.projet.clientleger.data.enumData.SoundId
import com.projet.clientleger.data.model.Coordinate
import com.projet.clientleger.data.model.PathData
import com.projet.clientleger.databinding.DrawboardFragmentBinding
import com.projet.clientleger.ui.game.view.GameTutorialActivity
import com.projet.clientleger.ui.game.view.GameTutorialActivity_GeneratedInjector
import com.projet.clientleger.ui.game.view.GameTutorialActivity_MembersInjector
import com.skydoves.colorpickerview.ColorPickerDialog
import com.skydoves.colorpickerview.listeners.ColorEnvelopeListener
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject
const val DRAWBOARD_MESSAGE = "Voici la surface de dessin, elle te permet de dessiner lorsque ton rôle est celui du dessinateur"
const val CHOOSE_PEN = "Avant de dessiner, il faut choisir son outil de dessin. Cliques sur le crayon pour commencer à dessiner"
const val PEN_PREVIEW_MESSAGE = "Tu as bien choisi le crayon !" +
        "\nMaintenant, tu peux choisir la largeur de ton trait à l'aide de la barre bleue ici"
const val TRY_DRAWING = "Tu es maintenant prêt à dessiner !\n" +
        "Fais ton premier dessin ! dessines une pomme avec les outils à ta disposition," +
        "c'est-à-dire le crayon, l'efface et l'outil de couleur. Quand tu as terminé, cliques " +
        "sur le bouton terminer le tutoriel"
const val BUTTON_PANNEL_DEMO = "Voici maintenant tous les outils à ta disposition pour dessiner dans " +
        "Polydessin"
const val UNDO_BUTTON_DEMO = "Le bouton Annuler te permet d'annuler ta dernière action au besoin"
const val REDO_BUTTON_DEMO = "Le bouton Refaire sert à refaire une action que tu aurais annulé par accident"
const val TRASH_BUTTON_DEMO = "Finalement, le bouton Poubelle représente l'efface, lorsque choisi," +
        "\n il detruit tout les éléments avec lesquels tu entre en contact avec ton clic"

@AndroidEntryPoint
class DrawboardFragment @Inject constructor(): Fragment() {

    val vm: DrawboardViewModel by viewModels()
    private var binding: DrawboardFragmentBinding? = null
    private var isDrawing = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setFragmentResultListener("isDrawing"){requestKey, bundle ->
            changeToolsVisibility(bundle["boolean"] as Boolean)
        }
        setFragmentResultListener("boardwipeNeeded"){requestKey, bundle ->
            vm.boardwipe()
        }
        setSubscriptions()
    }

    private fun setSubscriptions(){
        vm.isUndoPossibleLiveData.observe(requireActivity()){
            if(!vm.isTutorialActive()){
                binding!!.undoBtn.isEnabled = it
            }
        }
        vm.isRedoPossibleLiveData.observe(requireActivity()){
            if(!vm.isTutorialActive()){
                binding!!.redoBtn.isEnabled = it
            }
        }
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View {
        binding = DrawboardFragmentBinding.inflate(inflater, container, false)
        setupViewListener()
        setupObservable()
        setupBtnClickListeners()
        binding!!.strokeWidthSlider.addOnChangeListener{ _: Slider, value: Float, fromUser: Boolean ->
            if(fromUser){
                vm.updateWidth(value)
                binding!!.toolPreview.updateWidth(value)
            }
        }
        binding!!.vm = vm
        return binding!!.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setFragmentResult("ready",  bundleOf())
    }

    override fun onDestroyView() {
        super.onDestroyView()
        binding = null
    }

    private fun changeToolsVisibility(isVisible: Boolean){
        val visibility = if(isVisible) View.VISIBLE else View.INVISIBLE
        binding!!.strokeWidthSlider.visibility = visibility
        binding!!.toolPreviewContainer.visibility = visibility
        binding!!.undoBtn.visibility = visibility
        binding!!.redoBtn.visibility = visibility
        binding!!.colorPickerBtn.visibility = visibility
        binding!!.eraserBtn.visibility = visibility
        binding!!.pencilBtn.visibility = visibility
        isDrawing = isVisible
    }

    private fun setupBtnClickListeners(){
        binding!!.colorPickerBtn.setOnClickListener {
            vm.playSound(SoundId.SELECTED.value)
            pickColor() }
        binding!!.eraserBtn.setOnClickListener {
            vm.playSound(SoundId.SELECTED.value)
            changeTool("eraser")
            binding!!.pencilBtn.setImageResource(R.drawable.ic_pencil)
            binding!!.eraserBtn.setImageResource(R.drawable.ic_delete_green)}
        binding!!.pencilBtn.setOnClickListener {
            vm.playSound(SoundId.SELECTED.value)
            changeTool("pencil")
        binding!!.eraserBtn.setImageResource(R.drawable.ic_delete)
        binding!!.pencilBtn.setImageResource(R.drawable.ic_pencil_green)}
        binding!!.undoBtn.setOnClickListener {
            vm.playSound(SoundId.SELECTED.value)
            vm.undo() }
        binding!!.redoBtn.setOnClickListener {
            vm.playSound(SoundId.SELECTED.value)
            vm.redo() }

        binding!!.undoBtn.isEnabled = false
        binding!!.redoBtn.isEnabled = false
    }

    @SuppressLint("ClickableViewAccessibility")
    private fun setupViewListener(){
        binding!!.drawingBoard.setOnTouchListener { _, event ->
            if (event != null && isDrawing) {
                when(vm.currentTool){
                    DrawTool.PEN -> handlePenViewEvent(event)
                    DrawTool.ERASER -> handleEraserViewEvent(event)
                }
            }
            true
        }
    }

    private fun setupObservable(){
        vm.paths.observe(requireActivity()){
            binding!!.drawingBoard.updatePaths(it)
        }
    }

    private fun handleEraserViewEvent(event: MotionEvent){
        when(event.action){
            MotionEvent.ACTION_DOWN -> if(vm.isTutorialActive()){
                vm.localErase(Coordinate(event.x,event.y))
            }
            else{
                vm.erase(Coordinate(event.x, event.y))
            }
        }
    }

    private fun handlePenViewEvent(event: MotionEvent) {
        println("Nous sommes dans le tutoriel? ${vm.isTutorialActive()}")
        if(vm.isTutorialActive()){
            when(event.action){
                MotionEvent.ACTION_DOWN -> {
                    vm.startLocalPath(Coordinate(event.x,event.y))
                }
                MotionEvent.ACTION_MOVE -> {
                    vm.receiveUpdateCurrentPath(Coordinate(event.x,event.y))
                }
                MotionEvent.ACTION_UP -> {
                    vm.endPath(Coordinate(event.x, event.y))
                    vm.receiveEndPath(Coordinate(event.x,event.y))
                }
            }
        }
        else{
            when(event.action){
                MotionEvent.ACTION_DOWN -> {
                    vm.startPath(Coordinate(event.x, event.y))
                }
                MotionEvent.ACTION_MOVE -> {
                    vm.updateCurrentPath(Coordinate(event.x, event.y))
                }
                MotionEvent.ACTION_UP -> {
                    vm.endPath(Coordinate(event.x, event.y))
                }
            }
        }
    }

    private fun pickColor(){
        val builder = ColorPickerDialog.Builder(requireActivity())
            builder.setTitle("Choisir sa couleur")
            .setPositiveButton("Choisir"){ dialogInterface, i ->
                vm.playSound(SoundId.CONFIRM.value)
                binding!!.toolPreview.updatePenColor(vm.confirmColor())
            }
            .setNegativeButton("Annuler"){ dialogInterface, i ->
                dialogInterface.dismiss()
            }
            .attachAlphaSlideBar(true)
        builder.colorPickerView.setColorListener(ColorEnvelopeListener { envelope, fromUser ->
            vm.bufferBrushColor = "#" + envelope.hexCode
        })
        builder.show()
        builder.setOnDismissListener{
            vm.playSound(SoundId.CLOSE_CHAT.value)
        }
    }
    private fun changeTool(tool:String){
        vm.switchCurrentTool(tool)
        updateSliderProperties()
        binding!!.toolPreview.changeTool(vm.currentTool, vm.getCurrentToolWidth())
        Toast.makeText(requireContext(), vm.currentTool.value, Toast.LENGTH_SHORT).show()
    }

    private fun updateSliderProperties(){
        binding!!.strokeWidthSlider.valueFrom = vm.getCurrentToolMinWidth()
        binding!!.strokeWidthSlider.valueTo = vm.getCurrentToolMaxWidth()
        binding!!.strokeWidthSlider.value = vm.getCurrentToolWidth()
    }
    fun getTutorialSequence():ArrayList<SequenceModel>{
        val models = ArrayList<SequenceModel>()
        models.add(SequenceModel(DRAWBOARD_MESSAGE, binding!!.drawingBoardContainer,requireActivity(),false))
        models.add(SequenceModel(BUTTON_PANNEL_DEMO,binding!!.buttonPanel,requireActivity(),false))
        models.add(SequenceModel(UNDO_BUTTON_DEMO,binding!!.undoBtn,requireActivity(),false))
        models.add(SequenceModel(REDO_BUTTON_DEMO,binding!!.redoBtn,requireActivity(),false))
        models.add(SequenceModel(TRASH_BUTTON_DEMO,binding!!.eraserBtn,requireActivity(),false))
        models.add(SequenceModel(CHOOSE_PEN, binding!!.pencilBtn, requireActivity(),true))
        models.add(SequenceModel(PEN_PREVIEW_MESSAGE, binding!!.strokeWidthSlider,requireActivity(),true))
        models.add(SequenceModel(TRY_DRAWING,binding!!.drawingBoardContainer,requireActivity(),true))
        return models
    }

}
