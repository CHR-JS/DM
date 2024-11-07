import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Message } from '../../types';
import toast from 'react-hot-toast';

export const sendMessage = async (senderId: string, receiverId: string, content: string) => {
  try {
    const message = {
      senderId,
      receiverId,
      content,
      read: false,
      createdAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'messages'), message);
    
    return {
      id: docRef.id,
      ...message,
      timestamp: message.createdAt.toDate()
    };
  } catch (error) {
    console.error('Error sending message:', error);
    toast.error('Erreur lors de l\'envoi du message');
    throw error;
  }
};

export const getMessages = async (userId: string, otherId: string) => {
  try {
    const q = query(
      collection(db, 'messages'),
      where('senderId', 'in', [userId, otherId]),
      where('receiverId', 'in', [userId, otherId]),
      orderBy('createdAt', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const messages: Message[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        ...data,
        timestamp: data.createdAt.toDate()
      } as Message);
    });

    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    toast.error('Erreur lors de la récupération des messages');
    return [];
  }
};

export const subscribeToMessages = (
  userId: string,
  otherId: string,
  callback: (messages: Message[]) => void
) => {
  const q = query(
    collection(db, 'messages'),
    where('senderId', 'in', [userId, otherId]),
    where('receiverId', 'in', [userId, otherId]),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        ...data,
        timestamp: data.createdAt.toDate()
      } as Message);
    });
    callback(messages);
  });
};

export const markAsRead = async (messageId: string) => {
  try {
    await updateDoc(doc(db, 'messages', messageId), {
      read: true
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
  }
};