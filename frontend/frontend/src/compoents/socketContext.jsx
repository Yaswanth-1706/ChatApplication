import { createContext, useState, useEffect, useContext } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

// Hook to use socket and online list in any component
export const useSocketContext = () => useContext(SocketContext);

export const SocketContextProvider = ({ children, currentUser }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]); // This stores the list of userIds

  useEffect(() => {
    if (currentUser) {
      // Initialize connection pointing to the live Render backend URL
      const socketInstance = io("https://chatapplication-backend-v90l.onrender.com", {
        query: { userId: currentUser._id },
      });

      setSocket(socketInstance);

      // LISTENER: Catch the "getOnlineUsers" broadcast from your backend
      socketInstance.on("getOnlineUsers", (users) => {
        setOnlineUsers(users); // users is an array: ['id1', 'id2', ...]
      });

      return () => {
        socketInstance.close();
        setSocket(null);
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [currentUser]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
};