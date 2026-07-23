import { supabaseMobile } from './supabaseClient';
import { WilliamFileCard } from '../store/useWilliamStore';

export interface ExecChat {
  id: string;
  sender: 'user' | 'william';
  text: string;
  time: string;
}

export interface UserPortrait {
  name: string;
  identity: string;
  values: string;
  cognitive_profile?: {
    problemSolvingStyle?: string;
    temporalBias?: string;
  };
}

// 1. Direct Supabase Cloud Fetch: Executive Portrait & Cognitive Profile
export async function fetchUserPortrait(): Promise<UserPortrait> {
  try {
    const { data, error } = await supabaseMobile
      .from('portraits')
      .select('*')
      .limit(1);
    if (!error && data && data.length > 0) {
      return data[0];
    }
  } catch (err) {
    console.log('Direct Supabase fetch error (portrait):', err);
  }
  return {
    name: 'William',
    identity: 'Systems Architect & Chief Executive',
    values: 'Autonomy, aesthetic excellence, compounding focus',
  };
}

// 2. Direct Supabase Cloud Fetch: Executive Chat History
export async function fetchChatHistory(): Promise<ExecChat[]> {
  try {
    const { data, error } = await supabaseMobile
      .from('chats')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(30);
    if (!error && data) {
      return data.map(d => ({
        id: d.id,
        sender: d.sender || 'william',
        text: d.text,
        time: d.time || 'Now',
      }));
    }
  } catch (err) {
    console.log('Direct Supabase fetch error (chats):', err);
  }
  return [];
}

// 3. Direct Supabase Cloud Fetch: Executive Briefings
export async function fetchBriefings(): Promise<any[]> {
  try {
    const { data, error } = await supabaseMobile
      .from('briefings')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) {
      return data;
    }
  } catch (err) {
    console.log('Direct Supabase fetch error (briefings):', err);
  }
  return [];
}

// 4. Direct Supabase Cloud Fetch: Smart Calendar Events
export async function fetchCalendarEvents(): Promise<any[]> {
  try {
    const { data, error } = await supabaseMobile
      .from('calendar_events')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && data) {
      return data;
    }
  } catch (err) {
    console.log('Direct Supabase fetch error (calendar):', err);
  }
  return [];
}

// 5. Direct Supabase Cloud Fetch: Active Execution Commands
export async function fetchActiveCommands(): Promise<any[]> {
  try {
    const { data, error } = await supabaseMobile
      .from('commands')
      .select('*')
      .eq('completed', false)
      .order('priority', { ascending: true });
    if (!error && data) {
      return data;
    }
  } catch (err) {
    console.log('Direct Supabase fetch error (commands):', err);
  }
  return [];
}

// 6. Direct Supabase Cloud Write: Create New Command
export async function createNewCommand(title: string, duration = '30m'): Promise<any> {
  const { data, error } = await supabaseMobile
    .from('commands')
    .insert({
      title,
      estimated_duration: duration,
      priority: 1,
      completed: false,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

// 7. Direct Supabase Cloud Write: Create New Calendar Event
export async function createNewCalendarEvent(title: string, time: string, location = 'Remote'): Promise<any> {
  const { data, error } = await supabaseMobile
    .from('calendar_events')
    .insert({
      title,
      time,
      location,
      duration: '45m',
      status: 'upcoming',
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

// 8. Direct Supabase Cloud Write: Create New Executive Briefing
export async function createNewBriefing(title: string, body: string, urgent = false): Promise<any> {
  const { data, error } = await supabaseMobile
    .from('briefings')
    .insert({
      title,
      subtitle: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Executive Briefing`,
      body,
      urgent,
      type: urgent ? 'urgent' : 'digest',
      time: 'Just now',
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}
