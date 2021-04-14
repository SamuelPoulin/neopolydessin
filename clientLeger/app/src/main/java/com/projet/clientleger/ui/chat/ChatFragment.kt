package com.projet.clientleger.ui.chat

import android.graphics.Color
import android.os.Bundle
import android.text.Html
import android.util.DisplayMetrics
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Toast
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.fragment.app.setFragmentResultListener
import androidx.fragment.app.viewModels
import androidx.recyclerview.widget.LinearLayoutManager
import com.projet.clientleger.R
import com.projet.clientleger.data.enumData.SoundId
import com.projet.clientleger.data.model.FriendSimplified
import com.projet.clientleger.data.model.chat.TabInfo
import dagger.hilt.android.AndroidEntryPoint
import java.util.regex.Pattern
import javax.inject.Inject
import com.projet.clientleger.databinding.FragmentChatBinding

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


    override fun onResume() {
        super.onResume()
        vm.fetchSavedData()
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

            when(newVisibility) {
                View.VISIBLE ->{
                    vm.playSound(SoundId.OPEN_CHAT.value)
                    mBinding.root.setBackgroundResource(R.drawable.chat_background)
                    mBinding.hideIcon.setImageDrawable(ContextCompat.getDrawable(requireContext(), R.drawable.ic_hide_chat))
                    mBinding.headerSpaceBuffer.visibility = View.GONE
                }
                else -> {
                    vm.playSound(SoundId.CLOSE_CHAT.value)
                    mBinding.root.setBackgroundColor(Color.TRANSPARENT)
                    mBinding.hideIcon.setImageDrawable(ContextCompat.getDrawable(requireContext(), R.drawable.ic_open_chat))
                    mBinding.headerSpaceBuffer.visibility = View.VISIBLE
                }
            }
        }
    }

    private fun resize(height: Int){
        if(baseHeight < 0)
            baseHeight = binding!!.root.height
        if(height > 0 && baseHeight == binding!!.root.layoutParams.height) {
            val params = binding!!.root.layoutParams
            params.height = baseHeight - height
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
            vm.addNewTab(TabInfo(friend.username, friend.friendId, true))
        }

        setFragmentResultListener("openGameChat"){requestKey, bundle ->
            val tabName = (bundle["tabName"] as String)
            vm.addNewTab(TabInfo(tabName, ChatViewModel.GAME_TAB_ID))
        }
        setFragmentResultListener("closeGameChat"){requestKey, bundle ->
            val tabName = (bundle["tabName"] as String)
            vm.removeTab(TabInfo(tabName, ChatViewModel.GAME_TAB_ID))
        }
        setFragmentResultListener("activityChange"){requestKey, bundle ->
            vm.saveData()
            vm.clear()
        }
    }

    private fun setupTabsObservers(){
        vm.tabs.observe(requireActivity()){ newTabs ->
            binding?.let { mBinding ->
                mBinding.rvTabs.adapter?.notifyDataSetChanged()
                mBinding.rvTabs.scrollToPosition(0)
            }
        }

        vm.currentTab.observe(requireActivity()){ tab ->
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
                mBinding.rvMessages.adapter?.notifyDataSetChanged()
                mBinding.rvMessages.scrollToPosition(it.size - 1)
            }
        }
    }

    private fun setupRvMessages(){
        val mLinearLayoutManager = LinearLayoutManager(activity)
        mLinearLayoutManager.stackFromEnd = true
        binding!!.rvMessages.layoutManager = mLinearLayoutManager
        binding!!.rvMessages.adapter = MessagesAdapter(vm.messagesLiveData.value!!, vm.accountInfo.username)
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
        binding = null
        super.onDestroy()
    }
}