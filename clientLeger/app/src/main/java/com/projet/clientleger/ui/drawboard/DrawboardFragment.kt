package com.projet.clientleger.ui.drawboard

import android.annotation.SuppressLint
import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.viewModels
import com.projet.clientleger.data.enum.Difficulty
import com.projet.clientleger.data.enum.GameType
import com.projet.clientleger.data.model.Coordinate
import com.projet.clientleger.databinding.DrawboardFragmentBinding
import com.skydoves.colorpickerview.ColorPickerDialog
import com.skydoves.colorpickerview.listeners.ColorEnvelopeListener
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class DrawboardFragment @Inject constructor(): Fragment() {
    val vm: DrawboardViewModel by viewModels()
    private var binding: DrawboardFragmentBinding? = null

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View {
        binding = DrawboardFragmentBinding.inflate(inflater, container, false)
        setupViewListener()
        setupObservable()
        binding!!.colorPickerBtn.setOnClickListener { pickColor() }
        binding!!.vm = vm
        vm.paths.observe(requireActivity()){
            binding!!.drawingBoard.invalidate()
        }
        return binding!!.root
    }

    override fun onDestroyView() {
        super.onDestroyView()
        binding = null
    }

    @SuppressLint("ClickableViewAccessibility")
    private fun setupViewListener(){
        binding!!.drawingBoard.setOnTouchListener { v, event ->
            if (event != null) {
                when(event.action){
                    MotionEvent.ACTION_DOWN -> {
                        val strokeWidth = binding!!.strokeWidthSlider.value
                        vm.startPath(Coordinate(event.x, event.y), strokeWidth)
                    }
                    MotionEvent.ACTION_MOVE -> {
                        vm.updateCurrentPath(Coordinate(event.x, event.y))
                    }
                    MotionEvent.ACTION_UP -> {
                        vm.endPath(Coordinate(event.x, event.y))
                    }
                }
            }
            true }
    }

    private fun setupObservable(){
        vm.paths.observe(requireActivity()){
            binding!!.drawingBoard.paths = it
        }
    }

    private fun pickColor(){
        val builder = ColorPickerDialog.Builder(requireActivity())
            builder.setTitle("Choisir sa couleur")
            .setPositiveButton("Choisir"){ dialogInterface, i ->
                vm.confirmColor()
            }
            .attachAlphaSlideBar(true)
        builder.colorPickerView.setColorListener(ColorEnvelopeListener{envelope, fromUser ->
            vm.bufferBrushColor = "#" + envelope.hexCode
        })
        builder.show()
    }
}