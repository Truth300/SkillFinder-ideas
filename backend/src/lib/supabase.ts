import { createClient } from '@supabase/supabase-js';
// 1. Import the ws library to supply native WebSocket mappings
import ws from 'ws';

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key';

// 2. Pass the WebSocket transport configuration to prevent the Node 20 runtime engine crash
export const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    transport: ws as any,
  },
});
