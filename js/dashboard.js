// ============================================
// DASHBOARD (COMPLETO - COM GRÁFICOS)
// ============================================
const Dashboard = {
  update() {
    this.updateMainCards();
    this.updateMonthlyCards();
    this.updateIndicators();
    this.updateAccountsSummary();
    this.updateAccountsSummaryCard();
    
    // Atualizar gráficos avançados
    if (window.Charts) {
      setTimeout(() => {
        Charts.renderForecastChart();
        Charts.renderComparisonChart();
        Charts.renderGoalsVsActual();
      }, 100);
    }
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
    
    console.log('Saldo total atualizado:', totalBalance);
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
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const upcomingBills = AppState.bills.filter(b => {
        const dueDate = new Date(b.due_date);
        return b.status !== 'paid' && dueDate >= today && dueDate <= nextWeek;
      }).length;
      
      if (pendingBillsCountEl) pendingBillsCountEl.innerHTML = upcomingBills;
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
    
    console.log('Resumo das contas:', {
      total: totalAccountsBalance,
      count: AppState.accounts?.length,
      accounts: AppState.accounts
    });
  },
  
  updateAccountsSummaryCard() {
    const container = document.getElementById('accountsSummaryContent');
    if (!container) return;
    
    if (!AppState.accounts || AppState.accounts.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);width:100%;">Nenhuma conta cadastrada</div>';
      return;
    }
    
    container.innerHTML = AppState.accounts.map(acc => `
      <div style="text-align:center; min-width: 100px; background:var(--bg3); padding:12px; border-radius:12px;">
        <div style="font-size: 28px;">${acc.icon || '🏦'}</div>
        <div style="font-weight: 600; font-size: 12px; margin-top: 5px;">${Utils.escapeHtml(acc.name)}</div>
        <div style="font-size: 14px; font-weight: 700; color: var(--green); margin-top: 5px;">R$ ${Utils.formatMoney(acc.balance)}</div>
        <div style="font-size: 10px; color: var(--muted);">${acc.bank}</div>
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