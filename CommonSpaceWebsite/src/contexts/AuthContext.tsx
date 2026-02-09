import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
        // If Supabase is not configured, use localStorage fallback
        if (!isSupabaseConfigured) {
            const localUser = localStorage.getItem('currentUser');
            const localFlatCode = localStorage.getItem('flatCode');
            
            if (localUser) {
                try {
                    const userData = JSON.parse(localUser);
                    setUser(userData as User);
                    setSession({ user: userData, access_token: 'local', refresh_token: 'local' } as Session);
                } catch (e) {
                    console.error('Error parsing local user:', e);
                }
            }
            
            if (localFlatCode) {
                setFlatCode(localFlatCode);
            }
            
            setLoading(false);
            return;
        }

        // Get initial session from Supabase
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
        // If Supabase is not configured, use localStorage authentication
        if (!isSupabaseConfigured) {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const foundUser = users.find((u: any) => u.email === email && u.password === password);
            
            if (foundUser) {
                const mockUser = {
                    id: foundUser.id || email,
                    email: email,
                    user_metadata: { username: foundUser.username }
                } as User;
                
                setUser(mockUser);
                setSession({ user: mockUser, access_token: 'local', refresh_token: 'local' } as Session);
                localStorage.setItem('currentUser', JSON.stringify(mockUser));
                
                // Set flatCode if available
                const localFlatCode = localStorage.getItem('flatCode') || 'DEFAULT';
                setFlatCode(localFlatCode);
                
                return { error: null };
            } else {
                return { error: { message: 'Invalid email or password', name: 'AuthError', status: 400 } as AuthError };
            }
        }
        
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };

    const signOut = async () => {
        if (!isSupabaseConfigured) {
            setUser(null);
            setSession(null);
            localStorage.removeItem('currentUser');
            return;
        }
        
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
