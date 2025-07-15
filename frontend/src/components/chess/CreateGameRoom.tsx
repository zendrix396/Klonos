"use client";
import { useState } from 'react';
import { GameMode, TimeControl, GameRoom } from './multiplayer-types';

interface CreateGameRoomProps {
  onRoomCreated: (room: GameRoom, playerName: string) => void;
  onCancel: () => void;
}

export default function CreateGameRoom({ onRoomCreated, onCancel }: CreateGameRoomProps) {
  const [gameMode, setGameMode] = useState<GameMode>('standard');
  const [whiteTime, setWhiteTime] = useState<TimeControl>({ minutes: 10, seconds: 0, increment: 0 });
  const [blackTime, setBlackTime] = useState<TimeControl>({ minutes: 10, seconds: 0, increment: 0 });
  const [customPosition, setCustomPosition] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [sameTimeForBoth, setSameTimeForBoth] = useState(true);

  const handleCreateRoom = () => {
    const room: GameRoom = {
      id: generateRoomId(),
      hostId: generatePlayerId(),
      gameMode,
      timeControl: {
        white: whiteTime,
        black: sameTimeForBoth ? whiteTime : blackTime
      },
      customPosition: gameMode === 'custom' ? customPosition : undefined,
      status: 'waiting',
      createdAt: new Date()
    };

    onRoomCreated(room, playerName || 'Host');
  };

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const generatePlayerId = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  return (
    <div className="max-w-md mx-auto bg-stone-100 shadow-lg p-6 border border-stone-300">
      <h2 className="text-2xl font-bold mb-6 text-center text-stone-900 font-montserrat">Create Game Room</h2>
      
      {/* Player Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-stone-900 font-montserrat">Your Name (Optional)</label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="w-full p-2 border border-stone-300 bg-stone-100 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 font-montserrat"
          placeholder="Enter name or leave blank for 'Host'"
        />
      </div>

      {/* Game Mode */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-stone-900 font-montserrat">Game Mode</label>
        <select
          value={gameMode}
          onChange={(e) => setGameMode(e.target.value as GameMode)}
          className="w-full p-2 border border-stone-300 bg-stone-100 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 font-montserrat"
        >
          <option value="standard">Standard Chess</option>
          <option value="chess960">Chess960 (Fischer Random)</option>
          <option value="custom">Custom Position</option>
        </select>
      </div>

      {/* Custom Position */}
      {gameMode === 'custom' && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-stone-900 font-montserrat">Custom Position (FEN)</label>
          <input
            type="text"
            value={customPosition}
            onChange={(e) => setCustomPosition(e.target.value)}
            className="w-full p-2 border border-stone-300 bg-stone-100 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 font-mono text-sm"
            placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
          />
        </div>
      )}

      {/* Time Control */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 text-stone-900 font-montserrat">Time Control</label>
        
        {/* Same time for both players checkbox */}
        <div className="mb-3">
          <label className="flex items-center font-montserrat">
            <input
              type="checkbox"
              checked={sameTimeForBoth}
              onChange={(e) => setSameTimeForBoth(e.target.checked)}
              className="mr-2"
            />
            Same time for both players
          </label>
        </div>

        {/* White time */}
        <div className="mb-3">
          <label className="block text-xs font-medium mb-1 text-stone-900 font-montserrat">White Time</label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              max="180"
              value={whiteTime.minutes}
              onChange={(e) => setWhiteTime({...whiteTime, minutes: parseInt(e.target.value) || 0})}
              className="w-20 p-1 border border-stone-300 bg-stone-100 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 text-sm font-montserrat"
              placeholder="Min"
            />
            <span className="self-center text-sm font-montserrat">:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={whiteTime.seconds}
              onChange={(e) => setWhiteTime({...whiteTime, seconds: parseInt(e.target.value) || 0})}
              className="w-20 p-1 border border-stone-300 bg-stone-100 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 text-sm font-montserrat"
              placeholder="Sec"
            />
            <span className="self-center text-sm font-montserrat">+</span>
            <input
              type="number"
              min="0"
              max="30"
              value={whiteTime.increment}
              onChange={(e) => setWhiteTime({...whiteTime, increment: parseInt(e.target.value) || 0})}
              className="w-20 p-1 border border-stone-300 bg-stone-100 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 text-sm font-montserrat"
              placeholder="Inc"
            />
          </div>
        </div>

        {/* Black time (only if different) */}
        {!sameTimeForBoth && (
          <div className="mb-3">
            <label className="block text-xs font-medium mb-1 text-stone-900 font-montserrat">Black Time</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                max="180"
                value={blackTime.minutes}
                onChange={(e) => setBlackTime({...blackTime, minutes: parseInt(e.target.value) || 0})}
                className="w-20 p-1 border border-stone-300 bg-stone-100 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 text-sm font-montserrat"
                placeholder="Min"
              />
              <span className="self-center text-sm font-montserrat">:</span>
              <input
                type="number"
                min="0"
                max="59"
                value={blackTime.seconds}
                onChange={(e) => setBlackTime({...blackTime, seconds: parseInt(e.target.value) || 0})}
                className="w-20 p-1 border border-stone-300 bg-stone-100 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 text-sm font-montserrat"
                placeholder="Sec"
              />
              <span className="self-center text-sm font-montserrat">+</span>
              <input
                type="number"
                min="0"
                max="30"
                value={blackTime.increment}
                onChange={(e) => setBlackTime({...blackTime, increment: parseInt(e.target.value) || 0})}
                className="w-20 p-1 border border-stone-300 bg-stone-100 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 text-sm font-montserrat"
                placeholder="Inc"
              />
            </div>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-stone-900 text-stone-100 hover:bg-stone-100 hover:text-stone-900 border border-stone-900 transition-colors font-montserrat"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateRoom}
          className="flex-1 px-4 py-2 bg-stone-900 text-stone-100 hover:bg-stone-100 hover:text-stone-900 border border-stone-900 transition-colors font-montserrat"
        >
          Create Room
        </button>
      </div>
    </div>
  );
} 