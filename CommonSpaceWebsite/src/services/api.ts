import { supabase } from '../lib/supabase';
import { cacheGet, cacheSet, cacheRemove } from '../utils/cache';

// Helper function to get current user's flat code
const getUserFlatCode = (): string | null => {
  return localStorage.getItem('flatCode');
};

// Cache settings
const CACHE_TTL_MINUTES = 5;

const makeCacheKey = (flatCode: string, resource: string): string => {
  return `cache:${flatCode}:${resource}`;
};

export interface CleaningTask {
  id: number;
  text: string;
  completed: boolean;
  assignee: string;
  flat_code?: string;
}

export interface CleaningScheduleItem {
  id: number;
  area: string;
  day: string;
  assignee: string;
  flat_code?: string;
}

export interface ShoppingItem {
  id: number;
  item: string;
  quantity: string;
  purchased: boolean;
  addedBy: string;
  flat_code?: string;
}

// Cleaning Tasks API using Supabase
export const cleaningTasksApi = {
  getAll: async (): Promise<CleaningTask[]> => {
    const flatCode = getUserFlatCode();
    if (!flatCode) return [];

    const key = makeCacheKey(flatCode, 'cleaning_tasks');
    const cached = cacheGet<CleaningTask[]>(key);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('cleaning_tasks')
      .select('*')
      .eq('flat_code', flatCode)
      .order('id', { ascending: true });

    if (error) throw error;

    const result = data || [];
    cacheSet(key, result, CACHE_TTL_MINUTES);
    return result;
  },

  create: async (task: Omit<CleaningTask, 'id'>): Promise<CleaningTask> => {
    const flatCode = getUserFlatCode();
    if (!flatCode) throw new Error('No flat code found');

    const { data, error } = await supabase
      .from('cleaning_tasks')
      .insert([{ ...task, flat_code: flatCode }])
      .select()
      .single();

    if (error) throw error;

    cacheRemove(makeCacheKey(flatCode, 'cleaning_tasks'));
    return data;
  },

  update: async (id: number, task: CleaningTask): Promise<void> => {
    const { error } = await supabase
      .from('cleaning_tasks')
      .update(task)
      .eq('id', id);

    if (error) throw error;

    const flatCode = getUserFlatCode();
    if (flatCode) cacheRemove(makeCacheKey(flatCode, 'cleaning_tasks'));
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('cleaning_tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;

    const flatCode = getUserFlatCode();
    if (flatCode) cacheRemove(makeCacheKey(flatCode, 'cleaning_tasks'));
  },
};

// Cleaning Schedule API using Supabase
export const cleaningScheduleApi = {
  getAll: async (): Promise<CleaningScheduleItem[]> => {
    const flatCode = getUserFlatCode();
    if (!flatCode) return [];

    const key = makeCacheKey(flatCode, 'cleaning_schedule');
    const cached = cacheGet<CleaningScheduleItem[]>(key);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('cleaning_schedule')
      .select('*')
      .eq('flat_code', flatCode)
      .order('id', { ascending: true });

    if (error) throw error;

    const result = data || [];
    cacheSet(key, result, CACHE_TTL_MINUTES);
    return result;
  },

  create: async (item: Omit<CleaningScheduleItem, 'id'>): Promise<CleaningScheduleItem> => {
    const flatCode = getUserFlatCode();
    if (!flatCode) throw new Error('No flat code found');

    const { data, error } = await supabase
      .from('cleaning_schedule')
      .insert([{ ...item, flat_code: flatCode }])
      .select()
      .single();

    if (error) throw error;

    cacheRemove(makeCacheKey(flatCode, 'cleaning_schedule'));
    return data;
  },

  update: async (id: number, item: CleaningScheduleItem): Promise<void> => {
    const { error } = await supabase
      .from('cleaning_schedule')
      .update(item)
      .eq('id', id);

    if (error) throw error;

    const flatCode = getUserFlatCode();
    if (flatCode) cacheRemove(makeCacheKey(flatCode, 'cleaning_schedule'));
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('cleaning_schedule')
      .delete()
      .eq('id', id);

    if (error) throw error;

    const flatCode = getUserFlatCode();
    if (flatCode) cacheRemove(makeCacheKey(flatCode, 'cleaning_schedule'));
  },
};

// Shopping List API using Supabase
export const shoppingListApi = {
  getAll: async (): Promise<ShoppingItem[]> => {
    const flatCode = getUserFlatCode();
    if (!flatCode) return [];

    const key = makeCacheKey(flatCode, 'shopping_list');
    const cached = cacheGet<ShoppingItem[]>(key);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('shopping_list')
      .select('*')
      .eq('flat_code', flatCode)
      .order('id', { ascending: true });

    if (error) throw error;

  type ShoppingRow = {
    id: number;
    item: string;
    quantity: string;
    purchased: boolean;
    added_by: string;
  };

  const mapped = ((data || []) as ShoppingRow[]).map((row) => ({
    id: row.id,
    item: row.item,
    quantity: row.quantity,
    purchased: row.purchased,
    addedBy: row.added_by,
  }));


    cacheSet(key, mapped, CACHE_TTL_MINUTES);
    return mapped;
  },

  create: async (item: Omit<ShoppingItem, 'id'>): Promise<ShoppingItem> => {
    const flatCode = getUserFlatCode();
    if (!flatCode) throw new Error('No flat code found');

    const { data, error } = await supabase
      .from('shopping_list')
      .insert([
        {
          item: item.item,
          quantity: item.quantity,
          purchased: item.purchased,
          added_by: item.addedBy,
          flat_code: flatCode,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    cacheRemove(makeCacheKey(flatCode, 'shopping_list'));

    return {
      id: data.id,
      item: data.item,
      quantity: data.quantity,
      purchased: data.purchased,
      addedBy: data.added_by,
    };
  },

  update: async (id: number, item: ShoppingItem): Promise<void> => {
    const { error } = await supabase
      .from('shopping_list')
      .update({
        item: item.item,
        quantity: item.quantity,
        purchased: item.purchased,
        added_by: item.addedBy,
      })
      .eq('id', id);

    if (error) throw error;

    const flatCode = getUserFlatCode();
    if (flatCode) cacheRemove(makeCacheKey(flatCode, 'shopping_list'));
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase.from('shopping_list').delete().eq('id', id);

    if (error) throw error;

    const flatCode = getUserFlatCode();
    if (flatCode) cacheRemove(makeCacheKey(flatCode, 'shopping_list'));
  },
};

// Bulletin Board Interfaces
export interface BulletinPostIt {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  flat_code?: string;
}

export interface BulletinDrawing {
  id: number;
  paths: string; // JSON string of drawing paths
  color: string;
  flat_code?: string;
}

export interface BulletinText {
  id: number;
  x: number;
  y: number;
  text: string;
  font_size: number;
  color: string;
  flat_code?: string;
}

// Bulletin Post-its API
export const bulletinPostItsApi = {
  getAll: async (): Promise<BulletinPostIt[]> => {
    const flatCode = getUserFlatCode();
    if (!flatCode) return [];

    const key = makeCacheKey(flatCode, 'bulletin_postits');
    const cached = cacheGet<BulletinPostIt[]>(key);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('bulletin_postits')
      .select('*')
      .eq('flat_code', flatCode)
      .order('id', { ascending: true });

    if (error) throw error;

    const result = data || [];
    cacheSet(key, result, CACHE_TTL_MINUTES);
    return result;
  },

  create: async (postit: Omit<BulletinPostIt, 'id'>): Promise<BulletinPostIt> => {
    const flatCode = getUserFlatCode();
    if (!flatCode) throw new Error('No flat code found');

    const { data, error } = await supabase
      .from('bulletin_postits')
      .insert([{ ...postit, flat_code: flatCode }])
      .select()
      .single();

    if (error) throw error;

    cacheRemove(makeCacheKey(flatCode, 'bulletin_postits'));
    return data;
  },

  update: async (id: number, postit: BulletinPostIt): Promise<void> => {
    const { error } = await supabase.from('bulletin_postits').update(postit).eq('id', id);

    if (error) throw error;

    const flatCode = getUserFlatCode();
    if (flatCode) cacheRemove(makeCacheKey(flatCode, 'bulletin_postits'));
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase.from('bulletin_postits').delete().eq('id', id);

    if (error) throw error;

    const flatCode = getUserFlatCode();
    if (flatCode) cacheRemove(makeCacheKey(flatCode, 'bulletin_postits'));
  },

  // Subscribe to realtime changes
  subscribe: (flatCode: string, callbacks: {
    onInsert?: (postit: BulletinPostIt) => void;
    onUpdate?: (postit: BulletinPostIt) => void;
    onDelete?: (id: number) => void;
  }) => {
    return supabase
      .channel(`bulletin_postits_${flatCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bulletin_postits',
          filter: `flat_code=eq.${flatCode}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && callbacks.onInsert) {
            callbacks.onInsert(payload.new as BulletinPostIt);
          } else if (payload.eventType === 'UPDATE' && callbacks.onUpdate) {
            callbacks.onUpdate(payload.new as BulletinPostIt);
          } else if (payload.eventType === 'DELETE' && callbacks.onDelete) {
            callbacks.onDelete((payload.old as BulletinPostIt).id);
          }
          cacheRemove(makeCacheKey(flatCode, 'bulletin_postits'));
        }
      )
      .subscribe();
  },
};

// Bulletin Drawings API
export const bulletinDrawingsApi = {
  getAll: async (): Promise<BulletinDrawing[]> => {
    const flatCode = getUserFlatCode();
    if (!flatCode) return [];

    const key = makeCacheKey(flatCode, 'bulletin_drawings');
    const cached = cacheGet<BulletinDrawing[]>(key);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('bulletin_drawings')
      .select('*')
      .eq('flat_code', flatCode)
      .order('id', { ascending: true });

    if (error) throw error;

    const result = data || [];
    cacheSet(key, result, CACHE_TTL_MINUTES);
    return result;
  },

  create: async (drawing: Omit<BulletinDrawing, 'id'>): Promise<BulletinDrawing> => {
    const flatCode = getUserFlatCode();
    if (!flatCode) throw new Error('No flat code found');

    const { data, error } = await supabase
      .from('bulletin_drawings')
      .insert([{ ...drawing, flat_code: flatCode }])
      .select()
      .single();

    if (error) throw error;

    cacheRemove(makeCacheKey(flatCode, 'bulletin_drawings'));
    return data;
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase.from('bulletin_drawings').delete().eq('id', id);

    if (error) throw error;

    const flatCode = getUserFlatCode();
    if (flatCode) cacheRemove(makeCacheKey(flatCode, 'bulletin_drawings'));
  },

  // Subscribe to realtime changes
  subscribe: (flatCode: string, callbacks: {
    onInsert?: (drawing: BulletinDrawing) => void;
    onDelete?: (id: number) => void;
  }) => {
    return supabase
      .channel(`bulletin_drawings_${flatCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bulletin_drawings',
          filter: `flat_code=eq.${flatCode}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && callbacks.onInsert) {
            callbacks.onInsert(payload.new as BulletinDrawing);
          } else if (payload.eventType === 'DELETE' && callbacks.onDelete) {
            callbacks.onDelete((payload.old as BulletinDrawing).id);
          }
          cacheRemove(makeCacheKey(flatCode, 'bulletin_drawings'));
        }
      )
      .subscribe();
  },
};

