import React, { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import "./Home.css"
import axios from "axios"
import { io } from "socket.io-client"

const BASE_URL = "https://chatapplication-backend-v90l.onrender.com"

const Home = () => {

  const navigate = useNavigate()
  const location = useLocation()

  // ================= STATES =================

  const [searchTerm, setSearchTerm] = useState("")
  const [userList, setUserList] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [chatMessages, setChatMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [fullscreenImage, setFullscreenImage] = useState(null)
  const [currentUser, setCurrentUser] = useState(location.state || null)

  // ================= MOBILE VIEW =================

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 720)
  const [showChatMobile, setShowChatMobile] = useState(false)

  // ================= REFS =================

  const messagesEndRef = useRef(null)
  const socket = useRef(null)
  const fileInputRef = useRef(null)

  const currentUserId = localStorage.getItem("userId")
  const token = localStorage.getItem("token")

  // ================= WINDOW RESIZE =================

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 720
      setIsMobile(mobile)
      if (!mobile) setShowChatMobile(false)
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // ================= PROFILE PIC =================

  const getProfilePic = (pic) => {
    if (!pic) return null
    if (pic.startsWith("http")) return pic
    return `${BASE_URL}${pic}`
  }

  // ================= FALLBACK AVATAR =================

  const getAvatarFallback = (name) => {
    const initials = (name || "?")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
        <rect width="100%" height="100%" fill="#128C7E"/>
        <text
          x="50%"
          y="54%"
          dominant-baseline="middle"
          text-anchor="middle"
          font-size="42"
          fill="white"
          font-family="Arial"
        >
          ${initials}
        </text>
      </svg>
    `
    return `data:image/svg+xml;base64,${btoa(svg)}`
  }

  // ================= FETCH CURRENT USER =================

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/user/getUsers`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setCurrentUser(res.data)
      } catch (err) {
        console.log(err)
      }
    }
    if (token) fetchMyProfile()
  }, [token])

  // ================= AUTO SCROLL =================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  // ================= SOCKET =================

  useEffect(() => {
    if (!currentUserId) return

    socket.current = io(BASE_URL, { query: { userId: currentUserId } })

    socket.current.on("getOnlineUsers", (users) => {
      setOnlineUsers(users)
    })

    socket.current.on("newMessage", (msg) => {
      if (
        selectedChat &&
        (
          String(msg.senderId) === String(selectedChat._id) ||
          String(msg.reciverId) === String(selectedChat._id)
        )
      ) {
        setChatMessages((prev) => [...prev, msg])
      }
    })

    return () => {
      socket.current?.disconnect()
    }
  }, [currentUserId, selectedChat])

  // ================= FETCH USERS =================

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/user/search?search=${searchTerm || "a"}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const filtered = res.data.filter(
        (u) => String(u._id) !== String(currentUserId)
      )
      setUserList(filtered)
    } catch (err) {
      console.log(err)
    }
  }

  // ================= FETCH CHAT =================

  const fetchChat = async () => {
    if (!selectedChat) return
    try {
      const res = await axios.get(
        `${BASE_URL}/message/${selectedChat._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setChatMessages(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => { fetchUsers() }, [searchTerm])
  useEffect(() => { fetchChat() }, [selectedChat])

  // ================= OPEN CHAT =================

  const openChat = (user) => {
    setSelectedChat(user)
    if (isMobile) setShowChatMobile(true)
  }

  // ================= BACK TO USERS =================

  const backToUsers = () => setShowChatMobile(false)

  // ================= CLEAR FILE =================

  const clearFileSelection = () => {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // ================= SEND MESSAGE =================

  const sendMessage = async () => {
    if ((!newMessage.trim() && !file) || !selectedChat) return

    try {
      const formData = new FormData()
      formData.append("message", newMessage)
      if (file) formData.append("file", file)

      const res = await axios.post(
        `${BASE_URL}/message/send/${selectedChat._id}`,
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

  // ================= DELETE CHAT =================

  const deleteChat = async () => {
    if (!selectedChat) return
    const confirmDelete = window.confirm("Delete entire chat?")
    if (!confirmDelete) return

    try {
      await axios.delete(
        `${BASE_URL}/message/delete/${selectedChat._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSelectedChat(null)
      setChatMessages([])
      if (isMobile) setShowChatMobile(false)
    } catch (err) {
      console.log(err)
    }
  }

  // ================= DELETE MESSAGE =================

  const singleDelete = async (messageId) => {
    try {
      await axios.delete(
        `${BASE_URL}/message/singleDelete/${messageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setChatMessages((prev) => prev.filter((msg) => msg._id !== messageId))
    } catch (err) {
      console.log(err.response?.data || err)
    }
  }

  // ================= NAVIGATION =================

  const goToMyProfile = () => navigate("/editProfile", { state: currentUser })

  const goToUserProfile = (user, e) => {
    e.stopPropagation()
    navigate("/viewProfile", { state: user })
  }

  // ================= LOGOUT =================

  const logout = () => {
    socket.current?.disconnect()
    localStorage.clear()
    navigate("/")
  }

  // ================= FILE TYPE HELPERS =================

  // ✅ Determines what icon/label to show for non-image files
  const getFileLabel = (fileType, fileName) => {
    if (fileType === "application/pdf") return "📄 PDF"
    if (fileType?.startsWith("video")) return "🎥 Video"
    if (fileType?.startsWith("audio")) return "🎵 Audio"
    return "📎 File"
  }

  if (!currentUser) return <h1>No User Data Found</h1>

  // ================= UI =================

  return (
    <div className="container">

      {/* ================= SIDEBAR ================= */}

      <div className={`results ${isMobile && showChatMobile ? "mobile-hide" : ""}`}>

        {/* HEADER */}
        <div className="header-row">
          <img
            src={getProfilePic(currentUser?.profilepic) || getAvatarFallback(currentUser?.name)}
            className="searchProfile"
            alt={currentUser?.name}
            onError={(e) => { e.target.onerror = null; e.target.src = getAvatarFallback(currentUser?.name) }}
            onClick={goToMyProfile}
          />
          <p className="profile-name">{currentUser?.name}</p>
          <button className="logout-button" onClick={logout}>Logout</button>
        </div>

        {/* SEARCH */}
        <input
          className="search-box"
          type="text"
          placeholder="Search User"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* USER LIST */}
        <div className="user-list">
          {userList.map((user) => (
            <div
              className={`user-card ${selectedChat?._id === user._id ? "active-user" : ""}`}
              key={user._id}
              onClick={() => openChat(user)}
            >
              <img
                className="user-avatar"
                src={getProfilePic(user.profilepic) || getAvatarFallback(user.name)}
                alt={user.name}
                onError={(e) => { e.target.onerror = null; e.target.src = getAvatarFallback(user.name) }}
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

      {/* ================= CHAT WINDOW ================= */}

      <div className={`chat-window ${isMobile ? (showChatMobile ? "active" : "") : ""}`}>

        {selectedChat ? (
          <>

            {/* CHAT HEADER */}
            <div className="chat-header">
              {isMobile && (
                <button className="mobile-back-button" onClick={backToUsers}>←</button>
              )}
              <img
                className="chat-header-avatar"
                src={getProfilePic(selectedChat.profilepic) || getAvatarFallback(selectedChat.name)}
                alt={selectedChat.name}
                onError={(e) => { e.target.onerror = null; e.target.src = getAvatarFallback(selectedChat.name) }}
                onClick={(e) => goToUserProfile(selectedChat, e)}
              />
              <div className="chat-user-info">
                <h2>{selectedChat.name}</h2>
                <p>{onlineUsers.includes(selectedChat._id) ? "Online" : "Offline"}</p>
              </div>
              <button className="delete-chat-button" onClick={deleteChat}>Delete</button>
            </div>

            {/* ================= MESSAGES ================= */}

            <div className="messages-area">
              {chatMessages.map((msg) => (
                <div
                  key={msg._id}
                  className={`message-bubble ${
                    String(msg.senderId) === String(currentUserId) ? "sent" : "received"
                  }`}
                >

                  {/* DELETE BUTTON */}
                  <button
                    className="delete-message-button"
                    onClick={() => singleDelete(msg._id)}
                  >
                    🗑
                  </button>

                  {/* TEXT MESSAGE */}
                  {msg.message && <p>{msg.message}</p>}

                  {/* ✅ IMAGE */}
                  {msg.file && msg.fileType?.startsWith("image") && (
                    <img
                      className="message-media"
                      src={msg.file}
                      alt="attachment"
                      onClick={() => setFullscreenImage(msg.file)}
                    />
                  )}

                  {/* ✅ VIDEO — hardcoded mp4 fallback fixes playback issues */}
                  {msg.file && msg.fileType?.startsWith("video") && (
                    <video className="message-media" controls>
                      <source src={msg.file} type="video/mp4" />
                      <source src={msg.file} type={msg.fileType} />
                      Your browser does not support video.
                    </video>
                  )}

                  {/* ✅ AUDIO */}
                  {msg.file && msg.fileType?.startsWith("audio") && (
                    <audio controls style={{ width: "100%", marginTop: "4px" }}>
                      <source src={msg.file} type={msg.fileType} />
                      <source src={msg.file} type="audio/mpeg" />
                      Your browser does not support audio.
                    </audio>
                  )}

                  {/* ✅ PDF — via backend proxy to bypass Cloudinary CORS */}
                  {msg.file && msg.fileType === "application/pdf" && (
                    <a
                      href={`${BASE_URL}/message/pdf-proxy?url=${encodeURIComponent(msg.file)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "rgba(0,0,0,0.08)",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        color: "inherit",
                        textDecoration: "none",
                        fontWeight: "500",
                        marginTop: "4px",
                        fontSize: "14px"
                      }}
                    >
                      📄 Download PDF
                    </a>
                  )}

                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* ================= INPUT AREA ================= */}

            <div className="input-area">

              {/* FILE PREVIEW */}
              {preview && (
                <div className="preview-row">
                  <button className="clear-preview-button" onClick={clearFileSelection}>✕</button>

                  {/* IMAGE PREVIEW */}
                  {file?.type?.startsWith("image") && (
                    <img className="preview-image" src={preview} alt="preview" />
                  )}

                  {/* VIDEO PREVIEW */}
                  {file?.type?.startsWith("video") && (
                    <video className="preview-image" controls src={preview} />
                  )}

                  {/* AUDIO PREVIEW */}
                  {file?.type?.startsWith("audio") && (
                    <audio controls>
                      <source src={preview} type={file.type} />
                    </audio>
                  )}

                  {/* PDF PREVIEW */}
                  {file?.type === "application/pdf" && (
                    <div className="pdf-preview">
                      📄 {file.name}
                    </div>
                  )}
                </div>
              )}

              <div className="input-wrapper">

                <input
                  className="message-input"
                  type="text"
                  placeholder="Type a message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />

                {/* FILE INPUT */}
                <label className="file-label">
                  📎
                  <input
                    className="file-input"
                    type="file"
                    ref={fileInputRef}
                    hidden
                    accept="image/*,video/*,audio/*,application/pdf"
                    onChange={(e) => {
                      const selectedFile = e.target.files[0]
                      if (selectedFile) {
                        setFile(selectedFile)
                        setPreview(URL.createObjectURL(selectedFile))
                      }
                    }}
                  />
                </label>

                <button className="send-button" onClick={sendMessage}>Send</button>

              </div>
            </div>

          </>
        ) : (
          <div className="empty-state">
            <h2>Select a chat</h2>
          </div>
        )}
      </div>

      {/* ================= FULLSCREEN IMAGE ================= */}

      {fullscreenImage && (
        <div className="fullscreen-overlay" onClick={() => setFullscreenImage(null)}>
          <img className="fullscreen-image" src={fullscreenImage} alt="fullscreen" />
        </div>
      )}

    </div>
  )
}

export default Home
