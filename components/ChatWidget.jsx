"use client";
import { useState } from "react";
import { Bot, X } from "lucide-react";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-[999] w-14 h-14 rounded-full 
        bg-gradient-to-br from-green-700 to-green-900 
        text-white flex items-center justify-center 
        shadow-lg hover:scale-110 transition-all duration-300"
      >
        {open ? <X size={26} /> : <Bot size={26} />}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed right-5 z-[999] transition-all duration-500 ${
          open
            ? "bottom-24 opacity-100 scale-100"
            : "bottom-16 opacity-0 scale-90 pointer-events-none"
        }`}
      >
        <div
          className="w-[350px] h-[500px] bg-[#0F1A14] rounded-2xl overflow-hidden 
          shadow-2xl border border-green-900 backdrop-blur-lg"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-800 to-green-900 text-white">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-semibold">AI Assistant</span>
            </div>
            <button onClick={() => setOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Chat iframe */}
          <iframe
            src="https://local-collab-ai.vercel.app"
            className="w-full h-[calc(100%-48px)] border-none"
          />
        </div>
      </div>
    </>
  );
}