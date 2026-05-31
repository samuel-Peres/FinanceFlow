// ============================================
// UTILITÁRIOS
// ============================================
const Utils = {
  formatMoney(value) {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },
  
  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[m]);
  },
  
  showToast(message, isError = false) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.color = isError ? 'var(--red)' : 'var(--green)';
    toast.style.borderColor = isError ? 'var(--red)' : 'var(--green)';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  },
  
  getCurrentDate() {
    return new Date().toISOString().split('T')[0];
  },
  
  saveGoals() {
    localStorage.setItem('finance_goals', JSON.stringify(AppState.goals));
  }
};