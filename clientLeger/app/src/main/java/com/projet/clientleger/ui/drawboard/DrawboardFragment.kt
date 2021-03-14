package com.projet.clientleger.ui.drawboard

import android.annotation.SuppressLint
import androidx.lifecycle.ViewModelProvider
import android.os.Bundle
import androidx.fragment.app.Fragment
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.fragment.app.viewModels
import com.projet.clientleger.R
import com.projet.clientleger.data.model.Coordinate
import com.projet.clientleger.databinding.DrawboardFragmentBinding
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class DrawboardFragment @Inject constructor(): Fragment() {
    val vm: DrawboardViewModel by viewModels()
    private var binding: DrawboardFragmentBinding? = null;

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View {
        binding = DrawboardFragmentBinding.inflate(inflater, container, false)
        setupViewListener()
        setupObservable()
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
                        vm.startPath(Coordinate(event.x, event.y), ContextCompat.getColor(requireContext(),R.color.black))
                        v.invalidate()
                    }
                    MotionEvent.ACTION_MOVE -> {
                        vm.updateCurrentPath(Coordinate(event.x, event.y))
                        v.invalidate()
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
}