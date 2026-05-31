// ============================================
// EVENTOS
// ============================================
const Events = {
  init() {
    document.getElementById('searchInput')?.addEventListener('keyup', () => Transactions.filter());
    document.getElementById('typeFilter')?.addEventListener('change', () => Transactions.filter());
    document.getElementById('categoryFilter')?.addEventListener('change', () => Transactions.filter());
    document.getElementById('saveTransactionBtn')?.addEventListener('click', async () => {
      const data = Transactions.getFormData();
      if (!data.name || !data.amount || !data.date) { Utils.showToast('❌ Preencha todos os campos'); return; }
      await Transactions.save(data);
    });
    document.getElementById('cancelModalBtn')?.addEventListener('click', () => Transactions.closeModal());
    document.getElementById('saveGoalBtn')?.addEventListener('click', () => Goals.save());
    document.getElementById('cancelGoalBtn')?.addEventListener('click', () => Goals.closeModal());
    document.getElementById('loginBtn')?.addEventListener('click', () => Auth.handleLogin());
    document.getElementById('googleBtn')?.addEventListener('click', () => Auth.loginGoogle());
    document.getElementById('logoutBtn')?.addEventListener('click', () => Auth.logout());
    document.getElementById('mobileLogoutBtn')?.addEventListener('click', () => Auth.logout());
    document.getElementById('configLogoutBtn')?.addEventListener('click', () => Auth.logout());
    
    const handleEnter = (e) => { if (e.key === 'Enter') AppState.isLoginMode ? Auth.handleLogin() : Auth.handleSignUp(); };
    document.getElementById('loginEmail')?.addEventListener('keypress', handleEnter);
    document.getElementById('loginPassword')?.addEventListener('keypress', handleEnter);
  }
};