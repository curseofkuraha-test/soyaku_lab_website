(() => {
  'use strict';

  // 正解パスワード。半角・全角および大文字・小文字の違いは区別しません。
  // これは静的HTML上の演出用ログインです。機密情報を保護する仕組みではありません。
  const STAFF_PASSWORD = 'archives';
  const normalizePassword = value => value.trim().normalize('NFKC').toLowerCase();
  const MAX_SECURITY_IMAGES = 30;
  const IMAGE_FOLDER = 'image/';

  const form = document.getElementById('staffLoginForm');
  const staffId = document.getElementById('staffId');
  const password = document.getElementById('staffPassword');
  const togglePassword = document.getElementById('toggleStaffPassword');
  const eyeOpen = document.getElementById('staffEyeOpen');
  const eyeClosed = document.getElementById('staffEyeClosed');
  const error = document.getElementById('loginError');
  const loginPanel = document.getElementById('staffLoginPanel');
  const successPanel = document.getElementById('staffSuccessPanel');
  const recordsTitle = document.getElementById('staffRecordsTitle');
  const evidenceImage = document.getElementById('evidenceImage');
  const evidenceMissing = document.getElementById('evidenceMissing');
  const evidenceView = document.getElementById('evidenceView');
  const openHelp = document.getElementById('openPasswordHelp');
  const closeHelp = document.getElementById('closePasswordHelp');
  const dialog = document.getElementById('passwordHelpDialog');
  const gallery = document.getElementById('securityGallery');
  const slides = document.getElementById('securitySlides');
  const message = document.getElementById('securityGalleryMessage');
  const controls = document.getElementById('securityControls');
  const prev = document.getElementById('securityPrev');
  const next = document.getElementById('securityNext');
  const count = document.getElementById('securityCount');
  const dots = document.getElementById('securityDots');

  let images = [];
  let current = 0;
  let loaded = false;
  let loading = null;
  let lastFocused = null;
  let scrollingFrame = 0;

  // 職員IDは入力欄のみ設けます。指定のIDとの照合は行いません。
  // 謎解き用の正解判定はこれまでどおりパスワードだけで行います。
  function clearLoginError() {
    error.hidden = true;
    staffId.removeAttribute('aria-invalid');
    password.removeAttribute('aria-invalid');
  }

  function showLoginError(messageText, input) {
    error.textContent = messageText;
    error.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    input.focus();
    if (input === password && input.value) input.select();
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    clearLoginError();
    if (!staffId.value.trim()) {
      showLoginError('職員IDを入力してください。', staffId);
      return;
    }
    if (normalizePassword(password.value) !== STAFF_PASSWORD) {
      showLoginError(password.value ? 'パスワードが違います。' : 'パスワードを入力してください。', password);
      return;
    }
    loginPanel.hidden = true;
    successPanel.hidden = false;
    recordsTitle.focus();
  });

  // 目のボタンでパスワードを一時的に表示し、再度押すと伏せ字に戻します。
  togglePassword.addEventListener('click', () => {
    const visible = password.type === 'password';
    password.type = visible ? 'text' : 'password';
    togglePassword.setAttribute('aria-pressed', String(visible));
    togglePassword.setAttribute('aria-label', visible ? 'パスワードを非表示' : 'パスワードを表示');
    togglePassword.title = visible ? 'パスワードを非表示' : 'パスワードを表示';
    eyeOpen.hidden = visible;
    eyeClosed.hidden = !visible;
  });

  // 記録画像が未配置の場合はファイルの代わりに案内を表示します。
  evidenceImage.addEventListener('error', () => {
    evidenceImage.hidden = true;
    evidenceView.hidden = true;
    evidenceMissing.hidden = false;
  });

  staffId.addEventListener('input', clearLoginError);
  password.addEventListener('input', clearLoginError);

  // ファイル一覧は静的HTMLから取得できないため、連番を順に読み込み、
  // 最初に存在しない画像が現れたところで自動的に終わります。
  function imageExists(src) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  async function discoverImages() {
    const found = [];
    for (let i = 1; i <= MAX_SECURITY_IMAGES; i++) {
      const src = `${IMAGE_FOLDER}Security_${i}.png`;
      if (!await imageExists(src)) break;
      found.push(src);
    }
    return found;
  }

  function updateControls() {
    count.textContent = `${images.length ? current + 1 : 0} / ${images.length}`;
    prev.disabled = current <= 0;
    next.disabled = current >= images.length - 1;
    [...dots.children].forEach((dot, index) => dot.classList.toggle('is-active', index === current));
  }

  function goTo(index, behavior = 'smooth') {
    if (!images.length) return;
    current = Math.max(0, Math.min(index, images.length - 1));
    gallery.scrollTo({left: current * gallery.clientWidth, behavior});
    updateControls();
  }

  function drawImages() {
    slides.replaceChildren();
    dots.replaceChildren();
    if (!images.length) {
      controls.hidden = true;
      gallery.hidden = true;
      message.hidden = false;
      message.textContent = '案内画像は現在準備中です。';
      return;
    }
    message.hidden = true;
    gallery.hidden = false;
    images.forEach((src, index) => {
      const slide = document.createElement('div');
      slide.className = 'security-slide';
      const img = document.createElement('img');
      img.src = src;
      img.alt = `ご案内画像 ${index + 1}枚目`;
      img.draggable = false;
      slide.append(img);
      slides.append(slide);
      if (images.length <= 12) {
        const dot = document.createElement('span');
        dot.className = 'security-dot';
        dots.append(dot);
      }
    });
    controls.hidden = images.length <= 1;
    goTo(0, 'instant');
  }

  async function showHelp(event) {
    event.preventDefault();
    lastFocused = document.activeElement;
    dialog.showModal();
    document.body.classList.add('security-dialog-open');
    closeHelp.focus();
    if (loaded) {
      goTo(0, 'instant');
      return;
    }
    message.textContent = '画像を読み込んでいます。';
    message.hidden = false;
    controls.hidden = true;
    if (!loading) loading = discoverImages();
    try {
      images = await loading;
    } catch (e) {
      images = [];
    }
    loaded = true;
    drawImages();
  }

  function dismissHelp() { dialog.close(); }
  openHelp.addEventListener('click', showHelp);
  closeHelp.addEventListener('click', dismissHelp);
  dialog.addEventListener('click', event => { if (event.target === dialog) dismissHelp(); });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('security-dialog-open');
    if (lastFocused && lastFocused.isConnected) lastFocused.focus();
  });
  prev.addEventListener('click', () => goTo(current - 1));
  next.addEventListener('click', () => goTo(current + 1));
  gallery.addEventListener('scroll', () => {
    cancelAnimationFrame(scrollingFrame);
    scrollingFrame = requestAnimationFrame(() => {
      if (!gallery.clientWidth || !images.length) return;
      const index = Math.max(0, Math.min(images.length - 1, Math.round(gallery.scrollLeft / gallery.clientWidth)));
      if (index !== current) { current = index; updateControls(); }
    });
  }, {passive: true});
  gallery.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  window.addEventListener('resize', () => {
    if (dialog.open && images.length) goTo(current, 'instant');
  });
})();
