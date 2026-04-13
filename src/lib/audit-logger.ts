import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

export enum ActionType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
}

export interface AuditLog {
  userId: string;
  userName: string;
  userEmail: string;
  action: ActionType;
  resource: string;
  resourceId?: string;
  details?: string;
  timestamp: any;
}

export async function logAction(action: ActionType, resource: string, resourceId?: string, details?: string) {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const log: AuditLog = {
      userId: user.uid,
      userName: user.displayName || 'Utilisateur inconnu',
      userEmail: user.email || '',
      action,
      resource,
      resourceId,
      details,
      timestamp: serverTimestamp(),
    };

    await addDoc(collection(db, 'audit_logs'), log);
  } catch (error) {
    console.error('Failed to log action:', error);
  }
}
