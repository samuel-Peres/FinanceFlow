// ============================================
// METAS
// ============================================
const Goals = {
  render() {
    const container = document.getElementById('goalsList');
    if (!container) return;
    
    const totalIncome = AppState.transactions.filter(t => t.type === 'in').reduce((s, t) => s + parseFloat(t.amount), 0);
    const totalExpense = AppState.transactions.filter(t => t.type === 'out').reduce((s, t) => s + parseFloat(t.amount), 0);
    const currentSavings = totalIncome - totalExpense;
    
    if (AppState.goals.length === 0) {
      container.innerHTML = `<div style="text-align:center;padding:20px;color:var(--muted)">🎯 Nenhuma meta definida</div>`;
      return;
    }
    
    container.innerHTML = AppState.goals.map(goal => {
      const progress = (currentSavings / goal.target) * 100;
      const progressPercent = Math.min(progress, 100).toFixed(0);
      const achieved = currentSavings >= goal.target;
      return `
        <div class="goal-item">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span style="font-weight:600">${Utils.escapeHtml(goal.name)}</span>
            <span style="color:${achieved ? 'var(--green)' : 'var(--yellow)'}">R$ ${Utils.formatMoney(currentSavings)} / R$ ${Utils.formatMoney(goal.target)}</span>
          </div>
          <div class="goal-progress-bar"><div class="goal-progress-fill" style="width:${progressPercent}%;background:${achieved ? 'var(--green)' : 'var(--yellow)'}"></div></div>
          <div style="display:flex;justify-content:space-between;margin-top:8px">
            <small style="color:var(--muted)">Prazo: ${new Date(goal.deadline).toLocaleDateString('pt-BR')}</small>
            ${achieved ? '<span style="color:var(--green)">🎉 Meta alcançada!</span>' : `<span>${progressPercent}%</span>`}
          </div>
        </div>
      `;
    }).join('');
  },
  
  openModal() {
    document.getElementById('goalModal').classList.add('open');
  },
  
  closeModal() {
    document.getElementById('goalModal').classList.remove('open');
  },
  
  save() {
    const name = document.getElementById('goalName').value;
    const target = parseFloat(document.getElementById('goalTarget').value);
    const deadline = document.getElementById('goalDeadline').value;
    
    if (!name || !target || !deadline) {
      Utils.showToast('❌ Preencha todos os campos');
      return;
    }
    
    AppState.goals.push({ id: Date.now(), name, target, deadline });
    Utils.saveGoals();
    this.render();
    this.closeModal();
    Utils.showToast('✅ Meta criada com sucesso!');
    
    document.getElementById('goalName').value = '';
    document.getElementById('goalTarget').value = '';
    document.getElementById('goalDeadline').value = '';
  }
};