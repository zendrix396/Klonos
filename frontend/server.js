const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const rooms = {};

// --- Game Logic on Server ---
function createInitialBoard() {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    const p = (type, color) => ({ type, color, image: `pieces/${color}_${type}.png` });
  
    // Black pieces
    board[0] = [p('rook','black'), p('knight','black'), p('bishop','black'), p('queen','black'), p('king','black'), p('bishop','black'), p('knight','black'), p('rook','black')];
    board[1] = Array(8).fill(p('pawn', 'black'));
  
    // White pieces
    board[7] = [p('rook','white'), p('knight','white'), p('bishop','white'), p('queen','white'), p('king','white'), p('bishop','white'), p('knight','white'), p('rook','white')];
    board[6] = Array(8).fill(p('pawn', 'white'));
    
    return board;
}

function createInitialGameState() {
    return {
        board: createInitialBoard(),
        currentPlayer: 'white',
        castlingRights: { white: { k: true, q: true }, black: { k: true, q: true } },
        enPassantTarget: null,
        halfMoveClock: 0,
        fullMoveNumber: 1,
        isCheck: false, isCheckmate: false, isStalemate: false, moveHistory: []
    };
}

// This function must exist on the server to update its own state
function makeServerMove(gameState, from, to) {
    const newGameState = JSON.parse(JSON.stringify(gameState)); // Deep copy
    const piece = newGameState.board[from.row][from.col];
    
    // Basic move logic
    newGameState.board[to.row][to.col] = piece;
    newGameState.board[from.row][from.col] = null;
    
    // Switch player
    newGameState.currentPlayer = newGameState.currentPlayer === 'white' ? 'black' : 'white';
    
    // In a full implementation, you'd have the full legal move validation here
    // For now, we trust the client's validation and just update state.
    return newGameState;
}

// --- End Game Logic ---

// Helper to manage timers
const startTimer = (roomId) => {
  const room = rooms[roomId];
  // First, always clear any existing timer to prevent duplicates.
  if (room && room.timer && room.timer.interval) {
    clearInterval(room.timer.interval);
    room.timer.interval = null;
  }
  // Now, start a new one.
  if (!room || !room.timer) return;

  room.timer.interval = setInterval(() => {
    const turn = room.gameState.currentPlayer;
    if (room.timer[turn] > 0) {
      room.timer[turn]--;
      io.to(roomId).emit('time-update', {
        white: room.timer.white,
        black: room.timer.black,
      });
    } else {
      // Handle timeout
      clearInterval(room.timer.interval);
      io.to(roomId).emit('game-over', { winner: turn === 'white' ? 'black' : 'white', reason: 'timeout' });
    }
  }, 1000);
};

const stopTimer = (roomId) => {
    const room = rooms[roomId];
    if (room && room.timer && room.timer.interval) {
        clearInterval(room.timer.interval);
        room.timer.interval = null;
    }
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('create-room', (data, callback) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    rooms[roomId] = {
      id: roomId,
      players: [{ id: socket.id, name: data.playerName, isHost: true }],
      gameMode: data.gameMode,
      timeControl: data.timeControl,
      gameState: null, // Game state will be created when guest joins
    };
    socket.join(roomId);
    console.log(`Room created: ${roomId} by host ${socket.id}`);
    callback({ roomId });
  });

  socket.on('join-room', (data, callback) => {
    const { roomId, playerName } = data;
    const room = rooms[roomId];

    if (!room) return callback({ error: 'Room not found.' });
    
    const playerInRoom = room.players.find(p => p.id === socket.id);

    // Only reject if the room is full AND this is a new player.
    if (room.players.length >= 2 && !playerInRoom) {
      return callback({ error: 'Room is full.' });
    }

    // Add the player if they are not already in the room.
    if (!playerInRoom) {
        room.players.push({ id: socket.id, name: playerName || 'Anonymous', isHost: false });
    }
    
    socket.join(roomId);
    
    // If we now have two players, start the game
    if (room.players.length === 2) {
        const host = room.players.find(p => p.isHost);
        const guest = room.players.find(p => !p.isHost);

        if (Math.random() > 0.5) {
            host.color = 'white';
            guest.color = 'black';
        } else {
            host.color = 'black';
            guest.color = 'white';
        }

        // Initialize server-side game state
        room.gameState = createInitialGameState();
        room.timer = {
            white: room.timeControl.white.minutes * 60,
            black: room.timeControl.black.minutes * 60,
            interval: null,
        }

        io.to(roomId).emit('game-start', {
            players: room.players,
            gameState: room.gameState,
            timeControl: room.timeControl
        });
        startTimer(roomId);
    }

    callback({ success: true, room: { id: room.id, players: room.players } });
  });

  socket.on('make-move', (data) => {
    const { roomId, from, to } = data;
    const room = rooms[roomId];
    if (!room || !room.gameState) return;

    stopTimer(roomId);
    
    // Update server's game state
    room.gameState = makeServerMove(room.gameState, from, to);
    
    const turn = room.gameState.currentPlayer === 'white' ? 'black' : 'white'; // The player who just moved
    const increment = room.timeControl[turn].increment;
    room.timer[turn] += increment;
    
    // Broadcast the NEW game state to all clients
    io.to(roomId).emit('game-state-update', room.gameState);
    
    startTimer(roomId);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const player = room.players.find(p => p.id === socket.id);
      if (player && !player.disconnected) { // Only handle first disconnect
        player.disconnected = true;
        stopTimer(roomId);
        console.log(`Player ${player.name} marked as disconnected from room ${roomId}.`);
        
        // Notify other player
        socket.to(roomId).emit('player-disconnected', { playerId: socket.id, playerName: player.name });

        // Set a timeout to delete the room if the player doesn't reconnect
        room.deleteTimeout = setTimeout(() => {
            console.log(`Room ${roomId} deleted due to disconnect timeout.`);
            io.to(roomId).emit('opponent-left', { message: 'Your opponent has disconnected for too long.' });
            delete rooms[roomId];
        }, 60000); // 60-second grace period
        break;
      }
    }
  });

  socket.on('reconnect-player', (data, callback) => {
    const { roomId, oldSocketId } = data;
    const room = rooms[roomId];
    if (room) {
        const player = room.players.find(p => p.id === oldSocketId && p.disconnected);
        if (player) {
            player.id = socket.id; // Update to new socket ID
            player.disconnected = false;
            
            if (room.deleteTimeout) {
                clearTimeout(room.deleteTimeout);
                room.deleteTimeout = null;
                console.log(`Player ${player.name} reconnected to room ${roomId}. Timeout cleared.`);
            }

            socket.join(roomId);
            io.to(roomId).emit('player-reconnected', { playerId: socket.id, name: player.name });
            
            // If both players are now connected, restart the timer
            const allConnected = room.players.every(p => !p.disconnected);
            if (room.players.length === 2 && allConnected) {
                startTimer(roomId);
            }

            callback({ success: true, room, player });
            return;
        }
    }
    callback({ error: 'Could not reconnect.' });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
}); 