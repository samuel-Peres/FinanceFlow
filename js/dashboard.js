// ============================================
// DASHBOARD (ATUALIZADO)
// ============================================
const Dashboard = {
  update() {
    this.updateMainCards();
    this.updateMonthlyCards();
    this.updateIndicators();
  },
  
  updateMainCards() {
    const totalIncome = AppState.transactions.filter(t => t.type === 'in').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalExpense = AppState.transactions.filter(t => t.type === 'out').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(0) : 0;
    
    document.getElementById('totalBalance').innerHTML = `R$ ${Utils.formatMoney(balance)}`;
    document.getElementById('savingsRate').innerHTML = `${savingsRate}%`;
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
    // Total em bancos
    const totalBankBalance = document.getElementById('totalBankBalance');
    if (totalBankBalance && window.Accounts) {
      totalBankBalance.innerHTML = `R$ ${Utils.formatMoney(Accounts.getBankBalance())}`;
    }
    
    // Total em carteira
    const totalWalletBalance = document.getElementById('totalWalletBalance');
    if (totalWalletBalance && window.Accounts) {
      totalWalletBalance.innerHTML = `R$ ${Utils.formatMoney(Accounts.getWalletBalance())}`;
    }
    
    // Metas ativas
    const activeGoals = document.getElementById('activeGoals');
    if (activeGoals && window.Goals) {
      activeGoals.innerHTML = AppState.goals?.length || 0;
    }
    
    // Contas a vencer
    const pendingBillsCount = document.getElementById('pendingBillsCount');
    if (pendingBillsCount && window.Bills) {
      const pending = AppState.bills?.filter(b => b.status === 'pending') || [];
      pendingBillsCount.innerHTML = pending.length;
    }
  },
  
  updateAccountsSummary() {
    const totalAccountsBalance = document.getElementById('totalAccountsBalance');
    const accountsCount = document.getElementById('accountsCount');
    
    if (totalAccountsBalance && window.Accounts) {
      totalAccountsBalance.innerHTML = `R$ ${Utils.formatMoney(Accounts.getTotalBalance())}`;
    }
    if (accountsCount && AppState.accounts) {
      accountsCount.innerHTML = AppState.accounts.length;
    }
  }
};