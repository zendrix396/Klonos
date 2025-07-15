"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Board from "@/components/chess/Board";
import MainMenu from "@/components/chess/MainMenu";
import CreateGameRoom from "@/components/chess/CreateGameRoom";
import { useSocket } from "@/context/SocketContext";
import "./globals.css";

type ViewState = 'menu' | 'singlePlayer' | 'createRoom';

export default function Home() {
  const { socket } = useSocket();
  const router = useRouter();
  const [view, setView] = useState<ViewState>('menu');

  const handleCreateRoom = (roomConfig: any, playerName: string) => {
    if (!socket) return;
    
    // Set a flag in session storage to identify the user as the host on the next page
    sessionStorage.setItem('isHost', 'true');
    sessionStorage.setItem('playerName', playerName || 'Host');

    socket.emit('create-room', { ...roomConfig, playerName }, (response: { roomId: string }) => {
      if (response.roomId) {
        // Redirect the host to the room link
        router.push(`/room/${response.roomId}`);
      }
    });
  };

  return (
    <main className="min-h-screen bg-stone-100 flex items-center justify-center p-8">
      {view === 'menu' && (
        <MainMenu
          onSinglePlayer={() => setView('singlePlayer')}
          onCreateRoom={() => setView('createRoom')}
          onJoinRoom={() => {
              const roomId = prompt("Please enter the Room ID to join:");
              if (roomId) router.push(`/room/${roomId}`);
          }}
        />
      )}

      {view === 'singlePlayer' && (
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => setView('menu')}
            className="px-4 py-2 bg-stone-900 text-stone-100 hover:bg-stone-100 hover:text-stone-900 border border-stone-900 transition-colors font-montserrat"
          >
            ← Back to Menu
          </button>
          <Board />
        </div>
      )}

      {view === 'createRoom' && (
        <CreateGameRoom
          onRoomCreated={handleCreateRoom}
          onCancel={() => setView('menu')}
        />
      )}
    </main>
  );
}
