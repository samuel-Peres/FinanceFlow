// ============================================
// INICIALIZAÇÃO DO APP
// ============================================
async function init() {
  console.log('🚀 Iniciando FinanceFlow...');
  
  try {
    await Auth.init();
    console.log('✅ Auth inicializado');
    
    UI.initTheme();
    UI.initNavigation();
    ExportModule.init();
    Events.init();
    Alerts.init();
    
    // Carregar dados se usuário estiver logado
    if (AppState.user) {
      console.log('👤 Usuário logado:', AppState.user.email);
      
      await Accounts.load();
      console.log('✅ Contas carregadas:', AppState.accounts.length);
      
      await Transactions.load();
      console.log('✅ Transações carregadas:', AppState.transactions.length);
      
      if (window.Bills) await Bills.load();
      if (window.Installments) await Installments.load();
      if (window.Reports) Reports.init();
      
      // Atualizar dashboard
      Dashboard.update();
      if (window.Charts) Charts.render();
      
      console.log('🎉 App pronto! Saldo total:', Accounts.getTotalBalance());
    }
    
  } catch (error) {
    console.error('❌ Erro na inicialização:', error);
    Utils.showToast('Erro ao carregar app: ' + error.message, true);
  }
  
  // Expor globalmente
  window.Auth = Auth;
  window.Transactions = Transactions;
  window.Utils = Utils;
  window.Goals = Goals;
  window.Accounts = Accounts;
  window.Bills = Bills;
  window.Installments = Installments;
  window.Reports = Reports;
  window.Charts = Charts;
  window.Dashboard = Dashboard;
}

init();