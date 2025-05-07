import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchGreeting = async () => {
      try {
        const res = await fetch("http://localhost:8000/chat/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: "__RESET__",
            last_agent_msg: ""
          }),
        });
        const data = await res.json();
        const fullResponse = data.response;
        const splitIndex = fullResponse.indexOf("1.");
        if (splitIndex !== -1) {
          const introPart = fullResponse.slice(0, splitIndex).trim();
          const questionPart = fullResponse.slice(splitIndex).trim();
          setMessages([{ from: "bot", text: introPart }, { from: "bot", text: questionPart }]);
        } else {
          setMessages([{ from: "bot", text: fullResponse }]);
        }
      } catch (err) {
        setMessages([{ from: "bot", text: "Sunucuya ulaşılamadı." }]);
      }
    };
    fetchGreeting();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!userInput.trim()) return;
    const userMessage = userInput.trim();
    setMessages((prev) => [...prev, { from: "user", text: userMessage }]);
    setUserInput("");
    const lastBotMsg = messages.slice().reverse().find((m) => m.from === "bot")?.text || null;

    try {
      const res = await fetch("http://localhost:8000/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          last_agent_msg: lastBotMsg || ""
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { from: "bot", text: data.response }]);
    } catch (err) {
      setMessages((prev) => [...prev, { from: "bot", text: "Sunucuya ulaşılamadı." }]);
    }
  };

  const themeStyles = {
    background: darkMode ? "#121212" : "linear-gradient(to bottom right, #e3f2fd, #fce4ec)",
    color: darkMode ? "#f5f5f5" : "#2c3e50",
    inputBg: darkMode ? "#1f1f1f" : "#fff",
    inputBorder: darkMode ? "#333" : "#ccc",
    chatBg: darkMode ? "#1e1e1e" : "#f7f9fb",
    userMsgBg: darkMode ? "#4caf50" : "#c8e6c9",
    botMsgBg: darkMode ? "#673ab7" : "#b39ddb",
    containerBg: darkMode ? "#1a1a1ad9" : "#ffffffcc"
  };

  return (
    <div style={{
      minHeight: "100vh",
      padding: "2rem",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      fontFamily: "'Segoe UI', sans-serif",
      background: themeStyles.background,
      color: themeStyles.color,
      transition: "all 0.3s ease"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "900px",
        backgroundColor: themeStyles.containerBg,
        backdropFilter: "blur(8px)",
        borderRadius: "2rem",
        boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
        display: "flex",
        flexDirection: "column",
        padding: "2rem",
        transition: "background-color 0.3s ease"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "700" }}>
            💬🩺Medical Assistant Chatbot🩺💬
          </h1>
          <button onClick={() => setDarkMode(!darkMode)} style={{
            padding: "0.5rem 1rem",
            borderRadius: "1rem",
            border: "none",
            backgroundColor: darkMode ? "#ffffff22" : "#00000022",
            color: themeStyles.color,
            fontWeight: "bold",
            cursor: "pointer"
          }}>
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        <div style={{
          flexGrow: 1,
          overflowY: "auto",
          height: "500px",
          padding: "1rem",
          backgroundColor: themeStyles.chatBg,
          borderRadius: "1.25rem",
          marginBottom: "1.5rem",
          border: "1px solid #8882",
          transition: "all 0.3s ease"
        }}>
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: "flex",
                  justifyContent: msg.from === "user" ? "flex-end" : "flex-start",
                  marginBottom: "1rem"
                }}
              >
                <div style={{
                  backgroundColor: msg.from === "user" ? themeStyles.userMsgBg : themeStyles.botMsgBg,
                  color: "#fff",
                  padding: "0.9rem 1.4rem",
                  borderRadius: "1.2rem",
                  maxWidth: "70%",
                  fontSize: "1rem",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                  lineHeight: "1.5"
                }}>
                  <b>{msg.from === "user" ? "Sen" : "Bot"}:</b>
                  {msg.text.split('\n').map((line, idx) => (
                    <div key={idx}>{line}</div>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Mesajınızı yazın..."
            style={{
              flex: 1,
              padding: "1rem",
              borderRadius: "1.5rem",
              border: `1px solid ${themeStyles.inputBorder}`,
              backgroundColor: themeStyles.inputBg,
              color: themeStyles.color,
              fontSize: "1rem",
              outline: "none"
            }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            style={{
              padding: "1rem 2rem",
              borderRadius: "1.5rem",
              backgroundColor: "#5c6bc0",
              color: "#fff",
              border: "none",
              fontSize: "1rem",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Gönder
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default App;
