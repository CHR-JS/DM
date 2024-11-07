import React from 'react';
import { Profile, Message } from '../../types';

interface ChatListProps {
  matches: Profile[];
  lastMessages: Record<number, Message>;
  onSelectChat: (profile: Profile) => void;
  selectedProfileId?: number;
}

const ChatList: React.FC<ChatListProps> = ({
  matches,
  lastMessages,
  onSelectChat,
  selectedProfileId,
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {matches.map((profile) => {
            const lastMessage = lastMessages[profile.id];
            return (
              <button
                key={profile.id}
                onClick={() => onSelectChat(profile)}
                className={`w-full p-4 flex items-center gap-3 rounded-lg transition-colors ${
                  selectedProfileId === profile.id
                    ? 'bg-purple-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 text-left">
                  <h3 className="font-medium">{profile.name}</h3>
                  {lastMessage && (
                    <p className="text-sm text-gray-500 truncate">
                      {lastMessage.content}
                    </p>
                  )}
                </div>
                {lastMessage && !lastMessage.read && (
                  <div className="w-3 h-3 bg-purple-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChatList;