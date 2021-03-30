package com.projet.clientleger.utils

import java.text.SimpleDateFormat
import java.util.*

object DateFormatter {
    fun stringToDate(sDate: String): Date {
        val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US)
        val dateObject = dateFormat.parse(sDate)
        return dateObject ?: Date(System.currentTimeMillis())
    }

    fun now(): Date{
        return Date(System.currentTimeMillis())
    }
}