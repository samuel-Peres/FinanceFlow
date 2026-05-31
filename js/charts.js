// ============================================
// GRÁFICOS AVANÇADOS
// ============================================
const Charts = {
  render() {
    this.renderExpenseChart();
    this.renderBankDistribution();
    this.renderEvolutionChart();
  },
  
  renderExpenseChart() {
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
        datasets: [{ 
          data: Object.values(categories), 
          backgroundColor: ['#00e5a0', '#38bdf8', '#8b5cf6', '#ffc947', '#ff4d6d', '#a78bfa', '#f97316', '#14b8a6', '#ec4899', '#6366f1'],
          borderWidth: 0
        }]
      },
      options: { 
        responsive: true, 
        maintainAspectRatio: true,
        plugins: { 
          legend: { position: 'bottom', labels: { color: 'var(--text)', font: { size: 11 } } }
        }
      }
    });
  },
  
  renderBankDistribution() {
    if (!AppState.accounts || AppState.accounts.length === 0) return;
    
    const bankBalances = {};
    AppState.accounts.forEach(acc => {
      bankBalances[acc.bank] = (bankBalances[acc.bank] || 0) + (acc.balance || 0);
    });
    
    const ctx = document.getElementById('bankDistributionChart')?.getContext('2d');
    if (!ctx) return;
    
    if (AppState.bankChartInstance) AppState.bankChartInstance.destroy();
    
    if (Object.keys(bankBalances).length === 0) {
      AppState.bankChartInstance = new Chart(ctx, {
        type: 'pie',
        data: { labels: ['Sem contas'], datasets: [{ data: [1], backgroundColor: ['var(--muted)'] }] }
      });
      return;
    }
    
    AppState.bankChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(bankBalances),
        datasets: [{ 
          data: Object.values(bankBalances), 
          backgroundColor: ['#00e5a0', '#38bdf8', '#8b5cf6', '#ffc947', '#ff4d6d', '#a78bfa', '#f97316']
        }]
      },
      options: { 
        responsive: true,
        maintainAspectRatio: true,
        plugins: { 
          legend: { position: 'right', labels: { color: 'var(--text)', font: { size: 11 } } }
        }
      }
    });
  },
  
  renderEvolutionChart() {
    const monthlyData = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      monthlyData[key] = { income: 0, expense: 0, balance: 0 };
    }
    
    AppState.transactions.forEach(t => {
      const d = new Date(t.date);
      const key = `${d.getMonth() + 1}/${d.getFullYear()}`;
      if (monthlyData[key]) {
        if (t.type === 'in') monthlyData[key].income += t.amount;
        else monthlyData[key].expense += t.amount;
        monthlyData[key].balance = monthlyData[key].income - monthlyData[key].expense;
      }
    });
    
    const ctx = document.getElementById('evolutionChart')?.getContext('2d');
    if (!ctx) return;
    
    if (AppState.evolutionChartInstance) AppState.evolutionChartInstance.destroy();
    
    AppState.evolutionChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Object.keys(monthlyData),
        datasets: [
          { 
            label: 'Receitas', 
            data: Object.values(monthlyData).map(d => d.income), 
            borderColor: '#00e5a0', 
            backgroundColor: 'transparent', 
            tension: 0.3, 
            fill: false,
            pointBackgroundColor: '#00e5a0'
          },
          { 
            label: 'Despesas', 
            data: Object.values(monthlyData).map(d => d.expense), 
            borderColor: '#ff4d6d', 
            backgroundColor: 'transparent', 
            tension: 0.3, 
            fill: false,
            pointBackgroundColor: '#ff4d6d'
          },
          { 
            label: 'Saldo', 
            data: Object.values(monthlyData).map(d => d.balance), 
            borderColor: '#ffc947', 
            backgroundColor: 'transparent', 
            tension: 0.3, 
            fill: false,
            pointBackgroundColor: '#ffc947'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { 
          legend: { position: 'bottom', labels: { color: 'var(--text)', font: { size: 11 } } }
        },
        scales: {
          y: { grid: { color: 'var(--border)' }, ticks: { color: 'var(--muted)' } },
          x: { grid: { color: 'var(--border)' }, ticks: { color: 'var(--muted)' } }
        }
      }
    });
  },
  
  renderReportChart(categories) {
    const ctx = document.getElementById('reportCategoryChart')?.getContext('2d');
    if (!ctx) return;
    
    if (AppState.reportChartInstance) AppState.reportChartInstance.destroy();
    
    if (Object.keys(categories).length === 0) {
      AppState.reportChartInstance = new Chart(ctx, {
        type: 'bar',
        data: { labels: ['Sem dados'], datasets: [{ data: [1], backgroundColor: 'var(--muted)' }] }
      });
      return;
    }
    
    AppState.reportChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(categories),
        datasets: [{
          label: 'Gastos por Categoria (R$)',
          data: Object.values(categories),
          backgroundColor: '#00e5a0',
          borderRadius: 8,
          barPercentage: 0.7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { 
          legend: { position: 'top', labels: { color: 'var(--text)' } }
        },
        scales: {
          y: { 
            grid: { color: 'var(--border)' }, 
            ticks: { color: 'var(--muted)' },
            title: { display: true, text: 'Valor (R$)', color: 'var(--muted)' }
          },
          x: { 
            grid: { color: 'var(--border)' }, 
            ticks: { color: 'var(--muted)' }
          }
        }
      }
    });
  }
};