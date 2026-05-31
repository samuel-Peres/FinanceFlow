// ============================================
// TRANSAÇÕES (CORRIGIDO COMPLETAMENTE)
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
      
      const tbody = document.getElementById('transactionsList');
      if (tbody) {
        this.renderTable();
      } else {
        console.log('⏳ Elemento transactionsList não está disponível ainda, aguardando...');
      }
      
      this.renderRecent();
      Dashboard.update();
      if (window.Charts) Charts.render();
      
    } catch (error) {
      console.error('❌ Erro ao carregar transações:', error);
      Utils.showToast('❌ Erro ao carregar transações: ' + error.message, true);
    }
  },
  
  render() {
    console.log('🎨 Renderizando transações...');
    this.renderTable();
    this.renderRecent();
  },
  
  renderTable() {
    setTimeout(() => {
      const tbody = document.getElementById('transactionsList');
      if (!tbody) {
        console.log('⏳ Aguardando elemento transactionsList...');
        setTimeout(() => this.renderTable(), 500);
        return;
      }
      
      console.log('✅ Elemento transactionsList encontrado!');
      
      if (!AppState.transactions || AppState.transactions.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align:center;padding:60px 20px;color:var(--muted)">
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
        const color = isIncome ? 'var(--green)' : 'var(--red)';
        const tipoText = isIncome ? '💰 Receita' : '💸 Despesa';
        const tipoBg = isIncome ? 'var(--green2)' : 'var(--red2)';
        
        const account = AppState.accounts?.find(a => a.id === t.account_id);
        const contaDisplay = account ? `${account.icon || '🏦'} ${account.name}` : '📌 Sem conta';
        
        html += `
          <tr style="border-bottom:1px solid var(--border);">
            <td style="padding:14px 12px;">
              <div style="font-weight:600;">${Utils.escapeHtml(t.name)}</div>
              <div style="font-size:11px; color:var(--muted); margin-top:4px;">${contaDisplay}</div>
            </td>
            <td style="padding:14px 12px;">
              <span style="background:${tipoBg}; color:${color}; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600;">
                ${tipoText}
              </span>
            </td>
            <td style="padding:14px 12px;">
              <span style="background:var(--bg3); padding:4px 12px; border-radius:20px; font-size:12px;">
                ${t.category || 'Sem categoria'}
              </span>
            </td>
            <td style="padding:14px 12px; color:var(--muted);">${new Date(t.date).toLocaleDateString('pt-BR')}</td>
            <td style="padding:14px 12px; font-family:'DM Mono',monospace; font-weight:700; color:${color}; font-size:16px;">
              ${sign} R$ ${Utils.formatMoney(t.amount)}
            </td>
            <td style="padding:14px 12px; text-align:center;">
              <div style="display:flex; gap:8px; justify-content:center;">
                <button class="tx-btn tx-btn-edit" data-id="${t.id}" style="background:var(--bg3); border:none; cursor:pointer; padding:8px 12px; border-radius:8px;">✏️</button>
                <button class="tx-btn tx-btn-del" data-id="${t.id}" style="background:var(--bg3); border:none; cursor:pointer; padding:8px 12px; border-radius:8px;">🗑️</button>
              </div>
            </td>
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
      
      console.log(`✅ Tabela renderizada com ${AppState.transactions.length} transações`);
    }, 100);
  },
  
  renderRecent() {
    const recentDiv = document.getElementById('recentTransactions');
    if (!recentDiv) return;
    
    if (!AppState.transactions || AppState.transactions.length === 0) {
      recentDiv.innerHTML = '<div style="text-align:center;padding:30px;color:var(--muted)">Nenhuma transação ainda</div>';
      return;
    }
    
    const recentes = AppState.transactions.slice(0, 5);
    recentDiv.innerHTML = recentes.map(t => {
      const isIncome = t.type === 'in';
      const account = AppState.accounts?.find(a => a.id === t.account_id);
      
      return `
        <div class="tx-item" style="cursor:pointer;" onclick="Transactions.edit('${t.id}')">
          <div class="tx-icon" style="background:${isIncome ? 'var(--green2)' : 'var(--red2)'}">${isIncome ? '💰' : '💸'}</div>
          <div class="tx-info">
            <div class="tx-name">${Utils.escapeHtml(t.name)}</div>
            <div class="tx-meta">
              ${t.category || 'Sem categoria'}
              ${account ? ` • ${account.icon || '🏦'} ${account.name}` : ''}
              • ${new Date(t.date).toLocaleDateString('pt-BR')}
            </div>
          </div>
          <div class="tx-amount ${isIncome ? 'in' : 'out'}">${isIncome ? '+ ' : '- '} R$ ${Utils.formatMoney(t.amount)}</div>
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
          <td colspan="6" style="text-align:center;padding:60px;color:var(--muted)">
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
      const color = isIncome ? 'var(--green)' : 'var(--red)';
      const tipoText = isIncome ? '💰 Receita' : '💸 Despesa';
      const tipoBg = isIncome ? 'var(--green2)' : 'var(--red2)';
      const account = AppState.accounts?.find(a => a.id === t.account_id);
      const contaDisplay = account ? `${account.icon || '🏦'} ${account.name}` : '📌 Sem conta';
      
      html += `
        <tr style="border-bottom:1px solid var(--border);">
          <td style="padding:14px 12px;">
            <div style="font-weight:600;">${Utils.escapeHtml(t.name)}</div>
            <div style="font-size:11px; color:var(--muted); margin-top:4px;">${contaDisplay}</div>
          </td>
          <td style="padding:14px 12px;">
            <span style="background:${tipoBg}; color:${color}; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600;">${tipoText}</span>
          </td>
          <td style="padding:14px 12px;">
            <span style="background:var(--bg3); padding:4px 12px; border-radius:20px; font-size:12px;">${t.category || 'Sem categoria'}</span>
          </td>
          <td style="padding:14px 12px; color:var(--muted);">${new Date(t.date).toLocaleDateString('pt-BR')}</td>
          <td style="padding:14px 12px; font-family:'DM Mono',monospace; font-weight:700; color:${color};">${sign} R$ ${Utils.formatMoney(t.amount)}</td>
          <td style="padding:14px 12px; text-align:center;">
            <div style="display:flex; gap:8px; justify-content:center;">
              <button class="tx-btn tx-btn-edit" data-id="${t.id}">✏️</button>
              <button class="tx-btn tx-btn-del" data-id="${t.id}">🗑️</button>
            </div>
          </td>
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
      
      const transaction = {
        user_id: AppState.user.id,
        account_id: accountId,
        type: type === 'income' ? 'in' : 'out',
        category: category,
        name: name.trim(),
        amount: amount,
        date: date
      };
      
      console.log('💾 Salvando transação:', transaction);
      
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
  },
  
  async edit(id) {
    try {
      const transaction = AppState.transactions.find(t => t.id === id);
      if (!transaction) return;
      
      console.log('✏️ Editando transação:', transaction);
      
      AppState.editId = id;
      document.getElementById('modalTitle').textContent = 'Editar Transação';
      document.getElementById('transactionAccount').value = transaction.account_id || '';
      document.getElementById('transactionType').value = transaction.type === 'in' ? 'income' : 'expense';
      document.getElementById('transactionCategory').value = transaction.category || 'Alimentação';
      document.getElementById('transactionDescription').value = transaction.name;
      document.getElementById('transactionAmount').value = transaction.amount;
      document.getElementById('transactionDate').value = transaction.date;
      this.openModal();
      
    } catch (error) {
      console.error('❌ Erro ao editar:', error);
      Utils.showToast('❌ Erro ao editar transação', true);
    }
  },
  
  async delete(id) {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) return;
    
    try {
      console.log('🗑️ Excluindo transação:', id);
      
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