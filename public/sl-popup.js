/**
 * SAMAVESH Unified On-Website Modal & Pop-up System
 * Clean SVG icons throughout - no emoji characters.
 */
(function (window, document) {
  'use strict';

  // Master SVG Icon Library
  const SL_ICONS = {
    logout: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>`,
    info: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
    success: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
    warning: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    danger: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
    question: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    star: `<svg width="30" height="30" viewBox="0 0 24 24" fill="#FFD166" stroke="#F59E0B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    starEmpty: `<svg width="30" height="30" viewBox="0 0 24 24" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    profile: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>`,
    math: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><line x1="12" y1="5" x2="12" y2="19"></line></svg>`,
    language: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>`,
    science: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.31L4.36 19.1A2 2 0 0 0 6 22h12a2 2 0 0 0 1.64-2.9L14 9.31V2"></path><line x1="8.5" y1="2" x2="15.5" y2="2"></line></svg>`,
    message: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
    clipboard: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>`,
    close: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`
  };

  window.SL_ICONS = SL_ICONS;

  // Create or retrieve global modal container
  function getModalElements() {
    let overlay = document.getElementById('slGlobalPopupOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'slGlobalPopupOverlay';
      overlay.className = 'sl-popup-overlay';
      overlay.innerHTML = `
        <div class="sl-popup-card" role="dialog" aria-modal="true">
          <button class="sl-modal-close" id="slPopupCloseBtn" aria-label="Close">${SL_ICONS.close}</button>
          <div class="sl-popup-icon" id="slPopupIcon"></div>
          <h3 class="sl-popup-title" id="slPopupTitle">Notice</h3>
          <div class="sl-popup-body" id="slPopupBody"></div>
          <div class="sl-popup-actions" id="slPopupActions"></div>
        </div>
      `;
      document.body.appendChild(overlay);
    }
    return {
      overlay: overlay,
      card: overlay.querySelector('.sl-popup-card'),
      closeBtn: overlay.querySelector('#slPopupCloseBtn'),
      icon: overlay.querySelector('#slPopupIcon'),
      title: overlay.querySelector('#slPopupTitle'),
      body: overlay.querySelector('#slPopupBody'),
      actions: overlay.querySelector('#slPopupActions')
    };
  }

  // Toast Container
  function getToastContainer() {
    let container = document.getElementById('slToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'slToastContainer';
      container.className = 'sl-toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  /**
   * Show a modern toast notification with SVG icon
   * @param {string} message
   * @param {'info'|'success'|'warning'|'danger'} type
   * @param {number} duration
   */
  window.slToast = function (message, type = 'info', duration = 3500) {
    const container = getToastContainer();
    const toast = document.createElement('div');
    toast.className = `sl-toast ${type}`;

    let iconSvg = SL_ICONS.info;
    if (type === 'success') iconSvg = SL_ICONS.success;
    else if (type === 'warning') iconSvg = SL_ICONS.warning;
    else if (type === 'danger') iconSvg = SL_ICONS.danger;

    toast.innerHTML = `
      <span class="sl-toast-icon">${iconSvg}</span>
      <span class="sl-toast-msg">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, duration);
  };

  /**
   * Generic Modal display function returning Promise
   */
  window.slModal = function (opts = {}) {
    return new Promise((resolve) => {
      const els = getModalElements();
      const {
        title = 'Notice',
        message = '',
        html = null,
        icon = 'info',
        iconType = 'info', // 'info', 'success', 'warning', 'danger'
        confirmText = 'OK',
        cancelText = null,
        danger = false,
        showClose = true
      } = opts;

      // Resolve SVG icon
      if (typeof icon === 'string' && icon.startsWith('<svg')) {
        els.icon.innerHTML = icon;
      } else if (SL_ICONS[icon]) {
        els.icon.innerHTML = SL_ICONS[icon];
      } else if (danger) {
        els.icon.innerHTML = SL_ICONS.danger;
      } else {
        els.icon.innerHTML = SL_ICONS[iconType] || SL_ICONS.info;
      }

      els.icon.className = `sl-popup-icon ${danger ? 'danger' : iconType}`;
      els.title.textContent = title;
      
      if (html) {
        els.body.innerHTML = html;
      } else {
        els.body.textContent = message;
      }

      els.closeBtn.style.display = showClose ? 'flex' : 'none';

      // Build actions
      els.actions.innerHTML = '';
      if (cancelText) {
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'sl-btn sl-btn-outline';
        cancelBtn.textContent = cancelText;
        cancelBtn.addEventListener('click', () => {
          close(false);
        });
        els.actions.appendChild(cancelBtn);
      }

      const confirmBtn = document.createElement('button');
      confirmBtn.className = danger ? 'sl-btn sl-btn-danger' : 'sl-btn sl-btn-primary';
      confirmBtn.textContent = confirmText;
      confirmBtn.addEventListener('click', () => {
        close(true);
      });
      els.actions.appendChild(confirmBtn);

      function handleKey(e) {
        if (e.key === 'Escape') {
          close(false);
        } else if (e.key === 'Enter' && !cancelText) {
          close(true);
        }
      }

      function handleOverlayClick(e) {
        if (e.target === els.overlay) {
          close(false);
        }
      }

      function close(result) {
        els.overlay.classList.remove('active');
        document.removeEventListener('keydown', handleKey);
        els.overlay.removeEventListener('click', handleOverlayClick);
        els.closeBtn.onclick = null;
        resolve(result);
      }

      els.closeBtn.onclick = () => close(false);
      document.addEventListener('keydown', handleKey);
      els.overlay.addEventListener('click', handleOverlayClick);

      // Trigger animation
      requestAnimationFrame(() => {
        els.overlay.classList.add('active');
        confirmBtn.focus();
      });
    });
  };

  /**
   * Modern alert dialog with SVG icon
   */
  window.slAlert = function (message, title = 'Notice', icon = 'info') {
    if (typeof message === 'object' && message !== null) {
      return window.slModal(message);
    }
    return window.slModal({
      title: title,
      message: message,
      icon: icon,
      confirmText: 'OK'
    });
  };

  /**
   * Modern confirmation dialog returning Promise<boolean> with SVG icon
   */
  window.slConfirm = function (message, title = 'Confirm', options = {}) {
    if (typeof message === 'object' && message !== null) {
      return window.slModal({
        title: message.title || title,
        message: message.message || '',
        confirmText: message.confirmText || 'Confirm',
        cancelText: message.cancelText || 'Cancel',
        icon: message.icon || 'question',
        danger: message.danger || false,
        iconType: message.danger ? 'danger' : 'info'
      });
    }
    return window.slModal({
      title: title,
      message: message,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      icon: options.icon || 'question',
      danger: options.danger || false,
      iconType: options.danger ? 'danger' : 'info'
    });
  };

  /**
   * AI Quiz Result Popup with SVG Star ratings
   */
  window.slQuizResultModal = function ({ score, feedback, stars, subject, chapterId }) {
    const starCount = Math.max(1, Math.min(3, stars || 1));
    let starsHtml = '';
    for (let i = 0; i < 3; i++) {
      starsHtml += i < starCount ? SL_ICONS.star : SL_ICONS.starEmpty;
    }

    const html = `
      <div class="sl-quiz-result-box">
        <div class="sl-quiz-score-badge">
          <span class="sl-quiz-score-num">${score}</span>
          <span class="sl-quiz-score-denom">/ 10</span>
        </div>
        <div class="sl-quiz-stars-row">${starsHtml}</div>
        <div class="sl-quiz-feedback-card">
          <p class="sl-quiz-feedback-text">${feedback || 'Great effort on your signing!'}</p>
        </div>
      </div>
    `;

    return window.slModal({
      title: 'AI Sign Evaluation',
      html: html,
      icon: 'success',
      iconType: 'success',
      confirmText: 'Continue Learning',
      showClose: true
    });
  };

  /**
   * Rich Student Profile Popup with SVG icons
   */
  window.slProfileModal = function (user, progress) {
    if (!user) return;
    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'S';
    
    let totalScore = 0;
    let totalQuizzes = 0;
    for (const [qid, score] of Object.entries((progress && progress.quizzes) || {})) {
      totalScore += score;
      totalQuizzes += 1;
    }
    const percentage = totalQuizzes > 0 ? Math.round((totalScore / (totalQuizzes * 10)) * 100) : 0;

    const courses = (progress && progress.courses) || {};
    const mathProg = courses.maths ? courses.maths.progress_pct : 0;
    const langProg = courses.language ? courses.language.progress_pct : 0;
    const sciProg = courses.science ? courses.science.progress_pct : 0;

    const html = `
      <div class="sl-profile-popup-content">
        <div class="sl-profile-badge-row">
          <div class="sl-avatar-circle" style="width:60px; height:60px; font-size:1.8rem; flex-shrink:0;">
            ${initial}
          </div>
          <div style="text-align:left;">
            <h4 style="margin:0; font-size:1.3rem; font-weight:900; color:var(--text-main);">${user.name}</h4>
            <div style="margin:2px 0 0; color:var(--text-muted); font-size:0.85rem; font-weight:600;">ID: ${user.id} • ${user.grade || 'Grade 3'}</div>
          </div>
        </div>
        
        <div class="sl-profile-section">
          <div class="sl-profile-section-title">Course Progress</div>
          <div class="sl-prog-group">
            <div class="sl-prog-label"><span>${SL_ICONS.math} Mathematics</span><b>${mathProg}%</b></div>
            <div class="sl-prog-track"><div class="sl-prog-fill orange" style="width:${mathProg}%"></div></div>
          </div>
          <div class="sl-prog-group">
            <div class="sl-prog-label"><span>${SL_ICONS.language} Language</span><b>${langProg}%</b></div>
            <div class="sl-prog-track"><div class="sl-prog-fill mint" style="width:${langProg}%"></div></div>
          </div>
          <div class="sl-prog-group">
            <div class="sl-prog-label"><span>${SL_ICONS.science} Science</span><b>${sciProg}%</b></div>
            <div class="sl-prog-track"><div class="sl-prog-fill blue" style="width:${sciProg}%"></div></div>
          </div>
        </div>

        <div class="sl-profile-stats-grid">
          <div class="sl-stat-box">
            <span class="sl-stat-num">${totalQuizzes}</span>
            <span class="sl-stat-lbl">Quizzes Taken</span>
          </div>
          <div class="sl-stat-box">
            <span class="sl-stat-num">${percentage}%</span>
            <span class="sl-stat-lbl">Overall Average</span>
          </div>
        </div>
      </div>
    `;

    return window.slModal({
      title: 'Student Profile',
      html: html,
      icon: 'profile',
      iconType: 'info',
      confirmText: 'Done',
      showClose: true
    });
  };

  // Safe window.alert override
  const originalAlert = window.alert;
  window.alert = function (msg) {
    try {
      window.slAlert(msg);
    } catch (e) {
      if (typeof originalAlert === 'function') originalAlert(msg);
    }
  };

})(window, document);
