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
  
  // Expor globalmente para onclick
  window.Auth = Auth;
  window.Transactions = Transactions;
  window.Utils = Utils;
  window.Goals = Goals;
}

init();