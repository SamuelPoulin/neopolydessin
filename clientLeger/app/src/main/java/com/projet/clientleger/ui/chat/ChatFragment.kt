package com.projet.clientleger.ui.chat

import android.graphics.Color
import android.graphics.drawable.Drawable
import android.os.Bundle
import android.text.Html
import android.util.DisplayMetrics
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.RelativeLayout
import android.widget.Toast
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.constraintlayout.widget.ConstraintSet
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.FragmentContainerView
import androidx.fragment.app.setFragmentResultListener
import androidx.fragment.app.viewModels
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.projet.clientleger.R
import com.projet.clientleger.data.model.FriendSimplified
import com.projet.clientleger.data.model.chat.IMessage
import dagger.hilt.android.AndroidEntryPoint
import java.util.regex.Pattern
import javax.inject.Inject
import com.projet.clientleger.databinding.FragmentChatBinding
import kotlin.random.Random

private const val MESSAGE_CONTENT_ERROR: String =
    "Le message ne doit pas être vide et ne doit pas dépasser 200 caractères"

@AndroidEntryPoint
class ChatFragment @Inject constructor() : Fragment() {

    val vm: ChatViewModel by viewModels()
    private var binding: FragmentChatBinding? = null
    var baseHeight: Int = -1
    var screenSize: Int = -1
    var baseWidth: Int = -1

    companion object {
        fun newInstance() = ChatFragment()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val displayMetrics = DisplayMetrics()
        requireActivity().windowManager.defaultDisplay.getMetrics(displayMetrics)
        screenSize = displayMetrics.widthPixels
        baseWidth = screenSize/2

        vm.isGuessing.observe(requireActivity()){
            updateTheme(it)
        }
        vm.isGuesser.observe(requireActivity()){
            updateGuessingBtnVisibility(it)
        }

        setupFragmentListeners()
        setupTabsObservers()
    }



    private fun toggleVisibilityChat(){
        binding?.let { mBinding ->
            val newVisibility = when(mBinding.chatSendBox.visibility){
                View.VISIBLE -> View.GONE
                else -> View.VISIBLE
            }
            mBinding.rvTabs.visibility = newVisibility
            mBinding.messageContainer.visibility = newVisibility
            mBinding.chatSendBox.visibility = newVisibility

            val layout = (mBinding.header.layoutParams as RelativeLayout.LayoutParams)
            val ruleToRemove: Int
            val ruleToAdd: Int
            when(newVisibility) {
                View.VISIBLE ->{
                    ruleToRemove = RelativeLayout.ALIGN_PARENT_BOTTOM
                    ruleToAdd = RelativeLayout.ALIGN_PARENT_TOP
                    mBinding.root.setBackgroundResource(R.drawable.chat_background)
                    mBinding.hideIcon.setImageDrawable(ContextCompat.getDrawable(requireContext(), R.drawable.ic_hide_chat))
                }
                else -> {
                    ruleToAdd = RelativeLayout.ALIGN_PARENT_BOTTOM
                    ruleToRemove = RelativeLayout.ALIGN_PARENT_TOP
                    mBinding.root.setBackgroundColor(Color.TRANSPARENT)
                    mBinding.hideIcon.setImageDrawable(ContextCompat.getDrawable(requireContext(), R.drawable.ic_open_chat))

                }
            }
            layout.removeRule(ruleToRemove)
            layout.addRule(ruleToAdd)
            mBinding.header.layoutParams = layout
        }
    }

    private fun resize(height: Int){
        if(baseHeight < 0)
            baseHeight = binding!!.root.height
        if(height > 0 && baseHeight == binding!!.root.layoutParams.height) {
            val params = binding!!.root.layoutParams
            params.height = height
            binding?.let {
                it.root.requestLayout()
                it.rvMessages.adapter?.notifyDataSetChanged()
                it.rvMessages.scrollToPosition(vm.messagesLiveData.value!!.size - 1)
            }

        } else if(height < 0 && binding!!.root.layoutParams.height != baseHeight){
            val params = binding!!.root.layoutParams
            params.height = baseHeight
            binding?.let {
                it.root.requestLayout()
                it.rvMessages.adapter?.notifyDataSetChanged()
                it.rvMessages.scrollToPosition(vm.messagesLiveData.value!!.size - 1)
            }
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        binding = FragmentChatBinding.inflate(inflater, container, false)

        binding!!.sendButton.setOnClickListener { sendMessage() }
        binding!!.guessingToggleBtn.setOnClickListener { toggleSendMode() }

        binding!!.vm = vm
        return binding!!.root
    }


    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        setupRvMessages()

        setupMessagesObserver()

        binding?.let {
            it.iconsHeader.setOnClickListener {
                toggleVisibilityChat()
            }

            val manager = LinearLayoutManager(activity)
            manager.orientation = LinearLayoutManager.HORIZONTAL
            it.rvTabs.layoutManager = manager
            it.rvTabs.adapter = TabAdapter(vm.tabs.value!!, vm::changeSelectedTab)
        }
    }

