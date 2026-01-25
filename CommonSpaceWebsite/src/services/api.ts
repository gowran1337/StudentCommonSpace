import { supabase } from '../lib/supabase';

export interface CleaningTask {
  id: number;
  text: string;
  completed: boolean;
  assignee: string;
}

export interface CleaningScheduleItem {
  id: number;
  area: string;
  day: string;
  assignee: string;
}

export interface ShoppingItem {
  id: number;
  item: string;
  quantity: string;
  purchased: boolean;
  addedBy: string;
}

// Cleaning Tasks API using Supabase
export const cleaningTasksApi = {
  getAll: async (): Promise<CleaningTask[]> => {
    const { data, error } = await supabase
      .from('cleaning_tasks')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  create: async (task: Omit<CleaningTask, 'id'>): Promise<CleaningTask> => {
    const { data, error } = await supabase
      .from('cleaning_tasks')
      .insert([task])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (id: number, task: CleaningTask): Promise<void> => {
    const { error } = await supabase
      .from('cleaning_tasks')
      .update(task)
      .eq('id', id);

    if (error) throw error;
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('cleaning_tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Cleaning Schedule API using Supabase
export const cleaningScheduleApi = {
  getAll: async (): Promise<CleaningScheduleItem[]> => {
    const { data, error } = await supabase
      .from('cleaning_schedule')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  create: async (item: Omit<CleaningScheduleItem, 'id'>): Promise<CleaningScheduleItem> => {
    const { data, error } = await supabase
      .from('cleaning_schedule')
      .insert([item])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (id: number, item: CleaningScheduleItem): Promise<void> => {
    const { error } = await supabase
      .from('cleaning_schedule')
      .update(item)
      .eq('id', id);

    if (error) throw error;
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('cleaning_schedule')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Shopping List API using Supabase
export const shoppingListApi = {
  getAll: async (): Promise<ShoppingItem[]> => {
    const { data, error } = await supabase
      .from('shopping_list')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    return (data || []).map(item => ({
      id: item.id,
      item: item.item,
      quantity: item.quantity,
      purchased: item.purchased,
      addedBy: item.added_by,
    }));
  },

  create: async (item: Omit<ShoppingItem, 'id'>): Promise<ShoppingItem> => {
    const { data, error } = await supabase
      .from('shopping_list')
      .insert([{
        item: item.item,
        quantity: item.quantity,
        purchased: item.purchased,
        added_by: item.addedBy,
      }])
      .select()
      .single();

    if (error) throw error;
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
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('shopping_list')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Bulletin Board Interfaces
export interface BulletinPostIt {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
}

export interface BulletinDrawing {
  id: number;
  paths: string; // JSON string of drawing paths
  color: string;
}

export interface BulletinText {
  id: number;
  x: number;
  y: number;
  text: string;
  font_size: number;
  color: string;
}

// Bulletin Post-its API
export const bulletinPostItsApi = {
  getAll: async (): Promise<BulletinPostIt[]> => {
    const { data, error } = await supabase
      .from('bulletin_postits')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  create: async (postit: Omit<BulletinPostIt, 'id'>): Promise<BulletinPostIt> => {
    const { data, error } = await supabase
      .from('bulletin_postits')
      .insert([postit])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (id: number, postit: BulletinPostIt): Promise<void> => {
    const { error } = await supabase
      .from('bulletin_postits')
      .update(postit)
      .eq('id', id);

    if (error) throw error;
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('bulletin_postits')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Bulletin Drawings API
export const bulletinDrawingsApi = {
  getAll: async (): Promise<BulletinDrawing[]> => {
    const { data, error } = await supabase
      .from('bulletin_drawings')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  create: async (drawing: Omit<BulletinDrawing, 'id'>): Promise<BulletinDrawing> => {
    const { data, error } = await supabase
      .from('bulletin_drawings')
      .insert([drawing])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('bulletin_drawings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// Bulletin Text API
export const bulletinTextApi = {
  getAll: async (): Promise<BulletinText[]> => {
    const { data, error } = await supabase
      .from('bulletin_text')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  create: async (text: Omit<BulletinText, 'id'>): Promise<BulletinText> => {
    const { data, error } = await supabase
      .from('bulletin_text')
      .insert([text])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  update: async (id: number, text: BulletinText): Promise<void> => {
    const { error } = await supabase
      .from('bulletin_text')
      .update(text)
      .eq('id', id);

    if (error) throw error;
  },

  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('bulletin_text')
      .delete()
      .eq('id', id);

    if (error) throw error;
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
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('email', { ascending: true });

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
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    console.log('All users data:', usersData);

    // Manually join the data
    const mapped = (rotationData || []).map(rotationItem => {
      const user = (usersData || []).find(u => u.id === rotationItem.user_id);
      console.log(`Rotation item ${rotationItem.id} user_id: ${rotationItem.user_id}, found user:`, user);
      return {
        ...rotationItem,
        user: user || null
      };
    });

    console.log('Mapped rotation data:', mapped);
    return mapped;
  },

  // Get current rotation state
  getState: async (): Promise<RotationState | null> => {
    const { data, error } = await supabase
      .from('rotation_state')
      .select('*')
      .eq('id', 1)
      .single();

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
        current_user: userData || null
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
    const { error } = await supabase
      .from('cleaning_rotation')
      .delete()
      .eq('id', id);

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
}

export interface Settlement {
  id: number;
  from_user: string;
  to_user: string;
  amount: number;
  date: string;
  created_at?: string;
}

// Expenses API
export const expensesApi = {
  getAll: async (): Promise<Expense[]> => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
  
  create: async (expense: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> => {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expense])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  update: async (id: number, expense: Partial<Expense>): Promise<void> => {
    const { error } = await supabase
      .from('expenses')
      .update(expense)
      .eq('id', id);
    
    if (error) throw error;
  },
  
  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

// Settlements API
export const settlementsApi = {
  getAll: async (): Promise<Settlement[]> => {
    const { data, error } = await supabase
      .from('settlements')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
  
  create: async (settlement: Omit<Settlement, 'id' | 'created_at'>): Promise<Settlement> => {
    const { data, error } = await supabase
      .from('settlements')
      .insert([settlement])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  delete: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('settlements')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};

