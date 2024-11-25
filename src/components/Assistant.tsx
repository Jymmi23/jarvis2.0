import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Mic, Image, Upload, Send, Sun, MessageSquare, Loader } from 'lucide-react';
import { getAIResponse } from '../lib/openai';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export default function Assistant() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAIResponse = async (userMessage: string) => {
    setIsTyping(true);
    try {
      const response = await getAIResponse(userMessage);
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: response,
        sender: 'assistant',
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error al procesar la respuesta:', error);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "Lo siento, hubo un error al procesar tu solicitud. Por favor, intenta de nuevo.",
        sender: 'assistant',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (message.trim()) {
      const newMessage = {
        id: Date.now(),
        text: message,
        sender: 'user' as const,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      
      await handleAIResponse(message);
    }
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      setIsListening(!isListening);
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'es-ES';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      alert('El reconocimiento de voz no está soportado en este navegador.');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileNames = Array.from(files).map(file => file.name).join(', ');
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: `Archivos seleccionados: ${fileNames}`,
        sender: 'user',
        timestamp: new Date()
      }]);

      // Aquí puedes agregar la lógica para procesar los archivos con IA
      await handleAIResponse(`Analiza estos archivos: ${fileNames}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col relative overflow-hidden">
      {/* Creator signature */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 right-4 text-right"
      >
        <div className="w-24 h-24 bg-yellow-500/10 rounded-full blur-xl absolute -top-8 -right-8" />
        <h3 className="font-['Chiller'] text-2xl text-yellow-500 relative z-10">
          Cristian Pavas
        </h3>
      </motion.div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Welcome Message */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2 mb-8"
        >
          <div className="relative inline-block">
            <div className="w-48 h-48 bg-blue-500/20 rounded-full absolute blur-xl -z-10" />
            <Bot className="w-32 h-32 text-blue-400 animate-float" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            JARVIS
          </h1>
          <p className="text-gray-300">¿Qué tal tu día? ¿En qué puedo ayudarte?</p>
        </motion.div>

        {/* Messages */}
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-lg p-3 ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-100'
              }`}>
                <div className="prose prose-invert max-w-none">
                  {msg.text}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-gray-400"
          >
            <Loader className="w-4 h-4 animate-spin" />
            <span>JARVIS está escribiendo...</span>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4"
      >
        <div className="bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm border border-gray-700 max-w-2xl mx-auto">
          <div className="flex gap-2 mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors text-gray-300"
              onClick={handleVoiceInput}
            >
              <Mic className={`w-5 h-5 ${isListening ? 'text-red-500' : ''}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors text-gray-300"
              onClick={() => fileInputRef.current?.click()}
            >
              <Image className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors text-gray-300"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-5 h-5" />
            </motion.button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              onChange={handleFileUpload}
            />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors text-white"
              onClick={handleSendMessage}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-4"
        >
          <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700 hover:bg-gray-800/40 transition-colors">
            <Sun className="w-6 h-6 text-yellow-500 mb-2" />
            <h3 className="text-gray-200 font-semibold">Asistencia IA</h3>
            <p className="text-gray-400 text-sm">Ayuda con programación y más</p>
          </div>
          <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700 hover:bg-gray-800/40 transition-colors">
            <MessageSquare className="w-6 h-6 text-green-500 mb-2" />
            <h3 className="text-gray-200 font-semibold">Chat Interactivo</h3>
            <p className="text-gray-400 text-sm">Conversaciones naturales</p>
          </div>
          <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-700 hover:bg-gray-800/40 transition-colors">
            <Bot className="w-6 h-6 text-blue-500 mb-2" />
            <h3 className="text-gray-200 font-semibold">Diseño Técnico</h3>
            <p className="text-gray-400 text-sm">Planos y proyectos técnicos</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}