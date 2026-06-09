/**
 * Storage — wraps miniappsAI.storage with localStorage fallback.
 */
var BotHostStorage = (function() {

  var STORAGE_KEY = 'starbot_session';
  var CONFIG_KEY = 'starbot_config';

  function hasSDK() {
    return typeof miniappsAI !== 'undefined' && miniappsAI.storage;
  }

  function init() {}

  async function saveSession(user) {
    var data = JSON.stringify(user);
    if (hasSDK()) {
      await miniappsAI.storage.setItem(STORAGE_KEY, data);
    } else {
      try { localStorage.setItem(STORAGE_KEY, data); } catch (e) { console.warn('Storage save failed', e); }
    }
  }

  async function loadSession() {
    var raw;
    if (hasSDK()) {
      raw = await miniappsAI.storage.getItem(STORAGE_KEY);
    } else {
      try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) { raw = null; }
    }
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (_) { return null; }
  }

  async function clearSession() {
    if (hasSDK()) {
      await miniappsAI.storage.removeItem(STORAGE_KEY);
    } else {
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    }
  }

  async function saveConfig(cfg) {
    var data = JSON.stringify(cfg);
    if (hasSDK()) {
      await miniappsAI.storage.setItem(CONFIG_KEY, data);
    } else {
      try { localStorage.setItem(CONFIG_KEY, data); } catch (_) {}
    }
  }

  async function loadConfig() {
    var raw;
    if (hasSDK()) {
      raw = await miniappsAI.storage.getItem(CONFIG_KEY);
    } else {
      try { raw = localStorage.getItem(CONFIG_KEY); } catch (_) { raw = null; }
    }
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (_) { return null; }
  }

  return {
    init: init,
    saveSession: saveSession,
    loadSession: loadSession,
    clearSession: clearSession,
    saveConfig: saveConfig,
    loadConfig: loadConfig,
  };
})();
