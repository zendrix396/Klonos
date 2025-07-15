"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Board from '@/components/chess/Board';
import { useSocket } from '@/context/SocketContext';
import { GameState as ChessGameState, Position } from "@/components/chess/types";
import { makeMove, createInitialGameState } from '@/components/chess/game-logic';

interface Player {
  id: string;
  name: string;
  color: 'white' | 'black';
}

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

export default function RoomPage() {
  const { socket } = useSocket();
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;
  
  const [view, setView] = useState<'waiting' | 'playing' | 'error'>('waiting');
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('Waiting for opponent...');

  // Game State
  const [chessGameState, setChessGameState] = useState<ChessGameState | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [opponent, setOpponent] = useState<Player | null>(null);
  const [times, setTimes] = useState<{ white: number, black: number } | null>(null);
  
  const joinRoom = useCallback(() => {
    if (!socket || !roomId) return;
    const isHost = sessionStorage.getItem('isHost') === 'true';
    const playerName = sessionStorage.getItem('playerName') || 'Anonymous';
    
    // Store room ID for potential reconnections
    sessionStorage.setItem('roomId', roomId);

    socket.emit('join-room', { roomId, playerName, isHost }, (response: any) => {
      if (response.error) {
        setErrorMessage(response.error);
        setView('error');
      }
    });
  }, [socket, roomId]);

  useEffect(() => {
    if (socket) {
      joinRoom();

      const onGameStart = (data: { players: Player[], gameState: ChessGameState, timeControl: any }) => {
        const self = data.players.find((p: Player) => p.id === socket.id);
        const other = data.players.find((p: Player) => p.id !== socket.id);
        
        if (self && other) {
          setPlayer(self);
          setOpponent(other);
          setChessGameState(data.gameState); // Set game state from server
          setTimes({
              white: data.timeControl.white.minutes * 60 + data.timeControl.white.seconds,
              black: data.timeControl.black.minutes * 60 + data.timeControl.black.seconds,
          })
          setView('playing');
        } else {
          setErrorMessage('Could not initialize game.');
          setView('error');
        }
      };

      // Listen for the full game state update
      const onGameStateUpdate = (newGameState: ChessGameState) => {
        setChessGameState(newGameState);
      };
      
      const onTimeUpdate = (newTimes: { white: number, black: number }) => {
          setTimes(newTimes);
      }

      const onPlayerDisconnected = (data: { playerName: string }) => {
          setStatusMessage(`${data.playerName} disconnected. Waiting for reconnection...`);
      }

      const onPlayerReconnected = (data: { name: string }) => {
          setStatusMessage(`${data.name} reconnected.`);
          // Clear message after a few seconds
          setTimeout(() => setStatusMessage(""), 3000);
      }

      const onOpponentLeft = () => {
        alert('Your opponent has left the game.');
        sessionStorage.removeItem('roomId');
        sessionStorage.removeItem('isHost');
        sessionStorage.removeItem('playerName');
        router.push('/');
      };

      socket.on('game-start', onGameStart);
      socket.on('game-state-update', onGameStateUpdate);
      socket.on('time-update', onTimeUpdate);
      socket.on('player-disconnected', onPlayerDisconnected);
      socket.on('player-reconnected', onPlayerReconnected);
      socket.on('opponent-left', onOpponentLeft);

      return () => {
        socket.off('game-start', onGameStart);
        socket.off('game-state-update', onGameStateUpdate);
        socket.off('time-update', onTimeUpdate);
        socket.off('player-disconnected', onPlayerDisconnected);
        socket.off('player-reconnected', onPlayerReconnected);
        socket.off('opponent-left', onOpponentLeft);
      };
    }
  }, [socket, joinRoom, router]);

  const handleMakeMove = (from: Position, to: Position) => {
    // Client no longer calculates the next state. It just sends the move.
    if (socket && player?.color === chessGameState?.currentPlayer) {
      socket.emit('make-move', { roomId, from, to });
    }
  };

  const renderPlayerInfo = (p: Player, time: number) => (
    <div className="px-4 py-2 bg-stone-200 text-stone-900 border border-stone-300 font-montserrat w-48 text-center">
        <p className="font-bold">{p.name} ({p.color})</p>
        <p className="text-2xl font-mono">{formatTime(time)}</p>
    </div>
  );

  const getPlayerForColor = (color: 'white' | 'black') => {
      if (player?.color === color) return player;
      return opponent;
  }

  if (view === 'error') {
    return (
      <main className="min-h-screen bg-stone-100 flex items-center justify-center p-8">
        <div className="max-w-md mx-auto bg-stone-100 shadow-lg p-6 border border-stone-300 text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-600 font-montserrat">Error</h2>
            <p className="text-stone-900 font-montserrat mb-6">{errorMessage}</p>
            <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-stone-900 text-stone-100 hover:bg-stone-100 hover:text-stone-900 border border-stone-900 transition-colors font-montserrat"
            >
                Back to Menu
            </button>
        </div>
      </main>
    )
  }

  if (view === 'waiting') {
      return (
          <main className="min-h-screen bg-stone-100 flex items-center justify-center p-8">
              <div className="max-w-md mx-auto bg-stone-100 shadow-lg p-6 border border-stone-300 text-center">
                  <h2 className="text-2xl font-bold mb-4 text-stone-900 font-montserrat animate-pulse">
                      {statusMessage}
                  </h2>
                  <p className="text-stone-600 font-montserrat-italic">Room ID: {roomId}</p>
                  <p className="text-sm text-stone-500 mt-4">Share this page's link to invite someone.</p>
              </div>
          </main>
      )
  }

  if (view === 'playing' && player && opponent && chessGameState && times) {
    const whitePlayer = getPlayerForColor('white');
    const blackPlayer = getPlayerForColor('black');
    const isBoardFlipped = player.color === 'black';

    // Player order depends on board orientation
    const topPlayer = isBoardFlipped ? whitePlayer : blackPlayer;
    const bottomPlayer = isBoardFlipped ? blackPlayer : whitePlayer;
    const topTime = isBoardFlipped ? times.white : times.black;
    const bottomTime = isBoardFlipped ? times.black : times.white;
    
    return (
      <main className="min-h-screen bg-stone-100 flex items-center justify-center p-2 sm:p-4">
        <div className="flex flex-col items-center gap-2">
          {topPlayer && renderPlayerInfo(topPlayer, topTime)}
          <Board
            onMove={handleMakeMove}
            externalGameState={chessGameState}
            playerColor={player.color}
            isMyTurn={player.color === chessGameState.currentPlayer}
          />
          {bottomPlayer && renderPlayerInfo(bottomPlayer, bottomTime)}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-100 flex items-center justify-center p-8">
        <p>Connecting to room...</p>
    </main>
  );
} 