    private fun setupFragmentListeners(){
        setFragmentResultListener("isGuessing"){ requestKey, bundle ->
            vm.isGuesser.postValue(bundle["boolean"] as Boolean)
            vm.isGuessing.postValue(bundle["boolean"] as Boolean)
        }
        setFragmentResultListener("keyboardEvent"){ requestKey, bundle ->
            resize(bundle["height"] as Int)
        }
        setFragmentResultListener("openFriendChat"){ requestKey, bundle ->
            val friend = (bundle["friend"] as FriendSimplified)
            vm.addNewTab(friend.username, friend.friendId, true)
        }
    }

    private fun setupTabsObservers(){
        vm.tabs.observe(requireActivity()){ newTabs ->
            binding?.let { mBinding ->
                mBinding.rvTabs.adapter?.notifyDataSetChanged()
                mBinding.rvTabs.scrollToPosition(0)
            }
        }

        vm.selectedTab.observe(requireActivity()){ tab ->
            binding?.let { mBinding ->
                (mBinding.rvTabs.adapter as TabAdapter?)?.setSelectedTabIndex(tab)
            }
        }
    }

    private fun setupMessagesObserver(){
        vm.messagesLiveData.observe(requireActivity()){
            binding?.let { mBinding ->
                if(it.isEmpty()) {
                    mBinding.noMessagesView.visibility = View.VISIBLE
                    mBinding.rvMessages.visibility = View.GONE
                } else {
                    mBinding.noMessagesView.visibility = View.GONE
                    mBinding.rvMessages.visibility = View.VISIBLE
                }
                println("observe messages update: ${it.size}")
                mBinding.rvMessages.adapter?.notifyDataSetChanged()
                mBinding.rvMessages.scrollToPosition(it.size - 1)
            }
        }
    }

    private fun setupRvMessages(){
        val adapter = MessagesAdapter(vm.messagesLiveData.value!!, vm.username)
        val mLinearLayoutManager = LinearLayoutManager(activity)
        mLinearLayoutManager.stackFromEnd = true
        binding!!.rvMessages.layoutManager = mLinearLayoutManager
        binding!!.rvMessages.adapter = adapter
    }

    private fun sendMessage() {
        vm.sendMessage()

        //TODO show loading message

        binding?.chatBox?.text?.clear()
    }
    private fun isMessageValidFormat(message: String): Boolean {
        return Pattern.matches(".*\\S.*", message) && message.length <= 200 && message.isNotEmpty()
    }

    private fun toggleSendMode(){
        vm.isGuessing.postValue(!vm.isGuessing.value!!)
    }

    private fun updateTheme(isGuessing: Boolean){
        if(isGuessing){
            binding!!.chatSendBox.background = ContextCompat.getDrawable(requireContext(), R.drawable.chat_guessing_input_background)
            binding!!.guessingToggleBtn.background = ContextCompat.getDrawable(requireContext(), R.drawable.ic_lightbulb_white)
            binding!!.sendButton.background = ContextCompat.getDrawable(requireContext(), R.drawable.ic_sent)
        } else{
            binding!!.chatSendBox.background = ContextCompat.getDrawable(requireContext(), R.drawable.chat_input_background)
            binding!!.guessingToggleBtn.background = ContextCompat.getDrawable(requireContext(), R.drawable.ic_lightbulb)
            binding!!.sendButton.background = ContextCompat.getDrawable(requireContext(), R.drawable.ic_baseline_send_24)
        }
    }

    private fun showErrorToast(errorMessage: String) {
        activity?.runOnUiThread {
            Toast.makeText(
                activity,
                Html.fromHtml(
                    "<font color='#e61515'><b>${errorMessage}</b></font>",
                    0
                ),
                Toast.LENGTH_SHORT
            ).show()
        }
    }

    private fun updateGuessingBtnVisibility(isGuesser: Boolean){
        if(isGuesser){
            binding!!.guessingToggleBtn.visibility = View.VISIBLE
        }
        else{
            binding!!.guessingToggleBtn.visibility = View.INVISIBLE
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        binding = null
    }
}