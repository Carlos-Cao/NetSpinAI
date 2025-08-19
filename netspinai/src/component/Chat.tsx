"use client";

import { useState, useRef, useEffect } from "react";
import { Message } from "../types/types";

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input, history: updatedMessages }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "Sorry, I couldn't generate a response.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, there was an error processing your request.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-800">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-white mb-4">NetSpinAI</h2>
              <p className="text-gray-400 text-lg">
                Ready to spin up some ideas?
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`w-full ${
                message.isUser ? "bg-gray-800" : "bg-gray-700"
              }`}
            >
              <div className="max-w-4xl mx-auto px-4 py-6 flex gap-6">
                <div className="flex-shrink-0">
                  {message.isUser ? (
                    <div className="w-8 h-8 bg-purple-600 rounded-sm flex items-center justify-center text-white text-sm font-semibold">
                      U
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-green-600 rounded-sm flex items-center justify-center text-white text-sm font-semibold">
                      AI
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-white whitespace-pre-wrap leading-relaxed">
                    {message.text}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="w-full bg-gray-700">
            <div className="max-w-4xl mx-auto px-4 py-6 flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-600 rounded-sm flex items-center justify-center text-white text-sm font-semibold">
                  AI
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-700 bg-gray-800 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-center">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Send a message..."
              className="flex-1 resize-none bg-gray-700 text-white rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[44px] max-h-32"
              disabled={isLoading}
              rows={1}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className={`${
                  input.trim() && !isLoading ? "text-white" : "text-gray-500"
                }`}
              >
                <path
                  d="M7 11L12 6L17 11M12 18V7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-2 text-center">
            <p>Responses are AI-generated and may not always be accurate.</p>
            <a href="https://github.com/Carlos-Cao">
              <p>&copy; {new Date().getFullYear()} Carlos-Cao</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
