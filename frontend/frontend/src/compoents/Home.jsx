import React, { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import "./Home.css"
import axios from "axios"
import { io } from "socket.io-client"

const Home = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // STATES
  const [searchTerm, setSearchTerm] = useState("")
  const [userList, setUserList] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [fullscreenImage, setFullscreenImage] = useState(null)

  const messagesEndRef = useRef(null)
  const socket = useRef(null)
  const fileInputRef = useRef(null)

  const currentUserId = localStorage.getItem("userId")
  const token = localStorage.getItem("token")

  // AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  // SOCKET
  useEffect(() => {
    if (!currentUserId) return

    socket.current = io("https://chatapplication-backend-v90l.onrender.com", {
      query: { userId: currentUserId }
    })

    socket.current.on("getOnlineUsers", setOnlineUsers)

    socket.current.on("newMessage", (msg) => {
      setSelectedChat((prev) => {
        if (prev && String(msg.senderId) === String(prev._id)) {
          setChatMessages((old) => [...old, msg])
        }
        return prev
      })
    })

    return () => socket.current?.disconnect()
  }, [currentUserId])

  // FETCH USERS
  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `https://chatapplication-backend-v90l.onrender.com/user/search?search=${searchTerm || "a"}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setUserList(res.data.filter((u) => String(u._id) !== String(currentUserId)))
    } catch (err) {
      console.log(err)
    }
  }

  // FETCH CHAT
  const fetchChat = async () => {
    if (!selectedChat) return
    try {
      const res = await axios.get(
        `https://chatapplication-backend-v90l.onrender.com/message/${selectedChat._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setChatMessages(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  const clearFileSelection = () => {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // SEND MESSAGE
  const sendMessage = async () => {
    if ((!newMessage.trim() && !file) || !selectedChat) return

    try {
      const formData = new FormData()
      formData.append("message", newMessage)
      if (file) formData.append("file", file)

      const res = await axios.post(
        `https://chatapplication-backend-v90l.onrender.com/message/send/${selectedChat._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (res.data.success) {
        setChatMessages((prev) => [...prev, res.data.newMessage])
        setNewMessage("")
        clearFileSelection()
      }
    } catch (err) {
      console.log(err)
    }
  }

  // DELETE CHAT
  const deleteChat = async () => {
    if (!selectedChat) return
    if (!window.confirm("Delete whole chat?")) return

    try {
      await axios.delete(
        `https://chatapplication-backend-v90l.onrender.com/message/delete/${selectedChat._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setChatMessages([])
      setSelectedChat(null)
    } catch (err) {
      console.log(err)
    }
  }

  // SINGLE DELETE
  const singleDelete = async (messageId) => {
    try {
      await axios.delete(
        `https://chatapplication-backend-v90l.onrender.com/message/singleDelete/${messageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setChatMessages((prev) => prev.filter((msg) => msg._id !== messageId))
    } catch (err) {
      console.log(err)
    }
  }

  // NAVIGATION
  const goToMyProfile = () => {
    navigate("/editProfile", {
      state: location.state
    })
  }

  const goToUserProfile = (user, e) => {
    e?.stopPropagation()
    navigate("/viewProfile", {
      state: user
    })
  }

  // EFFECTS
  useEffect(() => { fetchUsers() }, [searchTerm])
  useEffect(() => { fetchChat() }, [selectedChat])

  const logout = () => {
    socket.current?.disconnect()
    localStorage.clear()
    navigate("/")
  }

  if (!location.state) return <h1>No User Data Found</h1>

  // UI
  return (
    <div className="container">

      {/* SIDEBAR */}
      <div className="results">

        <div className="header-row">
          <img
            src={location.state.profilepic}
            className="searchProfile"
            onClick={goToMyProfile}
          />
          <p>{location.state.name}</p>
          <button onClick={logout}>Logout</button>
        </div>

        <input
          placeholder="Search User"
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div>
          {userList.map((user) => (
            <div key={user._id} onClick={() => setSelectedChat(user)}>
              <img
                src={user.profilepic}
                onClick={(e) => goToUserProfile(user, e)}
              />
              <h3>{user.name}</h3>
              <p>{onlineUsers.includes(user._id) ? "Online" : "Offline"}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT */}
      <div className="chat-window">

        {selectedChat ? (
          <>
            <header>
              <img
                src={selectedChat.profilepic}
                onClick={(e) => goToUserProfile(selectedChat, e)}
              />
              <h2>{selectedChat.name}</h2>
              <button onClick={deleteChat}>Delete Chat</button>
            </header>

            {/* MESSAGES */}
            <div className="messages-area">
              {chatMessages.map((msg) => (
                <div key={msg._id}>

                  <button onClick={() => singleDelete(msg._id)}>🗑</button>

                  {msg.message && <p>{msg.message}</p>}

                  {/* IMAGE */}
                  {msg.file && msg.fileType?.startsWith("image") && (
                    <img
                      src={msg.file}
                      onClick={() => setFullscreenImage(msg.file)}
                    />
                  )}

                  {/* VIDEO */}
                  {msg.file && msg.fileType?.startsWith("video") && (
                    <video controls>
                      <source src={msg.file} type={msg.fileType} />
                    </video>
                  )}

                  {/* AUDIO */}
                  {msg.file && msg.fileType?.startsWith("audio") && (
                    <audio controls src={msg.file} />
                  )}

                  {/* PDF */}
                  {msg.file && msg.fileType === "application/pdf" && (
                    <a href={msg.file} target="_blank">
                      Open PDF
                    </a>
                  )}

                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div>
              {preview && (
                <div>
                  <button onClick={clearFileSelection}>X</button>
                  <img src={preview} />
                </div>
              )}

              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />

              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const f = e.target.files[0]
                  setFile(f)
                  setPreview(URL.createObjectURL(f))
                }}
              />

              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <h2>Select chat</h2>
        )}

      </div>

      {/* FULLSCREEN */}
      {fullscreenImage && (
        <div onClick={() => setFullscreenImage(null)}>
          <img src={fullscreenImage} />
        </div>
      )}

    </div>
  )
}

export default Home