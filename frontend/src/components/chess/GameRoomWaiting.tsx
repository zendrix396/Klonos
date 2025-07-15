"use client";
import { useState, useEffect } from 'react';
import { GameRoom } from './multiplayer-types';

interface GameRoomWaitingProps {
  room: GameRoom;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  isHost: boolean;
  opponentJoined: boolean;
}

export default function GameRoomWaiting({ 
  room, 
  onStartGame, 
  onLeaveRoom, 
  isHost, 
  opponentJoined 
}: GameRoomWaitingProps) {
  const [copied, setCopied] = useState(false);
  
  const roomLink = `${window.location.origin}/room/${room.id}`;

  // Auto-start game when opponent joins for quick match
  useEffect(() => {
    if (opponentJoined) {
      const timer = setTimeout(() => {
        onStartGame();
      }, 1000); // 1 second delay for smooth transition
      
      return () => clearTimeout(timer);
    }
  }, [opponentJoined, onStartGame]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(roomLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const formatTime = (timeControl: any) => {
    const minutes = timeControl.minutes;
    const seconds = timeControl.seconds;
    const increment = timeControl.increment;
    
    let timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    if (increment > 0) {
      timeStr += ` +${increment}`;
    }
    return timeStr;
  };

  return (
    <div className="max-w-md mx-auto bg-stone-100 shadow-lg p-6 border border-stone-300">
      <h2 className="text-2xl font-bold mb-6 text-center text-stone-900 font-montserrat">
        {opponentJoined ? 'Starting Game...' : 'Waiting for Opponent'}
      </h2>
      
      {!opponentJoined && (
        <>
          {/* Room Info */}
          <div className="mb-6 p-4 bg-stone-200 border border-stone-300">
            <div className="mb-2">
              <span className="font-medium text-stone-900 font-montserrat">Room ID:</span> 
              <span className="ml-2 font-mono text-lg text-stone-900">{room.id}</span>
            </div>
            <div className="mb-2">
              <span className="font-medium text-stone-900 font-montserrat">Mode:</span> 
              <span className="ml-2 capitalize text-stone-900 font-montserrat">{room.gameMode}</span>
            </div>
            <div className="mb-2">
              <span className="font-medium text-stone-900 font-montserrat">Time Control:</span>
            </div>
            <div className="ml-4 text-sm">
              <div className="text-stone-900 font-montserrat">White: {formatTime(room.timeControl.white)}</div>
              <div className="text-stone-900 font-montserrat">Black: {formatTime(room.timeControl.black)}</div>
            </div>
          </div>

          {/* Share Room Link */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-stone-900 font-montserrat">Share this link for quick match:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomLink}
                readOnly
                className="flex-1 p-2 border border-stone-300 bg-stone-200 text-stone-900 text-sm font-mono"
              />
              <button
                onClick={copyToClipboard}
                className={`px-3 py-2 text-sm transition-colors border border-stone-900 font-montserrat ${
                  copied 
                    ? 'bg-stone-900 text-stone-100' 
                    : 'bg-stone-100 text-stone-900 hover:bg-stone-900 hover:text-stone-100'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Waiting Message */}
          <div className="mb-6 text-center text-stone-600">
            <div className="animate-pulse font-montserrat-italic">Waiting for opponent to join...</div>
            <div className="mt-2 text-sm font-montserrat">Game will start automatically when someone joins!</div>
          </div>
        </>
      )}

      {opponentJoined && (
        <div className="mb-6 text-center">
          <div className="text-green-600 font-montserrat text-lg mb-2">✓ Opponent Joined!</div>
          <div className="text-stone-600 font-montserrat-italic">Starting game in a moment...</div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onLeaveRoom}
          className="flex-1 px-4 py-2 bg-stone-900 text-stone-100 hover:bg-stone-100 hover:text-stone-900 border border-stone-900 transition-colors font-montserrat"
        >
          Leave Room
        </button>
        {isHost && opponentJoined && (
          <button
            onClick={onStartGame}
            className="flex-1 px-4 py-2 bg-stone-900 text-stone-100 hover:bg-stone-100 hover:text-stone-900 border border-stone-900 transition-colors font-montserrat"
          >
            Start Now
          </button>
        )}
      </div>
    </div>
  );
} 