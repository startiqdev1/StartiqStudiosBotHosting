/**
 * Bot state management — single source of truth.
 */
var BotHostState = (function() {

  var STATUS = {
    OFFLINE: 'offline',
    STARTING: 'starting',
    ONLINE: 'online',
    STOPPING: 'stopping',
  };

  var listeners = [];

  var state = {
    status: STATUS.OFFLINE,
    stats: { servers: 0, users: 0, uptimeMs: 0, messages: 0, latency: null, commands: 0 },
    activity: [],
    config: {
      token: '',
      prefix: '!',
      statusMessage: 'Watching over the server',
      statusType: 'watching',
    },
    user: null,
  };

  function getState() { return state; }

  function subscribe(fn) {
    listeners.push(fn);
    return function() {
      var idx = listeners.indexOf(fn);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }

  function notify(path) {
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](path, state); } catch (_) {}
    }
  }

  function setStatus(next) { state.status = next; notify('status'); }

  function updateStats(patch) { Object.assign(state.stats, patch); notify('stats'); }

  function bumpStat(key, delta) {
    if (delta === undefined) delta = 1;
    state.stats[key] = (state.stats[key] || 0) + delta;
    notify('stats');
  }

  function pushActivity(value) {
    state.activity.push(value);
    if (state.activity.length > 60) state.activity.shift();
    notify('activity');
  }

  function setConfig(cfg) { Object.assign(state.config, cfg); notify('config'); }
  function setUser(user) { state.user = user; notify('user'); }
  function getUser() { return state.user; }

  return {
    init: function() {},
    STATUS: STATUS,
    getState: getState,
    subscribe: subscribe,
    setStatus: setStatus,
    updateStats: updateStats,
    bumpStat: bumpStat,
    pushActivity: pushActivity,
    setConfig: setConfig,
    setUser: setUser,
    getUser: getUser,
  };
})();
