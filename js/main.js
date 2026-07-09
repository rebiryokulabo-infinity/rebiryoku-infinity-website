/* ===================================
   Re美力Labo Infinity - Main JavaScript
   =================================== */

// スクロール復元を最速で無効化（DOMContentLoaded より前）
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// ===================================
// Google Translate initialization (must be global / outside DOMContentLoaded)
// ===================================
window.googleTranslateElementInit = function () {
  new google.translate.TranslateElement({
    pageLanguage: 'ja',
    includedLanguages: 'en,fr,zh-CN,zh-TW,ko',
    autoDisplay: false
  }, 'google_translate_element');
};

document.addEventListener('DOMContentLoaded', () => {

  // ===================================
  // SITE_INFO を HTML に反映（footerと[data-si]要素）
  // ===================================
  if (typeof SITE_INFO !== 'undefined') {
    // フッター情報
    document.querySelectorAll('.footer-info').forEach(el => {
      el.innerHTML =
        `${SITE_INFO.address}<br>` +
        `営業時間 ${SITE_INFO.hours}<br>` +
        `LINE: ${SITE_INFO.lineId} ／ ${SITE_INFO.email}`;
    });

    // コピーライト年 + 商標表記
    document.querySelectorAll('.footer-copy').forEach(el => {
      el.innerHTML =
        `&copy; ${SITE_INFO.copyrightYear} ${SITE_INFO.name}. All Rights Reserved.` +
        `<br><span style="font-size:0.7rem; opacity:0.7;">※「Re美力」「Wellcierge」は商標登録出願中</span>`;
    });

    // 個別のdata-si属性で指定された要素
    // 例: <span data-si="address"></span> ← SITE_INFO.address に置き換わる
    document.querySelectorAll('[data-si]').forEach(el => {
      const key = el.dataset.si;
      if (SITE_INFO[key] !== undefined) {
        el.textContent = SITE_INFO[key];
      }
    });

    // LINE URL を含むリンクを更新
    document.querySelectorAll('[data-si-href="line"]').forEach(el => {
      el.href = SITE_INFO.lineUrl;
    });
    document.querySelectorAll('[data-si-href="email"]').forEach(el => {
      el.href = 'mailto:' + SITE_INFO.email;
    });
  }

  // ===================================
  // Header scroll effect
  // ===================================
  const header = document.querySelector('.site-header');

  const handleScroll = () => {
    if (window.scrollY > 60) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // ===================================
  // Hamburger menu
  // ===================================
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');

  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav?.classList.toggle('open');
    document.body.style.overflow = mobileNav?.classList.contains('open') ? 'hidden' : '';
  });

  document.querySelectorAll('.mobile-nav a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger?.classList.remove('open');
      mobileNav?.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ===================================
  // Active navigation link
  // ===================================
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (
      href === currentPage ||
      (currentPage === '' && href === 'index.html') ||
      (currentPage === 'index.html' && href === 'index.html')
    ) {
      link.classList.add('active');
    }
  });

  // ===================================
  // Scroll animations (IntersectionObserver)
  // ===================================
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right').forEach(el => {
    observer.observe(el);
  });

  // ===================================
  // Menu tabs
  // ===================================
  const menuTabs = document.querySelectorAll('.menu-tab');
  const menuPanels = document.querySelectorAll('.menu-panel');

  menuTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      menuTabs.forEach(t => t.classList.remove('active'));
      menuPanels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      document.querySelector(`.menu-panel[data-panel="${target}"]`)?.classList.add('active');

      // タブ位置へスクロール（ユーザーがクリックした場合は意図的に移動）
      const tabNav = document.querySelector('.menu-tabs');
      if (tabNav) {
        const top = tabNav.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top, behavior: 'instant' });
      }

      // セッションに保存 ＋ URLハッシュも同期
      sessionStorage.setItem('activeMenuTab', target);
      history.replaceState(null, '', '#' + target);
    });
  });

  // タブ切り替えヘルパー
  // scroll: true のときだけタブ位置までスクロール（タブクリック・hashchange 用）
  // scroll: false のときはタブ切り替えのみ（ページ読み込み時は上から自然に表示）
  function activateTab(tabName, scroll = false) {
    menuTabs.forEach(t => t.classList.remove('active'));
    menuPanels.forEach(p => p.classList.remove('active'));
    const targetTab = document.querySelector(`.menu-tab[data-tab="${tabName}"]`);
    const targetPanel = document.querySelector(`.menu-panel[data-panel="${tabName}"]`);
    if (targetTab) targetTab.classList.add('active');
    if (targetPanel) targetPanel.classList.add('active');
    if (scroll) {
      const tabNav = document.querySelector('.menu-tabs');
      if (tabNav) {
        const top = tabNav.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top, behavior: 'instant' });
      }
    }
  }

  // URLハッシュ → セッション保存値 → デフォルト の優先順で復元
  // ページ読み込み時はスクロールせず、正しいタブをセットしてトップから表示
  const hash = window.location.hash.replace('#', '');
  const savedTab = sessionStorage.getItem('activeMenuTab');
  const tabToRestore = (['salon', 'saloncar', 'school'].includes(hash) ? hash : null)
                    || (['salon', 'saloncar', 'school'].includes(savedTab) ? savedTab : null);

  if (tabToRestore) {
    activateTab(tabToRestore, false); // スクロールなし：他ページと同じ自然な表示
    sessionStorage.setItem('activeMenuTab', tabToRestore);
    history.replaceState(null, '', '#' + tabToRestore);
  } else {
    window.scrollTo(0, 0);
  }

  // 同じページ内でハッシュが変わった時（Menuドロップダウンから選択した時など）
  // こちらはスクロールあり（ユーザー操作なので意図的にタブ位置へ移動）
  window.addEventListener('hashchange', () => {
    const newHash = window.location.hash.replace('#', '');
    if (['salon', 'saloncar', 'school'].includes(newHash)) {
      activateTab(newHash, true);
      sessionStorage.setItem('activeMenuTab', newHash);
    }
  });

  // ===================================
  // Smooth scroll for anchor links
  // ===================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // ===================================
  // Netlify form handling (success message)
  // ===================================
  const contactForm = document.querySelector('.contact-form form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      // Netlify handles the actual submission
      // This just provides UX feedback if needed
    });
  }

  // ===================================
  // Menu Nav Dropdown
  // ===================================
  const navMenuDropdown = document.getElementById('nav-menu-dropdown');
  const navMenuBtn = document.getElementById('nav-menu-btn');

  navMenuBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    navMenuDropdown?.classList.toggle('open');
    navMenuBtn.setAttribute('aria-expanded', navMenuDropdown?.classList.contains('open'));
  });

  document.addEventListener('click', () => {
    navMenuDropdown?.classList.remove('open');
    navMenuBtn?.setAttribute('aria-expanded', 'false');
  });

  // menu.html ではボタンをアクティブ表示
  if (currentPage === 'menu.html') {
    navMenuBtn?.classList.add('active');
  }

  // ===================================
  // Language Dropdown
  // ===================================
  const langDropdown = document.getElementById('lang-dropdown');
  const langDropdownBtn = document.getElementById('lang-dropdown-btn');

  const LANG_LABELS = {
    ja: '日本語', en: 'English', fr: 'Français',
    'zh-CN': '中文（简体）', 'zh-TW': '中文（繁體）', ko: '한국어'
  };

  // ボタンのラベルとactiveを更新
  function setActiveLang(lang) {
    document.querySelectorAll('.lang-option').forEach(b => {
      b.classList.toggle('active', b.dataset.lang === lang);
    });
    if (langDropdownBtn) {
      const svgEl = langDropdownBtn.querySelector('svg');
      langDropdownBtn.textContent = LANG_LABELS[lang] || 'Language';
      if (svgEl) langDropdownBtn.prepend(svgEl);
    }
  }

  // ドロップダウンの開閉
  langDropdownBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    langDropdown?.classList.toggle('open');
    langDropdownBtn.setAttribute('aria-expanded', langDropdown?.classList.contains('open'));
  });

  // 外側クリックで閉じる
  document.addEventListener('click', () => {
    langDropdown?.classList.remove('open');
    langDropdownBtn?.setAttribute('aria-expanded', 'false');
  });

  // ページ読み込み時: 保存済み言語があれば復元
  const savedLang = localStorage.getItem('siteLang');
  if (savedLang && savedLang !== 'ja') {
    setActiveLang(savedLang);
    const tryApply = setInterval(() => {
      const select = document.querySelector('.goog-te-combo');
      if (select) {
        clearInterval(tryApply);
        select.value = savedLang;
        select.dispatchEvent(new Event('change'));
      }
    }, 100);
  }

  // 言語選択
  document.querySelectorAll('.lang-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const lang = btn.dataset.lang;
      localStorage.setItem('siteLang', lang);
      setActiveLang(lang);
      langDropdown?.classList.remove('open');
      langDropdownBtn?.setAttribute('aria-expanded', 'false');

      if (lang === 'ja') {
        document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
        document.cookie = 'googtrans=; path=/; domain=' + location.hostname + '; expires=Thu, 01 Jan 1970 00:00:00 UTC';
        window.location.reload();
        return;
      }

      const select = document.querySelector('.goog-te-combo');
      if (select) {
        select.value = lang;
        select.dispatchEvent(new Event('change'));
      }
    });
  });

});

// ===================================
// LINE・問い合わせボタンのクリック計測（GA4）
// ===================================
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href]');
  if (!link || typeof gtag !== 'function') return;
  const href = link.href;
  if (href.includes('lin.ee') || href.includes('line.me')) {
    gtag('event', 'line_click', { link_url: href, page_path: location.pathname });
  } else if (href.includes('docs.google.com/forms')) {
    gtag('event', 'form_click', { link_url: href, page_path: location.pathname });
  }
});
