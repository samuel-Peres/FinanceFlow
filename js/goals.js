// ============================================
// METAS (ATUALIZADO)
// ============================================
const Goals = {
  render() {
    const container = document.getElementById('goalsList');
    if (!container) return;
    
    if (AppState.goals.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:40px;color:var(--muted)">
          <div style="font-size:48px;margin-bottom:16px">🎯</div>
          <div>Nenhuma meta definida</div>
          <button class="btn btn-primary" style="margin-top:16px" onclick="Goals.openModal()">Criar Primeira Meta</button>
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
        <div class="goal-item" style="background:linear-gradient(135deg, var(--bg3), var(--bg2)); border-radius:16px; padding:20px; margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
            <div>
              <span style="font-weight:700; font-size:16px;">${Utils.escapeHtml(goal.name)}</span>
              ${goal.account_name ? `<div style="font-size:11px; color:var(--muted); margin-top:4px;">🏦 ${goal.account_name}</div>` : ''}
            </div>
            <span style="color:${achieved ? 'var(--green)' : 'var(--yellow)'}; font-weight:600;">
              R$ ${Utils.formatMoney(goal.current)} / R$ ${Utils.formatMoney(goal.target)}
            </span>
          </div>
          <div style="background:var(--bg); border-radius:12px; height:12px; overflow:hidden; margin:12px 0;">
            <div style="width:${progressPercent}%; height:100%; background:${achieved ? 'var(--green)' : 'linear-gradient(90deg, var(--yellow), var(--green))'}; transition:width .5s ease;"></div>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:12px;">
            <div style="display:flex; gap:16px;">
              <div><span style="color:var(--muted);">📅 Prazo:</span> ${new Date(goal.deadline).toLocaleDateString('pt-BR')}</div>
              <div><span style="color:var(--muted);">💰 Faltam:</span> R$ ${Utils.formatMoney(remaining)}</div>
            </div>
            <div style="display:flex; gap:8px;">
              ${achieved ? '<span style="color:var(--green);">🎉 Meta alcançada!</span>' : `<span style="color:var(--green);">${progressPercent}% concluído</span>`}
              <button class="tx-btn tx-btn-del" onclick="Goals.delete('${goal.id}')" style="margin-left:8px;">🗑️</button>
            </div>
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