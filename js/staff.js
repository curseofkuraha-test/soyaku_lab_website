(() => {
  'use strict';

  // 正解パスワード。半角・全角および大文字・小文字の違いは区別しません。
  // これは静的HTML上の演出用ログインです。機密情報を保護する仕組みではありません。
  const STAFF_PASSWORD = 'archives';
  const normalizePassword = value => value.trim().normalize('NFKC').toLowerCase();
  const MAX_SECURITY_IMAGES = 30;
  const IMAGE_FOLDER = 'image/';

  const form = document.getElementById('staffLoginForm');
  const password = document.getElementById('staffPassword');
  const error = document.getElementById('loginError');
  const loginPanel = document.getElementById('staffLoginPanel');
  const successPanel = document.getElementById('staffSuccessPanel');
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

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (normalizePassword(password.value) === STAFF_PASSWORD) {
      loginPanel.hidden = true;
      successPanel.hidden = false;
      successPanel.setAttribute('tabindex', '-1');
      successPanel.focus();
    } else {
      error.textContent = password.value ? 'パスワードが違います。' : 'パスワードを入力してください。';
      error.hidden = false;
      password.setAttribute('aria-invalid', 'true');
      password.focus();
      password.select();
    }
  });
  password.addEventListener('input', () => {
    error.hidden = true;
    password.removeAttribute('aria-invalid');
  });

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
