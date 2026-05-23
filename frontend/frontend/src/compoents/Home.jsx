import React, { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import "./Home.css"
import axios from "axios"
import { io } from "socket.io-client"

const BASE_URL = "https://chatapplication-backend-v90l.onrender.com"

const Home = () => {
  const navigate = useNavigate()
  const location = useLocation()

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

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 720)
  const [showChatMobile, setShowChatMobile] = useState(false)

  const messagesEndRef = useRef(null)
  const socket = useRef(null)
  const fileInputRef = useRef(null)

  const currentUserId = localStorage.getItem("userId")
  const token = localStorage.getItem("token")

  // ================= RESIZE =================
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 720
      setIsMobile(mobile)
      if (!mobile) setShowChatMobile(false)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // ================= PROFILE =================
  const getProfilePic = (pic) => {
    if (!pic) return null
    if (pic.startsWith("http")) return pic
    return `${BASE_URL}${pic}`
  }

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
        <text x="50%" y="54%" text-anchor="middle" font-size="42" fill="white">
          ${initials}
        </text>
      </svg>
    `

    return `data:image/svg+xml;base64,${btoa(svg)}`
  }

  // ================= SOCKET =================
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

  useEffect(() => {
    fetchChat()
  }, [selectedChat])

  // ================= AUTO SCROLL =================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages])

  // ================= SEND =================
  const sendMessage = async () => {
    if (!selectedChat || (!newMessage.trim() && !file)) return

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

  // ================= MEDIA URL FIX =================
  const getFileUrl = (url) => {
    if (!url) return ""
    if (url.startsWith("http")) return url
    return `${BASE_URL}${url}`
  }

  // ================= UI =================
  return (
    <div className="container">

      {/* SIDEBAR */}
      <div className="results">

        <div className="header-row">
          <img
            src={
              getProfilePic(currentUser?.profilepic) ||
              getAvatarFallback(currentUser?.name)
            }
            className="searchProfile"
            onClick={() => navigate("/editProfile", { state: currentUser })}
          />

          <p className="profile-name">{currentUser?.name}</p>

          <button onClick={() => navigate("/")}>Logout</button>
        </div>

        <input
          className="search-box"
          placeholder="Search User"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="user-list">
          {userList.map((user) => (
            <div key={user._id} className="user-card" onClick={() => setSelectedChat(user)}>
              <img
                className="user-avatar"
                src={getProfilePic(user.profilepic) || getAvatarFallback(user.name)}
              />
              <div>
                <h3>{user.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT */}
      <div className="chat-window">

        {selectedChat ? (
          <>
            <div className="chat-header">
              <h2>{selectedChat.name}</h2>
            </div>

            <div className="messages-area">
              {chatMessages.map((msg) => (
                <div key={msg._id} className="message-bubble">

                  {/* IMAGE */}
                  {msg.fileType?.startsWith("image") && (
                    <img
                      className="message-media"
                      src={getFileUrl(msg.file)}
                      onClick={() => setFullscreenImage(getFileUrl(msg.file))}
                    />
                  )}

                  {/* VIDEO */}
                  {msg.fileType?.startsWith("video") && (
                    <video className="message-media" controls>
                      <source src={getFileUrl(msg.file)} type={msg.fileType} />
                    </video>
                  )}

                  {/* AUDIO */}
                  {msg.fileType?.startsWith("audio") && (
                    <audio controls>
                      <source src={getFileUrl(msg.file)} type={msg.fileType} />
                    </audio>
                  )}

                  {/* PDF FIX */}
                  {msg.fileType === "application/pdf" && (
                    <a
                      href={getFileUrl(msg.file)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open PDF
                    </a>
                  )}

                  {/* TEXT */}
                  {msg.message && <p>{msg.message}</p>}
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type message"
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
          <h2>Select a chat</h2>
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