import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  UserProfile, 
  DailyCheckIn, 
  ChatSession, 
  SupportTicket, 
  userProfileSchema, 
  dailyCheckInSchema, 
  chatSessionSchema, 
  supportTicketSchema 
} from './schema';

// Collection names
const COLLECTIONS = {
  PROFILES: 'profiles',
  DAILY_CHECK_INS: 'dailyCheckIns',
  CHAT_SESSIONS: 'chatSessions',
  SUPPORT_TICKETS: 'supportTickets',
} as const;

// User Profile Operations
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const docRef = doc(db, COLLECTIONS.PROFILES, userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
};

export const createOrUpdateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  const profileRef = doc(db, COLLECTIONS.PROFILES, userId);
  const profileData = {
    ...data,
    updatedAt: serverTimestamp(),
  };
  
  await setDoc(profileRef, profileData, { merge: true });
  return getUserProfile(userId);
};

// Daily Check-in Operations
export const logDailyCheckIn = async (checkInData: Omit<DailyCheckIn, 'id' | 'createdAt'>) => {
  const checkInRef = await addDoc(collection(db, COLLECTIONS.DAILY_CHECK_INS), {
    ...checkInData,
    createdAt: serverTimestamp(),
  });
  
  return checkInRef.id;
};

export const getUserCheckInHistory = async (userId: string, limitCount: number = 30) => {
  const q = query(
    collection(db, COLLECTIONS.DAILY_CHECK_INS),
    where('userId', '==', userId),
    orderBy('date', 'desc'),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as DailyCheckIn[];
};

// Chat Session Operations
export const createChatSession = async (userId: string, title: string) => {
  const sessionRef = await addDoc(collection(db, COLLECTIONS.CHAT_SESSIONS), {
    userId,
    title,
    messages: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  return sessionRef.id;
};

export const getUserChatSessions = async (userId: string, limitCount: number = 50) => {
  const q = query(
    collection(db, COLLECTIONS.CHAT_SESSIONS),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc'),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ChatSession[];
};

// Support Ticket Operations
export const createSupportTicket = async (ticketData: Omit<SupportTicket, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
  const ticketRef = await addDoc(collection(db, COLLECTIONS.SUPPORT_TICKETS), {
    ...ticketData,
    status: 'open',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  return ticketRef.id;
};

export const getUserSupportTickets = async (userId: string) => {
  const q = query(
    collection(db, COLLECTIONS.SUPPORT_TICKETS),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as SupportTicket[];
};
