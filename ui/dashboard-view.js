/**
 * Dashboard view — stats, activity graph, status indicator.
 */
var BotHostDashboard = (function() {

  var STATUS_CLASSES = {
    offline: 'status-offline',
    starting: 'status-starting',
    online: 'status-online',
    stopping: 'status-stopping',
  };

  var STATUS_LABELS = {
    offline: 'Offline',
    starting: 'Starting…',
    online: 'Online',
    stopping: 'Stopping…',
  };

  var els = {};
  var graphBars = [];
  var unsubscribe = null;

  function formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  }

  function createGraphBars() {
    if (!els.graph) return;
    els.graph.innerHTML = '';
    graphBars = [];
    for (var i = 0; i < 60; i++) {
      var bar = document.createElement('div');
      bar.className = 'graph-bar';
      bar.style.height = '2px';
      els.graph.appendChild(bar);
      graphBars.push(bar);
    }
  }

  function updateGraph(activity) {
    var max = 1;
    for (var i = 0; i < activity.length; i++) {
      if (activity[i] > max) max = activity[i];
    }
    for (var i = 0; i < 60; i++) {
      var val = activity[i] || 0;
      var pct = Math.max(2, (val / max) * 100);
      if (graphBars[i]) graphBars[i].style.height = pct + '%';
    }
  }

  function updateStatus(status) {
    if (!els.dot || !els.label) return;
    els.dot.className = 'h-2.5 w-2.5 rounded-full ' + (STATUS_CLASSES[status] || STATUS_CLASSES.offline);
    els.label.textContent = STATUS_LABELS[status] || STATUS_LABELS.offline;

    var isOnline = status === 'online';
    var isOffline = status === 'offline';
    if (els.btnStart) {
      els.btnStart.disabled = !isOffline;
      els.btnStart.style.display = isOffline ? '' : 'none';
    }
    if (els.btnStop) {
      els.btnStop.disabled = !isOnline;
      els.btnStop.style.display = isOnline ? '' : 'none';
    }
    if (els.btnRestart) els.btnRestart.disabled = !isOnline;
  }

  function updateStats(stats) {
    if (els.servers) els.servers.textContent = formatNumber(stats.servers);
    if (els.users) els.users.textContent = formatNumber(stats.users);
    if (els.uptime) els.uptime.textContent = stats.uptimeMs > 0 ? BotHostSimulator.formatUptime(stats.uptimeMs) : '—';
    if (els.messages) els.messages.textContent = formatNumber(stats.messages);
    if (els.commands) els.commands.textContent = formatNumber(stats.commands);
    if (els.latency) {
      els.latency.innerHTML = stats.latency !== null
        ? stats.latency + '<span class="text-sm font-normal text-slate-400"> ms</span>'
        : '—<span class="text-sm font-normal text-slate-400"> ms</span>';
    }
  }

  function init() {
    if (unsubscribe) { unsubscribe(); unsubscribe = null; }

    els.dot = document.getElementById('statusDot');
    els.label = document.getElementById('statusLabel');
    els.servers = document.getElementById('stat-servers');
    els.users = document.getElementById('stat-users');
    els.uptime = document.getElementById('stat-uptime');
    els.messages = document.getElementById('stat-messages');
    els.latency = document.getElementById('stat-latency');
    els.commands = document.getElementById('stat-commands');
    els.graph = document.getElementById('activityGraph');
    els.btnStart = document.getElementById('btnStart');
    els.btnStop = document.getElementById('btnStop');
    els.btnRestart = document.getElementById('btnRestart');

    createGraphBars();

    var state = BotHostState.getState();
    updateStatus(state.status);
    updateStats(state.stats);
    updateGraph(state.activity);

    unsubscribe = BotHostState.subscribe(function(path, state) {
      if (path === 'status') updateStatus(state.status);
      if (path === 'stats') updateStats(state.stats);
      if (path === 'activity') updateGraph(state.activity);
    });
  }

  return { init: init };
})();