// Bulletin Text API
export const bulletinTextApi = {
  getAll: async (): Promise<BulletinText[]> => {
    const flatCode = getUserFlatCode();
    if (!flatCode) return [];

    const key = makeCacheKey(flatCode, 'bulletin_text');
    const cached = cacheGet<BulletinText[]>(key);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('bulletin_text')
      .select('*')
      .eq('flat_code', flatCode)
      .order('id', { ascending: true });

    if (error) throw error;

    const result = data || [];
    cacheSet(key, result, CACHE_TTL_MINUTES);
    return result;
  },

  create: async (text: Omit<BulletinText, 'id'>): Promise<BulletinText> => {
    const flatCode = getUserFlatCode();
    if (!flatCode) throw new Error('No flat code found');

    const { data, error } = await supabase
      .from('bulletin_text')
      .insert([{ ...text, flat_code: flatCode }])
      .select()
      .single();

    if (error) throw error;

    cacheRemove(makeCacheKey(flatCode, 'bulletin_text'));
    return data;
  },

  update: async (id: number, text: BulletinText): Promise<void> => {
    const { error } = await supabase.from('bulletin_text').update(text).eq('id', id);

    if (error) throw error;

    const flatCode = getUserFlatCode();
    if (flatCode) cacheRemove(makeCacheKey(flatCode, 'bulletin_text'));
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase.from('bulletin_text').delete().eq('id', id);

    if (error) throw error;

    const flatCode = getUserFlatCode();
    if (flatCode) cacheRemove(makeCacheKey(flatCode, 'bulletin_text'));
  },

  // Subscribe to realtime changes
  subscribe: (flatCode: string, callbacks: {
    onInsert?: (text: BulletinText) => void;
    onUpdate?: (text: BulletinText) => void;
    onDelete?: (id: number) => void;
  }) => {
    return supabase
      .channel(`bulletin_text_${flatCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bulletin_text',
          filter: `flat_code=eq.${flatCode}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && callbacks.onInsert) {
            callbacks.onInsert(payload.new as BulletinText);
          } else if (payload.eventType === 'UPDATE' && callbacks.onUpdate) {
            callbacks.onUpdate(payload.new as BulletinText);
          } else if (payload.eventType === 'DELETE' && callbacks.onDelete) {
            callbacks.onDelete((payload.old as BulletinText).id);
          }
          cacheRemove(makeCacheKey(flatCode, 'bulletin_text'));
        }
      )
      .subscribe();
  },
};

