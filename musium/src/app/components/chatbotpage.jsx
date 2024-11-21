"use client";
import React, { useState, useEffect, useRef } from "react";
import styles from "./components.module.css";
import Link from "next/link";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone, faPlus } from "@fortawesome/free-solid-svg-icons";

const ChatbotPage = () => {
  const [name, setName] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [savedChats, setSavedChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentChatIndex, setCurrentChatIndex] = useState(null);
  const [showChatbotImage, setShowChatbotImage] = useState(true);
  const userid = 54515;

  const chatHistoryRef = useRef(null);

  useEffect(() => {
    // Load saved chats and current chat from localStorage on component mount
    const savedChatsFromStorage = localStorage.getItem("savedChats");
    const currentChatIndexFromStorage = localStorage.getItem("currentChatIndex");
    const chatHistoryFromStorage = localStorage.getItem("chatHistory");

    if (savedChatsFromStorage) {
      setSavedChats(JSON.parse(savedChatsFromStorage));
    }
    if (currentChatIndexFromStorage) {
      setCurrentChatIndex(Number(currentChatIndexFromStorage));
    }
    if (chatHistoryFromStorage) {
      setChatHistory(JSON.parse(chatHistoryFromStorage));
    }
  }, []);

  useEffect(() => {
    // Save chats to localStorage whenever they are updated
    localStorage.setItem("savedChats", JSON.stringify(savedChats));
  }, [savedChats]);

  useEffect(() => {
    localStorage.setItem("currentChatIndex", currentChatIndex);
    localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
  }, [currentChatIndex, chatHistory]);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleMicClick = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Sorry, your browser doesn't support speech recognition.");
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.start();

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setName(speechResult);
      handleGreetSubmit({ preventDefault: () => {} });
    };

    recognition.onerror = (event) => {
      alert("Couldn't recognize speech, please try again.");
    };
  };

  const formatMessage = (message) => {
    let formatted = message.replace(/\*\*\*(.*?)\*\*\*/g, "<strong>$1</strong>");
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");
    formatted = formatted.replace(/\n/g, "<br>");
    return formatted;
  };

  const handleGreetSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setChatHistory((prev) => [...prev, { sender: "user", text: name }]);
    setLoading(true);
    setShowChatbotImage(false);

    try {
      const res = await axios.post("http://localhost:8000/api/chatbot/", {
        name,
        userid,
      });
      const responseMessage = res.data.message || "Hello!";

      // Save user and bot messages in savedChats
      if (currentChatIndex === null) {
        const chatName = name.split(" ").slice(0, 3).join(" ") + "...";
        const newChat = {
          name: chatName,
          history: [
            { sender: "user", text: name },
            { sender: "bot", text: responseMessage },
          ],
        };
        setSavedChats((prev) => [...prev, newChat]);
        setCurrentChatIndex(savedChats.length);
      } else {
        const updatedChats = [...savedChats];
        updatedChats[currentChatIndex].history.push(
          { sender: "user", text: name },
          { sender: "bot", text: responseMessage }
        );
        setSavedChats(updatedChats);
      }

      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: responseMessage },
      ]);
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
      setName("");
    }
  };

  const handleNewChat = () => {
    setChatHistory([]);
    setCurrentChatIndex(null);
    setShowChatbotImage(true);
  };

  const handleChatClick = (index) => {
    const selectedChat = savedChats[index];
    if (selectedChat) {
      setChatHistory(selectedChat.history); // Load the entire history
      setCurrentChatIndex(index);
      setShowChatbotImage(false);
    }
  };

  const handleDeleteChat = (index) => {
    const updatedChats = savedChats.filter((_, i) => i !== index);
    setSavedChats(updatedChats);
    if (currentChatIndex === index) {
      setChatHistory([]);
      setCurrentChatIndex(null);
      setShowChatbotImage(true);
    }
  };

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <h3>ASTRA-THE CHATBOT</h3>
        <button className={styles.newChatButton} onClick={handleNewChat}>
          <FontAwesomeIcon icon={faPlus} /> New Chat
        </button>
        <div className={styles.savedChats}>
          {savedChats.map((chat, index) => (
            <div
              key={index}
              className={`${styles.chatItem} ${
                index === currentChatIndex ? styles.activeChat : ""
              }`}
              onClick={() => handleChatClick(index)}
            >
              <span>{chat.name}</span>
              <button
                className={styles.deleteButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChat(index);
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.chatbotDisplay}>
          <div className={styles.topButtons}>
            <Link href="/show">
              <button className={styles.topButton}>Show Tickets</button>
            </Link>
            <Link href="/book">
              <button className={styles.topButton}>Book Tickets</button>
            </Link>
            <Link href="/api/auth/signout">
              <button className={styles.topButton}>Logout</button>
            </Link>
          </div>

          {showChatbotImage && (
            <img
              src="/chatbot.png"
              alt="Chatbot"
              className={styles.chatbotImage}
            />
          )}

          <div className={styles.chatHistory} ref={chatHistoryRef}>
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`${styles.chatBubble} ${
                  chat.sender === "user" ? styles.userBubble : styles.botBubble
                }`}
              >
                <p
                  dangerouslySetInnerHTML={{
                    __html: formatMessage(chat.text),
                  }}
                />
              </div>
            ))}
          </div>

          <div className={styles.chatInput}>
            <form onSubmit={handleGreetSubmit} style={{ display: "flex", width: "100%" }}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Type your message here or use the mic!"
                className={styles.inputField}
                disabled={loading}
              />
              <button
                type="button"
                className={styles.micButton}
                onClick={handleMicClick}
              >
                <FontAwesomeIcon icon={faMicrophone} className={styles.mic} />
              </button>
              <button type="submit" className={styles.micButton} disabled={loading}>
                {loading ? "..." : "Send"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatbotPage;
