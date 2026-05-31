// ============================================
// ALERTAS
// ============================================
const Alerts = {
  init() {
    const limitInput = document.getElementById('spendingLimit');
    limitInput?.addEventListener('change', () => this.checkSpending());
    this.checkSpending();
  },
  
  checkSpending() {
    const limit = parseFloat(document.getElementById('spendingLimit')?.value);
    if (!limit) return;
    
    const now = new Date();
    const monthExpenses = AppState.transactions.filter(t => {
      const d = new Date(t.date);
      return t.type === 'out' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, t) => s + parseFloat(t.amount), 0);
    
    if (monthExpenses > limit) {
      Utils.showToast(`⚠️ ALERTA: Você já gastou R$ ${Utils.formatMoney(monthExpenses)} este mês! Limite: R$ ${Utils.formatMoney(limit)}`, true);
    }
  }
};