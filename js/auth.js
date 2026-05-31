// ============================================
// AUTENTICAÇÃO
// ============================================
const Auth = {
  async init() {
    await this.handleCallback();
    await this.checkSession();
  },
  
  async handleCallback() {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get('access_token')) {
      const { data: { session } } = await sb.auth.getSession();
      if (session) await this.checkSession();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  },
  
  async checkSession() {
    const { data: { session } } = await sb.auth.getSession();
    
    if (session?.user) {
      AppState.user = session.user;
      this.showApp();
      this.updateUserUI();
      await Transactions.load();
      Goals.render();
      Charts.render();
    } else {
      AppState.user = null;
      this.showLogin();
    }
  },
  
  showApp() {
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('sidebar').style.display = 'flex';
    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('bottomNav').style.display = 'flex';
    document.getElementById('mobileUserBar').style.display = 'flex';
  },
  
  showLogin() {
    document.getElementById('loginPage').classList.add('active');
    document.getElementById('sidebar').style.display = 'none';
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('bottomNav').style.display = 'none';
    document.getElementById('mobileUserBar').style.display = 'none';
  },
  
  updateUserUI() {
    const nome = AppState.user.user_metadata?.full_name || AppState.user.email?.split('@')[0] || 'Usuário';
    const email = AppState.user.email;
    const inicial = nome.charAt(0).toUpperCase();
    
    const avatars = ['avatarDesktop', 'mobileAvatar', 'profileAvatar'];
    avatars.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = inicial; });
    
    document.getElementById('userNameDesktop').textContent = nome;
    document.getElementById('userEmailDesktop').textContent = email;
    document.getElementById('mobileUserName').textContent = nome;
    document.getElementById('mobileUserEmail').textContent = email;
    document.getElementById('profileName').textContent = nome;
    document.getElementById('profileEmail').textContent = email;
  },
  
  async login(email, password) {
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await this.checkSession();
    Utils.showToast('✅ Login realizado!');
  },
  
  async signUp(email, password) {
    const { error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    if (error) throw error;
    Utils.showToast('✅ Conta criada! Verifique seu e-mail.');
    this.toggleMode();
  },
  
  async logout() {
    await sb.auth.signOut();
    await this.checkSession();
    Utils.showToast('✅ Até logo!');
  },
  
  async loginGoogle() {
    const btn = document.getElementById('googleBtn');
    btn.disabled = true;
    btn.innerHTML = '⏳ Redirecionando...';
    try {
      await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
    } catch (error) {
      Utils.showToast('❌ Erro: ' + error.message);
      btn.disabled = false;
      btn.innerHTML = '🔐 Continuar com Google';
    }
  },
  
  toggleMode() {
    AppState.isLoginMode = !AppState.isLoginMode;
    const title = document.getElementById('loginTitle');
    const sub = document.getElementById('loginSub');
    const btn = document.getElementById('loginBtn');
    const footer = document.getElementById('loginFooter');
    const googleBtn = document.getElementById('googleBtn');
    
    if (AppState.isLoginMode) {
      title.textContent = 'Bem-vindo de volta';
      sub.textContent = 'Faça login para acessar seu painel financeiro.';
      btn.textContent = 'Entrar';
      btn.onclick = () => this.handleLogin();
      footer.innerHTML = 'Não tem conta? <a onclick="Auth.toggleMode()">Criar conta grátis</a>';
      googleBtn.style.display = 'flex';
    } else {
      title.textContent = 'Criar conta';
      sub.textContent = 'Cadastre-se para começar a controlar suas finanças.';
      btn.textContent = 'Cadastrar';
      btn.onclick = () => this.handleSignUp();
      footer.innerHTML = 'Já tem conta? <a onclick="Auth.toggleMode()">Fazer login</a>';
      googleBtn.style.display = 'none';
    }
  },
  
  async handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) { Utils.showToast('❌ Preencha e-mail e senha'); return; }
    try { await this.login(email, password); } 
    catch (error) { Utils.showToast('❌ ' + (error.message.includes('Invalid') ? 'E-mail ou senha incorretos' : error.message)); }
  },
  
  async handleSignUp() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    if (!email || !password) { Utils.showToast('❌ Preencha e-mail e senha'); return; }
    if (password.length < 6) { Utils.showToast('❌ Senha deve ter no mínimo 6 caracteres'); return; }
    await this.signUp(email, password);
  }
};