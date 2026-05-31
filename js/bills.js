// ============================================
// CONTAS A PAGAR
// ============================================
const Bills = {
  async load() {
    if (!AppState.user) return;
    const { data, error } = await sb
      .from('bills_to_pay')
      .select('*')
      .eq('user_id', AppState.user.id)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    AppState.bills = data || [];
    this.render();
    this.updateIndicators();
  },
  
  render() {
    const container = document.getElementById('billsList');
    if (!container) return;
    
    if (AppState.bills.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:60px 20px;color:var(--muted)">
          <div style="font-size:64px;margin-bottom:20px">📅</div>
          <div style="font-size:18px;margin-bottom:10px">Nenhuma conta a pagar</div>
          <div style="font-size:13px;margin-bottom:20px">Adicione suas contas para receber lembretes</div>
          <button class="btn btn-primary" onclick="Bills.openModal()">+ Adicionar Conta</button>
        </div>
      `;
      return;
    }
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    container.innerHTML = AppState.bills.map(bill => {
      const dueDate = new Date(bill.due_date);
      const isOverdue = dueDate < today && bill.status !== 'paid';
      const statusClass = bill.status === 'paid' ? 'paid' : (isOverdue ? 'overdue' : 'pending');
      const statusText = bill.status === 'paid' ? '✅ Pago' : (isOverdue ? '⚠️ Atrasado' : '⏳ Pendente');
      const account = AppState.accounts?.find(a => a.id === bill.account_id);
      
      return `
        <div class="bill-item" style="background:linear-gradient(135deg, var(--bg3), var(--bg2)); border-radius:16px; padding:18px; margin-bottom:12px; border-left:4px solid ${isOverdue ? 'var(--red)' : (bill.status === 'paid' ? 'var(--green)' : 'var(--yellow)')}">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
            <div>
              <div style="font-weight:700; font-size:16px;">${Utils.escapeHtml(bill.name)}</div>
              <div style="font-size:12px; color:var(--muted); margin-top:4px;">
                ${bill.category || 'Sem categoria'}
                ${account ? ` • ${account.icon || '🏦'} ${account.name}` : ''}
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:20px; font-weight:700; color:${isOverdue ? 'var(--red)' : 'var(--yellow)'}">R$ ${Utils.formatMoney(bill.amount)}</div>
              <div class="bill-status" style="font-size:12px; margin-top:4px;">${statusText}</div>
            </div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-size:13px;">📅 Vence em: ${dueDate.toLocaleDateString('pt-BR')}</div>
            <div style="display:flex; gap:8px;">
              ${bill.status !== 'paid' ? `<button class="btn btn-primary" style="padding:6px 12px; font-size:12px;" onclick="Bills.markAsPaid('${bill.id}')">✅ Marcar como Pago</button>` : ''}
              <button class="tx-btn tx-btn-edit" onclick="Bills.edit('${bill.id}')">✏️</button>
              <button class="tx-btn tx-btn-del" onclick="Bills.delete('${bill.id}')">🗑️</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },
  
  updateIndicators() {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const pendingTotal = AppState.bills
      .filter(b => b.status === 'pending')
      .reduce((sum, b) => sum + b.amount, 0);
    
    const overdueTotal = AppState.bills
      .filter(b => {
        const dueDate = new Date(b.due_date);
        return b.status !== 'paid' && dueDate < today;
      })
      .reduce((sum, b) => sum + b.amount, 0);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingBills = AppState.bills.filter(b => {
      const dueDate = new Date(b.due_date);
      return b.status !== 'paid' && dueDate >= today && dueDate <= nextWeek;
    }).length;
    
    const pendingEl = document.getElementById('pendingBillsTotal');
    const overdueEl = document.getElementById('overdueBillsTotal');
    const upcomingEl = document.getElementById('upcomingBillsCount');
    
    if (pendingEl) pendingEl.innerHTML = `R$ ${Utils.formatMoney(pendingTotal)}`;
    if (overdueEl) overdueEl.innerHTML = `R$ ${Utils.formatMoney(overdueTotal)}`;
    if (upcomingEl) upcomingEl.innerHTML = upcomingBills;
    
    // Atualizar dashboard
    const pendingBillsCount = document.getElementById('pendingBillsCount');
    if (pendingBillsCount) pendingBillsCount.innerHTML = AppState.bills.filter(b => b.status === 'pending').length;
  },
  
  async save() {
    const data = {
      user_id: AppState.user.id,
      name: document.getElementById('billName').value,
      amount: parseFloat(document.getElementById('billAmount').value),
      due_date: document.getElementById('billDueDate').value,
      category: document.getElementById('billCategory').value,
      account_id: document.getElementById('billAccount').value || null,
      status: 'pending'
    };
    
    if (!data.name || !data.amount || !data.due_date) {
      Utils.showToast('❌ Preencha todos os campos obrigatórios');
      return;
    }
    
    const { error } = await sb.from('bills_to_pay').insert([data]);
    if (error) {
      Utils.showToast('❌ Erro ao salvar: ' + error.message);
      return;
    }
    
    Utils.showToast('✅ Conta adicionada!');
    this.closeModal();
    await this.load();
  },
  
  async markAsPaid(id) {
    const bill = AppState.bills.find(b => b.id === id);
    if (!bill) return;
    
    // Criar transação automática
    const transaction = {
      user_id: AppState.user.id,
      type: 'out',
      category: bill.category || 'Contas',
      name: bill.name,
      amount: bill.amount,
      date: new Date().toISOString().split('T')[0],
      account_id: bill.account_id
    };
    
    await sb.from('transactions').insert([transaction]);
    
    const { error } = await sb
      .from('bills_to_pay')
      .update({ status: 'paid', paid_date: new Date().toISOString().split('T')[0] })
      .eq('id', id);
    
    if (error) {
      Utils.showToast('❌ Erro ao marcar como pago');
      return;
    }
    
    Utils.showToast('✅ Conta marcada como paga!');
    await this.load();
    if (window.Transactions) await Transactions.load();
  },
  
  async delete(id) {
    if (!confirm('Tem certeza?')) return;
    const { error } = await sb.from('bills_to_pay').delete().eq('id', id);
    if (error) {
      Utils.showToast('❌ Erro ao excluir');
      return;
    }
    Utils.showToast('✅ Excluída!');
    await this.load();
  },
  
  openModal() {
    const accountSelect = document.getElementById('billAccount');
    if (accountSelect && window.Accounts) {
      accountSelect.innerHTML = '<option value="">Selecionar conta</option>' + Accounts.getSelectOptions();
    }
    document.getElementById('billModal').classList.add('open');
    document.getElementById('billDueDate').value = Utils.getCurrentDate();
  },
  
  closeModal() {
    document.getElementById('billModal').classList.remove('open');
    document.getElementById('billName').value = '';
    document.getElementById('billAmount').value = '';
    document.getElementById('billCategory').value = 'Moradia';
  }
};