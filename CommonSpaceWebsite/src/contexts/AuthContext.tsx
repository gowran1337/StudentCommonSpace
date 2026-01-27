import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    flatCode: string | null;
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [flatCode, setFlatCode] = useState<string | null>(null);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            
            // Fetch flatCode from user profile if user is logged in
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('flat_code')
                    .eq('id', session.user.id)
                    .single();
                
                if (profile?.flat_code) {
                    setFlatCode(profile.flat_code);
                    localStorage.setItem('flatCode', profile.flat_code);
                }
            }
            
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            
            // Fetch flatCode when auth state changes
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('flat_code')
                    .eq('id', session.user.id)
                    .single();
                
                if (profile?.flat_code) {
                    setFlatCode(profile.flat_code);
                    localStorage.setItem('flatCode', profile.flat_code);
                }
            } else {
                setFlatCode(null);
                localStorage.removeItem('flatCode');
            }
            
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ user, session, loading, flatCode, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
