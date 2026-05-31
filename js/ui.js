// ============================================
// INTERFACE DO USUÁRIO (Tema, Navegação)
// ============================================
const UI = {
  initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const root = document.documentElement;
    const toggle = document.getElementById('themeToggle');
    
    if (savedTheme === 'light') {
      root.style.setProperty('--bg', '#ffffff');
      root.style.setProperty('--bg2', '#f5f5f5');
      root.style.setProperty('--bg3', '#e8e8e8');
      root.style.setProperty('--text', '#1a1a1a');
      root.style.setProperty('--muted', '#666666');
      if (toggle) toggle.classList.add('on');
    }
    
    toggle?.addEventListener('click', () => {
      const isDark = root.style.getPropertyValue('--bg') === '#0a0a0f' || root.style.getPropertyValue('--bg') === '';
      if (isDark) {
        root.style.setProperty('--bg', '#ffffff');
        root.style.setProperty('--bg2', '#f5f5f5');
        root.style.setProperty('--bg3', '#e8e8e8');
        root.style.setProperty('--text', '#1a1a1a');
        root.style.setProperty('--muted', '#666666');
        localStorage.setItem('theme', 'light');
        toggle.classList.add('on');
      } else {
        root.style.setProperty('--bg', '#0a0a0f');
        root.style.setProperty('--bg2', '#111118');
        root.style.setProperty('--bg3', '#18181f');
        root.style.setProperty('--text', '#f0f0f5');
        root.style.setProperty('--muted', '#6b6b80');
        localStorage.setItem('theme', 'dark');
        toggle.classList.remove('on');
      }
      Charts.render();
    });
  },
  
  initNavigation() {
    document.querySelectorAll('.sidebar .nav-item, .bottom-nav .bn-item').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        this.showPage(page);
        this.setActive(item);
      });
    });
    
    document.getElementById('viewAllBtn')?.addEventListener('click', () => this.showPage('transactions'));
    document.getElementById('newTransactionBtn')?.addEventListener('click', () => Transactions.openModal());
    document.getElementById('newTransactionBtn2')?.addEventListener('click', () => Transactions.openModal());
    document.getElementById('newGoalBtn')?.addEventListener('click', () => Goals.openModal());
  },
  
  showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${pageId}`).classList.add('active');
  },
  
  setActive(activeItem) {
    document.querySelectorAll('.sidebar .nav-item, .bottom-nav .bn-item').forEach(item => item.classList.remove('active'));
    activeItem.classList.add('active');
  }
};