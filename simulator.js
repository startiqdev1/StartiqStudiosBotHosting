/**
 * Bot simulator — generates fake Discord bot events for demo purposes.
 */
var BotHostSimulator = (function() {

  var intervals = [];
  var uptimeStart = null;
  var uptimeInterval = null;

  var SERVER_NAMES = [
    'Gaming Hub', 'Dev Community', 'Art Studio', 'Music Lounge',
    'Study Group', 'Meme Central', 'Anime Club', 'CryptoTalk',
    'Design Guild', 'Code Academy', 'Minecraft World', 'Valorant EU',
  ];

  var CHANNEL_NAMES = [
    'general', 'off-topic', 'dev-chat', 'help', 'announcements',
    'memes', 'art-showcase', 'music-bot', 'voice-text', 'bot-commands',
  ];

  var COMMANDS = [
    '!help', '!ping', '!userinfo', '!serverinfo', '!play',
    '!skip', '!queue', '!ban', '!kick', '!mute',
    '!poll', '!8ball', '!avatar', '!roleinfo', '!stats',
  ];

  var USERS = [
    'Alex_GG', 'NightOwl42', 'PixelArtist', 'ChillVibes',
    'CodeWizard', 'GameMasterX', 'MelodyMaker', 'StarDust99',
    'PixelPanda', 'TechNinja', 'LunaWolf', 'SkyDreamer',
  ];

  function random(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  function formatUptime(ms) {
    var s = Math.floor(ms / 1000);
    if (s < 60) return s + 's';
    var m = Math.floor(s / 60);
    if (m < 60) return m + 'm ' + (s % 60) + 's';
    var h = Math.floor(m / 60);
    return h + 'h ' + (m % 60) + 'm';
  }

  function log(text, type) {
    if (BotHostConsole && BotHostConsole.addLog) {
      BotHostConsole.addLog(text, type || 'info');
    }
  }

  function startBot() {
    var state = BotHostState.getState();
    if (state.status !== 'offline') return;

    BotHostState.setStatus('starting');
    log('Connecting to Discord gateway…', 'info');

    setTimeout(function() {
      BotHostState.setStatus('online');
      BotHostState.updateStats({ servers: 1, users: randomInt(50, 200), latency: randomInt(30, 120) });
      log('✅ Logged in as StartiqStudios#0001', 'success');
      log('Connected to ' + BotHostState.getState().stats.servers + ' server(s)', 'info');

      uptimeStart = Date.now();
      uptimeInterval = setInterval(function() {
        BotHostState.updateStats({ uptimeMs: Date.now() - uptimeStart });
      }, 1000);
      intervals.push(uptimeInterval);

      // Simulate events
      var eventInterval = setInterval(function() {
        var roll = Math.random();
        var s = BotHostState.getState();

        if (roll < 0.3) {
          BotHostState.bumpStat('messages');
          BotHostState.pushActivity(randomInt(1, 5));
          log('📨 Message in #' + random(CHANNEL_NAMES) + ' from ' + random(USERS), 'info');
        } else if (roll < 0.5) {
          BotHostState.bumpStat('commands');
          BotHostState.bumpStat('messages');
          BotHostState.pushActivity(randomInt(3, 10));
          log('⚡ Command executed: ' + random(COMMANDS) + ' by ' + random(USERS), 'success');
        } else if (roll < 0.65) {
          var server = random(SERVER_NAMES);
          BotHostState.bumpStat('servers');
          BotHostState.bumpStat('users', randomInt(5, 50));
          log('🟢 Joined server: ' + server, 'success');
        } else if (roll < 0.75) {
          BotHostState.updateStats({ latency: randomInt(25, 200) });
          log('💓 Heartbeat — latency: ' + s.stats.latency + 'ms', 'info');
        } else if (roll < 0.85) {
          BotHostState.pushActivity(0);
          log('⚠️ Rate limited — backing off', 'warning');
        } else {
          BotHostState.pushActivity(0);
        }
      }, randomInt(1500, 3500));
      intervals.push(eventInterval);

    }, randomInt(1000, 2500));
  }

  function stopBot() {
    var state = BotHostState.getState();
    if (state.status !== 'online') return;

    BotHostState.setStatus('stopping');
    log('Shutting down gracefully…', 'warning');

    setTimeout(function() {
      BotHostState.setStatus('offline');
      intervals.forEach(clearInterval);
      intervals = [];
      if (uptimeInterval) clearInterval(uptimeInterval);
      uptimeStart = null;
      BotHostState.updateStats({ servers: 0, users: 0, uptimeMs: 0, latency: null });
      log('🔴 Bot has been stopped.', 'error');
    }, randomInt(800, 1500));
  }

  function restartBot() {
    var state = BotHostState.getState();
    if (state.status !== 'online') return;

    log('🔄 Restarting bot…', 'warning');
    stopBot();
    var check = setInterval(function() {
      if (BotHostState.getState().status === 'offline') {
        clearInterval(check);
        setTimeout(startBot, 500);
      }
    }, 200);
  }

  return {
    init: function() {},
    startBot: startBot,
    stopBot: stopBot,
    restartBot: restartBot,
    formatUptime: formatUptime,
  };
})();
