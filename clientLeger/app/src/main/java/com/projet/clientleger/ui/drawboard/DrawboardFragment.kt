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
import com.google.android.material.slider.Slider
import com.projet.clientleger.R
import com.projet.clientleger.data.api.model.SequenceModel
import com.projet.clientleger.data.enumData.DrawTool
import com.projet.clientleger.data.model.Coordinate
import com.projet.clientleger.databinding.DrawboardFragmentBinding
import com.skydoves.colorpickerview.ColorPickerDialog
import com.skydoves.colorpickerview.listeners.ColorEnvelopeListener
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject
const val DRAWBOARD_MESSAGE = "Voici la surface de dessin, Elle te permet de dessiner lorsque ton rôle est celui du dessinateur"
const val CHOOSE_PEN = "Avant de dessiner, il faut choisir son outil de dessin. Cliques sur le crayon pour commencer à dessiner"
const val PEN_PREVIEW_MESSAGE = "Tu as bien choisi le crayon !" +
        "\nMaintenant, tu peux choisir la largeur de ton trait à l'aide de la barre bleue ici"
const val TRY_DRAWING = "Tu es maintenant prêt à dessiner !\n" +
        "Fais ton premier trait pour progresser"
const val BUTTON_PANNEL_DEMO = "Maintenant que tu comprends la base de dessiner, nous porterons notre" +
        "\nattention sur les différents buttons utiles au dessin"
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
            binding!!.undoBtn.isEnabled = it
        }
        vm.isRedoPossibleLiveData.observe(requireActivity()){
            binding!!.redoBtn.isEnabled = it
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
        println("BINDING ONVIEWCREATED $binding")
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
        binding!!.colorPickerBtn.setOnClickListener { pickColor() }
        binding!!.eraserBtn.setOnClickListener {
            changeTool("eraser")
            binding!!.pencilBtn.setImageResource(R.drawable.ic_pencil)
            binding!!.eraserBtn.setImageResource(R.drawable.ic_delete_green)}
        binding!!.pencilBtn.setOnClickListener { changeTool("pencil")
        binding!!.eraserBtn.setImageResource(R.drawable.ic_delete)
        binding!!.pencilBtn.setImageResource(R.drawable.ic_pencil_green)}
        binding!!.undoBtn.setOnClickListener { vm.undo() }
        binding!!.redoBtn.setOnClickListener { vm.redo() }

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
            MotionEvent.ACTION_DOWN -> vm.erase(Coordinate(event.x, event.y))
        }
    }

    private fun handlePenViewEvent(event: MotionEvent) {
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

    private fun pickColor(){
        val builder = ColorPickerDialog.Builder(requireActivity())
            builder.setTitle("Choisir sa couleur")
            .setPositiveButton("Choisir"){ dialogInterface, i ->
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
        println("BINDING CRÉÉ ICI $binding")
        val models = ArrayList<SequenceModel>()
        models.add(SequenceModel(DRAWBOARD_MESSAGE, binding!!.drawingBoardContainer,requireActivity()))
        models.add(SequenceModel(CHOOSE_PEN, binding!!.pencilBtn, requireActivity()))
        models.add(SequenceModel(PEN_PREVIEW_MESSAGE, binding!!.strokeWidthSlider,requireActivity()))
        models.add(SequenceModel(TRY_DRAWING,binding!!.drawingBoardContainer,requireActivity()))
        models.add(SequenceModel(BUTTON_PANNEL_DEMO,binding!!.buttonPanel,requireActivity()))
        models.add(SequenceModel(UNDO_BUTTON_DEMO,binding!!.undoBtn,requireActivity()))
        models.add(SequenceModel(REDO_BUTTON_DEMO,binding!!.redoBtn,requireActivity()))
        models.add(SequenceModel(TRASH_BUTTON_DEMO,binding!!.eraserBtn,requireActivity()))
        return models
    }

}
