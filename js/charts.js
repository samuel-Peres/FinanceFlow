// ============================================
// GRÁFICOS AVANÇADOS - COMPLETO
// ============================================
const Charts = {
  // Instâncias dos gráficos
  expenseChartInstance: null,
  bankChartInstance: null,
  evolutionChartInstance: null,
  reportChartInstance: null,
  forecastChartInstance: null,
  comparisonChartInstance: null,
  goalsChartInstance: null,
  
  render() {
    this.renderExpenseChart();
    this.renderBankDistribution();
    this.renderEvolutionChart();
    this.renderForecastChart();
    this.renderComparisonChart();
    this.renderGoalsVsActual();
  },
  
  // ============================================
  // 1. PREVISÃO DE GASTOS (Próximos 30 dias)
  // ============================================
  renderForecastChart() {
    const ctx = document.getElementById('forecastChart')?.getContext('2d');
    if (!ctx) return;
    
    // Calcular média diária de gastos dos últimos 3 meses
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    
    let totalExpense = 0;
    let totalDays = 0;
    
    AppState.transactions.forEach(t => {
      if (t.type === 'out') {
        const date = new Date(t.date);
        if (date >= threeMonthsAgo) {
          totalExpense += t.amount;
          totalDays++;
        }
      }
    });
    
    const avgDailyExpense = totalDays > 0 ? totalExpense / totalDays : 0;
    
    // Previsão para os próximos 30 dias
    const forecast = [];
    const labels = [];
    let totalForecast = 0;
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);
      labels.push(`${date.getDate()}/${date.getMonth() + 1}`);
      
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const multiplier = isWeekend ? 1.2 : 1;
      const prediction = avgDailyExpense * multiplier;
      forecast.push(prediction);
      totalForecast += prediction;
    }
    
    if (this.forecastChartInstance) this.forecastChartInstance.destroy();
    
    this.forecastChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Previsão de Gastos (R$)',
          data: forecast,
          borderColor: '#ffc947',
          backgroundColor: 'rgba(255, 201, 71, 0.1)',
          fill: true,
          tension: 0.3,
          pointBackgroundColor: '#ffc947',
          pointBorderColor: '#ffc947'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          tooltip: { callbacks: { label: (ctx) => `R$ ${Utils.formatMoney(ctx.raw)}` } },
          legend: { position: 'top', labels: { color: 'var(--text)' } }
        },
        scales: {
          y: { ticks: { callback: (v) => `R$ ${v}`, color: 'var(--muted)' }, grid: { color: 'var(--border)' } },
          x: { ticks: { maxRotation: 45, minRotation: 45, color: 'var(--muted)' }, grid: { color: 'var(--border)' } }
        }
      }
    });
    
    const insightDiv = document.getElementById('forecastInsight');
    if (insightDiv) {
      insightDiv.innerHTML = `📊 Previsão para 30 dias: <strong style="color:var(--yellow)">R$ ${Utils.formatMoney(totalForecast)}</strong> | Média diária: R$ ${Utils.formatMoney(avgDailyExpense)}`;
    }
  },
  
  // ============================================
  // 2. COMPARAÇÃO MÊS A MÊS
  // ============================================
  renderComparisonChart() {
    const ctx = document.getElementById('comparisonChart')?.getContext('2d');
    if (!ctx) return;
    
    const yearSelect = document.getElementById('comparisonYear');
    const year = yearSelect ? parseInt(yearSelect.value) : new Date().getFullYear();
    
    const monthlyIncome = new Array(12).fill(0);
    const monthlyExpense = new Array(12).fill(0);
    
    AppState.transactions.forEach(t => {
      const date = new Date(t.date);
      if (date.getFullYear() === year) {
        const month = date.getMonth();
        if (t.type === 'in') monthlyIncome[month] += t.amount;
        else monthlyExpense[month] += t.amount;
      }
    });
    
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    if (this.comparisonChartInstance) this.comparisonChartInstance.destroy();
    
    this.comparisonChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: monthNames,
        datasets: [
          { label: '💰 Receitas', data: monthlyIncome, backgroundColor: '#00e5a0', borderRadius: 8, barPercentage: 0.6 },
          { label: '💸 Despesas', data: monthlyExpense, backgroundColor: '#ff4d6d', borderRadius: 8, barPercentage: 0.6 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: R$ ${Utils.formatMoney(ctx.raw)}` } },
          legend: { position: 'top', labels: { color: 'var(--text)' } }
        },
        scales: {
          y: { ticks: { callback: (v) => `R$ ${v}`, color: 'var(--muted)' }, grid: { color: 'var(--border)' } },
          x: { ticks: { color: 'var(--muted)' }, grid: { color: 'var(--border)' } }
        }
      }
    });
  },
  
  // ============================================
  // 3. METAS VS REALIZADO
  // ============================================
  renderGoalsVsActual() {
    const ctx = document.getElementById('goalsVsActualChart')?.getContext('2d');
    if (!ctx) return;
    
    if (!AppState.goals || AppState.goals.length === 0) {
      if (this.goalsChartInstance) this.goalsChartInstance.destroy();
      this.goalsChartInstance = new Chart(ctx, {
        type: 'bar',
        data: { labels: ['Nenhuma meta'], datasets: [{ label: 'Meta', data: [0], backgroundColor: '#8b5cf6' }] },
        options: { plugins: { legend: { labels: { color: 'var(--text)' } } } }
      });
      return;
    }
    
    const recentGoals = [...AppState.goals].slice(-5);
    const goalNames = recentGoals.map(g => g.name.length > 15 ? g.name.substring(0, 12) + '...' : g.name);
    const targetValues = recentGoals.map(g => g.target);
    const currentValues = recentGoals.map(g => g.current || 0);
    
    if (this.goalsChartInstance) this.goalsChartInstance.destroy();
    
    this.goalsChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: goalNames,
        datasets: [
          { label: '🎯 Meta (R$)', data: targetValues, backgroundColor: '#8b5cf6', borderRadius: 8, barPercentage: 0.5 },
          { label: '✅ Realizado (R$)', data: currentValues, backgroundColor: '#00e5a0', borderRadius: 8, barPercentage: 0.5 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: R$ ${Utils.formatMoney(ctx.raw)}` } },
          legend: { position: 'top', labels: { color: 'var(--text)' } }
        },
        scales: {
          y: { ticks: { callback: (v) => `R$ ${v}`, color: 'var(--muted)' }, grid: { color: 'var(--border)' } },
          x: { ticks: { color: 'var(--muted)', maxRotation: 45, minRotation: 45 }, grid: { color: 'var(--border)' } }
        }
      }
    });
  },
  
  // ============================================
  // GRÁFICOS ORIGINAIS (MANTER)
  // ============================================
  renderExpenseChart() {
    const categories = {};
    AppState.transactions.filter(t => t.type === 'out').forEach(t => {
      const cat = t.category || 'Outros';
      categories[cat] = (categories[cat] || 0) + parseFloat(t.amount);
    });
    
    const ctx = document.getElementById('expenseChart')?.getContext('2d');
    if (!ctx) return;
    
    if (this.expenseChartInstance) this.expenseChartInstance.destroy();
    
    if (Object.keys(categories).length === 0) {
      this.expenseChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: ['Sem dados'], datasets: [{ data: [1], backgroundColor: ['var(--muted)'] }] },
        options: { plugins: { legend: { position: 'bottom', labels: { color: 'var(--text)' } } } }
      });
      return;
    }
    
    this.expenseChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(categories),
        datasets: [{ data: Object.values(categories), backgroundColor: ['#00e5a0', '#38bdf8', '#8b5cf6', '#ffc947', '#ff4d6d', '#a78bfa', '#f97316', '#14b8a6'], borderWidth: 0 }]
      },
      options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom', labels: { color: 'var(--text)', font: { size: 11 } } } } }
    });
  },
  
  renderBankDistribution() {
    if (!AppState.accounts || AppState.accounts.length === 0) return;
    
    const bankBalances = {};
    AppState.accounts.forEach(acc => { bankBalances[acc.bank] = (bankBalances[acc.bank] || 0) + (acc.balance || 0); });
    
    const ctx = document.getElementById('bankDistributionChart')?.getContext('2d');
    if (!ctx) return;
    
    if (this.bankChartInstance) this.bankChartInstance.destroy();
    
    if (Object.keys(bankBalances).length === 0) {
      this.bankChartInstance = new Chart(ctx, { type: 'pie', data: { labels: ['Sem contas'], datasets: [{ data: [1], backgroundColor: ['var(--muted)'] }] } });
      return;
    }
    
    this.bankChartInstance = new Chart(ctx, {
      type: 'pie',
      data: { labels: Object.keys(bankBalances), datasets: [{ data: Object.values(bankBalances), backgroundColor: ['#00e5a0', '#38bdf8', '#8b5cf6', '#ffc947', '#ff4d6d', '#a78bfa'] }] },
      options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'right', labels: { color: 'var(--text)', font: { size: 11 } } } } }
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
    
    if (this.evolutionChartInstance) this.evolutionChartInstance.destroy();
    
    this.evolutionChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Object.keys(monthlyData),
        datasets: [
          { label: 'Receitas', data: Object.values(monthlyData).map(d => d.income), borderColor: '#00e5a0', backgroundColor: 'transparent', tension: 0.3, fill: false, pointBackgroundColor: '#00e5a0' },
          { label: 'Despesas', data: Object.values(monthlyData).map(d => d.expense), borderColor: '#ff4d6d', backgroundColor: 'transparent', tension: 0.3, fill: false, pointBackgroundColor: '#ff4d6d' },
          { label: 'Saldo', data: Object.values(monthlyData).map(d => d.balance), borderColor: '#ffc947', backgroundColor: 'transparent', tension: 0.3, fill: false, pointBackgroundColor: '#ffc947' }
        ]
      },
      options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom', labels: { color: 'var(--text)', font: { size: 11 } } } }, scales: { y: { grid: { color: 'var(--border)' }, ticks: { color: 'var(--muted)' } }, x: { grid: { color: 'var(--border)' }, ticks: { color: 'var(--muted)' } } } }
    });
  },
  
  renderReportChart(categories) {
    const ctx = document.getElementById('reportCategoryChart')?.getContext('2d');
    if (!ctx) return;
    
    if (this.reportChartInstance) this.reportChartInstance.destroy();
    
    if (Object.keys(categories).length === 0) {
      this.reportChartInstance = new Chart(ctx, { type: 'bar', data: { labels: ['Sem dados'], datasets: [{ data: [1], backgroundColor: 'var(--muted)' }] } });
      return;
    }
    
    this.reportChartInstance = new Chart(ctx, {
      type: 'bar',
      data: { labels: Object.keys(categories), datasets: [{ label: 'Gastos por Categoria (R$)', data: Object.values(categories), backgroundColor: '#00e5a0', borderRadius: 8, barPercentage: 0.7 }] },
      options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'top', labels: { color: 'var(--text)' } } }, scales: { y: { grid: { color: 'var(--border)' }, ticks: { color: 'var(--muted)' } }, x: { grid: { color: 'var(--border)' }, ticks: { color: 'var(--muted)' } } } }
    });
  }
};