// ============================================
// INICIALIZAÇÃO DO APP
// ============================================
async function init() {
  await Auth.init();
  UI.initTheme();
  UI.initNavigation();
  ExportModule.init();
  Events.init();
  Alerts.init();
  
  // Carregar contas primeiro
  if (AppState.user) {
    await Accounts.load();
    await Transactions.load();
    if (window.Bills) await Bills.load();
    if (window.Installments) await Installments.load();
    if (window.Reports) Reports.init();
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
}

init();