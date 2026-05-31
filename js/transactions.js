// ============================================
// TRANSAÇÕES (ATUALIZADO COM CONTAS)
// ============================================
const Transactions = {
  async load() {
    if (!AppState.user) return;
    const { data, error } = await sb
      .from('transactions')
      .select('*')
      .eq('user_id', AppState.user.id)
      .order('date', { ascending: false });
    
    if (error) throw error;
    AppState.transactions = data || [];
    this.render();
    Dashboard.update();
    if (window.Goals) Goals.render();
    if (window.Charts) Charts.render();
  },
  
  render() {
    this.renderTable();
    this.renderRecent();
  },
  
  renderTable() {
    const tbody = document.getElementById('transactionsList');
    if (!tbody) return;
    
    if (AppState.transactions.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px">Nenhuma transação cadastrada</td></tr>';
      return;
    }
    
    tbody.innerHTML = AppState.transactions.map(t => {
      const typeDisplay = t.type === 'in' ? 'income' : 'expense';
      const account = AppState.accounts?.find(a => a.id === t.account_id);
      return `
        <tr>
          <td>${Utils.escapeHtml(t.name)}</td>
          <td><span class="cat-tag">${t.category || 'Sem categoria'}</span></td>
          <td>${account ? `${account.icon || '🏦'} ${account.name}` : '-'}</td>
          <td>${new Date(t.date).toLocaleDateString('pt-BR')}</td>
          <td class="${typeDisplay === 'expense' ? 'red' : 'green'}">${typeDisplay === 'expense' ? '- ' : '+ '} R$ ${Utils.formatMoney(t.amount)}</td>
          <td class="td-actions">
            <div class="tx-actions">
              <button class="tx-btn tx-btn-edit" data-id="${t.id}">✏️</button>
              <button class="tx-btn tx-btn-del" data-id="${t.id}">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
    
    document.querySelectorAll('.tx-btn-edit').forEach(btn => btn.onclick = () => this.edit(btn.dataset.id));
    document.querySelectorAll('.tx-btn-del').forEach(btn => btn.onclick = () => this.delete(btn.dataset.id));
  },
  
  renderRecent() {
    const recentDiv = document.getElementById('recentTransactions');
    if (!recentDiv) return;
    
    const recentes = AppState.transactions.slice(0, 5);
    if (recentes.length === 0) {
      recentDiv.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted)">Nenhuma transação ainda</div>';
      return;
    }
    
    recentDiv.innerHTML = recentes.map(t => {
      const typeDisplay = t.type === 'in' ? 'income' : 'expense';
      const account = AppState.accounts?.find(a => a.id === t.account_id);
      return `
        <div class="tx-item">
          <div class="tx-icon" style="background:${typeDisplay === 'expense' ? 'var(--red2)' : 'var(--green2)'}">${typeDisplay === 'expense' ? '💸' : '💰'}</div>
          <div class="tx-info">
            <div class="tx-name">${Utils.escapeHtml(t.name)}</div>
            <div class="tx-meta">
              ${t.category || 'Sem categoria'}
              ${account ? ` • ${account.icon || '🏦'} ${account.name}` : ''}
              • ${new Date(t.date).toLocaleDateString('pt-BR')}
            </div>
          </div>
          <div class="tx-amount ${typeDisplay === 'expense' ? 'out' : 'in'}">${typeDisplay === 'expense' ? '- ' : '+ '} R$ ${Utils.formatMoney(t.amount)}</div>
        </div>
      `;
    }).join('');
  },
  
  filter() {
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const type = document.getElementById('typeFilter')?.value || 'all';
    const category = document.getElementById('categoryFilter')?.value || 'all';
    
    let filtered = AppState.transactions;
    if (search) filtered = filtered.filter(t => t.name.toLowerCase().includes(search));
    if (type !== 'all') filtered = filtered.filter(t => t.type === (type === 'income' ? 'in' : 'out'));
    if (category !== 'all') filtered = filtered.filter(t => t.category === category);
    
    const tbody = document.getElementById('transactionsList');
    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:40px">Nenhuma transação encontrada</td></tr>';
      return;
    }
    
    tbody.innerHTML = filtered.map(t => {
      const typeDisplay = t.type === 'in' ? 'income' : 'expense';
      const account = AppState.accounts?.find(a => a.id === t.account_id);
      return `
        <tr>
          <td>${Utils.escapeHtml(t.name)}</td>
          <td><span class="cat-tag">${t.category || 'Sem categoria'}</span></td>
          <td>${account ? `${account.icon || '🏦'} ${account.name}` : '-'}</td>
          <td>${new Date(t.date).toLocaleDateString('pt-BR')}</td>
          <td class="${typeDisplay === 'expense' ? 'red' : 'green'}">${typeDisplay === 'expense' ? '- ' : '+ '} R$ ${Utils.formatMoney(t.amount)}</td>
          <td class="td-actions">
            <div class="tx-actions">
              <button class="tx-btn tx-btn-edit" data-id="${t.id}">✏️</button>
              <button class="tx-btn tx-btn-del" data-id="${t.id}">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
    
    document.querySelectorAll('.tx-btn-edit').forEach(btn => btn.onclick = () => this.edit(btn.dataset.id));
    document.querySelectorAll('.tx-btn-del').forEach(btn => btn.onclick = () => this.delete(btn.dataset.id));
  },
  
  async save(data) {
    let error;
    if (AppState.editId) {
      const { error: updateError } = await sb.from('transactions').update(data).eq('id', AppState.editId);
      error = updateError;
    } else {
      const { error: insertError } = await sb.from('transactions').insert([data]);
      error = insertError;
    }
    if (error) throw error;
    Utils.showToast('✅ Transação salva!');
    this.closeModal();
    await this.load();
    if (window.Accounts) await Accounts.load();
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
    const { error } = await sb.from('transactions').delete().eq('id', id);
    if (error) throw error;
    Utils.showToast('✅ Transação excluída!');
    await this.load();
    if (window.Accounts) await Accounts.load();
  },
  
  openModal() {
    const accountSelect = document.getElementById('transactionAccount');
    if (accountSelect) {
      accountSelect.innerHTML = '<option value="">Selecionar conta</option>' + (window.Accounts?.getSelectOptions() || '');
    }
    
    if (!AppState.editId) {
      document.getElementById('modalTitle').textContent = 'Nova Transação';
      document.getElementById('transactionDescription').value = '';
      document.getElementById('transactionAmount').value = '';
      document.getElementById('transactionDate').value = Utils.getCurrentDate();
      document.getElementById('transactionType').value = 'income';
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