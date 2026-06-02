// ============================================
// DASHBOARD - ESTILO CRM PREMIUM
// ============================================
const Dashboard = {
  update() {
    this.updateMainCards();
    this.updateMonthlyCards();
    this.updateIndicators();
    this.updateAccountsSummary();
    this.updateAccountsSummaryCard();
    this.updateUserAvatar();
    
    if (window.Charts) {
      setTimeout(() => {
        Charts.renderForecastChart();
        Charts.renderComparisonChart();
        Charts.renderGoalsVsActual();
      }, 100);
    }
  },
  
  updateUserAvatar() {
    const nome = AppState.user?.user_metadata?.full_name || AppState.user?.email?.split('@')[0] || 'Usuário';
    const inicial = nome.charAt(0).toUpperCase();
    const dashboardAvatar = document.getElementById('dashboardAvatar');
    const dashboardUserName = document.getElementById('dashboardUserName');
    if (dashboardAvatar) dashboardAvatar.textContent = inicial;
    if (dashboardUserName) dashboardUserName.textContent = nome;
  },
  
  updateMainCards() {
    let totalBalance = 0;
    if (AppState.accounts && AppState.accounts.length > 0) {
      totalBalance = AppState.accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    }
    
    const totalIncome = AppState.transactions.filter(t => t.type === 'in').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalExpense = AppState.transactions.filter(t => t.type === 'out').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const savingsRate = totalIncome > 0 ? ((totalBalance / totalIncome) * 100).toFixed(0) : 0;
    
    const totalBalanceEl = document.getElementById('totalBalance');
    const savingsRateEl = document.getElementById('savingsRate');
    
    if (totalBalanceEl) totalBalanceEl.innerHTML = `R$ ${Utils.formatMoney(totalBalance)}`;
    if (savingsRateEl) savingsRateEl.innerHTML = `${savingsRate}%`;
  },
  
  updateMonthlyCards() {
    const now = new Date();
    const monthTransactions = AppState.transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    
    const monthlyIncome = monthTransactions.filter(t => t.type === 'in').reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpense = monthTransactions.filter(t => t.type === 'out').reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyIncomeEl = document.getElementById('monthlyIncome');
    const monthlyExpenseEl = document.getElementById('monthlyExpense');
    
    if (monthlyIncomeEl) monthlyIncomeEl.innerHTML = `R$ ${Utils.formatMoney(monthlyIncome)}`;
    if (monthlyExpenseEl) monthlyExpenseEl.innerHTML = `R$ ${Utils.formatMoney(monthlyExpense)}`;
  },
  
  updateIndicators() {
    let bankBalance = 0;
    let walletBalance = 0;
    
    if (AppState.accounts) {
      bankBalance = AppState.accounts
        .filter(acc => acc.type !== 'carteira' && acc.type !== 'dinheiro')
        .reduce((sum, acc) => sum + (acc.balance || 0), 0);
      
      walletBalance = AppState.accounts
        .filter(acc => acc.type === 'carteira' || acc.type === 'dinheiro')
        .reduce((sum, acc) => sum + (acc.balance || 0), 0);
    }
    
    const totalBankBalanceEl = document.getElementById('totalBankBalance');
    const totalWalletBalanceEl = document.getElementById('totalWalletBalance');
    const activeGoalsEl = document.getElementById('activeGoals');
    const pendingBillsCountEl = document.getElementById('pendingBillsCount');
    
    if (totalBankBalanceEl) totalBankBalanceEl.innerHTML = `R$ ${Utils.formatMoney(bankBalance)}`;
    if (totalWalletBalanceEl) totalWalletBalanceEl.innerHTML = `R$ ${Utils.formatMoney(walletBalance)}`;
    if (activeGoalsEl) activeGoalsEl.innerHTML = AppState.goals?.length || 0;
    
    if (AppState.bills) {
      const pending = AppState.bills.filter(b => b.status === 'pending').length;
      if (pendingBillsCountEl) pendingBillsCountEl.innerHTML = pending;
    }
  },
  
  updateAccountsSummary() {
    let totalAccountsBalance = 0;
    if (AppState.accounts) {
      totalAccountsBalance = AppState.accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    }
    
    const totalAccountsBalanceEl = document.getElementById('totalAccountsBalance');
    const accountsCountEl = document.getElementById('accountsCount');
    
    if (totalAccountsBalanceEl) totalAccountsBalanceEl.innerHTML = `R$ ${Utils.formatMoney(totalAccountsBalance)}`;
    if (accountsCountEl) accountsCountEl.innerHTML = AppState.accounts?.length || 0;
  },
  
  updateAccountsSummaryCard() {
    const container = document.getElementById('accountsSummaryContent');
    if (!container) return;
    
    if (!AppState.accounts || AppState.accounts.length === 0) {
      container.innerHTML = '<div class="account-placeholder">🏦 Nenhuma conta cadastrada</div>';
      return;
    }
    
    container.innerHTML = AppState.accounts.map(acc => `
      <div class="account-item-modern">
        <div style="font-size: 28px;">${acc.icon || '🏦'}</div>
        <div>
          <div style="font-weight: 600; font-size: var(--text-sm);">${Utils.escapeHtml(acc.name)}</div>
          <div style="font-size: var(--text-xs); color: var(--text-tertiary);">${acc.bank}</div>
          <div style="font-family: var(--font-mono); font-weight: 700; font-size: var(--text-sm); color: var(--success);">R$ ${Utils.formatMoney(acc.balance)}</div>
        </div>
      </div>
    `).join('');
  },
  
  showAccountDetails() {
    if (!AppState.accounts || AppState.accounts.length === 0) {
      Utils.showToast('Nenhuma conta cadastrada');
      return;
    }
    
    let message = '📊 RESUMO DAS CONTAS:\n\n';
    AppState.accounts.forEach(acc => {
      message += `${acc.icon || '🏦'} ${acc.name} (${acc.bank})\n`;
      message += `   Saldo: R$ ${Utils.formatMoney(acc.balance)}\n`;
      message += `   Tipo: ${this.getTypeName(acc.type)}\n\n`;
    });
    
    const total = AppState.accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    message += `━━━━━━━━━━━━━━━━━━\n`;
    message += `💰 SALDO TOTAL: R$ ${Utils.formatMoney(total)}`;
    
    alert(message);
  },
  
  getTypeName(type) {
    const names = {
      corrente: 'Conta Corrente',
      poupanca: 'Poupança',
      carteira: 'Carteira',
      dinheiro: 'Dinheiro físico',
      investimento: 'Investimento',
      cartao: 'Cartão de Crédito'
    };
    return names[type] || type;
  }
};