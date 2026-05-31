// ============================================
// GRÁFICOS
// ============================================
const Charts = {
  render() {
    const categories = {};
    AppState.transactions.filter(t => t.type === 'out').forEach(t => {
      const cat = t.category || 'Outros';
      categories[cat] = (categories[cat] || 0) + parseFloat(t.amount);
    });
    
    const ctx = document.getElementById('expenseChart')?.getContext('2d');
    if (!ctx) return;
    
    if (AppState.chartInstance) AppState.chartInstance.destroy();
    
    if (Object.keys(categories).length === 0) {
      AppState.chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: ['Sem dados'], datasets: [{ data: [1], backgroundColor: ['var(--muted)'] }] },
        options: { plugins: { legend: { position: 'bottom', labels: { color: 'var(--text)' } } } }
      });
      return;
    }
    
    AppState.chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(categories),
        datasets: [{ data: Object.values(categories), backgroundColor: ['#00e5a0', '#38bdf8', '#8b5cf6', '#ffc947', '#ff4d6d', '#a78bfa'], borderWidth: 0 }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: 'var(--text)', font: { size: 11 } } } } }
    });
  }
};