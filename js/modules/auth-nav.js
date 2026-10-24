/**
 * Shared auth navigation button.
 *
 * Populates the #auth-nav-item placeholder in the header (defined in header.js)
 * with either a "Đăng nhập" or "Đăng xuất" link, based on sessionStorage state.
 *
 * - When NOT authed: shows "Đăng nhập" linking to login.html
 * - When authed: shows "Đăng xuất" that clears session and redirects to login.html
 *
 * Auth state is stored in sessionStorage under the key 'quanli_authed'
 * (set to '1' on successful login, removed on logout).
 *
 * This module is loaded with `defer` AFTER header.js, so the placeholder
 * is guaranteed to exist when init() runs.
 */

(function () {
  const AUTH_STORAGE_KEY = 'quanli_authed';
  const LOGIN_PAGE = 'login.html';

  function isAuthed() {
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === '1';
  }

  function handleLogout(e) {
    if (e) e.preventDefault();
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    window.location.href = LOGIN_PAGE;
  }

  function init() {
    const item = document.getElementById('auth-nav-item');
    if (!item) return; // header not present on this page

    if (isAuthed()) {
      // Logged in -> show "Đăng xuất"
      item.innerHTML =
        '<a class="nav-link" href="#" id="authNavBtn" title="Đăng xuất">' +
          '<i class="fa fa-sign-out-alt"></i> Đăng xuất' +
        '</a>';
      const btn = document.getElementById('authNavBtn');
      if (btn) btn.addEventListener('click', handleLogout);
    } else {
      // Not logged in -> show "Đăng nhập" linking to login page
      item.innerHTML =
        '<a class="nav-link" href="' + LOGIN_PAGE + '" title="Đăng nhập">' +
          '<i class="fa fa-sign-in-alt"></i> Đăng nhập' +
        '</a>';
    }
  }

  // header.js uses `defer`, so by the time this script runs the custom element
  // has been upgraded and the header (including #auth-nav-item) is in the DOM.
  // Still, guard against the rare case where the script runs before parsing.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
