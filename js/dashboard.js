// ============================================
// DASHBOARD
// ============================================
const Dashboard = {
  update() {
    const totalIncome = AppState.transactions.filter(t => t.type === 'in').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalExpense = AppState.transactions.filter(t => t.type === 'out').reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(0) : 0;
    
    document.getElementById('totalBalance').innerHTML = `R$ ${Utils.formatMoney(balance)}`;
    document.getElementById('totalIncome').innerHTML = `R$ ${Utils.formatMoney(totalIncome)}`;
    document.getElementById('totalExpense').innerHTML = `R$ ${Utils.formatMoney(totalExpense)}`;
    document.getElementById('savingsRate').innerHTML = `${savingsRate}%`;
  }
};