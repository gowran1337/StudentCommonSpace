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
        // Get initial session - SNABB
        const initializeAuth = async () => {
            try {
                if (!isSupabaseConfigured) {
                    // Mock mode - no session to restore
                    console.log('🔧 Development Mode: Running without Supabase backend');
                    setLoading(false);
                    return;
                }
                
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                setUser(session?.user ?? null);
                
                // Ladda flatCode från localStorage för snabb rendering
                const cached = localStorage.getItem('flatCode');
                if (cached) {
                    setFlatCode(cached);
                }
                if (session?.user) {
                    // Alltid hämta från Supabase för att synka
                    fetchFlatCode(session.user.id);
                }
            } catch (error) {
                console.error('Error getting session:', error);
            } finally {
                setLoading(false);  // ✅ SNABB - loading är false efter 100ms
            }
        };

        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                fetchFlatCode(session.user.id);
            } else {
                setFlatCode(null);
                localStorage.removeItem('flatCode');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Hämta flatCode utan att blockera loading
    const fetchFlatCode = async (userId: string) => {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('flat_code')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                return;
            }
            
            // Always sync state with what's in the database
            const code = profile?.flat_code || null;
            setFlatCode(code);
            if (code) {
                localStorage.setItem('flatCode', code);
            } else {
                localStorage.removeItem('flatCode');
            }
        } catch (error) {
            console.error('Error fetching flat_code:', error);
        }
    };

    const signIn = async (email: string, password: string) => {
        if (!isSupabaseConfigured) {
            // Mock login for development when Supabase is not configured
            console.log('🔧 Mock login - Supabase not configured. Logging in as mock user.');
            
            // Simulate successful login with mock user
            const mockUser = {
                id: 'mock-user-123',
                email: email,
                app_metadata: {},
                user_metadata: { name: 'Test User' },
                aud: 'authenticated',
                created_at: new Date().toISOString(),
            } as User;
            
            const mockSession = {
                access_token: 'mock-token',
                refresh_token: 'mock-refresh',
                expires_in: 3600,
                expires_at: Date.now() + 3600000,
                token_type: 'bearer',
                user: mockUser,
            } as Session;
            
            setUser(mockUser);
            setSession(mockSession);
            setFlatCode('MOCK123');
            localStorage.setItem('flatCode', 'MOCK123');
            
            return { error: null };
        }
        
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };

    const signOut = async () => {
        // Clear all user-specific localStorage data
        localStorage.removeItem('flatCode');
        localStorage.removeItem('profileSettings');
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');

        if (!isSupabaseConfigured) {
            // Mock logout for development
            console.log('🔧 Mock logout - Supabase not configured');
            setUser(null);
            setSession(null);
            setFlatCode(null);
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
