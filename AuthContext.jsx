import { useState, useEffect } from 'react';
import {
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { AuthContext } from './authContextValue';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return { user: result.user, error: null };
        } catch (error) {
            console.error('Google sign-in error:', error);
            return { user: null, error: error.message };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            return { error: null };
        } catch (error) {
            console.error('Logout error:', error);
            return { error: error.message };
        }
    };

    const value = {
        user,
        loading,
        signInWithGoogle,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
