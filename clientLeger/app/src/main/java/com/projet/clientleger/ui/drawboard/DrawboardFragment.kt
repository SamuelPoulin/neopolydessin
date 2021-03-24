package com.projet.clientleger.ui.drawboard

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import com.google.android.material.slider.Slider
import com.projet.clientleger.data.enum.DrawTool
import com.projet.clientleger.data.model.Coordinate
import com.projet.clientleger.databinding.DrawboardFragmentBinding
import com.skydoves.colorpickerview.ColorPickerDialog
import com.skydoves.colorpickerview.listeners.ColorEnvelopeListener
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject
import kotlin.reflect.KFunction1


@AndroidEntryPoint
class DrawboardFragment @Inject constructor(): Fragment() {

    val vm: DrawboardViewModel by viewModels()
    private var binding: DrawboardFragmentBinding? = null
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

    override fun onDestroyView() {
        super.onDestroyView()
        binding = null
    }

    private fun setupBtnClickListeners(){
        binding!!.colorPickerBtn.setOnClickListener { pickColor() }
        binding!!.eraserBtn.setOnClickListener { changeTool() }
        binding!!.undoBtn.setOnClickListener { vm.undo() }
        binding!!.redoBtn.setOnClickListener { vm.redo() }
    }

    @SuppressLint("ClickableViewAccessibility")
    private fun setupViewListener(){
        binding!!.drawingBoard.setOnTouchListener { _, event ->
            if (event != null) {
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

    private fun changeTool(){
        vm.switchCurrentTool()
        updateSliderProperties()
        binding!!.toolPreview.changeTool(vm.currentTool, vm.getCurrentToolWidth())
        Toast.makeText(requireContext(), vm.currentTool.value, Toast.LENGTH_SHORT).show()
    }

    private fun updateSliderProperties(){
        binding!!.strokeWidthSlider.valueFrom = vm.getCurrentToolMinWidth()
        binding!!.strokeWidthSlider.valueTo = vm.getCurrentToolMaxWidth()
        binding!!.strokeWidthSlider.value = vm.getCurrentToolWidth()
    }

}
