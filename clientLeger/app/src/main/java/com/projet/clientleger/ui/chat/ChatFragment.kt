package com.projet.clientleger.ui.chat

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import androidx.fragment.app.Fragment
import com.projet.clientleger.R
import com.projet.clientleger.ui.mainmenu.view.MainmenuActivity
import kotlinx.android.synthetic.main.fragment_chat.*

// TODO: Rename parameter arguments, choose names that match
// the fragment initialization parameters, e.g. ARG_ITEM_NUMBER
private const val ARG_PARAM1 = "param1"
private const val ARG_PARAM2 = "param2"

/**
 * A simple [Fragment] subclass.
 * Use the [chat.newInstance] factory method to
 * create an instance of this fragment.
 */
class ChatFragment : Fragment() {
    // TODO: Rename and change types of parameters

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        arguments?.let {
        }
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?,
                              savedInstanceState: Bundle?): View? {
        // Inflate the layout for this fragment
        return inflater.inflate(R.layout.fragment_chat, container, false)
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        sendButton.setOnClickListener(){
            //passe ici
            sendButton()
        }
    }
    private fun sendButton(){
        val text:String = (chatBox.text).toString()
        addMessage(text)
        chatBox.text.clear()
        //envoyer le message à la db
        //ajoute le message à la boite de chat locale
    }
    private fun addMessage(text:String){
        if(text.isNotEmpty()){
            val messageView:TextView = TextView(activity)
            messageView.textSize = 20f
            messageView.text = text
            messageBox.addView(messageView)
        }
    }
    companion object {
        /**
         * Use this factory method to create a new instance of
         * this fragment using the provided parameters.
         *
         * @param param1 Parameter 1.
         * @param param2 Parameter 2.
         * @return A new instance of fragment chat.
         */
        // TODO: Rename and change types and number of parameters
        @JvmStatic
        fun newInstance() =
                ChatFragment().apply {
                    arguments = Bundle().apply {
                    }
                }
    }
}