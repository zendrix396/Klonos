"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected with new id:', newSocket.id);
      
      const oldSocketId = sessionStorage.getItem('socketId');
      const roomId = sessionStorage.getItem('roomId');
      
      if (oldSocketId && roomId && oldSocketId !== newSocket.id) {
        console.log(`Attempting to reconnect to room ${roomId} as old user ${oldSocketId}`);
        newSocket.emit('reconnect-player', { roomId, oldSocketId }, (response: any) => {
            if (response.success) {
                console.log('Successfully reconnected.');
            } else {
                console.log('Reconnection failed:', response.error);
                sessionStorage.removeItem('socketId');
                sessionStorage.removeItem('roomId');
            }
        });
      }

      // Store the new socket id for potential future reconnections
      sessionStorage.setItem('socketId', newSocket.id);
    });

    // Disconnect on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}; 