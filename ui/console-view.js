/**
 * Console view — live log feed and command input.
 */
var BotHostConsole = (function() {

  var elLog = null;
  var elInput = null;
  var maxLines = 200;

  var typeColors = {
    info: 'text-slate-400',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    error: 'text-red-400',
  };

  function addLog(text, type) {
    type = type || 'info';
    if (!elLog) elLog = document.getElementById('consoleLog');

    // Remove "no logs" placeholder
    var placeholder = elLog ? elLog.querySelector('.italic') : null;
    if (placeholder) placeholder.remove();

    var entry = document.createElement('div');
    entry.className = 'log-entry flex gap-2 py-1';

    var time = new Date();
    var ts = String(time.getHours()).padStart(2, '0') + ':' +
             String(time.getMinutes()).padStart(2, '0') + ':' +
             String(time.getSeconds()).padStart(2, '0');

    entry.innerHTML =
      '<span class="text-slate-600 shrink-0">' + ts + '</span>' +
      '<span class="' + (typeColors[type] || typeColors.info) + '">' + text + '</span>';

    if (elLog) {
      elLog.appendChild(entry);
      elLog.scrollTop = elLog.scrollHeight;

      // Trim old lines
      while (elLog.children.length > maxLines) {
        elLog.removeChild(elLog.firstChild);
      }
    }
  }

  function clear() {
    if (!elLog) return;
    elLog.innerHTML = '<p class="text-slate-500 italic">No logs yet. Start your bot to see activity.</p>';
  }

  function handleCommand() {
    if (!elInput) return;
    var cmd = elInput.value.trim();
    if (!cmd) return;

    addLog('> ' + cmd, 'info');
    elInput.value = '';

    // Simple local command responses
    var lower = cmd.toLowerCase();
    if (lower === 'help') {
      addLog('Available commands: help, ping, status, clear, uptime', 'info');
    } else if (lower === 'ping') {
      addLog('Pong! 🏓', 'success');
    } else if (lower === 'status') {
      var s = BotHostState.getState();
      addLog('Status: ' + s.status + ' | Servers: ' + s.stats.servers + ' | Users: ' + s.stats.users, 'info');
    } else if (lower === 'clear') {
      clear();
    } else if (lower === 'uptime') {
      var s = BotHostState.getState();
      addLog('Uptime: ' + (s.stats.uptimeMs > 0 ? BotHostSimulator.formatUptime(s.stats.uptimeMs) : 'Bot is offline'), 'info');
    } else {
      addLog('Unknown command: ' + cmd + '. Type "help" for available commands.', 'warning');
    }
  }

  function init() {
    elLog = document.getElementById('consoleLog');
    elInput = document.getElementById('consoleInput');

    var btnClear = document.getElementById('btnClearConsole');
    var btnSend = document.getElementById('btnSendCommand');

    if (btnClear) btnClear.addEventListener('click', clear);
    if (btnSend) btnSend.addEventListener('click', handleCommand);
    if (elInput) {
      elInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleCommand();
        }
      });
    }
  }

  return { init: init, addLog: addLog, clear: clear };
})();
