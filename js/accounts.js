// ============================================
// CONTAS BANCÁRIAS (ATUALIZADO)
// ============================================
const Accounts = {
  async load() {
    if (!AppState.user) return;
    const { data, error } = await sb
      .from('accounts')
      .select('*')
      .eq('user_id', AppState.user.id)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    AppState.accounts = data || [];
    this.render();
    Dashboard.updateAccountsSummary();
    Dashboard.updateAccountsSummaryCard();
    if (window.Charts) Charts.renderBankDistribution();
    return AppState.accounts;
  },
  
  render() {
    const container = document.getElementById('accountsList');
    if (!container) return;
    
    if (!AppState.accounts || AppState.accounts.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:60px 20px;color:var(--muted)">
          <div style="font-size:64px;margin-bottom:20px">🏦</div>
          <div style="font-size:18px;margin-bottom:10px">Nenhuma conta cadastrada</div>
          <div style="font-size:13px;margin-bottom:20px">Adicione sua primeira conta bancária</div>
          <button class="btn btn-primary" onclick="Accounts.openModal()">+ Adicionar Conta</button>
        </div>
      `;
      return;
    }
    
    // Calcular saldo total
    const totalBalance = AppState.accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
    
    // Adicionar card de resumo no topo
    const summaryCard = `
      <div style="background: linear-gradient(135deg, var(--green2), var(--bg3)); border-radius: 16px; padding: 20px; margin-bottom: 20px; text-align: center; border: 1px solid var(--border);">
        <div style="font-size: 14px; color: var(--muted); margin-bottom: 8px;">💰 SALDO TOTAL DE TODAS AS CONTAS</div>
        <div style="font-size: 32px; font-weight: 700; color: var(--green);">R$ ${Utils.formatMoney(totalBalance)}</div>
        <div style="font-size: 12px; color: var(--muted); margin-top: 8px;">${AppState.accounts.length} conta(s) cadastrada(s)</div>
        <button class="btn btn-ghost" style="margin-top: 12px;" onclick="Dashboard.showAccountDetails()">📊 Ver Detalhes de cada conta</button>
      </div>
    `;
    
    // Listar contas
    const accountsList = AppState.accounts.map(acc => `
      <div class="account-card" style="background:linear-gradient(135deg, ${acc.color}15, var(--bg3)); border-left:4px solid ${acc.color}; border-radius:16px; padding:18px; margin-bottom:12px; transition:all .2s;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="font-size:32px;">${acc.icon || '🏦'}</div>
            <div>
              <div style="font-weight:700; font-size:16px;">${Utils.escapeHtml(acc.name)}</div>
              <div style="font-size:12px; color:var(--muted);">${Utils.escapeHtml(acc.bank)} • ${this.getTypeName(acc.type)}</div>
            </div>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="tx-btn tx-btn-edit" onclick="Accounts.edit('${acc.id}')">✏️</button>
            <button class="tx-btn tx-btn-del" onclick="Accounts.delete('${acc.id}')">🗑️</button>
          </div>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:baseline;">
          <div style="font-size:12px; color:var(--muted);">Saldo atual</div>
          <div style="font-size:24px; font-weight:700; color:${acc.balance >= 0 ? 'var(--green)' : 'var(--red)'}">
            R$ ${Utils.formatMoney(acc.balance)}
          </div>
        </div>
      </div>
    `).join('');
    
    container.innerHTML = summaryCard + accountsList;
  },
  
  getTypeName(type) {
    const names = {
      corrente: 'Conta Corrente',
      poupanca: 'Poupança',
      carteira: 'Carteira',
      dinheiro: 'Dinheiro físico',
      investimento: 'Investimento',
      cartao: 'Cartão de Crédito'
    };
    return names[type] || type;
  },
  
  async save() {
    const id = document.getElementById('accountId').value;
    const data = {
      user_id: AppState.user.id,
      name: document.getElementById('accountName').value,
      bank: document.getElementById('accountBank').value,
      color: document.getElementById('accountColor').value,
      icon: document.getElementById('accountIcon').value || '🏦',
      type: document.getElementById('accountType').value,
      initial_balance: parseFloat(document.getElementById('accountBalance').value) || 0
    };
    
    if (!data.name || !data.bank) {
      Utils.showToast('❌ Preencha nome e banco');
      return;
    }
    
    let error;
    if (id) {
      data.balance = data.initial_balance;
      const { error: updateError } = await sb
        .from('accounts')
        .update(data)
        .eq('id', id);
      error = updateError;
    } else {
      data.balance = data.initial_balance;
      const { error: insertError } = await sb.from('accounts').insert([data]);
      error = insertError;
    }
    
    if (error) {
      Utils.showToast('❌ Erro ao salvar: ' + error.message);
      return;
    }
    
    Utils.showToast('✅ Conta salva com sucesso!');
    this.closeModal();
    await this.load();
    Dashboard.update();
  },
  
  async edit(id) {
    const account = AppState.accounts.find(a => a.id === id);
    if (!account) return;
    
    document.getElementById('modalAccountTitle').textContent = 'Editar Conta';
    document.getElementById('accountId').value = account.id;
    document.getElementById('accountName').value = account.name;
    document.getElementById('accountBank').value = account.bank;
    document.getElementById('accountColor').value = account.color;
    document.getElementById('accountIcon').value = account.icon || '🏦';
    document.getElementById('accountType').value = account.type;
    document.getElementById('accountBalance').value = account.initial_balance || account.balance;
    
    this.openModal();
  },
  
  async delete(id) {
    if (!confirm('Tem certeza que deseja excluir esta conta? Isso pode afetar transações vinculadas.')) return;
    
    const { error } = await sb.from('accounts').delete().eq('id', id);
    if (error) {
      Utils.showToast('❌ Erro ao excluir: ' + error.message);
      return;
    }
    
    Utils.showToast('✅ Conta excluída!');
    await this.load();
    Dashboard.update();
  },
  
  openModal() {
    document.getElementById('accountModal').classList.add('open');
  },
  
  closeModal() {
    document.getElementById('accountModal').classList.remove('open');
    document.getElementById('accountId').value = '';
    document.getElementById('modalAccountTitle').textContent = 'Nova Conta';
    document.getElementById('accountName').value = '';
    document.getElementById('accountBank').value = '';
    document.getElementById('accountColor').value = '#00e5a0';
    document.getElementById('accountIcon').value = '🏦';
    document.getElementById('accountType').value = 'corrente';
    document.getElementById('accountBalance').value = '';
  },
  
  getSelectOptions() {
    if (!AppState.accounts || AppState.accounts.length === 0) {
      return '<option value="">Nenhuma conta cadastrada</option>';
    }
    return AppState.accounts.map(acc => 
      `<option value="${acc.id}">${acc.icon || '🏦'} ${acc.name} (R$ ${Utils.formatMoney(acc.balance)})</option>`
    ).join('');
  },
  
  getTotalBalance() {
    if (!AppState.accounts) return 0;
    return AppState.accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0);
  },
  
  getBankBalance() {
    if (!AppState.accounts) return 0;
    return AppState.accounts
      .filter(acc => acc.type !== 'carteira' && acc.type !== 'dinheiro')
      .reduce((sum, acc) => sum + (acc.balance || 0), 0);
  },
  
  getWalletBalance() {
    if (!AppState.accounts) return 0;
    return AppState.accounts
      .filter(acc => acc.type === 'carteira' || acc.type === 'dinheiro')
      .reduce((sum, acc) => sum + (acc.balance || 0), 0);
  }
};