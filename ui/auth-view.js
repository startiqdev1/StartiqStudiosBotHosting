/**
 * Auth view — login and sign-up with session persistence.
 */
var BotHostAuth = (function() {

  /* ---- DOM refs ---- */
  var el = {};
  var mode = 'login';

  /* ---- Helpers ---- */

  function showError(msg) {
    if (!el.error) return;
    el.error.textContent = msg;
    el.error.classList.remove('hidden');
  }

  function hideError() {
    if (!el.error) return;
    el.error.textContent = '';
    el.error.classList.add('hidden');
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function $(id) { return document.getElementById(id); }

  /* ---- Mode switching ---- */

  function switchMode(newMode) {
    mode = newMode;
    hideError();

    if (mode === 'signup') {
      if (el.nameGroup) el.nameGroup.classList.remove('hidden');
      if (el.confirmGroup) el.confirmGroup.classList.remove('hidden');
      if (el.title) el.title.textContent = 'Create an account';
      if (el.subtitle) el.subtitle.textContent = 'Join StartiqStudios to host your bots.';
      if (el.submit) {
        var span = el.submit.querySelector('span');
        if (span) span.textContent = 'Create Account';
      }
      if (el.toggleText) {
        el.toggleText.innerHTML = 'Already have an account? <button type="button" id="authToggleLink" class="font-semibold text-indigo-400 hover:text-indigo-300 transition">Sign in</button>';
      }
    } else {
      if (el.nameGroup) el.nameGroup.classList.add('hidden');
      if (el.confirmGroup) el.confirmGroup.classList.add('hidden');
      if (el.title) el.title.textContent = 'Welcome back';
      if (el.subtitle) el.subtitle.textContent = 'Sign in to manage your bots.';
      if (el.submit) {
        var span = el.submit.querySelector('span');
        if (span) span.textContent = 'Sign In';
      }
      if (el.toggleText) {
        el.toggleText.innerHTML = 'Don\'t have an account? <button type="button" id="authToggleLink" class="font-semibold text-indigo-400 hover:text-indigo-300 transition">Sign up</button>';
      }
    }

    // Re-attach toggle link (innerHTML destroys old button)
    var link = $('authToggleLink');
    if (link) {
      link.addEventListener('click', function() {
        switchMode(mode === 'login' ? 'signup' : 'login');
      });
    }
  }

  /* ---- Form handling ---- */

  function handleSubmit(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    console.log('[Auth] Submit — mode:', mode);

    hideError();

    var email = el.email ? el.email.value.trim() : '';
    var password = el.password ? el.password.value : '';

    if (!email || !password) {
      showError('Please fill in all fields.');
      return;
    }
    if (!validateEmail(email)) {
      showError('Please enter a valid email address.');
      return;
    }

    if (mode === 'signup') {
      handleSignup(email, password);
    } else {
      handleLogin(email, password);
    }
  }

  function handleSignup(email, password) {
    console.log('[Auth] Signup');
    var name = el.name ? el.name.value.trim() : '';
    var confirm = el.confirm ? el.confirm.value : '';

    if (!name) { showError('Please enter your full name.'); return; }
    if (password.length < 6) { showError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { showError('Passwords do not match.'); return; }

    var user = { name: name, email: email, avatar: name.charAt(0).toUpperCase() };
    console.log('[Auth] User created:', user);

    BotHostStorage.saveSession(user).then(function() {
      console.log('[Auth] Session saved');
      BotHostState.setUser(user);
      showApp();
      BotHostToast.showToast('Welcome to StartiqStudios, ' + name + '!', 'success');
    }).catch(function(err) {
      console.error('[Auth] saveSession error:', err);
      // Still show the app even if storage fails
      BotHostState.setUser(user);
      showApp();
      BotHostToast.showToast('Welcome to StartiqStudios, ' + name + '!', 'success');
    });
  }

  function handleLogin(email, password) {
    console.log('[Auth] Login');

    BotHostStorage.loadSession().then(function(stored) {
      console.log('[Auth] Stored session:', stored);
      var user;

      if (stored && stored.email === email) {
        user = stored;
      } else {
        var name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); });
        user = { name: name, email: email, avatar: name.charAt(0).toUpperCase() };
        BotHostStorage.saveSession(user).catch(function(err) {
          console.error('[Auth] saveSession error:', err);
        });
      }

      console.log('[Auth] User:', user);
      BotHostState.setUser(user);
      showApp();
      BotHostToast.showToast('Welcome back, ' + (user.name || email.split('@')[0]) + '!', 'success');
    }).catch(function(err) {
      console.error('[Auth] loadSession error:', err);
      // Fallback: create user from email
      var name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, function(c) { return c.toUpperCase(); });
      var user = { name: name, email: email, avatar: name.charAt(0).toUpperCase() };
      BotHostState.setUser(user);
      showApp();
      BotHostToast.showToast('Welcome back, ' + name + '!', 'success');
    });
  }

  /* ---- Screen transitions ---- */

  function showApp() {
    console.log('[Auth] showApp');
    if (el.authScreen) el.authScreen.classList.add('hidden');
    if (el.appContent) el.appContent.classList.remove('hidden');

    // Populate user menu
    var user = BotHostState.getUser();
    if (user) {
      var avatar = $('userAvatar');
      var dName = $('dropdownName');
      var dEmail = $('dropdownEmail');
      if (avatar) avatar.textContent = user.avatar || '?';
      if (dName) dName.textContent = user.name || 'User';
      if (dEmail) dEmail.textContent = user.email || '';
    }

    // Init sub-views (each wrapped)
    try { BotHostDashboard.init(); } catch (err) { console.error('[Auth] Dashboard:', err); }
    try { BotHostConsole.init(); } catch (err) { console.error('[Auth] Console:', err); }
    try { BotHostSettings.init(); } catch (err) { console.error('[Auth] Settings:', err); }
  }

  function showAuth() {
    console.log('[Auth] showAuth');
    if (el.authScreen) el.authScreen.classList.remove('hidden');
    if (el.appContent) el.appContent.classList.add('hidden');
  }

  /* ---- Logout ---- */

  function handleLogout() {
    console.log('[Auth] Logout');
    BotHostStorage.clearSession().catch(function() {});
    BotHostState.setUser(null);
    showAuth();
    BotHostToast.showToast('You have been logged out.', 'info');
  }

  /* ---- Init ---- */

  function init() {
    console.log('[Auth] init');

    el.authScreen = $('authScreen');
    el.appContent = $('appContent');
    el.form = $('authForm');
    el.title = $('authTitle');
    el.subtitle = $('authSubtitle');
    el.nameGroup = $('authNameGroup');
    el.confirmGroup = $('authConfirmGroup');
    el.name = $('authName');
    el.email = $('authEmail');
    el.password = $('authPassword');
    el.confirm = $('authConfirm');
    el.submit = $('authSubmit');
    el.toggleText = $('authToggleText');
    el.error = $('authError');

    console.log('[Auth] DOM found:', {
      submit: !!el.submit,
      email: !!el.email,
      password: !!el.password,
      form: !!el.form
    });

    // Setup login mode
    switchMode('login');

    // Wire submit BUTTON click
    if (el.submit) {
      el.submit.addEventListener('click', function(e) {
        handleSubmit(e);
      });
      console.log('[Auth] Submit click handler attached');
    }

    // Wire form submit (for Enter key)
    if (el.form) {
      el.form.addEventListener('submit', function(e) {
        handleSubmit(e);
      });
      console.log('[Auth] Form submit handler attached');
    }

    // Wire logout
    var logoutBtn = $('btnLogout');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    // Auto-login check
    BotHostStorage.loadSession().then(function(stored) {
      console.log('[Auth] Auto-login check:', stored);
      if (stored && stored.email) {
        BotHostState.setUser(stored);
        showApp();
      }
    }).catch(function(err) {
      console.error('[Auth] Auto-login error:', err);
    });
  }

  return { init: init, showAuth: showAuth, showApp: showApp, handleLogout: handleLogout };
})();
