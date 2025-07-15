import Board from "@/components/chess/Board";
import "./globals.css";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <Board />
    </main>
  );
}
