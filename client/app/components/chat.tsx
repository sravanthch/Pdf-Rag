'use client'

import React from 'react'

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
}

const ChatComponent: React.FC = () => {
    const [message, setMessage] = React.useState<string>('')
    const [messages, setMessages] = React.useState<IMessage[]>([])
    const handleSend = async () => {
        setMessages((prev) => [...prev, { role: 'user', content: message }])
        const response = await fetch(`http://localhost:8000/chat?message=${message}`)
        const data = await response.json()
        setMessages(prev => [...prev,{role:'assistant', content:data?.message, documents:data?.docs}])
        console.log(data)
    }
    return (
        <div className='p-4'>
            <div>
                {messages.map((message, index)=><pre key={index}>{JSON.stringify(message,null,2)}</pre>)}
            </div>
            <div className='fixed bottom-4 w-100 flex gap-3'>
                <input value={message} onChange={e => setMessage(e.target.value)} type='text' placeholder='Type You Query here' />
                <button onClick={handleSend}>Send</button>
            </div>
        </div>
    )
}

export default ChatComponent
