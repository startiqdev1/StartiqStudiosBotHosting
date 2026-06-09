/**
 * Toast notification view.
 */
var BotHostToast = (function() {

  var container = null;

  function init() {
    container = document.getElementById('toastContainer');
  }

  function showToast(message, type) {
    type = type || 'info';
    if (!container) container = document.getElementById('toastContainer');
    if (!container) return;

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(function() {
      toast.style.animation = 'toastOut 0.3s ease-in forwards';
      setTimeout(function() {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3000);
  }

  return { init: init, showToast: showToast };
})();