// User Interfaces and API
export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*').order('email', { ascending: true });

    if (error) throw error;
    return data || [];
  },
};

// Cleaning Rotation Interfaces
export interface CleaningRotationUser {
  id: number;
  user_id: string;
  order_position: number;
  created_at: string;
  updated_at: string;
  user?: User; // Joined user data
}

export interface RotationState {
  id: number;
  current_user_id: string | null;
  rotation_start_date: string;
  updated_at: string;
  current_user?: User; // Joined user data
}

// Cleaning Rotation API
type RotationRow = {
  id: number;
  user_id: string;
  order_position: number;
  created_at: string;
  updated_at: string;
};

type UserRow = User; // ni har redan User-interface

export const cleaningRotationApi = {
  // Get all users in rotation order
  getRotation: async (): Promise<CleaningRotationUser[]> => {
    // Fetch rotation data
    const { data: rotationData, error: rotationError } = await supabase
      .from('cleaning_rotation')
      .select('*')
      .order('order_position', { ascending: true });

    if (rotationError) {
      console.error('Error fetching rotation:', rotationError);
      throw rotationError;
    }

    console.log('Raw rotation data:', rotationData);

    // Fetch all users
    const { data: usersData, error: usersError } = await supabase.from('users').select('*');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    console.log('All users data:', usersData);

    const rotationRows = (rotationData || []) as RotationRow[];
    const userRows = (usersData || []) as UserRow[];

    const mapped: CleaningRotationUser[] = rotationRows.map((rotationItem) => {
      const user = userRows.find((u) => u.id === rotationItem.user_id);

      console.log(
        `Rotation item ${rotationItem.id} user_id: ${rotationItem.user_id}, found user:`,
        user
      );

      return {
        ...rotationItem,
        user,
      };
    });



    console.log('Mapped rotation data:', mapped);
    return mapped;
  },

  // Get current rotation state
  getState: async (): Promise<RotationState | null> => {
    const { data, error } = await supabase.from('rotation_state').select('*').eq('id', 1).single();

    if (error) {
      console.error('Error fetching rotation state:', error);
      throw error;
    }

    console.log('Raw rotation state:', data);

    // Fetch the current user separately if there is one
    if (data && data.current_user_id) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.current_user_id)
        .single();

      if (userError) {
        console.error('Error fetching current user:', userError);
      }

      console.log('Current user data:', userData);

      const mapped = {
        ...data,
        current_user: userData || null,
      };
      console.log('Mapped rotation state:', mapped);
      return mapped;
    }

    return data;
  },

  // Add user to rotation
  addToRotation: async (userId: string, position: number): Promise<CleaningRotationUser> => {
    const { data, error } = await supabase
      .from('cleaning_rotation')
      .insert([{ user_id: userId, order_position: position }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Remove user from rotation
  removeFromRotation: async (id: number): Promise<void> => {
    const { error } = await supabase.from('cleaning_rotation').delete().eq('id', id);

    if (error) throw error;
  },

  // Manually advance to next person
  advanceRotation: async (): Promise<void> => {
    const { error } = await supabase.rpc('advance_rotation');

    if (error) throw error;
  },

  // Check if rotation needs to advance (7 days passed)
  checkAndAdvanceIfNeeded: async (): Promise<boolean> => {
    const state = await cleaningRotationApi.getState();
    if (!state) return false;

    const startDate = new Date(state.rotation_start_date);
    const today = new Date();
    const daysPassed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysPassed >= 7) {
      await cleaningRotationApi.advanceRotation();
      return true;
    }
    return false;
  },

  // Get days remaining in current rotation
  getDaysRemaining: (rotationStartDate: string): number => {
    const startDate = new Date(rotationStartDate);
    const today = new Date();
    const daysPassed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = 7 - (daysPassed % 7);
    return daysRemaining;
  },
};

// Expenses/Splitwise Interfaces
export interface Expense {
  id: number;
  description: string;
  amount: number;
  paid_by: string;
  split_between: string[]; // Array of user IDs or usernames
  date: string;
  created_at?: string;
  flat_code?: string;
}

export interface Settlement {
  id: number;
  from_user: string;
  to_user: string;
  amount: number;
  date: string;
  created_at?: string;
  flat_code?: string;
}

// Expenses API
export const expensesApi = {
  getAll: async (): Promise<Expense[]> => {
    const flatCode = getUserFlatCode();
    if (!flatCode) return [];

    const key = makeCacheKey(flatCode, 'expenses');
    const cached = cacheGet<Expense[]>(key);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('flat_code', flatCode)
      .order('date', { ascending: false });

    if (error) throw error;

    const result = data || [];
    cacheSet(key, result, CACHE_TTL_MINUTES);
    return result;
  },

  create: async (expense: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> => {
    const flatCode = getUserFlatCode();
    if (!flatCode) throw new Error('No flat code found');

    const { data, error } = await supabase
      .from('expenses')
      .insert([{ ...expense, flat_code: flatCode }])
      .select()
      .single();

    if (error) throw error;

    cacheRemove(makeCacheKey(flatCode, 'expenses'));
    return data;
  },

  update: async (id: number, expense: Partial<Expense>): Promise<void> => {
    const { error } = await supabase.from('expenses').update(expense).eq('id', id);

    if (error) throw error;

    const flatCode = getUserFlatCode();
    if (flatCode) cacheRemove(makeCacheKey(flatCode, 'expenses'));
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);

    if (error) throw error;

    const flatCode = getUserFlatCode();
    if (flatCode) cacheRemove(makeCacheKey(flatCode, 'expenses'));
  },
};

// Settlements API
export const settlementsApi = {
  getAll: async (): Promise<Settlement[]> => {
    const flatCode = getUserFlatCode();
    if (!flatCode) return [];

    const key = makeCacheKey(flatCode, 'settlements');
    const cached = cacheGet<Settlement[]>(key);
    if (cached) return cached;

    const { data, error } = await supabase
      .from('settlements')
      .select('*')
      .eq('flat_code', flatCode)
      .order('date', { ascending: false });

    if (error) throw error;

    const result = data || [];
    cacheSet(key, result, CACHE_TTL_MINUTES);
    return result;
  },

  create: async (settlement: Omit<Settlement, 'id' | 'created_at'>): Promise<Settlement> => {
    const flatCode = getUserFlatCode();
    if (!flatCode) throw new Error('No flat code found');

    const { data, error } = await supabase
      .from('settlements')
      .insert([{ ...settlement, flat_code: flatCode }])
      .select()
      .single();

    if (error) throw error;

    cacheRemove(makeCacheKey(flatCode, 'settlements'));
    return data;
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase.from('settlements').delete().eq('id', id);

    if (error) throw error;

    const flatCode = getUserFlatCode();
    if (flatCode) cacheRemove(makeCacheKey(flatCode, 'settlements'));
  },
};

// Messages Interface
export interface Message {
  id: number;
  user_id: string;
  username: string;
  text: string;
  profile_picture?: string;
  flat_code?: string;
  created_at: string;
}

// Messages API
export const messagesApi = {
  getAll: async (): Promise<Message[]> => {
    const flatCode = getUserFlatCode();
    if (!flatCode) return [];
    
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('flat_code', flatCode)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },
  
  create: async (message: { username: string; text: string; profile_picture?: string; user_id: string }): Promise<Message> => {
    const flatCode = getUserFlatCode();
    if (!flatCode) throw new Error('No flat code found');
    
    const { data, error } = await supabase
      .from('messages')
      .insert([{ ...message, flat_code: flatCode }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
  
  // Subscribe to realtime changes
  subscribe: (flatCode: string, callback: (message: Message) => void) => {
    return supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `flat_code=eq.${flatCode}`,
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();
  },
};

// Direct Messages Interface
export interface DirectMessage {
  id: number;
  sender_id: string;
  sender_username: string;
  receiver_id: string;
  receiver_username: string;
  text: string;
  flat_code?: string;
  created_at: string;
}

// Profile Interface for contacts
export interface Profile {
  id: string;
  email?: string;
  username?: string;
  profile_picture?: string;
  flat_code?: string;
}

// Direct Messages API
export const directMessagesApi = {
  // Get all DMs for current user with a specific contact
  getConversation: async (contactId: string): Promise<DirectMessage[]> => {
    const flatCode = getUserFlatCode();
    if (!flatCode) return [];
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('direct_messages')
      .select('*')
      .eq('flat_code', flatCode)
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },
  
  create: async (message: { receiver_id: string; receiver_username: string; text: string; sender_username: string }): Promise<DirectMessage> => {
    const flatCode = getUserFlatCode();
    if (!flatCode) throw new Error('No flat code found');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('direct_messages')
      .insert([{ 
        ...message, 
        sender_id: user.id,
        flat_code: flatCode 
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('direct_messages')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
  
  // Subscribe to realtime DM changes
  subscribe: (flatCode: string, currentUserId: string, callback: (message: DirectMessage) => void) => {
    return supabase
      .channel('dm-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `flat_code=eq.${flatCode}`,
        },
        (payload) => {
          const msg = payload.new as DirectMessage;
          // Only trigger for messages involving current user
          if (msg.sender_id === currentUserId || msg.receiver_id === currentUserId) {
            callback(msg);
          }
        }
      )
      .subscribe();
  },
};

// Profiles API - to get flat members as contacts
export const profilesApi = {
  getFlatMembers: async (): Promise<Profile[]> => {
    const flatCode = getUserFlatCode();
    if (!flatCode) return [];
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, profile_picture, flat_code')
      .eq('flat_code', flatCode)
      .neq('id', user.id);
    
    if (error) throw error;
    return data || [];
  },
};

// Calendar Event interface
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  all_day: boolean;
  color: string;
  created_by?: string;
  created_by_name?: string;
  flat_code: string;
  created_at?: string;
  updated_at?: string;
}

// Calendar Events API using Supabase with flat_code isolation
export const calendarEventsApi = {
  getAll: async (): Promise<CalendarEvent[]> => {
    const flatCode = getUserFlatCode();
    if (!flatCode) return [];

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('flat_code', flatCode)
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  getByDateRange: async (startDate: string, endDate: string): Promise<CalendarEvent[]> => {
    const flatCode = getUserFlatCode();
    if (!flatCode) return [];

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('flat_code', flatCode)
      .gte('start_date', startDate)
      .lte('start_date', endDate)
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  create: async (event: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>): Promise<CalendarEvent> => {
    const flatCode = getUserFlatCode();
    if (!flatCode) throw new Error('No flat code found');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('calendar_events')
      .insert([{
        ...event,
        flat_code: flatCode,
        created_by: user.id,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    const { data, error } = await supabase
      .from('calendar_events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Subscribe to realtime calendar changes
  subscribe: (callback: (event: CalendarEvent, eventType: 'INSERT' | 'UPDATE' | 'DELETE') => void) => {
    const flatCode = getUserFlatCode();
    if (!flatCode) return null;

    return supabase
      .channel('calendar-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_events',
          filter: `flat_code=eq.${flatCode}`,
        },
        (payload) => {
          const eventType = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE';
          const eventData = (payload.new || payload.old) as CalendarEvent;
          callback(eventData, eventType);
        }
      )
      .subscribe();
  },
};
