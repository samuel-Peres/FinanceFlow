// ============================================
// PARCELAMENTOS
// ============================================
const Installments = {
  async load() {
    if (!AppState.user) return;
    const { data, error } = await sb
      .from('installments')
      .select('*')
      .eq('user_id', AppState.user.id)
      .order('start_date', { ascending: false });
    
    if (error) throw error;
    AppState.installments = data || [];
    this.render();
  },
  
  render() {
    const container = document.getElementById('installmentsList');
    if (!container) return;
    
    if (AppState.installments.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:60px 20px;color:var(--muted)">
          <div style="font-size:64px;margin-bottom:20px">💳</div>
          <div style="font-size:18px;margin-bottom:10px">Nenhum parcelamento ativo</div>
          <div style="font-size:13px;margin-bottom:20px">Registre suas compras parceladas</div>
          <button class="btn btn-primary" onclick="Installments.openModal()">+ Criar Parcelamento</button>
        </div>
      `;
      return;
    }
    
    container.innerHTML = AppState.installments.map(inst => {
      const paidPercent = ((inst.current_installment - 1) / inst.installment_count) * 100;
      const remaining = (inst.installment_count - inst.current_installment + 1) * inst.installment_value;
      const account = AppState.accounts?.find(a => a.id === inst.account_id);
      
      return `
        <div class="installment-card" style="background:linear-gradient(135deg, var(--bg3), var(--bg2)); border-radius:16px; padding:20px; margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
            <div>
              <div style="font-weight:700; font-size:18px;">${Utils.escapeHtml(inst.description)}</div>
              <div style="font-size:12px; color:var(--muted); margin-top:4px;">
                ${inst.category || 'Sem categoria'}
                ${account ? ` • ${account.icon || '🏦'} ${account.name}` : ''}
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:14px; color:var(--muted);">Valor da parcela</div>
              <div style="font-size:22px; font-weight:700; color:var(--yellow);">R$ ${Utils.formatMoney(inst.installment_value)}</div>
            </div>
          </div>
          
          <div style="margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
              <span>Progresso</span>
              <span>${inst.current_installment - 1}/${inst.installment_count} parcelas pagas</span>
            </div>
            <div style="background:var(--bg); border-radius:12px; height:10px; overflow:hidden;">
              <div style="width:${paidPercent}%; height:100%; background:linear-gradient(90deg, var(--green), var(--blue)); transition:width .3s;"></div>
            </div>
          </div>
          
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div style="display:flex; gap:16px;">
              <div><span style="color:var(--muted);">💰 Total:</span> R$ ${Utils.formatMoney(inst.total_amount)}</div>
              <div><span style="color:var(--muted);">⏳ Restante:</span> R$ ${Utils.formatMoney(remaining)}</div>
              <div><span style="color:var(--muted);">📅 Início:</span> ${new Date(inst.start_date).toLocaleDateString('pt-BR')}</div>
            </div>
            <button class="tx-btn tx-btn-del" onclick="Installments.delete('${inst.id}')">🗑️ Excluir</button>
          </div>
        </div>
      `;
    }).join('');
  },
  
  async save() {
    const totalAmount = parseFloat(document.getElementById('installmentTotal').value);
    const installmentCount = parseInt(document.getElementById('installmentCount').value);
    const installmentValue = totalAmount / installmentCount;
    
    const data = {
      user_id: AppState.user.id,
      description: document.getElementById('installmentDescription').value,
      total_amount: totalAmount,
      installment_count: installmentCount,
      installment_value: installmentValue,
      current_installment: 1,
      account_id: document.getElementById('installmentAccount').value || null,
      category: document.getElementById('installmentCategory').value,
      start_date: document.getElementById('installmentStartDate').value
    };
    
    if (!data.description || !data.total_amount || !data.start_date) {
      Utils.showToast('❌ Preencha todos os campos');
      return;
    }
    
    const { error } = await sb.from('installments').insert([data]);
    if (error) {
      Utils.showToast('❌ Erro ao salvar: ' + error.message);
      return;
    }
    
    Utils.showToast('✅ Parcelamento criado!');
    this.closeModal();
    await this.load();
  },
  
  async delete(id) {
    if (!confirm('Tem certeza?')) return;
    const { error } = await sb.from('installments').delete().eq('id', id);
    if (error) {
      Utils.showToast('❌ Erro ao excluir');
      return;
    }
    Utils.showToast('✅ Parcelamento excluído!');
    await this.load();
  },
  
  openModal() {
    const accountSelect = document.getElementById('installmentAccount');
    if (accountSelect && window.Accounts) {
      accountSelect.innerHTML = '<option value="">Selecionar conta</option>' + Accounts.getSelectOptions();
    }
    document.getElementById('installmentModal').classList.add('open');
    document.getElementById('installmentStartDate').value = Utils.getCurrentDate();
  },
  
  closeModal() {
    document.getElementById('installmentModal').classList.remove('open');
    document.getElementById('installmentDescription').value = '';
    document.getElementById('installmentTotal').value = '';
    document.getElementById('installmentCount').value = '';
    document.getElementById('installmentCategory').value = 'Eletrônicos';
  }
};