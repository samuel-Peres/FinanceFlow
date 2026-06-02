// ============================================
// TRANSAÇÕES - VERSÃO PREMIUM COM ESTILO CRM
// ============================================
const Transactions = {
  async load() {
    if (!AppState.user) return;
    
    try {
      console.log('🔄 Carregando transações...');
      
      const { data, error } = await sb
        .from('transactions')
        .select('*')
        .eq('user_id', AppState.user.id)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      AppState.transactions = data || [];
      console.log(`✅ ${AppState.transactions.length} transações carregadas`);
      
      this.renderTable();
      this.renderRecent();
      Dashboard.update();
      if (window.Charts) Charts.render();
      
    } catch (error) {
      console.error('❌ Erro ao carregar transações:', error);
      Utils.showToast('❌ Erro ao carregar transações: ' + error.message, true);
    }
  },
  
  renderTable() {
    const tbody = document.getElementById('transactionsList');
    if (!tbody) return;
    
    if (!AppState.transactions || AppState.transactions.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;padding:60px 20px;color:var(--text-tertiary)">
            <div style="font-size:48px;margin-bottom:16px">💳</div>
            <div style="font-size:16px;margin-bottom:8px;font-weight:600">Nenhuma transação cadastrada</div>
            <div style="font-size:12px">Clique em "+ Nova transação" para começar</div>
            <button class="btn btn-primary" style="margin-top:20px" onclick="Transactions.openModal()">+ Nova Transação</button>
          </td>
        </tr>
      `;
      return;
    }
    
    let html = '';
    
    for (const t of AppState.transactions) {
      const isIncome = t.type === 'in';
      const sign = isIncome ? '+' : '-';
      const color = isIncome ? 'success' : 'danger';
      const tipoText = isIncome ? '💰 Receita' : '💸 Despesa';
      const tipoBg = isIncome ? 'bg-success' : 'bg-danger';
      
      const account = AppState.accounts?.find(a => a.id === t.account_id);
      const contaDisplay = account ? `${account.icon || '🏦'} ${account.name}` : '📌 Sem conta';
      
      html += `
        <tr>
          ${Utils.renderTableCell(`<div style="font-weight:600;">${Utils.escapeHtml(t.name)}</div><div style="font-size:11px; color:var(--text-tertiary); margin-top:4px;">${contaDisplay}</div>`, 'Descrição')}
          ${Utils.renderTableCell(`<span class="badge ${tipoBg}">${tipoText}</span>`, 'Tipo')}
          ${Utils.renderTableCell(`<span class="badge bg-elevated">${t.category || 'Sem categoria'}</span>`, 'Categoria')}
          ${Utils.renderTableCell(Utils.formatDate(t.date), 'Data')}
          ${Utils.renderTableCell(`<span class="text-${color}" style="font-family:var(--font-mono); font-weight:700;">${sign} R$ ${Utils.formatMoney(t.amount)}</span>`, 'Valor', 'text-right')}
          ${Utils.renderTableCell(`
            <div class="tx-actions" style="display:flex; gap:8px; justify-content:flex-end;">
              <button class="btn btn-ghost btn-sm tx-btn-edit" data-id="${t.id}" style="padding:6px 12px;">✏️</button>
              <button class="btn btn-ghost btn-sm tx-btn-del" data-id="${t.id}" style="padding:6px 12px;">🗑️</button>
            </div>
          `, 'Ações', 'text-right')}
        </tr>
      `;
    }
    
    tbody.innerHTML = html;
    
    document.querySelectorAll('.tx-btn-edit').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        Transactions.edit(btn.dataset.id);
      };
    });
    
    document.querySelectorAll('.tx-btn-del').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        Transactions.delete(btn.dataset.id);
      };
    });
  },
  
  renderRecent() {
    const recentDiv = document.getElementById('recentTransactions');
    if (!recentDiv) return;
    
    if (!AppState.transactions || AppState.transactions.length === 0) {
      recentDiv.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-tertiary)">Nenhuma transação ainda</div>';
      return;
    }
    
    const recentes = AppState.transactions.slice(0, 5);
    recentDiv.innerHTML = recentes.map(t => {
      const isIncome = t.type === 'in';
      const account = AppState.accounts?.find(a => a.id === t.account_id);
      
      return `
        <div class="tx-item-modern" onclick="Transactions.edit('${t.id}')">
          <div class="tx-left">
            <div class="tx-icon-modern ${isIncome ? 'income' : 'expense'}">
              ${isIncome ? '💰' : '💸'}
            </div>
            <div class="tx-info-modern">
              <span class="tx-name-modern">${Utils.escapeHtml(t.name)}</span>
              <span class="tx-date-modern">${Utils.formatDate(t.date)}${account ? ` • ${account.name}` : ''}</span>
            </div>
          </div>
          <div class="tx-amount-modern ${isIncome ? 'income' : 'expense'}">
            ${isIncome ? '+' : '-'} R$ ${Utils.formatMoney(t.amount)}
          </div>
        </div>
      `;
    }).join('');
  },
  
  filter() {
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const type = document.getElementById('typeFilter')?.value || 'all';
    const category = document.getElementById('categoryFilter')?.value || 'all';
    
    let filtered = [...AppState.transactions];
    
    if (search) filtered = filtered.filter(t => t.name.toLowerCase().includes(search));
    if (type !== 'all') filtered = filtered.filter(t => t.type === (type === 'income' ? 'in' : 'out'));
    if (category !== 'all') filtered = filtered.filter(t => t.category === category);
    
    const tbody = document.getElementById('transactionsList');
    if (!tbody) return;
    
    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;padding:60px;color:var(--text-tertiary)">
            🔍 Nenhuma transação encontrada com os filtros selecionados
          </td>
        </tr>
      `;
      return;
    }
    
    let html = '';
    for (const t of filtered) {
      const isIncome = t.type === 'in';
      const sign = isIncome ? '+' : '-';
      const color = isIncome ? 'success' : 'danger';
      const tipoText = isIncome ? '💰 Receita' : '💸 Despesa';
      const tipoBg = isIncome ? 'bg-success' : 'bg-danger';
      const account = AppState.accounts?.find(a => a.id === t.account_id);
      const contaDisplay = account ? `${account.icon || '🏦'} ${account.name}` : '📌 Sem conta';
      
      html += `
        <tr>
          ${Utils.renderTableCell(`<div style="font-weight:600;">${Utils.escapeHtml(t.name)}</div><div style="font-size:11px; color:var(--text-tertiary); margin-top:4px;">${contaDisplay}</div>`, 'Descrição')}
          ${Utils.renderTableCell(`<span class="badge ${tipoBg}">${tipoText}</span>`, 'Tipo')}
          ${Utils.renderTableCell(`<span class="badge bg-elevated">${t.category || 'Sem categoria'}</span>`, 'Categoria')}
          ${Utils.renderTableCell(Utils.formatDate(t.date), 'Data')}
          ${Utils.renderTableCell(`<span class="text-${color}" style="font-family:var(--font-mono); font-weight:700;">${sign} R$ ${Utils.formatMoney(t.amount)}</span>`, 'Valor', 'text-right')}
          ${Utils.renderTableCell(`
            <div class="tx-actions" style="display:flex; gap:8px; justify-content:flex-end;">
              <button class="btn btn-ghost btn-sm tx-btn-edit" data-id="${t.id}">✏️</button>
              <button class="btn btn-ghost btn-sm tx-btn-del" data-id="${t.id}">🗑️</button>
            </div>
          `, 'Ações', 'text-right')}
        </tr>
      `;
    }
    
    tbody.innerHTML = html;
    
    document.querySelectorAll('.tx-btn-edit').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        Transactions.edit(btn.dataset.id);
      };
    });
    
    document.querySelectorAll('.tx-btn-del').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        Transactions.delete(btn.dataset.id);
      };
    });
  },
  
  async save() {
    const saveBtn = document.getElementById('saveTransactionBtn');
    
    await Utils.withLoading(saveBtn, async () => {
      try {
        const accountId = document.getElementById('transactionAccount')?.value;
        const type = document.getElementById('transactionType').value;
        const category = document.getElementById('transactionCategory').value;
        const name = document.getElementById('transactionDescription').value;
        const amount = parseFloat(document.getElementById('transactionAmount').value);
        const date = document.getElementById('transactionDate').value;
        
        if (!name || !amount || !date) {
          Utils.showToast('❌ Preencha todos os campos');
          return;
        }
        
        if (!accountId) {
          Utils.showToast('❌ Selecione uma conta');
          return;
        }
        
        if (isNaN(amount) || amount <= 0) {
          Utils.showToast('❌ Valor inválido');
          return;
        }
        
        const transaction = {
          user_id: AppState.user.id,
          account_id: accountId,
          type: type === 'income' ? 'in' : 'out',
          category: category,
          name: name.trim(),
          amount: amount,
          date: date
        };
        
        let error;
        if (AppState.editId) {
          const { error: updateError } = await sb
            .from('transactions')
            .update(transaction)
            .eq('id', AppState.editId);
          error = updateError;
          if (!error) Utils.showToast('✅ Transação atualizada!');
        } else {
          const { error: insertError } = await sb
            .from('transactions')
            .insert([transaction]);
          error = insertError;
          if (!error) Utils.showToast('✅ Transação salva!');
        }
        
        if (error) throw error;
        
        this.closeModal();
        await Accounts.load();
        await this.load();
        
      } catch (error) {
        console.error('❌ Erro ao salvar:', error);
        Utils.showToast('❌ Erro: ' + error.message, true);
      }
    });
  },
  
  async edit(id) {
    const transaction = AppState.transactions.find(t => t.id === id);
    if (!transaction) return;
    
    AppState.editId = id;
    document.getElementById('modalTitle').textContent = 'Editar Transação';
    document.getElementById('transactionAccount').value = transaction.account_id || '';
    document.getElementById('transactionType').value = transaction.type === 'in' ? 'income' : 'expense';
    document.getElementById('transactionCategory').value = transaction.category || 'Alimentação';
    document.getElementById('transactionDescription').value = transaction.name;
    document.getElementById('transactionAmount').value = transaction.amount;
    document.getElementById('transactionDate').value = transaction.date;
    this.openModal();
  },
  
  async delete(id) {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;
    
    try {
      const { error } = await sb
        .from('transactions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      Utils.showToast('✅ Transação excluída!');
      await Accounts.load();
      await this.load();
      
    } catch (error) {
      console.error('❌ Erro ao excluir:', error);
      Utils.showToast('❌ Erro ao excluir: ' + error.message, true);
    }
  },
  
  openModal() {
    document.getElementById('modalTitle').textContent = 'Nova Transação';
    document.getElementById('transactionDescription').value = '';
    document.getElementById('transactionAmount').value = '';
    document.getElementById('transactionDate').value = Utils.getCurrentDate();
    document.getElementById('transactionType').value = 'income';
    document.getElementById('transactionCategory').value = 'Alimentação';
    
    const accountSelect = document.getElementById('transactionAccount');
    if (accountSelect) {
      if (AppState.accounts && AppState.accounts.length > 0) {
        accountSelect.innerHTML = '<option value="">Selecionar conta</option>' + 
          AppState.accounts.map(acc => `<option value="${acc.id}">${acc.icon || '🏦'} ${acc.name} (R$ ${Utils.formatMoney(acc.balance)})</option>`).join('');
      } else {
        accountSelect.innerHTML = '<option value="">⚠️ Nenhuma conta cadastrada - Crie uma conta primeiro</option>';
      }
    }
    
    document.getElementById('transactionModal').classList.add('open');
  },
  
  closeModal() {
    document.getElementById('transactionModal').classList.remove('open');
    AppState.editId = null;
  },
  
  getFormData() {
    return {
      user_id: AppState.user.id,
      account_id: document.getElementById('transactionAccount').value || null,
      type: document.getElementById('transactionType').value === 'income' ? 'in' : 'out',
      category: document.getElementById('transactionCategory').value,
      name: document.getElementById('transactionDescription').value,
      amount: parseFloat(document.getElementById('transactionAmount').value),
      date: document.getElementById('transactionDate').value
    };
  }
};