import { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react';
import { streamAllMadhhabs, getApiKey, setApiKey, clearApiKey, validateApiKey } from './api';

// ══════════════════════════════════════════════════════════
// TRANSLATIONS (AR / EN)
// ══════════════════════════════════════════════════════════
const T = {
  ar: {
    appName:          'بيّنة',
    appSub:           'مساعدك الذكي الإسلامي',
    topbarTitle:      'بيّنة',
    topbarSubtitle:   'المساعد الفقهي الذكي',
    welcomeTitle:     'مرحبًا بك في',
    welcomeHighlight: 'بيّنة',
    ornament:         '✦',
    welcomeSub:       'اسأل سؤالك الفقهي، وتعرّف على أقوال المذاهب من مصادرها',
    welcomeDesc:      'مساعد فقهي يعرض أقوال المذاهب الأربعة من مصادرها\nالحنفي · المالكي · الشافعي · الحنبلي',
    suggestions:      ['ما فرائض الوضوء؟', 'ما موجبات الغسل؟', 'هل لمس المرأة ينقض الوضوء؟'],
    inputPlaceholder: 'اكتب سؤالك الفقهي هنا...',
    inputHint:        'اضغط Enter للإرسال · Shift+Enter لسطر جديد',
    statusSearching:  'جاري البحث...',
    statusWriting:    'يكتب...',
    statusDone:       'اكتمل',
    statusError:      'خطأ',
    noResult:         'لا توجد إجابة في النصوص المرفقة.',
    showMore:         '▼ عرض المزيد',
    showLess:         '▲ عرض أقل',
    newChat:          'محادثة جديدة',
    clearChat:        'مسح',
    settings:         'الإعدادات',
    sources:          'المصادر',
    favorites:        'المفضلة',
    chatNav:          'المحادثة',
    switchToEn:       'EN',
    switchToDark:     'داكن',
    switchToLight:    'فاتح',
    errorApi:         'خطأ في الاتصال بالخادم. تأكد من تشغيل الـ Backend.',
    sourcesPanelTitle:'مصادر بيّنة',
    apiKeyBtn: 'مفتاح API', apiKeyTitle: 'مفتاح Gemini API',
    apiKeyDesc: 'أدخل مفتاحك الخاص. يُحفظ في متصفحك فقط ويُرسل مع كل سؤال.',
    apiKeyPlaceholder: 'الصق المفتاح هنا...', apiKeySave: 'حفظ', apiKeyRemove: 'حذف المفتاح',
    apiKeyInvalid: 'المفتاح غير صالح أو لا يمكن استخدامه.', apiKeyChecking: 'جاري التحقق...',
    apiKeyActive: 'يوجد مفتاح محفوظ', apiKeyShow: 'إظهار', apiKeyHide: 'إخفاء',
    madhhabs: [
      { key: 'hanafi',  label: 'المذهب الحنفي'  },
      { key: 'maliki',  label: 'المذهب المالكي' },
      { key: 'shafii',  label: 'المذهب الشافعي' },
      { key: 'hanbali', label: 'المذهب الحنبلي' },
    ],
    books: [
      { id: 'hanafi', madhhab: 'الحنفي', title: 'الاختيار لتعليل المختار', author: 'عبد الله بن محمود بن مودود الموصلي', scope: 'الطهارة والصلاة' },
      { id: 'maliki', madhhab: 'المالكي', title: 'كتاب الكافي في فقه أهل المدينة', author: 'ابن عبد البر', scope: 'كتاب الطهارة' },
      { id: 'shafii', madhhab: 'الشافعي', title: 'منهاج الطالبين وعمدة المفتين', author: 'الإمام النووي', scope: 'كتاب الطهارة' },
      { id: 'hanbali', madhhab: 'الحنبلي', title: 'زاد المستقنع في اختصار المقنع', author: 'موسى بن أحمد الحجاوي', scope: 'كتاب الطهارة' }
    ],
    bookAuthorLabel: 'المؤلف',
    bookScopeLabel: 'النطاق المتوفر'
  },
  en: {
    appName:          'Bayyina',
    appSub:           'Your Islamic AI Assistant',
    topbarTitle:      'Bayyina',
    topbarSubtitle:   'Islamic Fiqh AI Assistant',
    welcomeTitle:     'Welcome to',
    welcomeHighlight: 'Bayyina',
    ornament:         '✦',
    welcomeSub:       'Ask your jurisprudence question and discover what the four Madhabs say — from their original sources.',
    welcomeDesc:      'An AI assistant presenting opinions of the four schools of Islamic law\nHanafi · Maliki · Shafi\'i · Hanbali',
    suggestions:      [
      'What are the obligatory acts of Wudu?',
      'What invalidates Wudu?',
      'Does touching a woman break Wudu?',
    ],
    inputPlaceholder: 'Type your fiqh question here...',
    inputHint:        'Press Enter to send · Shift+Enter for new line',
    statusSearching:  'Searching...',
    statusWriting:    'Writing...',
    statusDone:       'Done',
    statusError:      'Error',
    noResult:         'No answer found in the attached texts.',
    showMore:         '▼ Show more',
    showLess:         '▲ Show less',
    newChat:          'New chat',
    clearChat:        'Clear',
    settings:         'Settings',
    sources:          'Sources',
    favorites:        'Favorites',
    chatNav:          'Chat',
    switchToEn:       'ع',
    switchToDark:     'Dark',
    switchToLight:    'Light',
    errorApi:         'Cannot connect to the server. Make sure the Backend is running.',
    sourcesPanelTitle:'Bayyina Sources',
    apiKeyBtn: 'API Key', apiKeyTitle: 'Gemini API Key',
    apiKeyDesc: 'Enter your own key. It is stored only in your browser and sent with each question.',
    apiKeyPlaceholder: 'Paste your key here...', apiKeySave: 'Save', apiKeyRemove: 'Remove key',
    apiKeyInvalid: 'The key is invalid or unusable.', apiKeyChecking: 'Checking...',
    apiKeyActive: 'A key is saved', apiKeyShow: 'Show', apiKeyHide: 'Hide',
    madhhabs: [
      { key: 'hanafi',  label: 'Hanafi'  },
      { key: 'maliki',  label: 'Maliki'  },
      { key: 'shafii',  label: "Shafi'i" },
      { key: 'hanbali', label: 'Hanbali' },
    ],
    books: [
      { id: 'hanafi', madhhab: 'Hanafi', title: 'Al-Ikhtiyar li-Ta\'lil al-Mukhtar', author: 'Abdullah bin Mahmud al-Mawsili', scope: 'Purity and Prayer' },
      { id: 'maliki', madhhab: 'Maliki', title: 'Al-Kafi fi Fiqh Ahl al-Madinah', author: 'Ibn Abd al-Barr', scope: 'Book of Purity' },
      { id: 'shafii', madhhab: 'Shafi\'i', title: 'Minhaj al-Talibin', author: 'Imam al-Nawawi', scope: 'Book of Purity' },
      { id: 'hanbali', madhhab: 'Hanbali', title: 'Zad al-Mustaqni\'', author: 'Musa bin Ahmad al-Hajjawi', scope: 'Book of Purity' }
    ],
    bookAuthorLabel: 'Author',
    bookScopeLabel: 'Available Scope'
  },
};

// ══════════════════════════════════════════════════════════
// CONTEXTS
// ══════════════════════════════════════════════════════════
const LangCtx  = createContext(null);
const ThemeCtx = createContext(null);

function useLang()  { return useContext(LangCtx);  }
function useTheme() { return useContext(ThemeCtx); }

// ══════════════════════════════════════════════════════════
// STATUS ENUM
// ══════════════════════════════════════════════════════════
const STATUS = {
  IDLE: 'idle', LOADING: 'loading', STREAMING: 'streaming',
  DONE: 'done', ERROR: 'error',
};

// ══════════════════════════════════════════════════════════
// SVG ICONS
// ══════════════════════════════════════════════════════════
const Icon = {
  Moon: () => (
    <svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 9 9 5.4 5.4 0 0 1-4.4 2.3 5.4 5.4 0 0 1-3.1-9.8A9.07 9.07 0 0 0 12 3z"/><path d="M17 6l1-2 1 2 2 1-2 1-1 2-1-2-2-1z"/></svg>
  ),
  Sun: () => (
    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round"/></svg>
  ),
  Send: () => (
    <svg viewBox="0 0 24 24"><path d="M3 20l19-8L3 4v6l14 2-14 2v6z"/></svg>
  ),
  Chat: () => (
    <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
  ),
  Book: () => (
    <svg viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.01 7.01 0 0 0-1.62-.94l-.36-2.54A.484.484 0 0 0 13.92 2H10.08c-.24 0-.43.17-.47.41l-.36 2.54a7.34 7.34 0 0 0-1.62.94l-2.39-.96a.48.48 0 0 0-.59.22L2.74 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.05.3-.07.63-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54a7.34 7.34 0 0 0 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.03-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"/></svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24"><path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
  ),
  Menu: () => (
    <svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
  ),
  Globe: () => (
    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
  ),
  Key: () => (
    <svg viewBox="0 0 24 24"><path d="M12.65 10A5.99 5.99 0 0 0 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6a5.99 5.99 0 0 0 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/></svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
  )
};

// ══════════════════════════════════════════════════════════
// SIDEBAR
// ══════════════════════════════════════════════════════════
function Sidebar({ isOpen, onClose, onClear, onOpenSources, onOpenKey, hasKey }) {
  const { lang }  = useLang();
  const { theme } = useTheme();
  const t = T[lang];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay open"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar${isOpen ? ' open' : ''}`} aria-label={t.appName}>
        {/* Logo */}
        <div className="sidebar-logo">
          <img src="/logo.jpg" alt="Bayyina Logo" className="app-logo-img" />
          <span className="sidebar-brand-name">{t.appName}</span>
          <span className="sidebar-brand-sub">{t.appSub}</span>
        </div>

        <div className="sidebar-divider" />

        <button className="sidebar-btn active" title={t.chatNav}>
          <Icon.Chat />
        </button>
        <button className="sidebar-btn" title={t.sources} onClick={onOpenSources}>
          <Icon.Book />
        </button>
        <button
          id="key-btn"
          className={`sidebar-btn${hasKey ? ' has-key' : ''}`}
          title={t.apiKeyBtn}
          onClick={onOpenKey}
        >
          <Icon.Key />
        </button>

        <div className="sidebar-spacer" />
        <div className="sidebar-divider" />

        <button className="sidebar-btn" title={t.newChat} onClick={onClear} id="btn-new-chat">
          <Icon.Plus />
        </button>
        <button className="sidebar-btn" title={t.clearChat} onClick={onClear} id="btn-clear-chat">
          <Icon.Trash />
        </button>
        <button className="sidebar-btn" title={t.settings} id="btn-settings">
          <Icon.Settings />
        </button>
      </aside>
    </>
  );
}

