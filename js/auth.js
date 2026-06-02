// ============================================
// AUTENTICAÇÃO - VERSÃO ULTRA SEGURA
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
      if (typeof Transactions !== 'undefined') await Transactions.load();
      if (typeof Goals !== 'undefined') Goals.render();
      if (typeof Charts !== 'undefined') Charts.render();
    } else {
      AppState.user = null;
      this.showLogin();
    }
  },
  
  showApp() {
    const loginPage = document.getElementById('loginPage');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    if (loginPage) loginPage.classList.remove('active');
    if (sidebar) sidebar.style.display = 'flex';
    if (mainContent) mainContent.style.display = 'block';
  },
  
  showLogin() {
    const loginPage = document.getElementById('loginPage');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    if (loginPage) loginPage.classList.add('active');
    if (sidebar) sidebar.style.display = 'none';
    if (mainContent) mainContent.style.display = 'none';
  },
  
  updateUserUI() {
    const nome = AppState.user.user_metadata?.full_name || AppState.user.email?.split('@')[0] || 'Usuário';
    const email = AppState.user.email;
    const inicial = nome.charAt(0).toUpperCase();
    
    const avatarDesktop = document.getElementById('avatarDesktop');
    const mobileAvatar = document.getElementById('mobileAvatar');
    const profileAvatar = document.getElementById('profileAvatar');
    const userNameDesktop = document.getElementById('userNameDesktop');
    const userEmailDesktop = document.getElementById('userEmailDesktop');
    const mobileUserName = document.getElementById('mobileUserName');
    const mobileUserEmail = document.getElementById('mobileUserEmail');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    
    if (avatarDesktop) avatarDesktop.textContent = inicial;
    if (mobileAvatar) mobileAvatar.textContent = inicial;
    if (profileAvatar) profileAvatar.textContent = inicial;
    if (userNameDesktop) userNameDesktop.textContent = nome;
    if (userEmailDesktop) userEmailDesktop.textContent = email;
    if (mobileUserName) mobileUserName.textContent = nome;
    if (mobileUserEmail) mobileUserEmail.textContent = email;
    if (profileName) profileName.textContent = nome;
    if (profileEmail) profileEmail.textContent = email;
  },
  
  async login(email, password) {
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await this.checkSession();
    if (typeof Utils !== 'undefined') Utils.showToast('✅ Login realizado!');
  },
  
  async signUp(email, password) {
    const { error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    if (error) throw error;
    if (typeof Utils !== 'undefined') Utils.showToast('✅ Conta criada! Verifique seu e-mail.');
    this.toggleMode();
  },
  
  async logout() {
    await sb.auth.signOut();
    await this.checkSession();
    if (typeof Utils !== 'undefined') Utils.showToast('✅ Até logo!');
  },
  
  async loginGoogle() {
    const btn = document.getElementById('googleBtn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '⏳ Redirecionando...';
    }
    try {
      await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
    } catch (error) {
      if (typeof Utils !== 'undefined') Utils.showToast('❌ Erro: ' + error.message);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '🔐 Continuar com Google';
      }
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
      if (title) title.textContent = 'Bem-vindo de volta';
      if (sub) sub.textContent = 'Faça login para acessar seu painel financeiro.';
      if (btn) btn.textContent = 'Entrar';
      if (btn) btn.onclick = () => this.handleLogin();
      if (footer) footer.innerHTML = 'Não tem conta? <a onclick="Auth.toggleMode()">Criar conta grátis</a>';
      if (googleBtn) googleBtn.style.display = 'flex';
    } else {
      if (title) title.textContent = 'Criar conta';
      if (sub) sub.textContent = 'Cadastre-se para começar a controlar suas finanças.';
      if (btn) btn.textContent = 'Cadastrar';
      if (btn) btn.onclick = () => this.handleSignUp();
      if (footer) footer.innerHTML = 'Já tem conta? <a onclick="Auth.toggleMode()">Fazer login</a>';
      if (googleBtn) googleBtn.style.display = 'none';
    }
  },
  
  async handleLogin() {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    if (!email || !password) { 
      if (typeof Utils !== 'undefined') Utils.showToast('❌ Preencha e-mail e senha'); 
      return; 
    }
    try { await this.login(email, password); } 
    catch (error) { 
      if (typeof Utils !== 'undefined') Utils.showToast('❌ ' + (error.message.includes('Invalid') ? 'E-mail ou senha incorretos' : error.message)); 
    }
  },
  
  async handleSignUp() {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    if (!email || !password) { 
      if (typeof Utils !== 'undefined') Utils.showToast('❌ Preencha e-mail e senha'); 
      return; 
    }
    if (password.length < 6) { 
      if (typeof Utils !== 'undefined') Utils.showToast('❌ Senha deve ter no mínimo 6 caracteres'); 
      return; 
    }
    await this.signUp(email, password);
  }
};