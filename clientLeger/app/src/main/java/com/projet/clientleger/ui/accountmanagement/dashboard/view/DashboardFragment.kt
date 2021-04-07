package com.projet.clientleger.ui.accountmanagement.dashboard.view

import android.graphics.Color
import android.graphics.ColorSpace
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import com.github.mikephil.charting.charts.BarChart
import com.github.mikephil.charting.components.XAxis
import com.github.mikephil.charting.data.BarData
import com.github.mikephil.charting.data.BarDataSet
import com.github.mikephil.charting.data.BarEntry
import com.github.mikephil.charting.formatter.IndexAxisValueFormatter
import com.github.mikephil.charting.interfaces.datasets.IBarDataSet
import com.github.mikephil.charting.utils.ColorTemplate
import com.projet.clientleger.R
import com.projet.clientleger.databinding.DashboardFragmentBinding
import com.projet.clientleger.databinding.FragmentChatBinding
import com.projet.clientleger.ui.accountmanagement.view.AccountManagementActivity
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject


@AndroidEntryPoint
class DashboardFragment @Inject constructor(): Fragment() {
    val vm: DashboardViewModel by viewModels()
    private var binding: DashboardFragmentBinding? = null

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        binding = DashboardFragmentBinding.inflate(inflater, container, false)
        return inflater.inflate(R.layout.dashboard_fragment, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        setBarChart()
        super.onViewCreated(view, savedInstanceState)
    }
    private fun setBarChart(){
        val barChart:BarChart = requireView().findViewById(R.id.historyBarChart)

        val entries = ArrayList<BarEntry>()

        entries.add(BarEntry(0f, floatArrayOf(0f,5f)))
        entries.add(BarEntry(1f,floatArrayOf(1f,4f)))
        entries.add(BarEntry(2f,floatArrayOf(2f,3f)))
        entries.add(BarEntry(3f,floatArrayOf(3f,2f)))
        entries.add(BarEntry(4f,floatArrayOf(4f,1f)))
        entries.add(BarEntry(5f,floatArrayOf(5f,0f)))
        entries.add(BarEntry(5f,floatArrayOf(5f,0f)))

        val barDataSet = BarDataSet(entries,"Dates")
        val greenColor = ContextCompat.getColor(requireActivity().applicationContext,R.color.dark_green)
        val redColor = ContextCompat.getColor(requireActivity().applicationContext,R.color.light_red )
        barDataSet.setColors(greenColor,redColor)
        val labels = ArrayList<String>()
        labels.add("1 mars")
        labels.add("2 mars")
        labels.add("3 mars")
        labels.add("4 mars")
        labels.add("5 mars")
        labels.add("6 mars")
        labels.add("7 mars")

        barChart.xAxis.valueFormatter = IndexAxisValueFormatter(labels)
        barChart.xAxis.position = XAxis.XAxisPosition.BOTTOM
        barChart.description.isEnabled = false
        barChart.legend.isEnabled = false
        barChart.axisRight.setDrawLabels(false)
        barChart.axisRight.setDrawGridLines(false)
        barChart.axisLeft.setStartAtZero(true)

        val data = BarData(barDataSet)
        barChart.data = data // set the data and list of lables into chart
        barChart.data.setValueTextColor(Color.WHITE)
        barChart.setDrawValueAboveBar(false)
        barChart.animateY(5000)
        barChart.invalidate()
    }

}