// ══════════════════════════════════════════════════════════
// TOPBAR
// ══════════════════════════════════════════════════════════
function Topbar({ onMenuToggle }) {
  const { lang, setLang } = useLang();
  const { theme, setTheme } = useTheme();
  const t = T[lang];
  const isDark = theme === 'dark';

  return (
    <header className="topbar" role="banner">
      {/* Left: menu (mobile) + title */}
      <div className="topbar-left">
        <button
          className="mobile-menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
          id="mobile-menu-btn"
        >
          <Icon.Menu />
        </button>
        <div className="topbar-brand">
          <img src="/logo.jpg" alt="Bayyina Logo" className="app-logo-img-small" />
          <div>
            <div className="topbar-title">{t.topbarTitle}</div>
            <div className="topbar-subtitle">{t.topbarSubtitle}</div>
          </div>
        </div>
      </div>

      {/* Right: controls */}
      <div className="topbar-controls">
        {/* Language toggle */}
        <button
          id="lang-toggle"
          className="ctrl-btn"
          onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
          title={lang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
        >
          <Icon.Globe />
          <span>{t.switchToEn}</span>
        </button>

        {/* Theme toggle */}
        <button
          id="theme-toggle"
          className="ctrl-btn gold"
          onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Icon.Sun /> : <Icon.Moon />}
          <span>{isDark ? t.switchToLight : t.switchToDark}</span>
        </button>
      </div>
    </header>
  );
}

