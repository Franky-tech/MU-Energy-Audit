window.MUEAMS = (() => {
  const nf0 = new Intl.NumberFormat('en-KE', { maximumFractionDigits: 0 });
  const nf2 = new Intl.NumberFormat('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const money = n => 'KES ' + nf0.format(n || 0);
  const num = n => nf2.format(n || 0);
  const compact = n => {
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k';
    return nf0.format(n || 0);
  };
  const today = () => new Date().toISOString().slice(0, 10);
  const uid = prefix => `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  async function request(endpoint, method = 'GET', body = null) {
    const opts = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`/api${endpoint}`, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  }

  function badge(status) {
    const s = String(status || '');
    let cls = 'amber';
    if (/audited|verified|completed|working|reading entered/i.test(s)) cls = 'green';
    else if (/approved|in progress/i.test(s)) cls = 'indigo';
    else if (/not working|fault|unsafe/i.test(s)) cls = 'red';
    return `<span class="badge-status ${cls}"><span class="tw-w-1.5 tw-h-1.5 tw-rounded-full tw-bg-current"></span>${esc(s)}</span>`;
  }

  function toast(message, type = 'success') {
    let container = document.getElementById('mu-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'mu-toast-container';
      container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
      container.style.zIndex = '1080';
      document.body.appendChild(container);
    }
    const borderCls = type === 'error' ? 'border-danger' : 'border-success';
    const el = document.createElement('div');
    el.className = `toast align-items-center text-bg-dark border-0 border-start border-4 ${borderCls} show shadow-lg`;
    el.innerHTML = `
      <div class="d-flex">
        <div class="toast-body fw-semibold small">${esc(message)}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
      </div>`;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  function downloadCSV(filename, rows) {
    const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    toast(`Exported ${filename}`);
  }

  // Interactive Open/Close Slide-Out Drawer & Collapsible Top Navbar
  function initCollapsibleNav() {
    const nav = document.querySelector('.mu-navbar');
    if (!nav) return;

    // 1. Floating button to reopen the top navbar when collapsed
    const reopenBtn = document.createElement('button');
    reopenBtn.className = 'nav-reopen-tab d-none';
    reopenBtn.innerHTML = `<i class="bi bi-arrows-expand"></i> Open Navbar`;
    document.body.appendChild(reopenBtn);

    // 2. Inject Menu Drawer Trigger (Left) & Hide Topbar Button (Right)
    const container = nav.querySelector('.container-fluid');
    const brand = nav.querySelector('.navbar-brand');

    const drawerBtn = document.createElement('button');
    drawerBtn.type = 'button';
    drawerBtn.className = 'btn btn-sm btn-outline-light me-2 d-inline-flex align-items-center gap-1';
    drawerBtn.setAttribute('data-bs-toggle', 'offcanvas');
    drawerBtn.setAttribute('data-bs-target', '#muSlideDrawer');
    drawerBtn.innerHTML = `<i class="bi bi-list fs-6"></i> <span class="d-none d-sm-inline small fw-semibold">Menu</span>`;
    container.insertBefore(drawerBtn, brand);

    const hideNavBtn = document.createElement('button');
    hideNavBtn.type = 'button';
    hideNavBtn.className = 'btn btn-sm btn-dark border-secondary text-secondary ms-1';
    hideNavBtn.title = 'Hide Top Navbar';
    hideNavBtn.innerHTML = `<i class="bi bi-chevron-up"></i>`;

    const rightActions = nav.querySelector('#mainNav > div:last-child');
    if (rightActions) rightActions.appendChild(hideNavBtn);

    // 3. Inject Offcanvas Slide-Out Sidebar HTML
    const currentPath = window.location.pathname;
    const isActive = (p) => currentPath.endsWith(p) || (currentPath === '/' && p === 'index.html') ? 'active' : '';

    const drawerHtml = `
      <div class="offcanvas offcanvas-start mu-offcanvas" tabindex="-1" id="muSlideDrawer">
        <div class="offcanvas-header border-bottom border-secondary border-opacity-25 py-3">
          <div class="d-flex align-items-center gap-2">
            <span class="tw-w-8 tw-h-8 tw-rounded-lg tw-bg-emerald-500 tw-text-slate-950 d-grid place-items-center fw-bolder">⚡</span>
            <div>
              <div class="fw-bold small text-white">MU-EAMS 2026</div>
              <div class="tw-text-[10px] tw-text-slate-400">CAMPUS NAVIGATION DRAWER</div>
            </div>
          </div>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body d-flex flex-column justify-content-between">
          <div class="d-flex flex-column gap-2">
            <div class="tw-text-[10px] tw-font-bold tw-uppercase tw-tracking-wider tw-text-slate-400 px-2 mb-1">Workspace Modules</div>
            <a class="nav-link mu-nav-link ${isActive('index.html')}" href="/index.html"><i class="bi bi-speedometer2 me-2"></i>Executive Overview</a>
            <a class="nav-link mu-nav-link ${isActive('facilities.html')}" href="/facilities.html"><i class="bi bi-buildings me-2"></i>Facilities & Assets</a>
            <a class="nav-link mu-nav-link ${isActive('meters.html')}" href="/meters.html"><i class="bi bi-lightning-charge me-2"></i>Submeters & Conditions</a>
            <a class="nav-link mu-nav-link ${isActive('audits.html')}" href="/audits.html"><i class="bi bi-clipboard2-check me-2"></i>Field Audits & ECMs</a>
            <hr class="border-secondary border-opacity-25 my-2">
            <button type="button" class="btn btn-sm btn-outline-warning text-start" id="drawer-collapse-top">
              <i class="bi bi-eye-slash me-2"></i>Hide Top Navigation Bar
            </button>
          </div>
          <div class="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25">
            <div class="d-flex align-items-center gap-2 small fw-semibold text-success mb-1">
              <span class="tw-w-2 tw-h-2 tw-rounded-full tw-bg-emerald-400"></span> SQLite Engine Connected
            </div>
            <div class="tw-text-xs tw-text-slate-400">Press <kbd class="bg-secondary text-white px-1 rounded">ESC</kbd> or click outside to close this drawer.</div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', drawerHtml);

    // 4. Bind Open/Close Events
    const collapseTopbar = () => {
      nav.classList.add('nav-collapsed');
      reopenBtn.classList.remove('d-none');
      const offcanvasEl = document.getElementById('muSlideDrawer');
      const instance = bootstrap.Offcanvas.getInstance(offcanvasEl);
      if (instance) instance.hide();
    };

    hideNavBtn.addEventListener('click', collapseTopbar);
    document.getElementById('drawer-collapse-top').addEventListener('click', collapseTopbar);

    reopenBtn.addEventListener('click', () => {
      nav.classList.remove('nav-collapsed');
      reopenBtn.classList.add('d-none');
    });
  }

  document.addEventListener('DOMContentLoaded', initCollapsibleNav);

  return { nf0, nf2, money, num, compact, today, uid, esc, request, badge, toast, downloadCSV };
})();
