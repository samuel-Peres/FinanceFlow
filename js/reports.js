// ============================================
// RELATÓRIOS
// ============================================
const Reports = {
  currentPeriod: 'month',
  currentType: 'all',
  
  init() {
    this.renderPeriodSelector();
    this.loadReport();
  },
  
  renderPeriodSelector() {
    const container = document.getElementById('reportControls');
    if (!container) return;
    
    container.innerHTML = `
      <div style="display:flex; gap:12px; flex-wrap:wrap; margin-bottom:24px; background:var(--bg2); padding:16px; border-radius:16px;">
        <select id="reportPeriod" class="filter-select" onchange="Reports.setPeriod(this.value)">
          <option value="month">📅 Mês Atual</option>
          <option value="lastMonth">📆 Mês Anterior</option>
          <option value="year">📊 Ano Atual</option>
          <option value="all">🎯 Todo Período</option>
        </select>
        <select id="reportType" class="filter-select" onchange="Reports.setType(this.value)">
          <option value="all">📋 Todas Transações</option>
          <option value="income">💰 Apenas Receitas</option>
          <option value="expense">💸 Apenas Despesas</option>
        </select>
        <button class="btn btn-primary" onclick="Reports.exportReport()">📥 Exportar Relatório</button>
      </div>
    `;
  },
  
  setPeriod(period) {
    this.currentPeriod = period;
    this.loadReport();
  },
  
  setType(type) {
    this.currentType = type;
    this.loadReport();
  },
  
  getFilteredTransactions() {
    let filtered = [...AppState.transactions];
    const now = new Date();
    
    if (this.currentPeriod === 'month') {
      filtered = filtered.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (this.currentPeriod === 'lastMonth') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      filtered = filtered.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
      });
    } else if (this.currentPeriod === 'year') {
      filtered = filtered.filter(t => {
        const d = new Date(t.date);
        return d.getFullYear() === now.getFullYear();
      });
    }
    
    if (this.currentType === 'income') {
      filtered = filtered.filter(t => t.type === 'in');
    } else if (this.currentType === 'expense') {
      filtered = filtered.filter(t => t.type === 'out');
    }
    
    return filtered;
  },
  
  loadReport() {
    const filtered = this.getFilteredTransactions();
    const income = filtered.filter(t => t.type === 'in').reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter(t => t.type === 'out').reduce((s, t) => s + t.amount, 0);
    const balance = income - expense;
    
    // Categorias para gráfico
    const categories = {};
    filtered.filter(t => t.type === 'out').forEach(t => {
      const cat = t.category || 'Outros';
      categories[cat] = (categories[cat] || 0) + t.amount;
    });
    
    const topCategory = Object.entries(categories).sort((a,b) => b[1] - a[1])[0];
    
    // Maiores transações
    const maxIncome = Math.max(...filtered.filter(t => t.type === 'in').map(t => t.amount), 0);
    const maxExpense = Math.max(...filtered.filter(t => t.type === 'out').map(t => t.amount), 0);
    
    // Atualizar elementos
    const incomeEl = document.getElementById('reportIncome');
    const expenseEl = document.getElementById('reportExpense');
    const balanceEl = document.getElementById('reportBalance');
    const topCategoryEl = document.getElementById('reportTopCategory');
    const maxIncomeEl = document.getElementById('reportMaxIncome');
    const maxExpenseEl = document.getElementById('reportMaxExpense');
    const countEl = document.getElementById('reportTransactionCount');
    
    if (incomeEl) incomeEl.innerHTML = `R$ ${Utils.formatMoney(income)}`;
    if (expenseEl) expenseEl.innerHTML = `R$ ${Utils.formatMoney(expense)}`;
    if (balanceEl) {
      balanceEl.innerHTML = `R$ ${Utils.formatMoney(balance)}`;
      balanceEl.style.color = balance >= 0 ? 'var(--green)' : 'var(--red)';
    }
    if (topCategoryEl) topCategoryEl.innerHTML = topCategory ? `${topCategory[0]} (R$ ${Utils.formatMoney(topCategory[1])})` : 'Nenhuma';
    if (maxIncomeEl) maxIncomeEl.innerHTML = `R$ ${Utils.formatMoney(maxIncome)}`;
    if (maxExpenseEl) maxExpenseEl.innerHTML = `R$ ${Utils.formatMoney(maxExpense)}`;
    if (countEl) countEl.innerHTML = filtered.length;
    
    this.renderTransactionsTable(filtered);
    if (window.Charts) Charts.renderReportChart(categories);
  },
  
  renderTransactionsTable(transactions) {
    const container = document.getElementById('reportTransactions');
    if (!container) return;
    
    if (transactions.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:60px;color:var(--muted)">Nenhuma transação no período</div>';
      return;
    }
    
    container.innerHTML = `
      <div class="table-scroll">
        <table style="width:100%;">
          <thead>
            <tr style="background:var(--bg3);">
              <th style="padding:12px;">Data</th>
              <th style="padding:12px;">Descrição</th>
              <th style="padding:12px;">Categoria</th>
              <th style="padding:12px;">Conta</th>
              <th style="padding:12px;">Valor</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.slice(0, 50).map(t => {
              const account = AppState.accounts?.find(a => a.id === t.account_id);
              return `
                <tr style="border-bottom:1px solid var(--border);">
                  <td style="padding:12px;">${new Date(t.date).toLocaleDateString('pt-BR')}</td>
                  <td style="padding:12px;">${Utils.escapeHtml(t.name)}</td>
                  <td style="padding:12px;">${t.category || '-'}</td>
                  <td style="padding:12px;">${account ? account.name : '-'}</td>
                  <td style="padding:12px; color:${t.type === 'in' ? 'var(--green)' : 'var(--red)'}; font-weight:600;">
                    ${t.type === 'in' ? '+' : '-'} R$ ${Utils.formatMoney(t.amount)}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        ${transactions.length > 50 ? `<div style="text-align:center;padding:20px;color:var(--muted)">Mostrando 50 de ${transactions.length} transações</div>` : ''}
      </div>
    `;
  },
  
  exportReport() {
    const filtered = this.getFilteredTransactions();
    const data = filtered.map(t => ({
      Data: new Date(t.date).toLocaleDateString('pt-BR'),
      Descrição: t.name,
      Categoria: t.category || 'Sem categoria',
      Conta: AppState.accounts?.find(a => a.id === t.account_id)?.name || '-',
      Tipo: t.type === 'in' ? 'Receita' : 'Despesa',
      Valor: `R$ ${Utils.formatMoney(t.amount)}`
    }));
    
    const headers = ['Data', 'Descrição', 'Categoria', 'Conta', 'Tipo', 'Valor'];
    const rows = [headers.join(';')];
    for (const row of data) {
      rows.push(headers.map(h => `"${row[h] || ''}"`).join(';'));
    }
    
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_${this.currentPeriod}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    Utils.showToast('✅ Relatório exportado!');
  }
};