// ══════════════════════════════════════════════════════════
// SOURCES PANEL (MODAL)
// ══════════════════════════════════════════════════════════
function SourcesPanel({ isOpen, onClose }) {
  const { lang } = useLang();
  const t = T[lang];

  if (!isOpen) return null;

  return (
    <div className="sources-backdrop" onClick={onClose}>
      <div className="sources-panel" onClick={e => e.stopPropagation()} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="sources-header">
          <h2 className="sources-title">
            <Icon.Book />
            {t.sourcesPanelTitle}
          </h2>
          <button className="sources-close" onClick={onClose} title="Close">
            <Icon.Close />
          </button>
        </div>
        <div className="sources-body">
          {t.books.map((book) => (
            <div key={book.id} className="book-card">
              <div className="book-madhhab-badge">
                <Icon.Moon />
                {book.madhhab}
              </div>
              <div>
                <div className="book-title">{book.title}</div>
                {lang === 'ar' && book.titleEn && <div className="book-title-en">{book.titleEn}</div>}
              </div>
              <div className="book-divider" />
              <div className="book-meta">
                <div className="book-meta-row">
                  <span className="book-meta-label">{t.bookAuthorLabel}:</span>
                  <span className="book-meta-value">{book.author}</span>
                </div>
              </div>
              <div className="book-scope">
                <strong>{t.bookScopeLabel}:</strong> {book.scope}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// WELCOME SCREEN
// ══════════════════════════════════════════════════════════
function WelcomeScreen({ onSuggest }) {
  const { lang } = useLang();
  const t = T[lang];

  return (
    <div className="welcome-wrap" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <h1 className="welcome-title">
        {t.welcomeTitle} <span className="brand">{t.welcomeHighlight}</span>
      </h1>

      <div className="ornament">
        <span>{t.ornament}</span>
      </div>

      <p className="welcome-subtitle">{t.welcomeSub}</p>
      <p className="welcome-desc" style={{ whiteSpace: 'pre-line' }}>{t.welcomeDesc}</p>

      <div className="suggestions">
        {t.suggestions.map((q) => (
          <button
            key={q}
            className="suggestion-pill"
            id={`suggestion-${q.slice(0, 20).replace(/\s/g, '-')}`}
            onClick={() => onSuggest(q)}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// FORMATTED TEXT (minimal markdown bold)
// ══════════════════════════════════════════════════════════
function FormattedText({ text }) {
  const { lang } = useLang();
  if (!text) return null;
  
  // Isolate the literal Arabic text robustly (handling missing asterisks or colons)
  const regex = /(?:\*\*النص الحرفي:\*\*|\*\*النص الحرفي\*\*|\nالنص الحرفي:|\nالنص الحرفي\s*\n)/;
  const parts = text.split(regex);
  const mainText = parts[0];
  const literalText = parts.length > 1 ? parts.slice(1).join('**النص الحرفي:**') : null;

  const renderBasicBold = (str) => {
    if (!str) return null;
    return str.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part.split('\n').map((line, j, arr) => (
        <span key={`${i}-${j}`}>
          {line}
          {j < arr.length - 1 && <br />}
        </span>
      ));
    });
  };

  return (
    <div className="formatted-text-wrapper">
      <div className="main-content-text">
        {renderBasicBold(mainText)}
      </div>
      {literalText !== null && (
        <div className="literal-quote-block" dir="rtl">
          <div className="literal-quote-icon">
            <Icon.Book />
            <span>{lang === 'en' ? 'Original Arabic Text' : 'النص الحرفي'}</span>
          </div>
          <div className="literal-quote-text">
            {renderBasicBold(literalText.trim())}
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MADHHAB CARD
// ══════════════════════════════════════════════════════════
function MadhhabCard({ madhhab, text, status }) {
  const { lang }    = useLang();
  const [exp, setExp] = useState(false);
  const t = T[lang];

  const hasContent = Boolean(text?.trim());
  const isLong = text?.length > 380;
  const isActive = hasContent || status === STATUS.STREAMING || status === STATUS.LOADING;

  const dotClass = {
    [STATUS.DONE]:      'done',
    [STATUS.ERROR]:     'error',
    [STATUS.IDLE]:      'idle',
    [STATUS.LOADING]:   '',
    [STATUS.STREAMING]: '',
  }[status] ?? '';

  const statusLabel = {
    [STATUS.LOADING]:   t.statusSearching,
    [STATUS.STREAMING]: t.statusWriting,
    [STATUS.DONE]:      t.statusDone,
    [STATUS.ERROR]:     t.statusError,
    [STATUS.IDLE]:      '',
  }[status] ?? '';

  return (
    <div className={`madhhab-card${isActive ? ' active' : ''}`}>
      {/* Header */}
      <div className="card-header">
        <div className="card-icon"><Icon.Moon /></div>
        <span className="card-name">{madhhab.label}</span>
        {status !== STATUS.IDLE && (
          <div className="card-status">
            <span className={`status-dot ${dotClass}`} />
            <span>{statusLabel}</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className={`card-body ${isLong && !exp ? 'collapsed' : ''}`}>
        {status === STATUS.LOADING && !hasContent && (
          <div className="skeleton">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        )}

        {hasContent && <FormattedText text={text} />}

        {status === STATUS.STREAMING && <span className="typing-cursor" />}

        {!hasContent && status === STATUS.DONE && (
          <span className="no-result">{t.noResult}</span>
        )}
      </div>

      {/* Expand / collapse */}
      {isLong && hasContent && status === STATUS.DONE && (
        <button className="expand-btn" onClick={() => setExp(e => !e)}>
          {exp ? t.showLess : t.showMore}
        </button>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// GENERAL RESPONSE CARD (Guardrails single-card response)
// ══════════════════════════════════════════════════════════
function GeneralCard({ text, status }) {
  const { lang } = useLang();
  const t = T[lang];
  const hasContent = Boolean(text?.trim());

  const statusLabel = {
    [STATUS.LOADING]:   t.statusSearching,
    [STATUS.STREAMING]: t.statusWriting,
    [STATUS.DONE]:      t.statusDone,
    [STATUS.ERROR]:     t.statusError,
    [STATUS.IDLE]:      '',
  }[status] ?? '';

  return (
    <div className="general-card">
      <div className="general-card-header">
        <img src="/logo.jpg" alt="Bayyina" className="general-card-logo" />
        <div className="general-card-title-wrap">
          <span className="general-card-title">
            {lang === 'ar' ? 'بيّنة' : 'Bayyina'}
          </span>
          <span className="general-card-subtitle">
            {lang === 'ar' ? 'المساعد الفقهي الذكي' : 'Islamic Fiqh AI Assistant'}
          </span>
        </div>
        {status !== STATUS.IDLE && status !== STATUS.DONE && (
          <div className="card-status" style={{ marginInlineStart: 'auto' }}>
            <span className="status-dot" />
            <span>{statusLabel}</span>
          </div>
        )}
      </div>
      <div className="general-card-body">
        {status === STATUS.LOADING && !hasContent && (
          <div className="skeleton">
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        )}
        {hasContent && <FormattedText text={text} />}
        {status === STATUS.STREAMING && <span className="typing-cursor" />}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MESSAGE BLOCK
// ══════════════════════════════════════════════════════════
function MessageBlock({ msg }) {
  const { lang } = useLang();
  const madhhabList = T[lang].madhhabs;

  return (
    <div className="message-block">
      <div className="user-bubble-wrap">
        <div className="user-bubble">{msg.question}</div>
      </div>

      {/* Guardrails: State 1 - Classifying intent */}
      {msg.isGeneral === null && (
        <div className="thinking-indicator">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="thinking-text">{lang === 'ar' ? 'جاري تحليل السؤال...' : 'Analyzing intent...'}</span>
        </div>
      )}

      {/* Guardrails: State 2 - General Query (1 card) */}
      {msg.isGeneral === true && (
        <GeneralCard
          text={msg.generalAnswer ?? ''}
          status={msg.generalStatus ?? STATUS.IDLE}
        />
      )}

      {/* State 3 - Fiqh Query (4 cards) */}
      {msg.isGeneral === false && (
        <div className="madhhab-grid">
          {madhhabList.map(m => (
            <MadhhabCard
              key={m.key}
              madhhab={m}
              text={msg.answers[m.key] ?? ''}
              status={msg.statuses[m.key] ?? STATUS.IDLE}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// INPUT AREA
// ══════════════════════════════════════════════════════════
function InputArea({ onSubmit, isLoading }) {
  const { lang }   = useLang();
  const t = T[lang];
  const [val, setVal] = useState('');
  const taRef = useRef(null);

  const submit = () => {
    const q = val.trim();
    if (!q || isLoading) return;
    onSubmit(q);
    setVal('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  // Auto-resize
  useEffect(() => {
    if (!taRef.current) return;
    taRef.current.style.height = 'auto';
    taRef.current.style.height = taRef.current.scrollHeight + 'px';
  }, [val]);

  return (
    <div className="input-area">
      <div className="input-box">
        <textarea
          ref={taRef}
          id="chat-input"
          className="chat-textarea"
          placeholder={t.inputPlaceholder}
          value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          disabled={isLoading}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        />
        <button
          id="send-btn"
          className="send-btn"
          onClick={submit}
          disabled={!val.trim() || isLoading}
          aria-label={lang === 'ar' ? 'إرسال' : 'Send'}
        >
          <Icon.Send />
        </button>
      </div>
      <p className="input-hint">{t.inputHint}</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// API KEY MODAL
// ══════════════════════════════════════════════════════════
function ApiKeyModal({ isOpen, onClose, onChange }) {
  const { lang } = useLang();
  const t = T[lang];
  const [val, setVal]   = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState('');
  const hasKey = Boolean(getApiKey());

  useEffect(() => { if (isOpen) { setVal(''); setErr(''); setShow(false); } }, [isOpen]);
  if (!isOpen) return null;

  const save = async () => {
    const k = val.trim();
    if (!k) return;
    setBusy(true); setErr('');
    try {
      await validateApiKey(k);
      setApiKey(k);
      onChange();
      onClose();
    } catch {
      setErr(t.apiKeyInvalid);
    } finally {
      setBusy(false);
    }
  };

  const remove = () => { clearApiKey(); onChange(); onClose(); };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="key-modal" onClick={e => e.stopPropagation()} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="sources-header">
          <h2 className="sources-title"><Icon.Key />{t.apiKeyTitle}</h2>
          <button className="sources-close" onClick={onClose}><Icon.Close /></button>
        </div>
        <div className="key-modal-body">
          <p className="key-desc">{t.apiKeyDesc}</p>
          {hasKey && <p className="key-active">● {t.apiKeyActive}</p>}
          <div className="key-input-row">
            <input
              className="key-input"
              type={show ? 'text' : 'password'}
              value={val}
              placeholder={t.apiKeyPlaceholder}
              onChange={e => setVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && save()}
              autoComplete="off"
              spellCheck={false}
              dir="ltr"
            />
            <button className="ctrl-btn" onClick={() => setShow(x => !x)}>
              {show ? t.apiKeyHide : t.apiKeyShow}
            </button>
          </div>
          {err && <p className="key-error">{err}</p>}
          <div className="key-actions">
            <button className="key-save" onClick={save} disabled={!val.trim() || busy}>
              {busy ? t.apiKeyChecking : t.apiKeySave}
            </button>
            {hasKey && <button className="key-remove" onClick={remove}>{t.apiKeyRemove}</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// ROOT APP
// ══════════════════════════════════════════════════════════
export default function App() {
  /* ── State ── */
  const [lang,       setLang]       = useState(() => {
    try { return localStorage.getItem('bayyina-lang') === 'en' ? 'en' : 'ar'; }
    catch { return 'ar'; }
  });
  const [theme,      setTheme]      = useState('light');
  const [messages,   setMessages]   = useState([]);
  const [isLoading,  setIsLoading]  = useState(false);
  const [sidebarOpen,setSidebarOpen]= useState(false);
  const [sourcesOpen,setSourcesOpen]= useState(false);
  const [keyOpen,    setKeyOpen]    = useState(false);
  const [hasKey,     setHasKey]     = useState(() => Boolean(getApiKey()));

  const bottomRef  = useRef(null);
  const pendingRef = useRef(null);   // question waiting for the user to enter a key

  /* ── Apply theme & lang to <html> ── */
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    html.setAttribute('lang', lang);
    try { localStorage.setItem('bayyina-lang', lang); } catch { /* ignore */ }
  }, [theme, lang]);

  /* ── Scroll to bottom ── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── Send question ── */
  const handleQuestion = useCallback(async (question) => {
    if (isLoading) return;
    setSidebarOpen(false);

    // Answer language follows the question's script (majority); UI follows it too
    const arCount = (question.match(/[\u0600-\u06FF]/g) || []).length;
    const enCount = (question.match(/[A-Za-z]/g) || []).length;
    const reqLang = arCount > enCount ? 'ar' : enCount > arCount ? 'en' : lang;
    if (reqLang !== lang) setLang(reqLang);

    const msgId = Date.now();
    const emptyAnswers   = { hanafi:'', hanbali:'', shafii:'', maliki:'' };
    const loadStatuses   = { hanafi: STATUS.LOADING, hanbali: STATUS.LOADING,
                              shafii: STATUS.LOADING, maliki: STATUS.LOADING };

    setMessages(prev => [...prev, {
      id: msgId,
      question,
      answers: emptyAnswers,
      statuses: loadStatuses,
      isGeneral: null,       // null = classifying intent
      generalAnswer: '',
      generalStatus: STATUS.IDLE,
    }]);
    setIsLoading(true);

    const update = (updater) =>
      setMessages(prev => prev.map(m => m.id === msgId ? updater(m) : m));

    try {
      for await (const ev of streamAllMadhhabs(question, reqLang)) {
        const { type, madhhab, text } = ev;

        // ── GUARDRAILS: general single-card events ──
        if (type === 'general_start') {
          update(m => ({
            ...m,
            isGeneral: true,
            generalStatus: STATUS.LOADING,
            statuses: { hanafi: STATUS.IDLE, hanbali: STATUS.IDLE,
                        shafii: STATUS.IDLE, maliki: STATUS.IDLE },
          }));
        } else if (type === 'chunk' && madhhab === 'general') {
          update(m => ({
            ...m,
            generalAnswer: (m.generalAnswer || '') + text,
            generalStatus: STATUS.STREAMING,
          }));
        } else if (type === 'general_end') {
          update(m => ({ ...m, generalStatus: STATUS.DONE }));

        // ── FIQH: normal 4-madhhab events ──
        } else if (type === 'start') {
          update(m => ({
            ...m,
            isGeneral: false, // Confirm this is a Fiqh query
            statuses: { ...m.statuses, [madhhab]: STATUS.STREAMING },
          }));
        } else if (type === 'chunk') {
          update(m => ({
            ...m,
            answers:  { ...m.answers,  [madhhab]: (m.answers[madhhab] || '') + text },
            statuses: { ...m.statuses, [madhhab]: STATUS.STREAMING },
          }));
        } else if (type === 'end') {
          update(m => ({
            ...m,
            statuses: { ...m.statuses, [madhhab]: STATUS.DONE },
          }));
        }
      }
    } catch (err) {
      console.error(err);
      if (err.status === 401) {
        // No key yet: drop the failed message, remember the question, ask for a key.
        // The question is re-sent automatically once a valid key is saved.
        pendingRef.current = question;
        setMessages(prev => prev.filter(m => m.id !== msgId));
        setKeyOpen(true);
      } else {
        update(m => ({
          ...m,
          statuses: { hanafi: STATUS.ERROR, hanbali: STATUS.ERROR,
                      shafii: STATUS.ERROR,  maliki: STATUS.ERROR },
          generalStatus: m.isGeneral ? STATUS.ERROR : m.generalStatus,
        }));
      }
    } finally {
      // Flush any remaining STREAMING → DONE
      update(m => {
        const fixed = {};
        for (const k of Object.keys(m.statuses)) {
          fixed[k] = m.statuses[k] === STATUS.STREAMING ? STATUS.DONE : m.statuses[k];
        }
        return {
          ...m,
          statuses: fixed,
          generalStatus: m.generalStatus === STATUS.STREAMING ? STATUS.DONE : m.generalStatus,
        };
      });
      setIsLoading(false);
    }
  }, [isLoading, lang]);

  const handleClear = () => {
    setMessages([]);
    setIsLoading(false);
    setSidebarOpen(false);
  };

  /* ── Render ── */
  return (
    <LangCtx.Provider  value={{ lang,  setLang:  (fn) => setLang(typeof fn === 'function' ? fn : () => fn) }}>
    <ThemeCtx.Provider value={{ theme, setTheme: (fn) => setTheme(typeof fn === 'function' ? fn : () => fn) }}>
      <div className="app-shell">

        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onClear={handleClear}
          onOpenSources={() => setSourcesOpen(true)}
          onOpenKey={() => setKeyOpen(true)}
          hasKey={hasKey}
        />

        {/* Main */}
        <div className="main-content">
          <Topbar onMenuToggle={() => setSidebarOpen(o => !o)} />

          {/* Chat */}
          <div className="chat-container" role="main" aria-label="Chat messages">
            {messages.length === 0 ? (
              <WelcomeScreen onSuggest={handleQuestion} />
            ) : (
              messages.map(msg => (
                <MessageBlock key={msg.id} msg={msg} />
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <InputArea onSubmit={handleQuestion} isLoading={isLoading} />
        </div>

        {/* Sources Panel Modal */}
        <SourcesPanel isOpen={sourcesOpen} onClose={() => setSourcesOpen(false)} />

        {/* API Key Modal */}
        <ApiKeyModal
          isOpen={keyOpen}
          onClose={() => { pendingRef.current = null; setKeyOpen(false); }}
          onChange={() => {
            setHasKey(Boolean(getApiKey()));
            const q = pendingRef.current;
            if (q && getApiKey()) {          // retry the question that was blocked
              pendingRef.current = null;
              setTimeout(() => handleQuestion(q), 0);
            }
          }}
        />

      </div>
    </ThemeCtx.Provider>
    </LangCtx.Provider>
  );
}
