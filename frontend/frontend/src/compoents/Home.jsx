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
  // ✅ FIX: local state for current user so profile pic updates immediately
  const [currentUser, setCurrentUser] = useState(location.state || null)

  const messagesEndRef = useRef(null)
  const socket = useRef(null)
  const fileInputRef = useRef(null)

  const currentUserId = localStorage.getItem("userId")
  const token = localStorage.getItem("token")

  // ✅ FIX: converts relative profilepic paths to full URLs
  const BASE_URL = "https://chatapplication-backend-v90l.onrender.com"
  const getProfilePic = (pic) => {
    if (!pic) return null
    if (pic.startsWith("http")) return pic      // already a full URL
    return `${BASE_URL}${pic}`                  // e.g. /public/male.png → full URL
  }

  // FALLBACK AVATAR HELPER — uses inline SVG so it NEVER breaks (no network needed)
  const getAvatarFallback = (name) => {
    const initials = (name || "?")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <rect width="128" height="128" rx="64" fill="#128C7E"/>
      <text x="64" y="72" text-anchor="middle" font-size="48" font-family="Arial" fill="#fff">${initials}</text>
    </svg>`
    return `data:image/svg+xml;base64,${btoa(svg)}`
  }

  // ✅ FIX: Fetch fresh profile from backend every time Home mounts or user returns
  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const res = await axios.get(
          `https://chatapplication-backend-v90l.onrender.com/user/${currentUserId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (res.data) {
          setCurrentUser(res.data)
        }
      } catch (err) {
        // If API fails, fall back to location.state
        console.log("Could not refresh profile, using cached data", err)
        setCurrentUser(location.state)
      }
    }
    if (currentUserId) fetchMyProfile()
  }, [currentUserId])

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
      state: currentUser
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
          {/* ✅ FIX: uses currentUser state (fetched fresh) instead of location.state */}
          <img
            src={currentUser.profilepic?`https://chatapplication-backend-v90l.onrender.com${profilepic}`:null|| getAvatarFallback(currentUser?.name)}
            className="searchProfile"
            alt={currentUser?.name}
            onError={(e) => {
              e.target.onerror = null
              e.target.src = getAvatarFallback(currentUser?.name)
            }}
            onClick={goToMyProfile}
          />
          <p className="profile-name">{currentUser?.name}</p>
          <button className="logout-button" onClick={logout}>Logout</button>
        </div>

        <input
          className="search-box"
          placeholder="Search User"
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="user-list">
          {userList.map((user) => (
            <div className="user-card" key={user._id} onClick={() => setSelectedChat(user)}>
              {/* ✅ FIX: onError fallback for user list avatars */}
              <img
                className="user-avatar"
                src={getProfilePic(user.profilepic) || getAvatarFallback(user.name)}
                alt={user.name}
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = getAvatarFallback(user.name)
                }}
                onClick={(e) => goToUserProfile(user, e)}
              />
              <div className="user-meta">
                <h3>{user.name}</h3>
                <p>{onlineUsers.includes(user._id) ? "Online" : "Offline"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT */}
      <div className="chat-window">

        {selectedChat ? (
          <>
            <header className="chat-header">
              {/* ✅ FIX: chat header avatar with className + onError fallback */}
              <img
                className="chat-header-avatar"
                src={getProfilePic(selectedChat.profilepic) || getAvatarFallback(selectedChat.name)}
                alt={selectedChat.name}
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = getAvatarFallback(selectedChat.name)
                }}
                onClick={(e) => goToUserProfile(selectedChat, e)}
              />
              <h2>{selectedChat.name}</h2>
              <button className="delete-chat-button" onClick={deleteChat}>Delete Chat</button>
            </header>

            {/* MESSAGES */}
            <div className="messages-area">
              {chatMessages.map((msg) => (
                <div
                  key={msg._id}
                  className={`message-bubble ${String(msg.senderId) === String(currentUserId) ? "sent" : "received"}`}
                >
                  <button className="delete-message-button" onClick={() => singleDelete(msg._id)}>🗑</button>

                  {msg.message && <p>{msg.message}</p>}

                  {/* IMAGE */}
                  {msg.file && msg.fileType?.startsWith("image") && (
                    <img
                      className="message-media"
                      src={msg.file}
                      alt="attachment"
                      onClick={() => setFullscreenImage(msg.file)}
                    />
                  )}

                  {/* VIDEO */}
                  {msg.file && msg.fileType?.startsWith("video") && (
                    <video className="message-media" controls>
                      <source src={msg.file} type={msg.fileType} />
                    </video>
                  )}

                  {/* AUDIO */}
                  {msg.file && msg.fileType?.startsWith("audio") && (
                    <audio className="message-audio" controls src={msg.file} />
                  )}

                  {/* PDF */}
                  {msg.file && msg.fileType === "application/pdf" && (
                    <a className="message-link" href={msg.file} target="_blank" rel="noreferrer">
                      Open PDF
                    </a>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="input-area">
              {preview && (
                <div className="preview-row">
                  <button className="clear-preview-button" onClick={clearFileSelection}>X</button>
                  <img className="preview-image" src={preview} alt="preview" />
                </div>
              )}

              <input
                className="message-input"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />

              <input
                className="file-input"
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const f = e.target.files[0]
                  setFile(f)
                  setPreview(URL.createObjectURL(f))
                }}
              />

              <button className="send-button" onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <h2 className="empty-state">Select chat</h2>
        )}
      </div>

      {/* FULLSCREEN */}
      {fullscreenImage && (
        <div className="fullscreen-overlay" onClick={() => setFullscreenImage(null)}>
          <img src={fullscreenImage} alt="Fullscreen preview" />
        </div>
      )}

    </div>
  )
}

export default Home
