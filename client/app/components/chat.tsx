'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, FileText, Loader2, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/utils'

interface Doc {
    pageContent?: string,
    metadata?: {
        loc?: {
            pageNumber?: number;
        };
        source?: string
    }
}

interface IMessage {
    role: 'assistant' | 'user'
    content?: string
    documents?: Doc[]
    timestamp: Date
}

const ChatComponent: React.FC = () => {
    const [message, setMessage] = useState<string>('')
    const [messages, setMessages] = useState<IMessage[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isLoading])

    const handleSend = async () => {
        if (!message.trim() || isLoading) return

        const userMsg: IMessage = { role: 'user', content: message, timestamp: new Date() }
        setMessages((prev) => [...prev, userMsg])
        setMessage('')
        setIsLoading(true)

        try {
            const response = await fetch(`http://127.0.0.1:8000/chat?message=${encodeURIComponent(message)}`)

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || errorData.error || `Server returned ${response.status}: ${response.statusText}`;

                const assistMsg: IMessage = {
                    role: 'assistant',
                    content: errorMessage,
                    timestamp: new Date()
                }
                setMessages(prev => [...prev, assistMsg])
                return;
            }

            const data = await response.json()

            const assistMsg: IMessage = {
                role: 'assistant',
                content: data?.message,
                documents: data?.docs,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, assistMsg])
        } catch (error) {
            console.error('Chat failed:', error)
            const assistMsg: IMessage = {
                role: 'assistant',
                content: "I'm having trouble connecting to the server. Please check if the server is running and try again.",
                timestamp: new Date()
            }
            setMessages(prev => [...prev, assistMsg])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-full bg-[#0a0a0c]">
            {/* Chat Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                {messages.length === 0 && !isLoading && (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                        <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center">
                            <Bot className="w-8 h-8 text-[#a1a1aa]" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Ask anything about your PDF</h2>
                        <p className="text-sm max-w-xs text-[#71717a]">Retrieve insights, summaries, and facts from your uploaded documents instantly.</p>
                    </div>
                )}

                <AnimatePresence initial={false}>
                    {messages.map((msg, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex gap-4",
                                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                msg.role === 'user' ? "bg-indigo-600 text-white" : "bg-[#18181b] border border-white/10 text-indigo-400"
                            )}>
                                {msg.role === 'user' ? <User size={18} /> : <Bot size={20} />}
                            </div>

                            <div className={cn(
                                "flex flex-col gap-2 max-w-[85%] md:max-w-[70%]",
                                msg.role === 'user' ? "items-end" : "items-start"
                            )}>
                                <div className={cn(
                                    "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                                    msg.role === 'user'
                                        ? "bg-indigo-600 text-white rounded-tr-none"
                                        : "bg-[#1d1d21] text-[#e4e4e7] border border-white/5 rounded-tl-none"
                                )}>
                                    {msg.content}
                                </div>

                                {msg.documents && msg.documents.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {msg.documents.map((doc, idx) => (
                                            <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] text-[#71717a] hover:bg-white/10 transition-colors">
                                                <FileText size={12} className="text-indigo-400" />
                                                <span>Source Match {idx + 1}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <span className="text-[10px] text-[#52525b] mt-1 px-1">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </motion.div>
                    ))}

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-4"
                        >
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#18181b] border border-white/10 text-indigo-400 flex items-center justify-center">
                                <Bot size={20} />
                            </div>
                            <div className="bg-[#1d1d21] p-4 rounded-2xl border border-white/5 rounded-tl-none flex items-center gap-3">
                                <Loader2 size={16} className="animate-spin text-indigo-500" />
                                <span className="text-xs text-[#a1a1aa] font-medium tracking-wide">AI is thinking...</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Form */}
            <div className="p-4 md:p-8 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c] to-transparent">
                <div className="relative max-w-4xl mx-auto group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-20 blur group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative flex items-center bg-[#18181b] border border-white/10 rounded-2xl shadow-xl overflow-hidden px-2">
                        <div className="pl-4 pr-2 py-4 text-[#71717a]">
                            <Sparkles size={18} className="text-indigo-500/50" />
                        </div>
                        <input
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            type='text'
                            placeholder='Ask a question about your documents...'
                            className="flex-1 bg-transparent border-none outline-none text-sm text-white py-4 placeholder-[#52525b]"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!message.trim() || isLoading}
                            className={cn(
                                "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 mr-1",
                                message.trim() && !isLoading ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "bg-[#27272a] text-[#52525b] cursor-not-allowed"
                            )}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                    <p className="text-[10px] text-center text-[#52525b] mt-3 tracking-wide uppercase font-semibold">
                        Powered by Gemini & Qdrant Vector DB
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ChatComponent
