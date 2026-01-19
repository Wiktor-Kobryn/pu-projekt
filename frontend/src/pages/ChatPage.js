import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bot, User, Trash2, Send } from 'lucide-react';
import { useApp } from '../AppContext';

const API_URL = "http://127.0.0.1:8000";

const ChatPage = () => {
  const { activeTextId } = useApp();
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [tekstNazwa, setTekstNazwa] = useState("");

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTextId) {
      axios.get(`${API_URL}/teksty/${activeTextId}`)
        .then(res => setTekstNazwa(res.data.nazwa))
        .catch(err => console.error(err));

      axios.get(`${API_URL}/wpisy/${activeTextId}`)
        .then(res => {
          setMessages(res.data);
          setTimeout(scrollToBottom, 100);
        })
        .catch(err => console.error(err));
    }
  }, [activeTextId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsgContent = inputText;
    setInputText("");
    setLoading(true);

    const optimisticUserMsg = { rola: 'user', tresc: userMsgContent, id: 'temp-user' };
    setMessages(prev => [...prev, optimisticUserMsg]);

    try {
      const response = await axios.post(`${API_URL}/ai-stateful/${activeTextId}`, {
        zapytanie: userMsgContent
      });

      const botMsg = { rola: 'model', tresc: response.data.tekst, id: 'temp-bot-' + Date.now() };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error(error);
      alert("Błąd komunikacji z AI");
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Czy na pewno wyczyścić całą historię rozmowy dla tego pliku?")) return;

    try {
      await axios.delete(`${API_URL}/tekst/${activeTextId}/wpisy`);
      setMessages([]);
    } catch (error) {
      alert("Błąd podczas czyszczenia historii");
    }
  };

  if (!activeTextId) {
    return (
        <div className="container" style={{marginTop: '5rem'}}>
            <h2>Nie wybrano tekstu!</h2>
            <p>Wróć do zakładki "Dodaj tekst" i wybierz plik, o którym chcesz porozmawiać.</p>
        </div>
    );
  }

  return (
    <div className="chat-container">
      
      <div className="chat-header">
        <button 
            className="btn-icon" 
            onClick={handleClearHistory} 
            title="Wyczyść historię rozmowy"
            style={{ padding: '0.5rem' }}
        >
            <Trash2 size={24} />
        </button>

        <div style={{textAlign: 'center'}}>
            <div className="chat-title">ZAPYTAJ AI O TREŚĆ</div>
            <div style={{fontSize: '0.9rem', color: '#cbd5e1', fontStyle: 'italic'}}>
                '{tekstNazwa}'
            </div>
        </div>

        <div style={{width: '40px'}}></div>
      </div>

      <div className="messages-list">
        {messages.length === 0 && (
            <div style={{textAlign: 'center', opacity: 0.5, marginTop: '2rem'}}>
                Zadaj pierwsze pytanie o treść dokumentu...
            </div>
        )}

        {messages.map((msg, index) => {
            const isUser = msg.rola === 'user';
            return (
                <div key={index} className={`message-row ${isUser ? 'user' : 'model'}`}>
                    <div className="avatar-circle">
                        {isUser ? <User size={24} /> : <Bot size={24} />}
                    </div>
                    
                    <div className="message-bubble">
                        {msg.tresc}
                    </div>
                </div>
            );
        })}
        {loading && (
             <div className="message-row model">
                <div className="avatar-circle"><Bot size={24}/></div>
                <div className="message-bubble" style={{fontStyle: 'italic'}}>
                    Piszę...
                </div>
             </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <textarea
            className="chat-textarea"
            placeholder="Wpisz swoje pytanie do tekstu..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                }
            }}
        />
        <div className="chat-actions">
            <button className="btn-send" onClick={handleSend} disabled={loading || !inputText}>
                zapytaj <Send size={18} />
            </button>
        </div>
      </div>

    </div>
  );
};

export default ChatPage;