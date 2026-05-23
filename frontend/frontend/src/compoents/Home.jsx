import React, { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import "./Home.css"
import axios from "axios"
import { io } from "socket.io-client"

const BASE_URL = "https://chatapplication-backend-v90l.onrender.com"

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
  const [currentUser, setCurrentUser] = useState(location.state || null)

  // MOBILE
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 720)
  const [showChatMobile, setShowChatMobile] = useState(false)

  // REFS
  const messagesEndRef = useRef(null)
  const socket = useRef(null)
  const fileInputRef = useRef(null)

  const currentUserId = localStorage.getItem("userId")
  const token = localStorage.getItem("token")

  // RESIZE
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 720
      setIsMobile(mobile)
      if (!mobile) setShowChatMobile(false)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // PROFILE PIC
  const getProfilePic = (pic) => {
    if (!pic) return null
    if (pic.startsWith("http")) return pic
    return `${BASE_URL}${pic}`
  }

  // FALLBACK
  const getAvatarFallback = (name) => {
    const initials = (name || "?")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

    return `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
        <rect width="100%" height="100%" fill="#128C7E"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="42" fill="white">
          ${initials}
        </text>
      </svg>
    `)}`
  }

  // CURRENT USER
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

  // AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  // SOCKET
  useEffect(() => {
    if (!currentUserId) return

    socket.current = io(BASE_URL, {
      query: { userId: currentUserId }
    })

    socket.current.on("getOnlineUsers", setOnlineUsers)

    socket.current.on("newMessage", (msg) => {
      if (
        selectedChat &&
        (String(msg.senderId) === String(selectedChat._id) ||
          String(msg.reciverId) === String(selectedChat._id))
      ) {
        setChatMessages((prev) => [...prev, msg])
      }
    })

    return () => socket.current?.disconnect()
  }, [currentUserId, selectedChat])

  // USERS
  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/user/search?search=${searchTerm || "a"}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setUserList(
        res.data.filter((u) => String(u._id) !== String(currentUserId))
      )
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [searchTerm])

  // CHAT
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

  useEffect(() => {
    fetchChat()
  }, [selectedChat])

  // OPEN CHAT
  const openChat = (user) => {
    setSelectedChat(user)
    if (isMobile) setShowChatMobile(true)
  }

  const backToUsers = () => setShowChatMobile(false)

  // SEND MESSAGE
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
        setFile(null)
        setPreview(null)
      }
    } catch (err) {
      console.log(err)
    }
  }

  // DELETE MESSAGE
  const singleDelete = async (id) => {
    try {
      await axios.delete(
        `${BASE_URL}/message/singleDelete/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setChatMessages((prev) => prev.filter((m) => m._id !== id))
    } catch (err) {
      console.log(err)
    }
  }

  if (!currentUser) return <h1>No User Data Found</h1>

  return (
    <div className="container">

      {/* SIDEBAR */}
      <div className={`results ${isMobile && showChatMobile ? "mobile-hide" : ""}`}>

        <div className="header-row">
          <img
            src={getProfilePic(currentUser?.profilepic) || getAvatarFallback(currentUser?.name)}
            className="searchProfile"
            onClick={() => navigate("/editProfile", { state: currentUser })}
          />
          <p className="profile-name">{currentUser?.name}</p>
        </div>

        <input
          className="search-box"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search"
        />

        <div className="user-list">
          {userList.map((user) => (
            <div key={user._id} className="user-card" onClick={() => openChat(user)}>
              <img className="user-avatar" src={getProfilePic(user.profilepic)} />
              <div>
                <h3>{user.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT */}
      <div className={`chat-window ${isMobile ? (showChatMobile ? "active" : "") : ""}`}>

        {selectedChat ? (
          <>
            <div className="chat-header">
              {isMobile && <button onClick={backToUsers}>←</button>}
              <h2>{selectedChat.name}</h2>
            </div>

            {/* MESSAGES */}
            <div className="messages-area">
              {chatMessages.map((msg) => (
                <div key={msg._id} className={`message-bubble ${String(msg.senderId) === String(currentUserId) ? "sent" : "received"}`}>

                  <button onClick={() => singleDelete(msg._id)}>🗑</button>

                  {/* TEXT */}
                  {msg.message && <p>{msg.message}</p>}

                  {/* IMAGE */}
                  {msg.file && msg.fileType?.startsWith("image") && (
                    <img src={msg.file} className="message-media" onClick={() => setFullscreenImage(msg.file)} />
                  )}

                  {/* VIDEO */}
                  {msg.file && msg.fileType?.startsWith("video") && (
                    <video controls className="message-media">
                      <source src={msg.file} type={msg.fileType} />
                    </video>
                  )}

                  {/* AUDIO */}
                  {msg.file && msg.fileType?.startsWith("audio") && (
                    <audio controls>
                      <source src={msg.file} />
                    </audio>
                  )}

                  {/* PDF */}
                  {msg.file && msg.fileType === "application/pdf" && (
                    <a href={msg.file} target="_blank">Open PDF</a>
                  )}

                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="input-area">

              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type message"
              />

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,video/*,audio/*,application/pdf"
                onChange={(e) => {
                  const f = e.target.files[0]
                  if (f) {
                    setFile(f)
                    setPreview(URL.createObjectURL(f))
                  }
                }}
              />

              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <h2>Select Chat</h2>
        )}
      </div>

      {/* FULLSCREEN IMAGE */}
      {fullscreenImage && (
        <div onClick={() => setFullscreenImage(null)} className="fullscreen-overlay">
          <img src={fullscreenImage} />
        </div>
      )}
    </div>
  )
}

export default Home