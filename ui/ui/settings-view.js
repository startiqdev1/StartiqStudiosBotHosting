/**
 * Settings view — bot config form and danger zone.
 */
var BotHostSettings = (function() {

  var elForm, elToken, elPrefix, elStatus, elStatusType, elToggleToken, elEyeIcon, elReset;

  function init() {
    elForm = document.getElementById('settingsForm');
    elToken = document.getElementById('inputToken');
    elPrefix = document.getElementById('inputPrefix');
    elStatus = document.getElementById('inputStatus');
    elStatusType = document.getElementById('inputStatusType');
    elToggleToken = document.getElementById('btnToggleToken');
    elEyeIcon = document.getElementById('eyeIcon');
    elReset = document.getElementById('btnReset');

    // Load saved config
    BotHostStorage.loadConfig().then(function(cfg) {
      if (!cfg) return;
      if (elToken && cfg.token) elToken.value = cfg.token;
      if (elPrefix && cfg.prefix) elPrefix.value = cfg.prefix;
      if (elStatus && cfg.statusMessage) elStatus.value = cfg.statusMessage;
      if (elStatusType && cfg.statusType) elStatusType.value = cfg.statusType;
      BotHostState.setConfig(cfg);
    }).catch(function() {});

    // Toggle token visibility
    if (elToggleToken) {
      elToggleToken.addEventListener('click', function() {
        if (!elToken) return;
        var isPass = elToken.type === 'password';
        elToken.type = isPass ? 'text' : 'password';
        if (elEyeIcon) {
          elEyeIcon.innerHTML = isPass
            ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'
            : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
        }
      });
    }

    // Save config
    if (elForm) {
      elForm.addEventListener('submit', function(e) {
        e.preventDefault();
        var cfg = {
          token: elToken ? elToken.value : '',
          prefix: elPrefix ? elPrefix.value : '!',
          statusMessage: elStatus ? elStatus.value : '',
          statusType: elStatusType ? elStatusType.value : 'watching',
        };
        BotHostState.setConfig(cfg);
        BotHostStorage.saveConfig(cfg).catch(function() {});
        BotHostToast.showToast('Configuration saved!', 'success');
      });
    }

    // Reset
    if (elReset) {
      elReset.addEventListener('click', function() {
        if (!confirm('This will clear all saved settings and logs. Continue?')) return;
        BotHostStorage.clearSession().catch(function() {});
        if (elToken) elToken.value = '';
        if (elPrefix) elPrefix.value = '!';
        if (elStatus) elStatus.value = '';
        if (elStatusType) elStatusType.value = 'watching';
        BotHostConsole.clear();
        BotHostState.updateStats({ servers: 0, users: 0, uptimeMs: 0, messages: 0, latency: null, commands: 0 });
        for (var i = 0; i < 60; i++) BotHostState.pushActivity(0);
        BotHostToast.showToast('All data has been reset.', 'info');
      });
    }
  }

  return { init: init };
})();
