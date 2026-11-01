import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  Tag,
  Package,
  Wrench,
  Loader2,
  Minimize2,
  Maximize2,
  ExternalLink,
  MessageCircle,
  PhoneCall,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  RotateCcw,
  ShoppingCart,
  Check,
  FileText,
  Copy,
} from 'lucide-react';
import { ChatMessage, Product } from '../types';
import { ProductBoxGraphic } from './ProductBoxGraphic';

interface AIAssistantChatProps {
  isOpen: boolean;
  onToggle: () => void;
  products: Product[];
  onViewProduct: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  recentOrderId?: string;
}

export const AIAssistantChat: React.FC<AIAssistantChatProps> = ({
  isOpen,
  onToggle,
  products,
  onViewProduct,
  onAddToCart,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: `Hello! 👋 Welcome to Chuks Communication (Park Road, Gwagwalada, Abuja).\n\nI'm your official AI parts consultant. I can help you with:\n- Instant screen prices (InCell, JK, GX, AMOLED)\n- Optical fingerprint calibrators (Relife RL-071)\n- Fast charging down boards with original ICs\n- Screen testing warranty policies\n\nWhat phone model or part are you looking for today?`,
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [addedCartToast, setAddedCartToast] = useState<string | null>(null);
  const [copiedChatToast, setCopiedChatToast] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Clean up speech synthesis on close or unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Initialize Speech Recognition (Web Speech API)
  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice dictation is not supported by this browser. You can type your request below.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-NG';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Text to Speech Read Aloud for Technicians
  const handleToggleSpeak = (msgId: string, textToSpeak: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown asterisks and backticks for clear audio narration
    const cleanSpeech = textToSpeak
      .replace(/\*\*/g, '')
      .replace(/`/g, '')
      .replace(/#/g, '')
      .replace(/•/g, ', ');

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingMsgId(null);
    };

    utterance.onerror = () => {
      setSpeakingMsgId(null);
    };

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputText).trim();
    if (!messageContent || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          history: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
          context: {
            catalogCount: products.length,
            sampleProducts: products.slice(0, 8).map((p) => ({ id: p.id, name: p.name, price: p.price })),
          },
        }),
      });

      if (!response.ok) throw new Error('AI service response error');
      const data = await response.json();

      // Combine server matched products with smart client keyword matcher
      const matchedProds: Product[] = [];
      if (Array.isArray(data.matchedProducts)) {
        matchedProds.push(...data.matchedProducts);
      }

      const lowerReply = (data.reply || '').toLowerCase();
      products.forEach((p) => {
        const pTokens = p.name.toLowerCase().split(' ').filter((w) => w.length > 3);
        const matchCount = pTokens.filter((token) => lowerReply.includes(token)).length;
        if (matchCount >= 2 && !matchedProds.some((mp) => mp.id === p.id)) {
          matchedProds.push(p);
        }
      });

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || "I'm here to help with phone parts, screens, calibrators, and down boards at Chuks Communication!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedProducts: matchedProds.slice(0, 3),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.warn('AI chat assistant response note:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: `We have original screens, calibrators, down boards, and tools in stock at Park Road, Gwagwalada, Abuja.\n\n📞 Call or WhatsApp us directly at **07039564380** for instant assistance!`,
          timestamp: 'Just now',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMsgId(null);
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        text: `Consultation refreshed! What phone part, screen grade, or repair tool can I look up for you?`,
        timestamp: 'Just now',
      },
    ]);
  };

  const handleShareToWhatsApp = () => {
    const summary = messages
      .slice(-4)
      .map((m) => `${m.sender === 'user' ? 'Customer' : 'Chuks AI'}: ${m.text}`)
      .join('\n\n');

    const encoded = encodeURIComponent(
      `Hello Chuks Communication Admin, I have a question from the Store AI Consultant:\n\n${summary}`
    );
    window.open(`https://wa.me/2347039564380?text=${encoded}`, '_blank');
  };

  const handleCopyChat = () => {
    const text = messages.map((m) => `${m.sender === 'user' ? 'Me' : 'Chuks AI'}: ${m.text}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopiedChatToast(true);
    setTimeout(() => setCopiedChatToast(false), 2000);
  };

  const handleAddSuggestedToCart = (product: Product) => {
    if (onAddToCart) {
      onAddToCart(product);
      setAddedCartToast(`Added ${product.name} to cart!`);
      setTimeout(() => setAddedCartToast(null), 2500);
    }
  };

  const handleAddSuggestedToInvoice = (product: Product) => {
    window.dispatchEvent(new CustomEvent('chuks_open_shop_invoice', { detail: { product } }));
  };

  const quickPrompts = [
    { label: '📱 Screen Grades & Prices', query: 'What is the difference between InCell, JK, GX and OLED screens and their prices?' },
    { label: '🔬 Optical Calibrator', query: 'Do you have optical fingerprint calibrator tools for Samsung and Xiaomi?' },
    { label: '⚡ Fast Charging Down Boards', query: 'Which phone charging down boards with original IC do you have in stock?' },
    { label: '🛡️ 30-Day Testing Warranty', query: 'What is your 30-day testing warranty policy for phone screens?' },
    { label: '📦 Track My Order', query: 'How can I track my order or verify dispatch?' },
    { label: '💬 WhatsApp Admin', query: 'What is your WhatsApp line and shop location at Gwagwalada, Abuja?' },
  ];

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          id="ai-bot-floating-btn"
          onClick={onToggle}
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm font-bold text-stone-950 shadow-lg shadow-orange-500/25 active:scale-95 transition"
        >
          <div className="relative">
            <Bot className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
            </span>
          </div>
          <span className="hidden sm:inline font-bold">Chuks AI Assistant</span>
        </button>
      )}

      {/* Main Chat Window */}
      {isOpen && (
        <div
          id="ai-bot-panel"
          className={`fixed right-2 sm:right-6 bottom-16 md:bottom-6 z-50 flex flex-col rounded-2xl border border-stone-800 bg-stone-950 text-stone-100 shadow-2xl transition-all duration-300 ${
            isMinimized
              ? 'h-14 w-72 sm:w-80'
              : 'h-[calc(100dvh-5.5rem)] max-h-[640px] w-[calc(100vw-1rem)] sm:w-[430px]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-850 bg-stone-900/95 px-4 py-3 rounded-t-2xl">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-stone-950 font-bold shadow">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white">Chuks AI Assistant</h3>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400" title="Online & Grounded in Inventory" />
                </div>
                <p className="text-[10px] text-amber-400 font-medium">Screens, Calibrators & Down Boards</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-stone-400">
              {/* WhatsApp Admin button */}
              <button
                onClick={handleShareToWhatsApp}
                className="flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-2 py-1 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-900/50 transition"
                title="Send Chat Inquiry to WhatsApp Admin (07039564380)"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">WhatsApp</span>
              </button>

              {/* Clear chat */}
              <button
                onClick={handleClearChat}
                className="rounded-lg p-1.5 hover:bg-stone-800 hover:text-white transition"
                title="Start new conversation"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              {/* Minimize */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="rounded-lg p-1.5 hover:bg-stone-800 hover:text-white transition"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
              </button>

              {/* Close */}
              <button
                id="ai-bot-close-btn"
                onClick={onToggle}
                className="rounded-lg p-1.5 hover:bg-stone-800 hover:text-white transition"
                title="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Toast Feedback */}
              {(addedCartToast || copiedChatToast) && (
                <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-3 py-1 text-center text-[11px] font-bold text-emerald-300 flex items-center justify-center gap-1 animate-in fade-in">
                  <Check className="h-3 w-3" />
                  <span>{addedCartToast || 'Conversation copied to clipboard!'}</span>
                </div>
              )}

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'bot' && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-950/60 border border-orange-500/40 text-amber-400 mt-0.5">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[88%] rounded-2xl p-3 leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-stone-950 font-medium rounded-br-none shadow'
                          : 'bg-stone-900/90 text-stone-200 border border-stone-800 rounded-bl-none'
                      }`}
                    >
                      {/* Formatted body */}
                      <div className="whitespace-pre-line">
                        {msg.text.split('\n').map((line, idx) => {
                          const parts = line.split(/(\*\*.*?\*\*)/g);
                          return (
                            <p key={idx} className={idx > 0 ? 'mt-1' : ''}>
                              {parts.map((part, pIdx) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return (
                                    <strong key={pIdx} className={msg.sender === 'user' ? 'font-black' : 'font-bold text-amber-400'}>
                                      {part.slice(2, -2)}
                                    </strong>
                                  );
                                }
                                if (part.startsWith('`') && part.endsWith('`')) {
                                  return (
                                    <code key={pIdx} className="rounded bg-stone-950 px-1 py-0.5 font-mono text-amber-300">
                                      {part.slice(1, -1)}
                                    </code>
                                  );
                                }
                                return part;
                              })}
                            </p>
                          );
                        })}
                      </div>

                      {/* Interactive suggested products cards */}
                      {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                        <div className="mt-3 space-y-2 border-t border-stone-800 pt-2.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                            Matching Parts in Stock:
                          </p>
                          {msg.suggestedProducts.map((p) => (
                            <div
                              key={p.id}
                              className="rounded-xl border border-stone-800 bg-stone-950/90 p-2.5 space-y-2 transition hover:border-orange-500/40"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div
                                  onClick={() => onViewProduct(p)}
                                  className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                                >
                                  <ProductBoxGraphic
                                    product={p}
                                    size="xs"
                                    className="h-9 w-9 rounded shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <p className="text-[11px] font-semibold text-white truncate hover:text-amber-300">
                                      {p.name}
                                    </p>
                                    <p className="text-[10px] text-stone-400">
                                      <strong className="text-amber-300">₦{p.price.toLocaleString()}</strong> • {p.stock > 0 ? `${p.stock} ready` : 'Out of stock'}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Interactive Action Buttons */}
                              <div className="flex items-center gap-1.5 pt-1 border-t border-stone-850 text-[10px]">
                                <button
                                  onClick={() => onViewProduct(p)}
                                  className="flex items-center gap-1 rounded-lg border border-stone-750 bg-stone-900 px-2 py-1 font-semibold text-stone-300 hover:text-white hover:border-orange-500 transition"
                                >
                                  <ExternalLink className="h-3 w-3 text-orange-400" />
                                  <span>Inspect</span>
                                </button>

                                {onAddToCart && (
                                  <button
                                    onClick={() => handleAddSuggestedToCart(p)}
                                    className="flex items-center gap-1 rounded-lg bg-orange-500 hover:bg-orange-400 px-2 py-1 font-bold text-stone-950 transition active:scale-95"
                                  >
                                    <ShoppingCart className="h-3 w-3" />
                                    <span>Add to Cart</span>
                                  </button>
                                )}

                                <button
                                  onClick={() => handleAddSuggestedToInvoice(p)}
                                  className="flex items-center gap-1 rounded-lg border border-stone-800 bg-stone-900 px-2 py-1 font-semibold text-stone-400 hover:text-amber-300 hover:border-amber-500/40 transition"
                                  title="Add to Shop Invoice"
                                >
                                  <FileText className="h-3 w-3 text-amber-400" />
                                  <span>Invoice</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Message Footer: Timestamp + Read Aloud TTS Speaker */}
                      <div className="mt-2 flex items-center justify-between text-[9px] text-stone-400 border-t border-stone-800/60 pt-1">
                        {msg.sender === 'bot' && (
                          <button
                            onClick={() => handleToggleSpeak(msg.id, msg.text)}
                            className="flex items-center gap-1 text-stone-400 hover:text-amber-400 transition"
                            title={speakingMsgId === msg.id ? 'Stop reading' : 'Read aloud (voice)'}
                          >
                            {speakingMsgId === msg.id ? (
                              <>
                                <VolumeX className="h-3 w-3 text-rose-400" />
                                <span className="text-rose-400">Stop Voice</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="h-3 w-3" />
                                <span>Read Aloud</span>
                              </>
                            )}
                          </button>
                        )}
                        <span className="ml-auto">{msg.timestamp}</span>
                      </div>
                    </div>

                    {msg.sender === 'user' && (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stone-800 text-stone-300 mt-0.5">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 text-stone-400 text-xs py-1">
                    <Loader2 className="h-4 w-4 text-orange-400 animate-spin" />
                    <span>Chuks AI is checking live inventory & screen records...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Inquiry Pills */}
              <div className="border-t border-stone-900 bg-stone-950 px-3 py-2">
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {quickPrompts.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q.query)}
                      className="shrink-0 rounded-lg border border-stone-850 bg-stone-900/80 px-2.5 py-1 text-[10px] font-medium text-stone-300 hover:border-orange-500 hover:text-amber-300 transition"
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input Bar with Mic & Send */}
              <div className="border-t border-stone-900 bg-stone-950 p-3 rounded-b-2xl">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  {/* Voice Input Button */}
                  <button
                    type="button"
                    onClick={toggleSpeechRecognition}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
                      isListening
                        ? 'border-rose-500 bg-rose-500/20 text-rose-400 animate-pulse'
                        : 'border-stone-800 bg-stone-900/80 text-stone-400 hover:border-orange-500 hover:text-amber-400'
                    }`}
                    title={isListening ? 'Listening... click to stop' : 'Speak your question (Voice Input)'}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={isListening ? 'Listening to your voice...' : 'Ask about screens, calibrators, down boards, prices...'}
                    className="flex-1 rounded-xl border border-stone-800 bg-stone-900/80 px-3 py-2 text-xs text-white placeholder-stone-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/40"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim() || isLoading}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-stone-950 disabled:opacity-40 transition active:scale-95"
                    title="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
