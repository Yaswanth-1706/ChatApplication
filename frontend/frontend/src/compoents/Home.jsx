import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Home.css";
import axios from "axios";
import { io } from "socket.io-client";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ================= STATES =================
  const [searchTerm, setSearchTerm] = useState("");
  const [userList, setUserList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  //REFS 
  const messagesEndRef = useRef(null);
  const socket = useRef(null);
  const fileInputRef = useRef(null); // Ref added to handle input clearing
  //AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);
  //AUTH
  const currentUserId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  //SOCKET
  useEffect(() => {
    if (!currentUserId) return;

    socket.current = io("http://localhost:8000", {
      query: { userId: currentUserId }
    });

    socket.current.on("getOnlineUsers", setOnlineUsers);

    socket.current.on("newMessage", (msg) => {
      setSelectedChat((prev) => {
        if (prev && String(msg.senderId) === String(prev._id)) {
          setChatMessages((old) => [...old, msg]);
        }
        return prev;
      });
    });

    return () => socket.current?.disconnect();
  }, [currentUserId]);

  //FETCH USERS
  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/user/search?search=${searchTerm || "a"}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserList(
        res.data.filter((u) => String(u._id) !== String(currentUserId))
      );
    } catch (err) {
      console.log(err);
    }
  };

  //FETCH CHAT
  const fetchChat = async () => {
    if (!selectedChat) return;
    try {
      const res = await axios.get(
        `http://localhost:8000/message/${selectedChat._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChatMessages(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  //HELPER TO CLEAR FILE INPUT
  const clearFileSelection = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Resets the DOM input value to allow selecting the same file
    }
  };
  //SEND MESSAGE
  const sendMessage = async () => {
    if ((!newMessage.trim() && !file) || !selectedChat) return;
    try {
      const formData = new FormData();
      formData.append("message", newMessage);
      if (file) formData.append("file", file);

      const res = await axios.post(
        `http://localhost:8000/message/send/${selectedChat._id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setChatMessages((prev) => [...prev, res.data.newMessage]);
        setNewMessage("");
        clearFileSelection(); // Clears internal state and resets HTML element
      }
    } catch (err) {
      console.log(err);
    }
  };

  //DELETE CHAT 
  const deleteChat = async () => {
    if (!selectedChat) return;
    if (!window.confirm("Delete whole chat?")) return;
    try {
      await axios.delete(
        `http://localhost:8000/message/delete/${selectedChat._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChatMessages([]);
      setSelectedChat(null);
    } catch (err) {
      console.log(err);
    }
  };

  //DELETE SINGLE MESSAGE 
  const singleDelete = async (messageId) => {
    try {
      await axios.delete(
        `http://localhost:8000/message/singleDelete/${messageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChatMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (err) {
      console.log(err);
    }
  };

  //NAVIGATE HELPERS
  const goToMyProfile = () => {
    navigate("/editProfile", {
      state: {
        img: `http://localhost:8000${location.state.profilepic}`,
        name: location.state.name,
        email: location.state.email,
        gender: location.state.gender,
      },
    });
  };

  const goToUserProfile = (user, e) => {
    e?.stopPropagation();
    navigate("/viewProfile", {
      state: {
        img: `http://localhost:8000${user.profilepic}`,
        name: user.name,
        email: user.email,
        gender: user.gender,
      },
    });
  };

  //EFFECTS
  useEffect(() => { fetchUsers(); }, [searchTerm]);
  useEffect(() => { fetchChat(); }, [selectedChat]);
  //LOGOUT
  const logout = () => {
    socket.current?.disconnect();
    localStorage.clear();
    navigate("/");
  };

  if (!location.state) return <h1>No User Data Found</h1>;
  // UI
  return (
    <div className="container">
      {/*SIDEBAR */}
      <div className="results">
        <div className="header-row">
          <img
            src={`http://localhost:8000${location.state.profilepic}`}
            className="searchProfile"
            alt="profile"
            title="View my profile"
            onClick={goToMyProfile}
          />
          <p className="welcome-name">{location.state.name}</p>
          <button className="logout" onClick={logout}>
            Logout
          </button>
        </div>

        <input
          className="searchBox"
          placeholder="Search User"
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="user-list">
          {userList.map((user) => (
            <div
              key={user._id}
              className={`card ${selectedChat?._id === user._id ? "active" : ""}`}
              onClick={() => setSelectedChat(user)}
            >
              <img
                src={`http://localhost:8000${user.profilepic}`}
                className="searchProfile"
                alt=""
                title={`View ${user.name}'s profile`}
                onClick={(e) => goToUserProfile(user, e)}
              />
              <div>
                <h3>{user.name}</h3>
                <p>
                  {onlineUsers.includes(user._id) ? "🟢 Online" : "⚫ Offline"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/*CHAT WINDOW*/}
      <div className="chat-window">
        {selectedChat ? (
          <>
            {/* HEADER */}
            <header className="chat-header">
              <img
                src={`http://localhost:8000${selectedChat.profilepic}`}
                alt=""
                title={`View ${selectedChat.name}'s profile`}
                onClick={(e) => goToUserProfile(selectedChat, e)}
              />
              <div>
                <h2>{selectedChat.name}</h2>
                <p>
                  {onlineUsers.includes(selectedChat._id) ? "🟢 Online" : "⚫ Offline"}
                </p>
              </div>
              <button className="delete-chat-btn" onClick={deleteChat}>
                Delete Chat
              </button>
            </header>

            {/* MESSAGES */}
            <div className="messages-area">
              {chatMessages.map((msg) => (
                <div
                  key={msg._id}
                  className={`message-bubble ${
                    String(msg.senderId) === String(currentUserId) ? "sent" : "received"
                  }`}
                >
                  <button
                    className="delete-message-btn"
                    onClick={() => singleDelete(msg._id)}
                  >
                    🗑
                  </button>

                  {msg.message && <p>{msg.message}</p>}

                  {msg.file && msg.fileType?.startsWith("image") && (
                    <img
                      src={`http://localhost:8000${msg.file}`}
                      className="chat-image"
                      alt="chat"
                      onClick={() => setFullscreenImage(`http://localhost:8000${msg.file}`)}
                    />
                  )}

                  {msg.file && msg.fileType?.startsWith("video") && (
                    <video controls className="chat-video">
                      <source src={`http://localhost:8000${msg.file}`} type={msg.fileType} />
                    </video>
                  )}

                  {msg.file && msg.fileType?.startsWith("audio") && (
                    <audio controls>
                      <source src={`http://localhost:8000${msg.file}`} type={msg.fileType} />
                    </audio>
                  )}

                  {msg.file && msg.fileType === "application/pdf" && (
                    <a href={`http://localhost:8000${msg.file}`} target="_blank" rel="noreferrer">
                      📄 Open PDF
                    </a>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT & PREVIEW AREA */}
            <div className="input-area">
              {/* FILE PREVIEW */}
              {preview && (
                <div className="file-preview">
                  {file?.type?.startsWith("image") && (
                    <img src={preview} alt="preview" className="preview-thumb" />
                  )}
                  {file?.type?.startsWith("video") && (
                    <video src={preview} className="preview-thumb" />
                  )}
                  {file?.type?.startsWith("audio") && (
                    <audio src={preview} controls className="preview-audio" />
                  )}
                  {file?.type === "application/pdf" && (
                    <span className="preview-pdf">📄 {file.name}</span>
                  )}
                  <button className="preview-remove-btn" onClick={clearFileSelection}>
                    ✕
                  </button>
                </div>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  placeholder="Type message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />

                <label className="file-label">
                  📎
                  <input
                    type="file"
                    hidden
                    ref={fileInputRef} /* Attached ref here */
                    accept="image/*,video/*,audio/*,.pdf"
                    onChange={(e) => {
                      const f = e.target.files[0];
                      if (f) {
                        setFile(f);
                        setPreview(URL.createObjectURL(f));
                      }
                    }}
                  />
                </label>

                <button onClick={sendMessage}>Send</button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">Select a chat to start messaging</div>
        )}
      </div>

      {/* FULLSCREEN IMAGE OVERLAY */}
      {fullscreenImage && (
        <div className="fullscreen-overlay" onClick={() => setFullscreenImage(null)}>
          <img src={fullscreenImage} className="fullscreen-image" alt="fullscreen" />
        </div>
      )}
    </div>
  );
};

export default Home;