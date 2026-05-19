import { createContext, useState, useEffect, useContext, useRef } from "react"
import io from "socket.io-client"

const SocketContext = createContext()

export const useSocketContext = () => useContext(SocketContext)

export const SocketContextProvider = ({ children, currentUser }) => {
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])

  const socketRef = useRef(null)

  useEffect(() => {
    if (!currentUser?._id) return

    // prevent duplicate connections
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }

    const socketInstance = io(
      "https://chatapplication-backend-v90l.onrender.com",
      {
        query: { userId: currentUser._id },
        transports: ["websocket"], // stable production connection
        reconnection: true
      }
    )

    socketRef.current = socketInstance
    setSocket(socketInstance)

    socketInstance.on("getOnlineUsers", (users) => {
      setOnlineUsers(users)
    })

    socketInstance.on("disconnect", () => {
      setOnlineUsers([])
    })

    return () => {
      socketInstance.disconnect()
      socketRef.current = null
      setSocket(null)
      setOnlineUsers([])
    }
  }, [currentUser?._id])

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  )
}