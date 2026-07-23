import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://imguadokkmkckvukkmjg.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltZ3VhZG9ra21rY2t2dWtrbWpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ0Njg2NzMsImV4cCI6MjEwMDA0NDY3M30.i6hCSre2R7xoQKI-E1khteYppTAqc_J3NzmdgGetGz8';

export const supabaseMobile = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
