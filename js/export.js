// ============================================
// EXPORTAÇÃO
// ============================================
const ExportModule = {
  init() {
    document.querySelectorAll('.export-card').forEach(card => {
      card.addEventListener('click', () => this.exportData(card.dataset.format));
    });
  },
  
  exportData(format) {
    if (AppState.transactions.length === 0) {
      Utils.showToast('❌ Nenhuma transação para exportar');
      return;
    }
    
    const data = AppState.transactions.map(t => ({
      Descrição: t.name,
      Categoria: t.category || 'Sem categoria',
      Tipo: t.type === 'in' ? 'Receita' : 'Despesa',
      Valor: parseFloat(t.amount),
      Data: new Date(t.date).toLocaleDateString('pt-BR')
    }));
    
    if (format === 'csv') {
      const headers = ['Descrição', 'Categoria', 'Tipo', 'Valor', 'Data'];
      const rows = [headers.join(',')];
      for (const row of data) rows.push(headers.map(h => `"${row[h]}"`).join(','));
      this.download(new Blob([rows.join('\n')], { type: 'text/csv' }), 'transacoes.csv');
    } else if (format === 'json') {
      this.download(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), 'transacoes.json');
    } else if (format === 'pdf') {
      const html = this.generatePDFHTML(data);
      this.download(new Blob([html], { type: 'text/html' }), 'relatorio.html');
    }
    Utils.showToast(`✅ ${format.toUpperCase()} exportado!`);
  },
  
  generatePDFHTML(data) {
    const totalIncome = data.filter(d => d.Tipo === 'Receita').reduce((s, d) => s + d.Valor, 0);
    const totalExpense = data.filter(d => d.Tipo === 'Despesa').reduce((s, d) => s + d.Valor, 0);
    return `<html><head><title>FinanceFlow</title><style>body{font-family:Arial;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px}th{background:#f2f2f2}</style></head>
      <body><h1>FinanceFlow - Relatório</h1><p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
      <table><thead><tr><th>Descrição</th><th>Categoria</th><th>Tipo</th><th>Valor</th><th>Data</th></tr></thead>
      <tbody>${data.map(d => `<tr><td>${d.Descrição}</td><td>${d.Categoria}</td><td>${d.Tipo}</td><td>R$ ${Utils.formatMoney(d.Valor)}</td><td>${d.Data}</td></tr>`).join('')}</tbody></table>
      <p><strong>Total Receitas:</strong> R$ ${Utils.formatMoney(totalIncome)}</p>
      <p><strong>Total Despesas:</strong> R$ ${Utils.formatMoney(totalExpense)}</p>
      <p><strong>Saldo:</strong> R$ ${Utils.formatMoney(totalIncome - totalExpense)}</p>
      </body></html>`;
  },
  
  download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
};