"use client";
import { useState, useEffect } from 'react';

interface JoinRoomProps {
  onJoinRoom: (roomId: string, playerName: string) => void;
  onCancel: () => void;
  initialRoomId?: string;
}

export default function JoinRoom({ onJoinRoom, onCancel, initialRoomId }: JoinRoomProps) {
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');

  useEffect(() => {
    if (initialRoomId) {
      setRoomId(initialRoomId.toUpperCase());
    }
  }, [initialRoomId]);

  const handleJoin = () => {
    if (!roomId.trim()) {
      alert('Please enter a room ID');
      return;
    }
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    onJoinRoom(roomId.toUpperCase(), playerName);
  };

  return (
    <div className="max-w-md mx-auto bg-stone-100 shadow-lg p-6 border border-stone-300">
      <h2 className="text-2xl font-bold mb-6 text-center text-stone-900 font-montserrat">Join Game Room</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-stone-900 font-montserrat">Your Name</label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full p-2 border border-stone-300 bg-stone-100 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 font-montserrat"
          placeholder="Enter your name"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 text-stone-900 font-montserrat">Room ID</label>
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value.toUpperCase())}
          className="w-full p-2 border border-stone-300 bg-stone-100 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono text-lg text-center"
          placeholder="Enter room ID"
          maxLength={6}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-stone-900 text-stone-100 hover:bg-stone-100 hover:text-stone-900 border border-stone-900 transition-colors font-montserrat"
        >
          Cancel
        </button>
        <button
          onClick={handleJoin}
          className="flex-1 px-4 py-2 bg-stone-900 text-stone-100 hover:bg-stone-100 hover:text-stone-900 border border-stone-900 transition-colors font-montserrat"
        >
          Join Room
        </button>
      </div>
    </div>
  );
} 