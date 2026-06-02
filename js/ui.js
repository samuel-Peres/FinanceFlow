// ============================================
// INTERFACE DO USUÁRIO - SEM BOTTOM NAV
// ============================================
const UI = {
  initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const root = document.documentElement;
    const toggle = document.getElementById('themeToggle');
    
    if (savedTheme === 'light') {
      this.setLightTheme(root);
      if (toggle) toggle.classList.add('on');
    } else {
      this.setDarkTheme(root);
      if (toggle && savedTheme !== 'light') toggle.classList.remove('on');
    }
    
    toggle?.addEventListener('click', () => {
      const isDark = root.style.getPropertyValue('--bg') === '#0a0a0f' || 
                     (!root.style.getPropertyValue('--bg') && localStorage.getItem('theme') !== 'light');
      
      if (isDark) {
        this.setLightTheme(root);
        localStorage.setItem('theme', 'light');
        toggle.classList.add('on');
      } else {
        this.setDarkTheme(root);
        localStorage.setItem('theme', 'dark');
        toggle.classList.remove('on');
      }
      
      setTimeout(() => {
        if (window.Charts) Charts.render();
      }, 100);
    });
  },
  
  setLightTheme(root) {
    root.style.setProperty('--bg', '#f8f9fa');
    root.style.setProperty('--bg-surface', '#ffffff');
    root.style.setProperty('--bg-elevated', '#f1f3f5');
    root.style.setProperty('--text-primary', '#212529');
    root.style.setProperty('--text-secondary', '#6c757d');
    root.style.setProperty('--text-tertiary', '#adb5bd');
    root.style.setProperty('--border', 'rgba(0, 0, 0, 0.08)');
    root.style.setProperty('--border-hover', 'rgba(0, 0, 0, 0.12)');
  },
  
  setDarkTheme(root) {
    root.style.setProperty('--bg', '#0a0a0f');
    root.style.setProperty('--bg-surface', '#121218');
    root.style.setProperty('--bg-elevated', '#1a1a24');
    root.style.setProperty('--text-primary', '#ffffff');
    root.style.setProperty('--text-secondary', '#a1a1b0');
    root.style.setProperty('--text-tertiary', '#6b6b7f');
    root.style.setProperty('--border', 'rgba(255, 255, 255, 0.06)');
    root.style.setProperty('--border-hover', 'rgba(255, 255, 255, 0.12)');
  },
  
  initNavigation() {
    console.log('🔄 Inicializando navegação...');
    
    document.querySelectorAll('.sidebar .nav-item').forEach(item => {
      item.removeEventListener('click', this.handleNavClick);
      item.addEventListener('click', this.handleNavClick);
    });
    
    const viewAllBtn = document.getElementById('viewAllBtn');
    if (viewAllBtn) {
      viewAllBtn.removeEventListener('click', this.handleViewAll);
      viewAllBtn.addEventListener('click', this.handleViewAll);
    }
    
    const newGoalBtn = document.getElementById('newGoalBtn');
    if (newGoalBtn) {
      newGoalBtn.removeEventListener('click', this.handleNewGoal);
      newGoalBtn.addEventListener('click', this.handleNewGoal);
    }
    
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
      sidebarToggle.removeEventListener('click', this.handleSidebarToggle);
      sidebarToggle.addEventListener('click', this.handleSidebarToggle);
    }
    
    this.initSidebarState();
  },
  
  handleSidebarToggle() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('collapsed');
      localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
    }
  },
  
  initSidebarState() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar && localStorage.getItem('sidebarCollapsed') === 'true') {
      sidebar.classList.add('collapsed');
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
    document.querySelectorAll('.sidebar .nav-item').forEach(i => i.classList.remove('active'));
    const targetItem = document.querySelector(`.sidebar .nav-item[data-page="transactions"]`);
    if (targetItem) targetItem.classList.add('active');
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
        setTimeout(() => Transactions.renderTable(), 100);
      }
      if (pageId === 'accounts' && window.Accounts) {
        setTimeout(() => Accounts.render(), 100);
      }
      if (pageId === 'dashboard' && window.Dashboard) {
        setTimeout(() => Dashboard.update(), 100);
      }
    } else {
      console.error(`❌ Página ${pageId} não encontrada`);
    }
  },
  
  setActive(activeItem) {
    document.querySelectorAll('.sidebar .nav-item').forEach(item => {
      item.classList.remove('active');
    });
    if (activeItem) activeItem.classList.add('active');
  },
  
  initModals() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('open');
        }
      });
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(modal => {
          modal.classList.remove('open');
        });
      }
    });
  }
};