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
