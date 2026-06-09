/**
 * Entry point — bootstraps the StartiqStudios Bot Host app.
 */
(function() {

  function initTabs() {
    var tabs = document.querySelectorAll('[role="tab"]');
    var panels = document.querySelectorAll('[role="tabpanel"]');

    function activateTab(tab) {
      var target = tab.dataset.tab;
      tabs.forEach(function(t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      panels.forEach(function(p) {
        p.classList.toggle('hidden', p.id !== 'tab-' + target);
      });
    }

    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() { activateTab(tab); });
      tab.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
          e.preventDefault();
          var idx = Array.from(tabs).indexOf(tab);
          var next = e.key === 'ArrowRight' ? (idx + 1) % tabs.length : (idx - 1 + tabs.length) % tabs.length;
          tabs[next].focus();
          activateTab(tabs[next]);
        }
      });
    });
  }

  function initUserMenu() {
    var btn = document.getElementById('btnUserMenu');
    var dropdown = document.getElementById('userDropdown');
    var wrap = document.getElementById('userMenuWrap');
    if (!btn || !dropdown || !wrap) return;

    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      dropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', function(e) {
      if (!wrap.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    console.log('[Boot] Starting…');

    try { initTabs(); } catch (e) { console.error('[Boot] Tabs:', e); }
    try { initUserMenu(); } catch (e) { console.error('[Boot] Menu:', e); }
    try { BotHostToast.init(); } catch (e) { console.error('[Boot] Toast:', e); }
    try { BotHostState.init(); } catch (e) { console.error('[Boot] State:', e); }
    try { BotHostStorage.init(); } catch (e) { console.error('[Boot] Storage:', e); }
    try { BotHostSimulator.init(); } catch (e) { console.error('[Boot] Sim:', e); }

    // Wire control buttons
    var btnStart = document.getElementById('btnStart');
    var btnStop = document.getElementById('btnStop');
    var btnRestart = document.getElementById('btnRestart');
    if (btnStart) btnStart.addEventListener('click', BotHostSimulator.startBot);
    if (btnStop) btnStop.addEventListener('click', BotHostSimulator.stopBot);
    if (btnRestart) btnRestart.addEventListener('click', BotHostSimulator.restartBot);

    // Init auth LAST
    try {
      BotHostAuth.init();
      console.log('[Boot] Auth initialized');
    } catch (e) { console.error('[Boot] Auth:', e); }
  });

})();
