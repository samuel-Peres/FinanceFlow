// ============================================
// CONFIGURAÇÃO DO SUPABASE
// ============================================
const CONFIG = {
  SUPABASE_URL: 'https://xsiajskzpoaqdytmtxuo.supabase.co',
  SUPABASE_KEY: 'sb_publishable_W1LwwWm1SAcAETokgUu4zw_8ubXEtHL'
};

// Cliente Supabase
const supabaseClient = window.supabase;
const sb = supabaseClient.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

// Estado Global
const AppState = {
  user: null,
  transactions: [],
  goals: JSON.parse(localStorage.getItem('finance_goals') || '[]'),
  editId: null,
  isLoginMode: true,
  chartInstance: null
};