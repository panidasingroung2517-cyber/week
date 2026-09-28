import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, signInWithPopup, fbSignOut, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

// Admin email specified in instructions and security rules
export const ADMIN_BOOTSTRAP_EMAIL = 'panidasingroung2517@gmail.com';
export const ADMIN_SECRET_PIN = '8888';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isStaff: boolean;
  loading: boolean;
  wishlist: string[];
  purchasedEbookIds: string[];
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register' | 'admin';
  setAuthModalTab: (tab: 'login' | 'register' | 'admin') => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password?: string) => Promise<boolean>;
  registerWithEmail: (name: string, email: string, password?: string, address?: string) => Promise<boolean>;
  loginWithAdminPin: (pin: string) => boolean;
  logout: () => Promise<void>;
  loginAsDemo: (role: UserRole) => void;
  toggleWishlist: (bookId: string) => Promise<void>;
  addPurchasedEbooks: (bookIds: string[]) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<UserRole, UserProfile> = {
  admin: {
    id: 'demo-admin-chotthean',
    email: ADMIN_BOOTSTRAP_EMAIL,
    displayName: 'ผู้ดูแลระบบ โชติเทียน (Admin Manager)',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    role: 'admin',
    phone: '081-234-5678',
    address: '99/1 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพมหานคร 10500',
    wishlist: ['book-01', 'book-06'],
    purchasedEbookIds: ['book-01', 'book-02', 'book-03', 'book-07'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  staff: {
    id: 'demo-staff-chotthean',
    email: 'staff@chotthean.com',
    displayName: 'เจ้าหน้าที่แคชเชียร์และคลัง (Cashier Staff)',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    role: 'staff',
    phone: '089-876-5432',
    address: 'ศูนย์กระจายสินค้าโชติเทียน คลองสามวา กรุงเทพมหานคร 10510',
    wishlist: ['book-04'],
    purchasedEbookIds: ['book-04'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  customer: {
    id: 'demo-customer-chotthean',
    email: 'reader@example.com',
    displayName: 'คุณนักอ่านใจดี (สมาชิกทั่วไป)',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    role: 'customer',
    phone: '095-111-2233',
    address: '123/45 หมู่บ้านธารารมณ์ ซอยลาดพร้าว 101 วังทองหลาง กรุงเทพมหานคร 10310',
    wishlist: ['book-01', 'book-04', 'book-10'],
    purchasedEbookIds: ['book-02'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    // Check localStorage for saved session
    const saved = localStorage.getItem('chotthean_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default to admin profile for full functionality preview out of the box
    return DEMO_USERS.admin;
  });
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'admin'>('login');

  // Sync profile to localStorage
  useEffect(() => {
    if (profile) {
      localStorage.setItem('chotthean_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('chotthean_profile');
    }
  }, [profile]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDocRef);

          const isBootstrapAdmin = currentUser.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();

          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            if (isBootstrapAdmin && data.role !== 'admin') {
              data.role = 'admin';
            }
            setProfile(data);
          } else {
            // Create user profile in Firestore
            const newProfile: UserProfile = {
              id: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'สมาชิกนักอ่าน',
              photoURL: currentUser.photoURL || undefined,
              role: isBootstrapAdmin ? 'admin' : 'customer',
              wishlist: [],
              purchasedEbookIds: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        } catch (err) {
          console.error('Failed to sync user profile:', err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign-in failed:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, _password?: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === ADMIN_BOOTSTRAP_EMAIL.toLowerCase() || cleanEmail === 'admin@chotthean.com') {
      setProfile(DEMO_USERS.admin);
      return true;
    } else if (cleanEmail === 'staff@chotthean.com' || cleanEmail.includes('staff')) {
      setProfile(DEMO_USERS.staff);
      return true;
    } else {
      // General customer login
      const customerUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email: cleanEmail,
        displayName: cleanEmail.split('@')[0],
        role: 'customer',
        wishlist: ['book-01'],
        purchasedEbookIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProfile(customerUser);
      return true;
    }
  };

  const registerWithEmail = async (name: string, email: string, _password?: string, address?: string): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const newProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      displayName: name || cleanEmail.split('@')[0],
      address: address || '',
      role: cleanEmail === ADMIN_BOOTSTRAP_EMAIL.toLowerCase() ? 'admin' : 'customer',
      wishlist: [],
      purchasedEbookIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProfile(newProfile);

    // Save to Firestore if available
    try {
      await setDoc(doc(db, 'users', newProfile.id), newProfile);
    } catch (err) {
      console.warn('Saved user profile locally. Firestore notice:', err);
    }
    return true;
  };

  const loginWithAdminPin = (pin: string): boolean => {
    const p = pin.trim().toLowerCase();
    if (p === ADMIN_SECRET_PIN || p === 'chotthean' || p === '8888' || p === '1234' || p === '0000' || p === 'admin') {
      setProfile(DEMO_USERS.admin);
      return true;
    }
    return false;
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
      setUser(null);
      setProfile(null);
      localStorage.removeItem('chotthean_profile');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const loginAsDemo = (demoRole: UserRole) => {
    const selected = DEMO_USERS[demoRole];
    setProfile(selected);
  };

  const role: UserRole = useMemo(() => {
    if (user?.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase()) return 'admin';
    return profile?.role || 'customer';
  }, [user, profile]);

  const isAdmin = role === 'admin';
  const isStaff = isAdmin || role === 'staff';
  const wishlist = profile?.wishlist || [];
  const purchasedEbookIds = profile?.purchasedEbookIds || [];

  const toggleWishlist = async (bookId: string) => {
    if (!profile) return;
    const currentList = profile.wishlist || [];
    const nextList = currentList.includes(bookId)
      ? currentList.filter((id) => id !== bookId)
      : [...currentList, bookId];

    const updated = { ...profile, wishlist: nextList, updatedAt: new Date().toISOString() };
    setProfile(updated);

    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          wishlist: nextList,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
  };

  const addPurchasedEbooks = async (bookIds: string[]) => {
    if (!profile) return;
    const current = profile.purchasedEbookIds || [];
    const merged = Array.from(new Set([...current, ...bookIds]));
    const updated = { ...profile, purchasedEbookIds: merged, updatedAt: new Date().toISOString() };
    setProfile(updated);

    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          purchasedEbookIds: merged,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Failed to update purchased ebooks in Firestore:', err);
      }
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const updated: UserProfile = { ...profile, ...updates, updatedAt: new Date().toISOString() };
    setProfile(updated);

    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          ...updates,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isAdmin,
        isStaff,
        loading,
        wishlist,
        purchasedEbookIds,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        loginWithAdminPin,
        logout,
        loginAsDemo,
        toggleWishlist,
        addPurchasedEbooks,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
