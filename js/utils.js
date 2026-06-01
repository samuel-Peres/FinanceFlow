// ============================================
// UTILITÁRIOS - VERSÃO PREMIUM
// ============================================
const Utils = {
  formatMoney(value) {
    if (isNaN(value)) value = 0;
    return value.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  },
  
  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },
  
  showToast(message, isError = false) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.className = `toast ${isError ? 'toast-error' : 'toast-success'}`;
    toast.classList.add('show');
    
    setTimeout(() => toast.classList.remove('show'), 3000);
  },
  
  getCurrentDate() {
    return new Date().toISOString().split('T')[0];
  },
  
  saveGoals() {
    localStorage.setItem('finance_goals', JSON.stringify(AppState.goals));
  },
  
  // Helper para criar data-label em tabelas responsivas
  renderTableCell(content, label, className = '') {
    return `<td data-label="${label}" class="${className}">${content}</td>`;
  },
  
  // Loading state para botões
  async withLoading(button, callback) {
    if (!button) return await callback();
    
    const originalText = button.innerHTML;
    button.classList.add('btn-loading');
    button.disabled = true;
    
    try {
      return await callback();
    } finally {
      button.classList.remove('btn-loading');
      button.disabled = false;
      button.innerHTML = originalText;
    }
  },
  
  // Formata data para exibição
  formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  },
  
  // Calcula diferença entre datas
  daysDiff(date1, date2) {
    const diffTime = Math.abs(new Date(date2) - new Date(date1));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
};