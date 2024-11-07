import { Notification } from '../types';
import { MOCK_PROFILES } from './mockProfiles';

export const mockNotifications: Notification[] = [
  {
    id: 1,
    type: 'match',
    userId: 2,
    content: 'Vous avez un nouveau match !',
    timestamp: new Date(Date.now() - 3600000),
    read: false
  },
  {
    id: 2,
    type: 'message',
    userId: 2,
    content: 'Vous avez reçu un nouveau message',
    timestamp: new Date(Date.now() - 7200000),
    read: false
  },
  {
    id: 3,
    type: 'like',
    userId: 3,
    content: 'Quelqu\'un a aimé votre profil',
    timestamp: new Date(Date.now() - 86400000),
    read: true
  }
];

export { MOCK_PROFILES };