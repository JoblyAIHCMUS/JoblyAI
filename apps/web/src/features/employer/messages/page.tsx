'use client';

import { useState } from 'react';
import { ConversationSidebar } from './ConversationSidebar';
import { ChatWindow } from './ChatWindow';
import { mockConversations, mockMessages } from './data';
import { Message } from './types';

export default function EmployerMessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [messages, setMessages] = useState(mockMessages);

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: messages.length + 1,
      sender: 'You',
      senderAvatar: 'https://placehold.co/40x40?text=MK',
      isSent: true,
      content,
      timestamp: 'Just now',
      timestamp24: 'Just now',
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <div className="flex w-full h-full gap-0 overflow-hidden bg-white">
      <ConversationSidebar
        conversations={mockConversations}
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
      />
      <ChatWindow
        conversation={selectedConversation}
        messages={messages}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
