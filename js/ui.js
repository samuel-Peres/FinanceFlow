// ============================================
// INTERFACE DO USUÁRIO (Tema, Navegação) - CORRIGIDO
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
      if (window.Charts) Charts.render();
    });
  },
  
  initNavigation() {
    console.log('🔄 Inicializando navegação...');
    
    // Sidebar navigation
    document.querySelectorAll('.sidebar .nav-item').forEach(item => {
      item.removeEventListener('click', this.handleNavClick);
      item.addEventListener('click', this.handleNavClick);
    });
    
    // Bottom nav navigation
    document.querySelectorAll('.bottom-nav .bn-item').forEach(item => {
      item.removeEventListener('click', this.handleNavClick);
      item.addEventListener('click', this.handleNavClick);
    });
    
    // Botões especiais
    const viewAllBtn = document.getElementById('viewAllBtn');
    if (viewAllBtn) {
      viewAllBtn.removeEventListener('click', this.handleViewAll);
      viewAllBtn.addEventListener('click', this.handleViewAll);
    }
    
    const newTransactionBtn = document.getElementById('newTransactionBtn');
    if (newTransactionBtn) {
      newTransactionBtn.removeEventListener('click', this.handleNewTransaction);
      newTransactionBtn.addEventListener('click', this.handleNewTransaction);
    }
    
    const newTransactionBtn2 = document.getElementById('newTransactionBtn2');
    if (newTransactionBtn2) {
      newTransactionBtn2.removeEventListener('click', this.handleNewTransaction);
      newTransactionBtn2.addEventListener('click', this.handleNewTransaction);
    }
    
    const newGoalBtn = document.getElementById('newGoalBtn');
    if (newGoalBtn) {
      newGoalBtn.removeEventListener('click', this.handleNewGoal);
      newGoalBtn.addEventListener('click', this.handleNewGoal);
    }
  },
  
  handleNavClick(e) {
    const item = e.currentTarget;
    const page = item.dataset.page;
    if (page) {
      UI.showPage(page);
      UI.setActive(item);
    }
  },
  
  handleViewAll() {
    UI.showPage('transactions');
    document.querySelectorAll('.sidebar .nav-item, .bottom-nav .bn-item').forEach(i => i.classList.remove('active'));
    const targetItem = document.querySelector(`.sidebar .nav-item[data-page="transactions"], .bottom-nav .bn-item[data-page="transactions"]`);
    if (targetItem) targetItem.classList.add('active');
  },
  
  handleNewTransaction() {
    if (window.Transactions) Transactions.openModal();
  },
  
  handleNewGoal() {
    if (window.Goals) Goals.openModal();
  },
  
  showPage(pageId) {
    console.log('📄 Mostrando página:', pageId);
    
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
      page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
      targetPage.classList.add('active');
      console.log(`✅ Página ${pageId} ativada`);
      
      if (pageId === 'transactions' && window.Transactions) {
        setTimeout(() => {
          console.log('🔄 Re-renderizando transações...');
          Transactions.renderTable();
        }, 100);
      }
    } else {
      console.error(`❌ Página ${pageId} não encontrada`);
    }
  },
  
  setActive(activeItem) {
    document.querySelectorAll('.sidebar .nav-item, .bottom-nav .bn-item').forEach(item => {
      item.classList.remove('active');
    });
    if (activeItem) activeItem.classList.add('active');
  }
};