package com.projet.clientleger.ui.accountmanagement.dashboard.view

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Color
import android.os.Bundle
import android.view.*
import androidx.appcompat.app.AlertDialog
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.recyclerview.widget.LinearLayoutManager
import com.github.mikephil.charting.charts.BarChart
import com.github.mikephil.charting.components.XAxis
import com.github.mikephil.charting.data.BarData
import com.github.mikephil.charting.data.BarDataSet
import com.github.mikephil.charting.data.BarEntry
import com.github.mikephil.charting.formatter.IndexAxisValueFormatter
import com.projet.clientleger.R
import com.projet.clientleger.data.api.model.account.AccountDashboard
import com.projet.clientleger.databinding.DashboardFragmentBinding
import com.projet.clientleger.ui.accountmanagement.dashboard.ConnectionAdapter
import com.projet.clientleger.ui.accountmanagement.dashboard.GameHistoryAdapter
import com.projet.clientleger.ui.accountmanagement.view.AccountManagementActivity
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.android.synthetic.main.dashboard_fragment.*
import kotlinx.android.synthetic.main.dialog_account_history.*
import java.util.*
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import kotlin.collections.ArrayList
import kotlin.math.floor


const val DOUBLE_DIGIT = 10
const val FORMATTED_DATE_START = 4
const val FORMATTED_DATE_END = 10
const val SECONDS_IN_MIN = 60
const val DAYS_IN_WEEK = 7
const val LAST_DAY_IN_WEEK = -1
const val FIRST_DAY_IN_WEEK = 6

@AndroidEntryPoint
class DashboardFragment @Inject constructor(): Fragment() {
    val vm: DashboardViewModel by viewModels()
    private var binding: DashboardFragmentBinding? = null
    lateinit var accountDashboard:AccountDashboard
    private var isAccountDefined:Boolean = false
    lateinit var activity: AccountManagementActivity

    override fun onCreateView(
            inflater: LayoutInflater, container: ViewGroup?,
            savedInstanceState: Bundle?
    ): View? {
        binding = DashboardFragmentBinding.inflate(inflater, container, false)
        return binding!!.root
    }

    override fun onAttach(context: Context) {
        super.onAttach(context)
        activity = context as AccountManagementActivity
        if(isAccountDefined){
            setupEntries()
        }
    }

    override fun onStart() {
        if(isAccountDefined){
            applyAccountValues(accountDashboard)
        }
        super.onStart()
    }
    private fun setBarChart(){
        val barChart:BarChart = requireView().findViewById(R.id.historyBarChart)
        val entries = setupEntries()
        val barDataSet = BarDataSet(entries, "Dates")
        val greenColor = ContextCompat.getColor(requireActivity().applicationContext, R.color.dark_green)
        val redColor = ContextCompat.getColor(requireActivity().applicationContext, R.color.light_red)
        val yellowColor = ContextCompat.getColor(requireActivity().applicationContext, R.color.mustard_yellow)
        barDataSet.setColors(greenColor, yellowColor, redColor)
        val labels = ArrayList<String>()
        for(i in FIRST_DAY_IN_WEEK downTo LAST_DAY_IN_WEEK){
            labels.add(formatDate(getDaysAgo(i).toString()))
        }
        val data = BarData(barDataSet)
        customizeChart(data, barChart, labels)
    }
    private fun customizeChart(data: BarData, barChart: BarChart, labels: ArrayList<String>){
        barChart.xAxis.valueFormatter = IndexAxisValueFormatter(labels)
        barChart.xAxis.position = XAxis.XAxisPosition.BOTTOM
        barChart.description.isEnabled = false
        barChart.legend.isEnabled = false
        barChart.axisRight.setDrawLabels(false)
        barChart.axisRight.setDrawGridLines(false)
        barChart.axisLeft.setStartAtZero(true)
        barChart.data = data // set the data and list of lables into chart
        barChart.data.setValueTextColor(Color.WHITE)
        barChart.setDrawValueAboveBar(false)
        barChart.animateY(3000)
        barChart.invalidate()
    }
    private fun setupEntries():ArrayList<BarEntry>{
        val entries = ArrayList<BarEntry>()
        val games = accountDashboard.gameHistory.games
        var winCpt = 0
        var neutralCpt = 0
        var loseCpt = 0
        for(j in 0 until DAYS_IN_WEEK){
            for(i in 0 until games.size){
                if(areDatesOnSameDay(Date(games[i].startDate), getDaysAgo(j))){
                    when(games[i].gameResult){
                        "Win" -> winCpt++
                        "Neutral" -> neutralCpt++
                        "Lose" -> loseCpt++
                    }
                }
            }
            entries.add(BarEntry((FIRST_DAY_IN_WEEK - j).toFloat(), floatArrayOf(winCpt.toFloat(), neutralCpt.toFloat(), loseCpt.toFloat())))
            winCpt = 0
            neutralCpt = 0
            loseCpt = 0
        }
        return entries
    }
    @SuppressLint("SetTextI18n")
    fun applyAccountValues(account: AccountDashboard) {
        accountDashboard = account
        binding!!.nbGamesPlayed.text = accountDashboard.gameHistory.nbGamePlayed
        binding!!.nbHoursPlayed.text = "${formatTimeToHours(account.gameHistory.totalTimePlayed).toString()}h"
        binding!!.winPercentage.text = "${account.gameHistory.winPercentage.toInt().toString()}%"
        binding!!.averageGameTime.text = activity.formatTimeMinSecFormat(account.gameHistory.averageGameTime)
        setBarChart()
        isAccountDefined = true
        showHistoryDialog.setOnClickListener {
            showHistoryDialog()
        }
    }
    private fun showHistoryDialog(){
        val dialogView = layoutInflater.inflate(R.layout.dialog_account_history, null)
        val dialog = AlertDialog.Builder(requireContext()).setView(dialogView).create()
        dialog.show()
        dialog.connectionHistory.layoutManager = LinearLayoutManager(requireActivity())
        dialog.connectionHistory.adapter = ConnectionAdapter(accountDashboard.logins)
        dialog.gameHistory.layoutManager = LinearLayoutManager(requireActivity())
        dialog.gameHistory.adapter = GameHistoryAdapter(accountDashboard.gameHistory.games)
        dialog.dismissBtn.setOnClickListener {
            dialog.dismiss()
        }
    }
    private fun formatTimeToHours(time: Long):Long{
        return TimeUnit.MILLISECONDS.toHours(time)
    }
    private fun getDaysAgo(daysAgo: Int): Date {
        val calendar = Calendar.getInstance()
        calendar.add(Calendar.DAY_OF_YEAR, -daysAgo)
        return calendar.time
    }
    private fun formatDate(date: String):String{
        var result = ""
        for(i in FORMATTED_DATE_START until FORMATTED_DATE_END){
            result += date[i]
        }
        return result
    }
    private fun areDatesOnSameDay(date1: Date, date2: Date):Boolean{
        val calendar1 = Calendar.getInstance()
        calendar1.time = date1
        val calendar2 = Calendar.getInstance()
        calendar2.time = date2
        return calendar1[Calendar.YEAR] == calendar2[Calendar.YEAR] && calendar1[Calendar.MONTH] == calendar2[Calendar.MONTH] && calendar1[Calendar.DAY_OF_MONTH] == calendar2[Calendar.DAY_OF_MONTH]
    }

}