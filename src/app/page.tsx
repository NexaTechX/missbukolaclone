'use client';

import React, { useState, useEffect } from 'react';
import { ChatInterface } from '@/components/chat-interface';
// import { UserSetup } from '@/components/user-setup'; // Removed - no longer needed
import { generateUserId } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  department: string;
  role: string;
}

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session in localStorage
    const savedUser = localStorage.getItem('bukola_ai_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('bukola_ai_user');
      }
    }
    setIsLoading(false);
  }, []);

  // User setup handler removed - no longer needed
  // const handleUserSetup = (userData: Omit<User, 'id'>) => {
  //   const user: User = {
  //     id: generateUserId(),
  //     ...userData,
  //   };
  //   
  //   setCurrentUser(user);
  //   localStorage.setItem('bukola_ai_user', JSON.stringify(user));
  // };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bukola_ai_user');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="executive-gradient w-16 h-16 md:w-20 md:h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="text-white text-xl md:text-2xl font-bold">B</div>
          </div>
          <div className="text-gray-600 text-sm md:text-base">Loading Bukola AI...</div>
          <div className="flex justify-center mt-3">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <ChatInterface currentUser={currentUser as User} />
    </div>
  );

  // Skip user setup - go directly to chat
  if (!currentUser) {
    // Auto-create a default user session
    const defaultUser = {
      id: 'default-user',
      name: 'Employee',
      department: 'Operations',
      role: 'Staff'
    };
    setCurrentUser(defaultUser);
    localStorage.setItem('bukola_ai_user', JSON.stringify(defaultUser));
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="executive-gradient w-16 h-16 md:w-20 md:h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <div className="text-white text-xl md:text-2xl font-bold">B</div>
          </div>
          <div className="text-gray-600 text-sm md:text-base">Initializing...</div>
        </div>
      </div>
    );
  }
}