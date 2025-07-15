"use client";

interface MainMenuProps {
  onSinglePlayer: () => void;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
}

export default function MainMenu({ onSinglePlayer, onCreateRoom, onJoinRoom }: MainMenuProps) {
  return (
    <div className="max-w-md mx-auto bg-stone-100 shadow-lg p-8 border border-stone-300">
      <h1 className="text-3xl font-bold mb-8 text-center text-stone-900 font-montserrat">Chess Game</h1>
      
      <div className="space-y-4">
        <button
          onClick={onSinglePlayer}
          className="w-full px-6 py-3 bg-stone-900 text-stone-100 hover:bg-stone-100 hover:text-stone-900 border border-stone-900 transition-colors text-lg font-medium font-montserrat"
        >
          Single Player
        </button>
        
        <div className="text-center text-stone-600 font-medium font-montserrat-italic">
          Multiplayer
        </div>
        
        <button
          onClick={onCreateRoom}
          className="w-full px-6 py-3 bg-stone-900 text-stone-100 hover:bg-stone-100 hover:text-stone-900 border border-stone-900 transition-colors text-lg font-medium font-montserrat"
        >
          Create Room
        </button>
        
        <button
          onClick={onJoinRoom}
          className="w-full px-6 py-3 bg-stone-900 text-stone-100 hover:bg-stone-100 hover:text-stone-900 border border-stone-900 transition-colors text-lg font-medium font-montserrat"
        >
          Join Room
        </button>
      </div>
      
      <div className="mt-8 text-center text-sm text-stone-600 font-montserrat">
        <p className="font-montserrat-italic">Features:</p>
        <ul className="mt-2 space-y-1 font-montserrat">
          <li>• Standard Chess & Chess960</li>
          <li>• Custom positions</li>
          <li>• Flexible time controls</li>
          <li>• Share room links with friends</li>
        </ul>
      </div>
    </div>
  );
} 