// ============================================
// METAS - VERSÃO PREMIUM COM ESTILO CRM
// ============================================
const Goals = {
  render() {
    const container = document.getElementById('goalsList');
    if (!container) return;
    
    if (AppState.goals.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:30px;color:var(--text-tertiary)">
          <div style="font-size: 32px; margin-bottom: 12px;">🎯</div>
          <div>Nenhuma meta definida</div>
          <button class="btn btn-primary btn-sm" style="margin-top: 16px;" onclick="Goals.openModal()">Criar Primeira Meta</button>
        </div>
      `;
      return;
    }
    
    container.innerHTML = AppState.goals.map(goal => {
      const progress = (goal.current / goal.target) * 100;
      const progressPercent = Math.min(progress, 100).toFixed(0);
      const achieved = goal.current >= goal.target;
      const remaining = goal.target - goal.current;
      
      return `
        <div class="tx-item-modern" style="flex-direction: column; align-items: stretch; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-weight: 700;">${Utils.escapeHtml(goal.name)}</span>
              ${goal.account_name ? `<span style="font-size: 11px; color: var(--text-tertiary); margin-left: 8px;">🏦 ${goal.account_name}</span>` : ''}
            </div>
            <span style="font-family: var(--font-mono); font-weight: 600; font-size: var(--text-sm); color: ${achieved ? 'var(--success)' : 'var(--warning)'}">
              R$ ${Utils.formatMoney(goal.current)} / R$ ${Utils.formatMoney(goal.target)}
            </span>
          </div>
          <div style="background: var(--bg); border-radius: 12px; height: 8px; overflow: hidden;">
            <div style="width: ${progressPercent}%; height: 100%; background: ${achieved ? 'var(--success)' : 'linear-gradient(90deg, var(--warning), var(--success))'}; transition: width .5s ease;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; gap: 16px;">
              <span style="font-size: var(--text-xs); color: var(--text-tertiary);">📅 ${new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>
              <span style="font-size: var(--text-xs); color: var(--text-tertiary);">💰 Faltam: R$ ${Utils.formatMoney(remaining)}</span>
            </div>
            ${achieved ? '<span style="color: var(--success); font-size: var(--text-xs);">🎉 Meta alcançada!</span>' : `<span style="color: var(--success); font-size: var(--text-xs);">${progressPercent}% concluído</span>`}
            <button class="btn-link" style="color: var(--danger);" onclick="Goals.delete('${goal.id}')">Excluir</button>
          </div>
        </div>
      `;
    }).join('');
  },
  
  openModal() {
    const accountSelect = document.getElementById('goalAccount');
    if (accountSelect && window.Accounts) {
      accountSelect.innerHTML = '<option value="">Nenhuma (manual)</option>' + Accounts.getSelectOptions();
    }
    document.getElementById('goalModal').classList.add('open');
  },
  
  closeModal() {
    document.getElementById('goalModal').classList.remove('open');
  },
  
  save() {
    const name = document.getElementById('goalName').value;
    const target = parseFloat(document.getElementById('goalTarget').value);
    const current = parseFloat(document.getElementById('goalCurrent').value) || 0;
    const deadline = document.getElementById('goalDeadline').value;
    const accountId = document.getElementById('goalAccount').value;
    
    if (!name || !target || !deadline) {
      Utils.showToast('❌ Preencha todos os campos obrigatórios');
      return;
    }
    
    const account = AppState.accounts?.find(a => a.id === accountId);
    
    AppState.goals.push({ 
      id: Date.now(), 
      name, 
      target, 
      current,
      deadline,
      account_id: accountId,
      account_name: account ? account.name : null
    });
    Utils.saveGoals();
    this.render();
    this.closeModal();
    Dashboard.updateIndicators();
    Utils.showToast('✅ Meta criada com sucesso!');
    
    document.getElementById('goalName').value = '';
    document.getElementById('goalTarget').value = '';
    document.getElementById('goalCurrent').value = '';
    document.getElementById('goalDeadline').value = '';
  },
  
  delete(id) {
    if (!confirm('Tem certeza que deseja excluir esta meta?')) return;
    AppState.goals = AppState.goals.filter(g => g.id !== id);
    Utils.saveGoals();
    this.render();
    Dashboard.updateIndicators();
    Utils.showToast('✅ Meta excluída!');
  }
};