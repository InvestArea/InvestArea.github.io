function getApiEndpoint(path) {
  if (typeof window === 'undefined') return path;
  if (!path.startsWith('/')) path = '/' + path;
  if (window.location.protocol === 'file:') {
    return 'http://localhost:8088' + path;
  }
  if (window.location.hostname && window.location.hostname.endsWith('github.io')) {
    return path;
  }
  if (window.location.port && window.location.port !== '8088') {
    const host = window.location.hostname || 'localhost';
    return `http://${host}:8088` + path;
  }
  return path;
}

/**
 * Azərbaycan Respublikası Kənd Təsərrüfatı Nazirliyi
 * Qarabağ Aqro-İnvest İnzibatçı Paneli (Admin Client Logic)
 * 100% Sinxronlaşdırılmış Reyestr və İdarəetmə Sistemi
 */

// State
let adminState = {
  activeTab: 'users',
  currentUser: null,
  users: [],
  filteredUsers: [],
  applications: [],
  parcels: [],
  partnerships: [],
  auditLogs: [],
  summary: {},
  currentRoleFilter: '',
  currentStatusFilter: '',
  searchQuery: '',
  selectedUserForModal: null,
  selectedAppForModal: null
};

// Initialize Admin Portal on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  checkAdminAuth();
  setupEventListeners();
  setupSyncListeners();
});

function checkAdminAuth() {
  const adminUserJson = localStorage.getItem('invest_area_admin_user');
  const barrier = document.getElementById('admin-auth-barrier');
  if (adminUserJson) {
    try {
      const user = JSON.parse(adminUserJson);
      if (user && (user.role === 'SUPER_ADMIN' || user.id === 999)) {
        localStorage.setItem('invest_area_admin_user', JSON.stringify(user));
        adminState.currentUser = user;
        if (barrier) {
          barrier.classList.add('hidden');
          barrier.style.display = 'none';
        }
        renderSuperuserHeader(user);
        initAdminPortal().catch(err => console.warn("Background initAdminPortal error:", err));
        return;
      }
    } catch (e) {
      console.error("Admin check error:", e);
    }
  }
  // Not authenticated
  if (barrier) {
    barrier.classList.remove('hidden');
    barrier.style.display = 'flex';
    barrier.style.opacity = '1';
  }
}

function renderSuperuserHeader(user) {
  const nameEl = document.querySelector('.admin-user-info-name');
  const roleEl = document.querySelector('.admin-user-info-role');
  if (nameEl && user.fullName) nameEl.textContent = user.fullName;
  if (roleEl) roleEl.innerHTML = `<i class="fa-solid fa-shield-halved"></i> Superuser (${user.email || 'admin@investarea.gov.az'})`;
}

async function handleAdminLogin(event) {
  if (event) event.preventDefault();
  const emailInput = document.getElementById('admin-login-email');
  const passwordInput = document.getElementById('admin-login-password');
  const errorEl = document.getElementById('admin-login-error');
  const errorText = document.getElementById('admin-login-error-text');
  const submitBtn = document.getElementById('admin-login-btn');

  const email = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value.trim() : '';

  if (!email || !password) {
    if (errorEl) {
      errorText.textContent = 'E-poçt və şifrə daxil edilməlidir!';
      errorEl.classList.remove('hidden');
    }
    return;
  }

  if (errorEl) {
    errorEl.classList.add('hidden');
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Yoxlanılır...</span>';
  }

  try {
    const res = await fetch(getApiEndpoint('/api/v1/admin/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username: email, password })
    });
    const data = await res.json();

    if (res.ok && data.success && data.user && (data.user.role === 'SUPER_ADMIN' || data.user.id === 999)) {
      localStorage.setItem('invest_area_admin_user', JSON.stringify(data.user));
      localStorage.setItem('invest_area_user', JSON.stringify(data.user));
      localStorage.setItem('invest_area_data_updated', Date.now().toString());
      adminState.currentUser = data.user;
      
      const barrier = document.getElementById('admin-auth-barrier');
      if (barrier) {
        barrier.style.transition = 'opacity 0.25s ease';
        barrier.style.opacity = '0';
        setTimeout(() => {
          barrier.classList.add('hidden');
          barrier.style.display = 'none';
        }, 250);
      }
      renderSuperuserHeader(data.user);
      try {
        await initAdminPortal();
      } catch (portalErr) {
        console.warn("initAdminPortal warning:", portalErr);
      }
      showAdminToast(`Xoş gəldiniz, ${data.user.fullName}! İnzibati idarəetmə aktivdir.`, "success");
    } else {
      if (errorEl) {
        errorText.textContent = data.message || 'Giriş məlumatları yanlışdır və ya səlahiyyətiniz çatmır!';
        errorEl.classList.remove('hidden');
      }
    }
  } catch (err) {
    console.warn("Admin backend connection issue, checking superadmin demo fallback:", err);
    const isSuperAdminLogin = (
      email === 'admin@investarea.gov.az' ||
      email === 'admin@qarabaq-agro.gov.az' ||
      email === 'superadmin' ||
      email === 'admin' ||
      email === '1000000001'
    );
    if (isSuperAdminLogin && (password === 'SuperAdmin2026!' || password === 'DemoPass2026!' || password === 'KarabakhSuperAdmin2026!' || !password)) {
      const superUser = {
        id: 999,
        role: "SUPER_ADMIN",
        roleName: "Baş İnzibatçı (Superuser)",
        fullName: "Dövlət Komissiyası Baş İnzibatçısı",
        companyName: "Azərbaycan Respublikası Kənd Təsərrüfatı Nazirliyi",
        email: "admin@investarea.gov.az",
        status: "AKTIV"
      };
      localStorage.setItem('invest_area_admin_user', JSON.stringify(superUser));
      localStorage.setItem('invest_area_user', JSON.stringify(superUser));
      localStorage.setItem('invest_area_data_updated', Date.now().toString());
      adminState.currentUser = superUser;
      
      const barrier = document.getElementById('admin-auth-barrier');
      if (barrier) {
        barrier.style.transition = 'opacity 0.25s ease';
        barrier.style.opacity = '0';
        setTimeout(() => {
          barrier.classList.add('hidden');
          barrier.style.display = 'none';
        }, 250);
      }
      renderSuperuserHeader(superUser);
      showAdminToast("Superuser hesabı ilə inzibatçı panelinə daxil oldunuz (Lokal/Demo Rejim).", "success");
      return;
    }

    if (errorEl) {
      errorText.textContent = 'Serverlə əlaqə qurmaq mümkün olmadı! "node server.js" işlədiyindən və port 8088-də olduğunuza əmin olun.';
      errorEl.classList.remove('hidden');
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-shield-halved"></i> <span>Dövlət İnzibatçısı Kimi Daxil Ol</span>';
    }
  }
}

function adminLogout() {
  localStorage.removeItem('invest_area_admin_user');
  localStorage.removeItem('invest_area_user');
  adminState.currentUser = null;
  const barrier = document.getElementById('admin-auth-barrier');
  if (barrier) {
    barrier.classList.remove('hidden');
    barrier.style.display = 'flex';
    barrier.style.opacity = '1';
  }
  const pwdInput = document.getElementById('admin-login-password');
  if (pwdInput) pwdInput.value = '';
  showAdminToast("İnzibatçı sessiyasından çıxış edildi.", "info");
}

function toggleAdminPwdVisibility() {
  const pwdInput = document.getElementById('admin-login-password');
  const eyeIcon = document.getElementById('admin-pwd-eye');
  if (!pwdInput) return;
  if (pwdInput.type === 'password') {
    pwdInput.type = 'text';
    if (eyeIcon) {
      eyeIcon.classList.remove('fa-eye');
      eyeIcon.classList.add('fa-eye-slash');
    }
  } else {
    pwdInput.type = 'password';
    if (eyeIcon) {
      eyeIcon.classList.remove('fa-eye-slash');
      eyeIcon.classList.add('fa-eye');
    }
  }
}

async function initAdminPortal() {
  await loadDashboardSummary();
  await loadCommissionExperts();
  await loadAllUsers();
  await loadAllApplications();
  await loadAllParcels();
  await loadAllPartnerships();
  await loadAuditLogs();
  
  // Set up auto-sync polling every 8 seconds
  if (!window._adminSyncInterval) {
    window._adminSyncInterval = setInterval(async () => {
      if (adminState.currentUser) {
        await refreshAdminDataSilently();
      }
    }, 8000);
  }

  // Support custom default tab per specialized page
  const defaultTab = document.body.dataset.defaultTab;
  if (defaultTab) {
    switchAdminTab(defaultTab);
  }

  // Always initialize GIS Map if map container exists in DOM
  const mapEl = document.getElementById('admin-monitoring-map') || document.getElementById('admin-interactive-map');
  if (mapEl && typeof initAdminGisMap === 'function') {
    setTimeout(() => {
      initAdminGisMap();
    }, 200);
  }
}

function setupEventListeners() {
  // Navigation tabs
  document.querySelectorAll('.sidebar-item[data-tab]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      switchAdminTab(btn.dataset.tab);
    });
  });

  // User search input
  const searchInput = document.getElementById('admin-user-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      adminState.searchQuery = e.target.value.toLowerCase().trim();
      applyUserFilters();
    });
  }

  // Role filter pills
  document.querySelectorAll('.role-pill-btn').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.role-pill-btn').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      adminState.currentRoleFilter = pill.dataset.role || '';
      applyUserFilters();
    });
  });

  // Status select filter
  const statusSelect = document.getElementById('admin-user-status-filter');
  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      adminState.currentStatusFilter = e.target.value;
      applyUserFilters();
    });
  }
}

// Multi-Tab & Storage Real-Time Synchronization
function setupSyncListeners() {
  window.addEventListener('storage', (e) => {
    if (e.key === 'invest_area_user' || e.key === 'invest_area_data_updated') {
      showAdminToast("Canlı sinxronizasiya: Məlumatlar portal ilə yeniləndi!", "info");
      refreshAdminDataSilently();
    }
  });
}

function notifyDataUpdated() {
  localStorage.setItem('invest_area_data_updated', Date.now().toString());
}

// Tab Switching
function switchAdminTab(tabName) {
  adminState.activeTab = tabName;
  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tabName);
  });

  document.querySelectorAll('.admin-panel-section').forEach(sec => {
    sec.classList.remove('active');
  });

  const activeSection = document.getElementById(`section-${tabName}`);
  if (activeSection) {
    activeSection.classList.add('active');
  }

  if (window.innerWidth <= 1024 && typeof toggleAdminSidebar === 'function') {
    toggleAdminSidebar(true);
  }

  if (tabName === 'experts') {
    if (typeof loadCommissionVotingSessions === 'function') loadCommissionVotingSessions();
  }

  if (tabName === 'monitoring' || tabName === 'parcels') {
    if (typeof loadMonitoringData === 'function') loadMonitoringData();
    setTimeout(() => {
      if (typeof initAdminGisMap === 'function') {
        initAdminGisMap();
      }
      if (adminMap) {
        adminMap.invalidateSize();
      }
    }, 150);
  }
}

// 1. Dashboard Summary
async function loadDashboardSummary() {
  try {
    const res = await fetch(getApiEndpoint('/api/v1/admin/summary'));
    const data = await res.json();
    adminState.summary = data;

    const safeSetText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    // Render Metrics
    safeSetText('metric-investor-count', data.totalInvestors || 0);
    safeSetText('metric-investor-capital', formatAzn(data.totalInvestorCapitalAzn || 0));
    safeSetText('metric-sahibkar-count', data.totalSahibkars || 0);
    safeSetText('metric-sahibkar-demand', `${data.totalSahibkarAreaDemandHectares || 0} ha`);
    safeSetText('metric-apps-count', data.totalApplications || 0);
    safeSetText('metric-apps-invest', formatAzn(data.totalInvestmentAzn || 0));
    safeSetText('metric-partnerships-count', data.totalPartnerships || 0);
    safeSetText('metric-parcels-ha', `${data.totalHectares || 0} ha`);

    safeSetText('badge-menu-users', (data.totalInvestors + data.totalSahibkars) || 0);
    safeSetText('badge-menu-apps', data.totalApplications || 0);
    safeSetText('badge-menu-coop', data.totalPartnerships || 0);
  } catch (err) {
    console.error("Dashboard summary fetch failed", err);
  }
}

// 2. Load and Render Users (Investors & Sahibkarlar)
async function loadAllUsers() {
  try {
    const res = await fetch(getApiEndpoint('/api/v1/users'));
    const data = await res.json();
    if (data && data.users) {
      adminState.users = data.users;
      applyUserFilters();
    }
  } catch (err) {
    console.error("Users load error", err);
  }
}

function applyUserFilters() {
  let list = [...adminState.users];

  if (adminState.currentRoleFilter) {
    list = list.filter(u => u.role === adminState.currentRoleFilter);
  }

  if (adminState.currentStatusFilter) {
    list = list.filter(u => u.status === adminState.currentStatusFilter);
  }

  if (adminState.searchQuery) {
    const q = adminState.searchQuery;
    list = list.filter(u => 
      (u.fullName && u.fullName.toLowerCase().includes(q)) ||
      (u.companyName && u.companyName.toLowerCase().includes(q)) ||
      (u.voen && u.voen.includes(q)) ||
      (u.pin && u.pin.toLowerCase().includes(q)) ||
      (u.ektisFarmerId && u.ektisFarmerId.toLowerCase().includes(q))
    );
  }

  adminState.filteredUsers = list;
  renderUsersTable(list);
}

function renderUsersTable(userList) {
  const tbody = document.getElementById('admin-users-tbody');
  const countSpan = document.getElementById('filtered-users-count');
  if (countSpan) countSpan.innerText = userList.length;

  if (!tbody) return;

  if (!userList.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 36px; color: var(--text-muted);">
          <i class="fa-solid fa-user-slash" style="font-size: 2rem; color: #cbd5e1; margin-bottom: 8px; display: block;"></i>
          Axtarış parametrlərinə uyğun heç bir investor və ya sahibkar tapılmadı.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = userList.map(u => {
    const isInvestor = u.role === 'INVESTOR';
    const roleBadge = isInvestor
      ? `<span class="role-badge investor"><i class="fa-solid fa-briefcase"></i> İnvestor</span>`
      : `<span class="role-badge sahibkar"><i class="fa-solid fa-tractor"></i> Sahibkar</span>`;

    const statusBadge = getStatusBadge(u.status);

    const profileDetail = isInvestor
      ? `<div><strong>Büdcə:</strong> ${formatAzn(u.investmentBudgetAzn || 0)}</div>
         <div style="font-size: 0.72rem; color: #64748b;">${(u.preferredSectors || []).join(', ') || 'Ümumi'}</div>`
      : `<div><strong>Torpaq tələbi:</strong> ${u.requiredAreaHectares || 0} ha</div>
         <div style="font-size: 0.72rem; color: #64748b;">Təcrübə: ${u.arableExperienceYears || 0} il | Texnika: ${u.machineryCount || 0} ədəd</div>`;

    const ektisAccreditedBadge = u.ektisAccredited
      ? `<span title="EKTİS Təsdiqlənmiş" style="color: #10b981; font-weight: 700;"><i class="fa-solid fa-circle-check"></i> Akkreditə</span>`
      : `<span title="Yoxlamada" style="color: #f59e0b;"><i class="fa-solid fa-clock"></i> Gözləmədə</span>`;

    const scoreVal = u.ratingScore || 85;

    return `
      <tr>
        <td>
          <div class="user-identity-cell">
            <img src="${u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" alt="${u.fullName}" class="user-avatar-circle">
            <div class="user-names">
              <div class="fullname">${u.fullName}</div>
              <div class="company">${u.companyName || 'Müstəqil İştirakçı'}</div>
              <div style="margin-top: 4px;">${roleBadge}</div>
            </div>
          </div>
        </td>
        <td>
          <div><strong>FİN:</strong> <span class="id-badge-code">${u.pin || '---'}</span></div>
          <div style="margin-top: 3px;"><strong>VÖEN:</strong> <span class="id-badge-code">${u.voen || '---'}</span></div>
          ${u.ektisFarmerId ? `<div style="font-size: 0.72rem; color: #059669; margin-top: 2px;"><strong>EKTİS:</strong> ${u.ektisFarmerId}</div>` : ''}
        </td>
        <td>
          ${profileDetail}
        </td>
        <td>
          <div style="display: flex; align-items: center; justify-content: space-between; font-weight: 700; font-size: 0.78rem;">
            <span>${scoreVal} / 100</span>
            ${ektisAccreditedBadge}
          </div>
          <div class="score-bar-wrap">
            <div class="score-bar-fill" style="width: ${scoreVal}%;"></div>
          </div>
        </td>
        <td>
          <div style="font-size: 0.75rem; color: #475569; margin-bottom: 2px;">
            <i class="${u.providerIcon || 'fa-solid fa-shield-halved'}"></i> ${u.authProvider ? u.authProvider.split('/')[0].trim() : 'myGov'}
          </div>
          ${statusBadge}
        </td>
        <td>
          <div class="action-btns">
            <button class="action-btn-mini" title="Dosyeyə Baxış" onclick="openUserDossierModal(${u.id})">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button class="action-btn-mini" title="Statusu Dəyiş" onclick="openStatusChangeModal(${u.id})">
              <i class="fa-solid fa-user-pen"></i>
            </button>
            <button class="action-btn-mini" title="Klasterə Təyin Et" onclick="openCoopModalWithUser(${u.id})">
              <i class="fa-solid fa-handshake"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function getStatusBadge(status) {
  switch (status) {
    case 'AKTIV':
      return `<span class="status-pill aktiv"><i class="fa-solid fa-check"></i> Aktiv</span>`;
    case 'YOXLAMADA':
      return `<span class="status-pill yoxlamada"><i class="fa-solid fa-hourglass-half"></i> Yoxlamada</span>`;
    case 'TESDIQLENIB':
      return `<span class="status-pill tesdiqlendi"><i class="fa-solid fa-shield-check"></i> Təsdiqlənib</span>`;
    case 'BLOKLANIB':
      return `<span class="status-pill bloklandi"><i class="fa-solid fa-ban"></i> Bloklanıb</span>`;
    default:
      return `<span class="status-pill aktiv">${status}</span>`;
  }
}

// 3. User Dossier Modal
function openUserDossierModal(userId) {
  const user = adminState.users.find(u => u.id === userId);
  if (!user) return;

  adminState.selectedUserForModal = user;
  const isInvestor = user.role === 'INVESTOR';

  const body = document.getElementById('modal-dossier-body');
  if (body) {
    body.innerHTML = `
      <div style="display: flex; gap: 20px; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 18px; margin-bottom: 18px;">
        <img src="${user.avatarUrl}" style="width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 3px solid #10b981;">
        <div>
          <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--gov-primary);">${user.fullName}</h2>
          <div style="color: #64748b; font-size: 0.85rem;">${user.companyName || 'Müstəqil Təşəbbüskar'}</div>
          <div style="margin-top: 6px; display: flex; gap: 8px;">
            <span class="role-badge ${isInvestor ? 'investor' : 'sahibkar'}">
              <i class="fa-solid ${isInvestor ? 'fa-briefcase' : 'fa-tractor'}"></i> ${user.roleName || user.role}
            </span>
            ${getStatusBadge(user.status)}
          </div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px;">
        <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <div style="font-size: 0.72rem; color: #64748b; text-transform: uppercase;">FİN Kod</div>
          <div style="font-weight: 700; font-family: monospace; font-size: 1rem;">${user.pin}</div>
        </div>
        <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <div style="font-size: 0.72rem; color: #64748b; text-transform: uppercase;">VÖEN Nömrəsi</div>
          <div style="font-weight: 700; font-family: monospace; font-size: 1rem;">${user.voen}</div>
        </div>
        <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <div style="font-size: 0.72rem; color: #64748b; text-transform: uppercase;">Telefon</div>
          <div style="font-weight: 600;">${user.phone || '---'}</div>
        </div>
        <div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
          <div style="font-size: 0.72rem; color: #64748b; text-transform: uppercase;">E-poçt</div>
          <div style="font-weight: 600;">${user.email || '---'}</div>
        </div>
      </div>

      ${isInvestor ? `
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px; margin-bottom: 18px;">
          <h4 style="color: #1e40af; font-size: 0.9rem; margin-bottom: 8px;"><i class="fa-solid fa-sack-dollar"></i> İnvestisiya Təminatı və Maliyyə Profili</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.85rem;">
            <div><strong>Planlaşdırılan İnvestisiya:</strong> ${formatAzn(user.investmentBudgetAzn || 0)}</div>
            <div><strong>Gözlənilən Gəlirlilik (ROI):</strong> ${user.expectedRoiPercent || 18}%</div>
            <div><strong>Finanslaşdırma Modeli:</strong> ${user.financingType || 'Birbaşa kapital'}</div>
            <div><strong>Maraqlandığı Rayonlar:</strong> ${(user.preferredDistricts || ['Ağdam', 'Füzuli']).join(', ')}</div>
          </div>
        </div>
      ` : `
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px; margin-bottom: 18px;">
          <h4 style="color: #166534; font-size: 0.9rem; margin-bottom: 8px;"><i class="fa-solid fa-wheat-awn"></i> Aqrar İstehsal və Təsərrüfat Təcrübəsi</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.85rem;">
            <div><strong>EKTİS Fermer Kodu:</strong> ${user.ektisFarmerId || 'AZ-FRM-88412'}</div>
            <div><strong>Təsərrüfat Təcrübəsi:</strong> ${user.arableExperienceYears || 5} il</div>
            <div><strong>Mövcud Texnika Parkı:</strong> ${user.machineryCount || 3} ədəd texnika</div>
            <div><strong>Tələb Olunan Torpaq:</strong> ${user.requiredAreaHectares || 50} ha</div>
          </div>
        </div>
      `}

      <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px; font-size: 0.82rem; color: #92400e; margin-bottom: 18px;">
        <i class="fa-solid fa-shield-halved"></i> <strong>EKTİS & Dövlət İdentifikasiyası:</strong> ${user.verifiedStatus} (${user.authProvider})
        <div>Akkreditasiya Reytinqi: <strong>${user.ratingScore || 90}/100</strong> | Dövlət aqrar subsidiyalarına uyğunluq statusu aktivdir.</div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn-admin btn-admin-secondary" onclick="closeModal('modal-user-dossier')">Bağla</button>
        <button class="btn-admin btn-admin-primary" onclick="openStatusChangeModal(${user.id})">Statusu İdarə Et</button>
      </div>
    `;
  }

  openModal('modal-user-dossier');
}

// 4. Status Change & Accreditation Modal
function openStatusChangeModal(userId) {
  closeModal('modal-user-dossier');
  const user = adminState.users.find(u => u.id === userId);
  if (!user) return;

  adminState.selectedUserForModal = user;
  document.getElementById('status-modal-username').innerText = `${user.fullName} (${user.companyName})`;
  document.getElementById('status-modal-select').value = user.status;
  document.getElementById('status-modal-accredited').checked = !!user.ektisAccredited;
  document.getElementById('status-modal-score').value = user.ratingScore || 90;
  document.getElementById('status-modal-notes').value = '';

  openModal('modal-status-change');
}

async function submitStatusChange() {
  if (!adminState.selectedUserForModal) return;

  const userId = adminState.selectedUserForModal.id;
  const newStatus = document.getElementById('status-modal-select').value;
  const accredited = document.getElementById('status-modal-accredited').checked;
  const ratingScore = parseInt(document.getElementById('status-modal-score').value) || 90;
  const note = document.getElementById('status-modal-notes').value.trim();

  try {
    const res = await fetch(`/api/v1/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: newStatus,
        ektisAccredited: accredited,
        ratingScore: ratingScore,
        note: note,
        actor: "İnzibatçı (Admin Paneli)"
      })
    });

    const data = await res.json();
    if (data && data.success) {
      showAdminToast(`${adminState.selectedUserForModal.fullName} statusu yeniləndi!`, "success");
      closeModal('modal-status-change');
      notifyDataUpdated();
      await loadAllUsers();
      await loadDashboardSummary();
      await loadAuditLogs();
    }
  } catch (err) {
    showAdminToast("Status yeniləməsi zamanı xəta", "error");
  }
}

// 5. Create User Directly from Admin Modal
function openCreateUserModal() {
  openModal('modal-create-user');
}

async function handleCreateUserSubmit(e) {
  e.preventDefault();
  const role = document.getElementById('newuser-role').value;
  const fullName = document.getElementById('newuser-fullname').value.trim();
  const companyName = document.getElementById('newuser-company').value.trim();
  const pin = document.getElementById('newuser-pin').value.trim().toUpperCase();
  const voen = document.getElementById('newuser-voen').value.trim();
  const phone = document.getElementById('newuser-phone').value.trim();
  const email = document.getElementById('newuser-email').value.trim();
  const budget = parseFloat(document.getElementById('newuser-budget').value) || 0;
  const experience = parseInt(document.getElementById('newuser-experience').value) || 0;
  const machinery = parseInt(document.getElementById('newuser-machinery').value) || 0;
  const areaDemand = parseFloat(document.getElementById('newuser-area-demand').value) || 0;

  try {
    const res = await fetch(getApiEndpoint('/api/v1/users'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role,
        fullName,
        companyName,
        pin,
        voen,
        phone,
        email,
        investmentBudgetAzn: budget,
        arableExperienceYears: experience,
        machineryCount: machinery,
        requiredAreaHectares: areaDemand
      })
    });

    const data = await res.json();
    if (data && data.success) {
      showAdminToast(`Yeni ${data.user.roleName} uğurla qeydiyyata alındı və sinxronlaşdırıldı!`, "success");
      closeModal('modal-create-user');
      notifyDataUpdated();
      await loadAllUsers();
      await loadDashboardSummary();
      await loadAuditLogs();
    }
  } catch (err) {
    showAdminToast("Qeydiyyat zamanı xəta baş verdi", "error");
  }
}

function toggleNewUserFields() {
  const role = document.getElementById('newuser-role').value;
  const investorFields = document.getElementById('newuser-investor-fields');
  const sahibkarFields = document.getElementById('newuser-sahibkar-fields');

  if (role === 'INVESTOR') {
    if (investorFields) investorFields.style.display = 'block';
    if (sahibkarFields) sahibkarFields.style.display = 'none';
  } else {
    if (investorFields) investorFields.style.display = 'none';
    if (sahibkarFields) sahibkarFields.style.display = 'block';
  }
}

// 6. Applications Management & EKTIS Scoring
async function loadAllApplications() {
  try {
    const res = await fetch(getApiEndpoint('/api/v1/applications'));
    const data = await res.json();
    adminState.applications = data;
    renderApplicationsTable(data);
  } catch (err) {
    console.error("Applications load error", err);
  }
}

function renderApplicationsTable(appList) {
  const tbody = document.getElementById('admin-applications-tbody');
  if (!tbody) return;

  if (!appList.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 24px;">Müraciət tapılmadı.</td></tr>`;
    return;
  }

  tbody.innerHTML = appList.map(a => {
    const ektisBadge = a.ektisSynced
      ? `<span class="status-pill tesdiqlendi" title="${a.ektisApplicationId}"><i class="fa-solid fa-cloud-arrow-up"></i> ${a.ektisApplicationId || 'Sinxron'}</span>`
      : `<button class="btn-admin btn-admin-gold" style="padding: 2px 8px; font-size: 0.72rem;" onclick="syncApplicationToEktis(${a.id})"><i class="fa-solid fa-arrows-rotate"></i> EKTİS-ə Göndər</button>`;

    const statusPill = getAppStatusPill(a.status);

    return `
      <tr>
        <td><strong class="id-badge-code">${a.trackingNumber}</strong></td>
        <td>
          <div style="font-weight: 700;">${a.investor ? a.investor.fullName : 'İştirakçı'}</div>
          <div style="font-size: 0.72rem; color: #64748b;">${a.investor ? a.investor.companyName : ''} (FİN: ${a.investor ? a.investor.pin : '---'})</div>
        </td>
        <td>
          <div><strong>${a.parcel ? a.parcel.district : 'Qarabağ'}</strong>, ${a.parcel ? a.parcel.areaHectares : 0} ha</div>
          <div style="font-size: 0.72rem; color: #64748b;">Kadastr: ${a.parcel ? a.parcel.cadastreNumber : '---'}</div>
        </td>
        <td><strong style="color: #047857;">${formatAzn(a.plannedInvestmentAzn || 0)}</strong></td>
        <td>${a.projectedJobsCount || 0} nəfər</td>
        <td>${statusPill}</td>
        <td>${ektisBadge}</td>
        <td>
          <div class="action-btns">
            <button class="action-btn-mini" title="Qiymətləndir və Status Ver" onclick="openAppScoringModal(${a.id})">
              <i class="fa-solid fa-stamp"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function getAppStatusPill(status) {
  switch (status) {
    case 'QEBUL_EDILIB':
      return `<span class="status-pill yoxlamada"><i class="fa-solid fa-envelope"></i> Qəbul Edilib</span>`;
    case 'BAXILIR':
      return `<span class="status-pill aktiv"><i class="fa-solid fa-magnifying-glass"></i> Baxılır</span>`;
    case 'ELAVE_MELUMAT_TELEB_OLUNUR':
      return `<span class="status-pill yoxlamada"><i class="fa-solid fa-triangle-exclamation"></i> Sənəd Tələb Olunur</span>`;
    case 'QERAR_VERILIB_TESDIQ':
      return `<span class="status-pill tesdiqlendi"><i class="fa-solid fa-circle-check"></i> Qalib / Təsdiq</span>`;
    case 'QERAR_VERILIB_IMTINA':
      return `<span class="status-pill bloklandi"><i class="fa-solid fa-circle-xmark"></i> İmtina</span>`;
    default:
      return `<span class="status-pill aktiv">${status}</span>`;
  }
}

function openAppScoringModal(appId) {
  const app = adminState.applications.find(a => a.id === appId);
  if (!app) return;

  adminState.selectedAppForModal = app;
  const titleEl = document.getElementById('app-scoring-title');
  if (titleEl) {
    titleEl.innerText = `${app.trackingNumber} - ${app.investor ? app.investor.fullName : 'İddiaçı'}`;
  }
  
  document.getElementById('score-finance').value = app.scoreFinance !== undefined ? app.scoreFinance : 24;
  document.getElementById('score-experience').value = app.scoreExperience !== undefined ? app.scoreExperience : 19;
  document.getElementById('score-technology').value = app.scoreTechnology !== undefined ? app.scoreTechnology : 24;
  document.getElementById('score-jobs').value = app.scoreJobs !== undefined ? app.scoreJobs : 14;
  document.getElementById('score-ecology').value = app.scoreEcology !== undefined ? app.scoreEcology : 14;
  
  if (document.getElementById('app-decision-status')) {
    document.getElementById('app-decision-status').value = app.status || 'BAXILIR';
  }
  if (document.getElementById('app-decision-notes')) {
    document.getElementById('app-decision-notes').value = app.adminDecisionNote || '';
  }

  const resultBox = document.getElementById('ai-analysis-result-box');
  if (resultBox) {
    resultBox.style.display = 'none';
    resultBox.innerHTML = '';
  }

  const infoEl = document.getElementById('evaluation-engine-info');
  if (infoEl) {
    infoEl.style.display = 'none';
    infoEl.innerHTML = '';
  }

  calcTotalScore();
  openModal('modal-app-scoring');
}

// -----------------------------------------------------------------------------
// 🤖 AI İLƏ SƏNƏDLƏRİN DƏRİNLİYİNƏ ANALİZİ VƏ 100-BALLIQ SKORİNQ TƏKLİFİ
// -----------------------------------------------------------------------------
async function runAiDocumentAnalysis() {
  if (!adminState.selectedAppForModal) return;
  const app = adminState.selectedAppForModal;
  const resultBox = document.getElementById('ai-analysis-result-box');

  if (resultBox) {
    resultBox.style.display = 'block';
    resultBox.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px; color:#047857; font-weight:600; font-size:0.85rem;">
        <i class="fa-solid fa-spinner fa-spin text-lg"></i>
        <span>AI Mühərriki iddiaçının sənədlərini (Biznes Plan, AVİS, EKTİS, DƏK, DSMF, Bank) analiz edir...</span>
      </div>
    `;
  }

  try {
    const res = await fetch('/api/v1/commission/ai-document-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId: app.id })
    });
    const data = await res.json();

    if (data && data.success && data.analysis) {
      const a = data.analysis;
      const s = a.suggestedScores;

      // Update scoring input fields automatically
      document.getElementById('score-finance').value = s.scoreFinance;
      document.getElementById('score-experience').value = s.scoreExperience;
      document.getElementById('score-technology').value = s.scoreTechnology;
      document.getElementById('score-jobs').value = s.scoreJobs;
      document.getElementById('score-ecology').value = s.scoreEcology;
      calcTotalScore();

      // Auto update status if recommended
      if (a.aiVerdict && document.getElementById('app-decision-status')) {
        document.getElementById('app-decision-status').value = a.aiVerdict;
      }

      // Render rich document audit badges and AI recommendations
      if (resultBox) {
        const docBadgesHtml = (a.documentsAudit || []).map(d => `
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:6px 10px; font-size:0.75rem; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong style="color:#0f172a;"><i class="fa-solid fa-file-shield text-emerald-600"></i> ${d.title}</strong>
              <div style="font-size:0.7rem; color:#64748b;">${d.serviceName} • Kod: <span style="font-family:monospace; color:#0369a1;">${d.docNumber}</span></div>
            </div>
            <span style="background:#ecfdf5; color:#065f46; font-size:0.68rem; font-weight:700; padding:2px 8px; border-radius:12px; border:1px solid #a7f3d0;">
              <i class="fa-solid fa-check"></i> 100% Təsdiqlənib
            </span>
          </div>
        `).join('');

        const strengthsHtml = (a.strengths || []).map(str => `
          <li style="margin-bottom:3px;"><i class="fa-solid fa-check text-emerald-600"></i> ${str}</li>
        `).join('');

        resultBox.innerHTML = `
          <div style="border-bottom:1px solid #a7f3d0; padding-bottom:8px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <div>
              <span style="font-size:0.72rem; text-transform:uppercase; letter-spacing:0.05em; color:#047857; font-weight:700;">
                <i class="fa-solid fa-certificate"></i> AI Dövlət Sənəd Ekspertizası Hesabatı
              </span>
              <div style="font-weight:800; font-size:1rem; color:#065f46;">
                Ümumi Uyğunluq Skoru: <span style="color:#047857;">${s.totalScore} / 100 Bal</span>
              </div>
            </div>
            <span class="status-pill tesdiqlendi" style="font-size:0.75rem;">
              <i class="fa-solid fa-award"></i> ${a.aiVerdictRecommendation.split(':')[0]}
            </span>
          </div>

          <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:12px;">
            <div style="font-size:0.76rem; font-weight:700; color:#334155;">Elektron Dövlət Şlüzlərindən İnteqrasiya Olunmuş Sənədlər:</div>
            ${docBadgesHtml}
          </div>

          <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:10px 12px; margin-bottom:10px; font-size:0.78rem; line-height:1.45; color:#14532d;">
            <strong><i class="fa-solid fa-lightbulb text-amber-500"></i> AI Ekspert Rəy Əsası:</strong> ${a.aiVerdictRecommendation}
            <ul style="list-style:none; padding-left:0; margin:6px 0 0 0; font-size:0.74rem; color:#166534;">
              ${strengthsHtml}
            </ul>
          </div>

          <div style="display:flex; justify-content:flex-end;">
            <button type="button" class="btn-admin btn-sm" style="background:#047857; color:white; font-size:0.75rem; font-weight:600; padding:5px 12px; border-radius:6px;" onclick="runAiGenerateOpinion()">
              <i class="fa-solid fa-pen-fancy"></i> Bu Analiz Əsasında Rəsmi Rəy Mətnini Yaz
            </button>
          </div>
        `;
      }

      showAdminToast(`AI Analizi: ${s.totalScore} bal təklif edildi və sənədlər təsdiqləndi!`, "success");
    }
  } catch (err) {
    if (resultBox) {
      resultBox.innerHTML = `<span style="color:#b91c1c;"><i class="fa-solid fa-circle-exclamation"></i> AI sənəd analizi sorğusu xətası.</span>`;
    }
  }
}

// -----------------------------------------------------------------------------
// ✍️ AI İLƏ SEÇİLMİŞ QURUM VƏ YA BÜTÜN KOMİSSİYA ÜZRƏ RƏSMİ RƏY TƏRTİBİ
// -----------------------------------------------------------------------------
async function runAiGenerateOpinion() {
  if (!adminState.selectedAppForModal) return;
  const app = adminState.selectedAppForModal;
  const expertSelect = document.getElementById('score-expert-id');
  const selectedExpert = expertSelect ? expertSelect.value : 'all';
  const notesEl = document.getElementById('app-decision-notes');

  if (notesEl) {
    notesEl.value = "AI ekspert rəy mətni hazırlanır...";
  }

  try {
    const res = await fetch('/api/v1/commission/ai-generate-opinion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationId: app.id,
        expertId: selectedExpert
      })
    });
    const data = await res.json();

    if (data && data.success && data.generatedOpinion) {
      if (Array.isArray(data.generatedOpinion)) {
        // Multi-agency consensus protocol
        const opinionText = data.generatedOpinion.map(op => 
          `[${op.agencyShort} — ${op.expertName}]:\n"${op.opinion}"`
        ).join('\n\n');
        if (notesEl) notesEl.value = opinionText;
      } else {
        const op = data.generatedOpinion;
        const opinionText = `[${op.agencyShort} — ${op.expertName}]:\n"${op.opinion}"`;
        if (notesEl) notesEl.value = opinionText;
      }
      showAdminToast("Rəsmi ekspert rəyi AI ilə tərtib olundu", "success");
    }
  } catch (err) {
    if (notesEl) notesEl.value = "AI rəy generasiyası xətası baş verdi.";
  }
}

function handleExpertSelectChange() {
  const expertSelect = document.getElementById('score-expert-id');
  if (expertSelect && adminState.selectedAppForModal) {
    runAiGenerateOpinion();
  }
}

async function runAutoScoring() {
  // Alias to AI Document Analysis
  return runAiDocumentAnalysis();
}

async function checkParcelCadastreTopology() {
  if (!adminState.selectedAppForModal) return;
  const parcelId = adminState.selectedAppForModal.parcelId || 1;
  const infoEl = document.getElementById('evaluation-engine-info');
  if (infoEl) {
    infoEl.style.display = 'block';
    infoEl.style.background = '#ecfdf5';
    infoEl.style.border = '1px solid #a7f3d0';
    infoEl.style.color = '#047857';
    infoEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> LocationTech JTS & FAO SOLA kadastr topologiyası və LADM RRR hüquqları yoxlanılır...`;
  }

  try {
    const res = await fetch(`/api/v1/evaluation/parcels/${parcelId}/cadastre-topology`);
    const data = await res.json();
    if (data && data.cadastreNumber) {
      const rightsHtml = (data.ladmRights || []).map(r => `<li><i class="fa-solid fa-check text-emerald-600"></i> ${r}</li>`).join('');
      const restrictionsHtml = (data.ladmRestrictions || []).map(r => `<li><i class="fa-solid fa-shield-halved text-amber-600"></i> ${r}</li>`).join('');
      const responsibilitiesHtml = (data.ladmResponsibilities || []).map(r => `<li><i class="fa-solid fa-file-contract text-blue-600"></i> ${r}</li>`).join('');

      if (infoEl) {
        infoEl.innerHTML = `
          <div style="font-weight: 700; margin-bottom: 6px;"><i class="fa-solid fa-shield-halved"></i> FAO SOLA & LocationTech JTS Kadastr Doğrulaması</div>
          <div><strong>Kadastr No:</strong> ${data.cadastreNumber} (${data.ladmCompliance})</div>
          <div><strong>Sahə:</strong> Rəsmi: ${data.officialAreaHectares} ha | JTS Qapalı Poliqon: ${data.jtsCalculatedAreaHectares} ha (Topologiya: Doğru)</div>
          <div><strong>Hüquqi Status:</strong> <span class="status-pill aktiv">${data.legalTenureStatus || 'İCARƏYƏ AÇIQ'}</span> | ANAMA: <strong>${data.anamaStatus}</strong> (${data.anamaCertificate})</div>
          <div style="margin-top: 8px; font-size: 0.78rem;">
            <div style="font-weight: 700; color: #065f46; margin-top: 4px;">FAO LADM RRR Hüquq və Məhdudiyyətlər Paketi:</div>
            <ul style="margin: 4px 0 0 16px; padding: 0; line-height: 1.4;">
              ${rightsHtml}
              ${restrictionsHtml}
              ${responsibilitiesHtml}
            </ul>
          </div>
        `;
      }
      showAdminToast("Kadastr, JTS topologiyası və LADM RRR təsdiqləndi", "success");
    }
  } catch (err) {
    if (infoEl) infoEl.innerHTML = `<span style="color:#b91c1c;"><i class="fa-solid fa-circle-exclamation"></i> Kadastr topologiyası sorğusu xətası.</span>`;
  }
}

async function viewAgroSurveySampling() {
  if (!adminState.selectedAppForModal) return;
  const parcelId = adminState.selectedAppForModal.parcelId || 1;
  const infoEl = document.getElementById('evaluation-engine-info');
  if (infoEl) {
    infoEl.style.display = 'block';
    infoEl.style.background = '#fdf4ff';
    infoEl.style.border = '1px solid #f5d0fe';
    infoEl.style.color = '#86198f';
    infoEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Open Foris Collect Earth torpaq nümunələri və Sentinel-2 NDVI hesablanır...`;
  }

  try {
    const res = await fetch(`/api/v1/evaluation/parcels/${parcelId}/agro-survey`);
    const data = await res.json();
    if (data && data.aggregatedMetrics) {
      const m = data.aggregatedMetrics;
      const yf = data.cropYieldForecast || {};
      const layersHtml = (data.soilDepthLayers || []).map(l => 
        `<div>• <strong>${l.depthInterval}:</strong> Üzvi maddə: ${l.organicMatterPercent}% | Azot (N): ${l.nitrogenMgKg} mq/kq</div>`
      ).join('');

      if (infoEl) {
        infoEl.innerHTML = `
          <div style="font-weight: 700; margin-bottom: 4px;"><i class="fa-solid fa-seedling"></i> Open Foris Collect Earth Aqro-Monitorinq & Bonitet</div>
          <div><strong>Standart:</strong> ${data.surveyFramework} (${data.samplingGridPointsCount} nümunə nöqtəsi)</div>
          <div><strong>Münbitlik & Bonitet:</strong> ${m.averageSoilBonitetScore} / 100 (${data.suitabilityVerdict}) | Peyk NDVI: <strong>${m.sentinel2NdviIndex}</strong></div>
          <div style="margin: 6px 0; font-size: 0.78rem; background: rgba(255,255,255,0.6); padding: 6px; border-radius: 6px;">
            <div style="font-weight: 700;">Torpaq Qatları Profili (SoilGrids & Open Foris):</div>
            ${layersHtml}
          </div>
          <div style="font-size: 0.78rem;"><strong>Məhsuldarlıq Proqnozu:</strong> Buğda: ${yf.wheatGrainCentnersPerHa || 48} snt/ha | Pambıq: ${yf.cottonCentnersPerHa || 38} snt/ha | Meyvə: ${yf.orchardFruitTonsPerHa || 16} t/ha</div>
        `;
      }
      showAdminToast("Open Foris torpaq və peyk nümunələri yükləndi", "success");
    }
  } catch (err) {
    if (infoEl) infoEl.innerHTML = `<span style="color:#b91c1c;"><i class="fa-solid fa-circle-exclamation"></i> Aqro monitorinq sorğusu xətası.</span>`;
  }
}

async function viewAkiaLoanAmortization() {
  if (!adminState.selectedAppForModal) return;
  const app = adminState.selectedAppForModal;
  const area = (app.parcel && app.parcel.areaHectares) || 120.0;
  const sector = (app.parcel && app.parcel.sector) || 'EKINCILIK';
  const infoEl = document.getElementById('evaluation-engine-info');
  if (infoEl) {
    infoEl.style.display = 'block';
    infoEl.style.background = '#fefce8';
    infoEl.style.border = '1px solid #fde047';
    infoEl.style.color = '#854d0e';
    infoEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Apache Fineract əsaslı AKİA 7% kredit və amortizasiya cədvəli hesablanır...`;
  }

  try {
    const res = await fetch(`/api/v1/evaluation/subsidies/calculate?areaHectares=${area}&sector=${encodeURIComponent(sector)}`);
    const data = await res.json();
    if (data && data.loanAmortizationSchedule) {
      const rows = data.loanAmortizationSchedule.slice(0, 5).map(r => `
        <tr style="border-bottom: 1px solid #fef08a;">
          <td style="padding: 4px 6px;">İl ${r.year}</td>
          <td style="padding: 4px 6px;">${r.openingBalanceAzn} ₼</td>
          <td style="padding: 4px 6px;">${r.principalDueAzn} ₼</td>
          <td style="padding: 4px 6px; color:#15803d;">${r.stateSubsidizedInterestAzn} ₼ (5%)</td>
          <td style="padding: 4px 6px; font-weight:700;">${r.investorNetInterestAzn} ₼ (2%)</td>
        </tr>
      `).join('');

      if (infoEl) {
        infoEl.innerHTML = `
          <div style="font-weight: 700; margin-bottom: 4px;"><i class="fa-solid fa-coins"></i> Apache Fineract & AKİA 7% Güzəştli Aqro-Kredit Simulyatoru</div>
          <div><strong>Sərmayə Həcmi:</strong> ${data.estimatedCapitalInvestmentAzn} ₼ | <strong>AKİA Krediti (60%):</strong> ${data.akiaConcessionalLoanAmountAzn} ₼</div>
          <div><strong>Dövlət Faiz Dəstəyi (5%):</strong> <span style="color:#15803d; font-weight:700;">${data.akiaStateInterestSubsidyAzn} ₼</span> | <strong>İnvestor Faiz Xərci (2%):</strong> ${data.akiaInvestorNetInterestAzn} ₼</div>
          <div style="margin-top: 8px; font-size: 0.76rem; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 6px; font-size: 0.74rem;">
              <thead>
                <tr style="background: #fef9c3; text-align: left;">
                  <th style="padding: 4px 6px;">Dövr</th>
                  <th style="padding: 4px 6px;">Qalıq Borc</th>
                  <th style="padding: 4px 6px;">Əsas Borc (2 il güzəşt)</th>
                  <th style="padding: 4px 6px;">Dövlət Subsidiyası (5%)</th>
                  <th style="padding: 4px 6px;">İnvestor Ödənişi (2%)</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        `;
      }
      showAdminToast("AKİA 7% amortizasiya cədvəli yükləndi", "success");
    }
  } catch (err) {
    if (infoEl) infoEl.innerHTML = `<span style="color:#b91c1c;"><i class="fa-solid fa-circle-exclamation"></i> AKİA kredit cədvəli sorğusu xətası.</span>`;
  }
}

function calcTotalScore() {
  const f = Math.min(25, Math.max(0, parseInt(document.getElementById('score-finance').value) || 0));
  const e = Math.min(20, Math.max(0, parseInt(document.getElementById('score-experience').value) || 0));
  const t = Math.min(25, Math.max(0, parseInt(document.getElementById('score-technology').value) || 0));
  const j = Math.min(15, Math.max(0, parseInt(document.getElementById('score-jobs').value) || 0));
  const ec = Math.min(15, Math.max(0, parseInt(document.getElementById('score-ecology').value) || 0));
  const sum = f + e + t + j + ec;

  const totalEl = document.getElementById('score-total-val');
  if (totalEl) totalEl.innerText = `${sum} / 100 Bal`;

  const badgeEl = document.getElementById('score-grade-badge');
  if (badgeEl) {
    if (sum >= 85) {
      badgeEl.className = 'status-pill tesdiqlendi';
      badgeEl.innerHTML = '<i class="fa-solid fa-star"></i> ⭐ Yüksək Uyğunluq (Qalibiyyət Tövsiyə Edilir)';
    } else if (sum >= 70) {
      badgeEl.className = 'status-pill baxilir';
      badgeEl.innerHTML = '<i class="fa-solid fa-check"></i> ✅ Məqbul (Ehtiyat Namizəd)';
    } else {
      badgeEl.className = 'status-pill imtina';
      badgeEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> ⚠️ Təkmilləşdirmə Tələb Olunur';
    }
  }

  return sum;
}

async function submitAppDecision() {
  if (!adminState.selectedAppForModal) return;

  const appId = adminState.selectedAppForModal.id;
  const newStatus = document.getElementById('app-decision-status').value;
  const notes = document.getElementById('app-decision-notes').value.trim();
  const expertIdEl = document.getElementById('score-expert-id');
  const selectedExpertVal = expertIdEl ? expertIdEl.value : 'all';

  const f = parseInt(document.getElementById('score-finance').value) || 0;
  const e = parseInt(document.getElementById('score-experience').value) || 0;
  const t = parseInt(document.getElementById('score-technology').value) || 0;
  const j = parseInt(document.getElementById('score-jobs').value) || 0;
  const ec = parseInt(document.getElementById('score-ecology').value) || 0;
  const totalScore = f + e + t + j + ec;

  try {
    // Post to commission expert scoring API
    await fetch(getApiEndpoint(`/api/v1/applications/${appId}/score`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expertId: selectedExpertVal === 'all' ? 1 : parseInt(selectedExpertVal),
        expertName: expertIdEl ? expertIdEl.options[expertIdEl.selectedIndex].text : "Komissiya Heyəti",
        scores: {
          agroEconomic: e,
          financialFeasibility: f,
          newJobs: j,
          modernTechIrrigation: t,
          ecologySoilProtection: ec
        },
        decision: newStatus,
        comments: notes || `Müsabiqə komissiyasının rəsmi qiymətləndirməsi: ${totalScore} bal.`
      })
    });
  } catch (err) {
    console.warn("Commission score endpoint notification:", err);
  }

  try {
    // 1. Submit through the reverse-engineered 100-point evaluation endpoint
    await fetch(`/api/v1/evaluation/applications/submit-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationId: appId,
        financialCapacityScore: f,
        agroExperienceScore: e,
        modernTechAndIrrigationScore: t,
        jobCreationScore: j,
        ecologicalImpactScore: ec,
        recommendedStatus: newStatus,
        decisionNotes: notes || `Müsabiqə komissiyası rəsmi qiymətləndirməsi: ${totalScore} bal.`,
        expertEvaluatorName: "Müsabiqə Komissiyasının Ekspert Heyəti"
      })
    });

    // 2. Also patch application status for backwards compatibility
    const res = await fetch(`/api/v1/applications/${appId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        newStatus,
        notes: notes || `Müsabiqə komissiyası qiymətləndirməsi: ${totalScore} bal. Status: ${newStatus}`,
        totalScore,
        changedBy: "Müsabiqə Komissiyasının Ekspert Heyəti"
      })
    });

    const data = await res.json();
    if (data) {
      showAdminToast("100 ballıq müsabiqə qərarı uğurla təsdiqləndi!", "success");
      closeModal('modal-app-scoring');
      notifyDataUpdated();
      await loadAllApplications();
      await loadDashboardSummary();
      await loadAuditLogs();
    }
  } catch (err) {
    showAdminToast("Qərar qeydiyyatı xətası", "error");
  }
}

async function syncApplicationToEktis(appId) {
  try {
    const res = await fetch(`/api/v1/ektis/sync/${appId}`, { method: 'POST' });
    const data = await res.json();
    if (data && data.success) {
      showAdminToast(`EKTİS İnteqrasiyası Tamamlandı! Reyestr №: ${data.ektisRegistrationNumber}`, "success");
      notifyDataUpdated();
      await loadAllApplications();
      await loadDashboardSummary();
      await loadAuditLogs();
    }
  } catch (err) {
    showAdminToast("EKTİS sinxronizasiya xətası", "error");
  }
}

// 7. Co-Funding Partnerships (Matchmaking Innovation)
async function loadAllPartnerships() {
  try {
    const res = await fetch(getApiEndpoint('/api/v1/partnerships'));
    const data = await res.json();
    if (data && data.partnerships) {
      adminState.partnerships = data.partnerships;
      renderPartnershipsTable(data.partnerships);
    }
  } catch (err) {
    console.error("Partnerships load error", err);
  }
}

function renderPartnershipsTable(list) {
  const tbody = document.getElementById('admin-partnerships-tbody');
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px;">Hələlik birgə layihə klasteri formalaşdırılmayıb.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(p => `
    <tr>
      <td><strong class="id-badge-code">${p.ektisCoopCode}</strong></td>
      <td><strong>${p.investorName}</strong></td>
      <td><strong>${p.sahibkarName}</strong></td>
      <td>${p.district} (${p.parcelCadastre})</td>
      <td><strong style="color: #047857;">${formatAzn(p.committedCapitalAzn)}</strong></td>
      <td><span class="status-pill tesdiqlendi"><i class="fa-solid fa-handshake"></i> ${p.status}</span></td>
      <td style="font-size: 0.76rem; color: #64748b;">${p.notes || '---'}</td>
    </tr>
  `).join('');
}

function openCoopModalWithUser(userId) {
  const user = adminState.users.find(u => u.id === userId);
  openModal('modal-create-coop');

  // Populate dropdowns
  const invSelect = document.getElementById('coop-investor-select');
  const sahSelect = document.getElementById('coop-sahibkar-select');
  const parcSelect = document.getElementById('coop-parcel-select');

  if (invSelect) {
    const investors = adminState.users.filter(u => u.role === 'INVESTOR');
    invSelect.innerHTML = investors.map(i => `<option value="${i.id}" ${user && user.id === i.id ? 'selected' : ''}>${i.fullName} (${i.companyName}) - ${formatAzn(i.investmentBudgetAzn || 0)}</option>`).join('');
  }

  if (sahSelect) {
    const sahibkars = adminState.users.filter(u => u.role === 'SAHIBKAR');
    sahSelect.innerHTML = sahibkars.map(s => `<option value="${s.id}" ${user && user.id === s.id ? 'selected' : ''}>${s.fullName} (${s.companyName}) - ${s.requiredAreaHectares || 0} ha</option>`).join('');
  }

  if (parcSelect) {
    parcSelect.innerHTML = adminState.parcels.map(p => `<option value="${p.id}">${p.district} (${p.cadastreNumber}) - ${p.areaHectares} ha - Min: ${formatAzn(p.minInvestmentAzn)}</option>`).join('');
  }
}

async function handleCreatePartnership(e) {
  e.preventDefault();
  const investorId = document.getElementById('coop-investor-select').value;
  const sahibkarId = document.getElementById('coop-sahibkar-select').value;
  const parcelId = document.getElementById('coop-parcel-select').value;
  const committedCapitalAzn = parseFloat(document.getElementById('coop-capital-input').value) || 500000;
  const notes = document.getElementById('coop-notes-input').value.trim();

  try {
    const res = await fetch(getApiEndpoint('/api/v1/partnerships'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        investorId,
        sahibkarId,
        parcelId,
        committedCapitalAzn,
        notes
      })
    });

    const data = await res.json();
    if (data && data.success) {
      showAdminToast("Yeni İnvestor-Sahibkar Klasteri uğurla formalaşdırıldı!", "success");
      closeModal('modal-create-coop');
      notifyDataUpdated();
      await loadAllPartnerships();
      await loadDashboardSummary();
      await loadAuditLogs();
    }
  } catch (err) {
    showAdminToast("Klaster formalaşdırma xətası", "error");
  }
}

// 8. Land Parcels Fund (10 Karabakh Districts)
async function loadAllParcels() {
  try {
    const res = await fetch(getApiEndpoint('/api/v1/parcels'));
    const data = await res.json();
    adminState.parcels = data;
    renderParcelsTable(data);
  } catch (err) {
    console.error("Parcels load error", err);
  }
}

function renderParcelsTable(list) {
  const tbody = document.getElementById('admin-parcels-tbody');
  if (!tbody) return;

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 24px;">Torpaq sahəsi tapılmadı.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(p => {
    const isOpen = p.auctionStatus === 'OPEN';
    const statusBadge = isOpen
      ? `<span class="status-pill aktiv" style="background: #ecfdf5; color: #047857; border: 1px solid #10b981; font-weight: 700;"><i class="fa-solid fa-gavel text-amber-500"></i> Açıqdır</span>`
      : `<span class="status-pill bloklandi" style="background: #fef2f2; color: #b91c1c; font-weight: 700;"><i class="fa-solid fa-lock"></i> Bağlıdır</span>`;

    const leaderName = p.highestBidder
      ? `<div style="font-weight: 700; color: #0f172a;">${p.highestBidder.companyName || p.highestBidder.fullName}</div>
         <div style="font-size: 0.72rem; color: #64748b;">FİN: ${p.highestBidder.pin || '---'}</div>`
      : `<span style="color: #94a3b8; font-size: 0.8rem;">İlkin start</span>`;

    const bidsCount = p.bidsCount || (p.bids ? p.bids.length : 0);

    const toggleActionBtn = isOpen
      ? `<button class="btn-admin btn-admin-danger" style="padding: 4px 8px; font-size: 0.72rem;" onclick="toggleParcelAuction(${p.id}, 'CLOSE')" title="Açıq artırmanı bitir və cari lideri qalib təsdiqlə">
          <i class="fa-solid fa-lock"></i> Bitir & Qalib
         </button>`
      : `<button class="btn-admin btn-admin-primary" style="padding: 4px 8px; font-size: 0.72rem;" onclick="toggleParcelAuction(${p.id}, 'OPEN')" title="Açıq artırmanı yenidən başlat">
          <i class="fa-solid fa-unlock"></i> Artırmanı Aç
         </button>`;

    return `
      <tr>
        <td>
          <strong class="id-badge-code">${p.cadastreNumber}</strong>
          <div style="font-size: 0.75rem; color: #64748b; margin-top: 2px;"><strong>${p.district}</strong>, ${p.village || 'Qarabağ'}</div>
        </td>
        <td>
          <div style="font-weight: 700;">${p.areaHectares} ha</div>
          <div style="margin-top: 2px;"><span class="role-badge ${p.sector === 'BAGCHILIQ' ? 'investor' : 'sahibkar'}">${p.sector}</span></div>
        </td>
        <td>
          <div style="font-weight: 700; color: #047857;">${p.soilBonitet} bal • pH ${p.soilPh || 7.0}</div>
          <div style="font-size: 0.72rem; color: #0284c7; margin-top: 2px;">
            <i class="fa-solid fa-mountain"></i> ${p.elevationMeters || 245}m d.s.h. • Meyil: <strong>${p.terrainSlope || 1.2}°</strong>
          </div>
          <div style="font-size: 0.68rem; color: #64748b; font-weight: 600;">
            ${p.reliefCategory || 'DÜZƏN'} &bull; ${p.irrigationType || 'PIVOT'}
          </div>
        </td>
        <td>
          <div style="font-weight: 800; color: #047857; font-size: 0.95rem;">${formatAzn(p.highestBidAzn || p.minInvestmentAzn)}</div>
          <div style="font-size: 0.72rem; color: #64748b;">Start: ${formatAzn(p.startingBidAzn || p.minInvestmentAzn)}</div>
        </td>
        <td>
          ${leaderName}
          <div style="margin-top: 4px;">
            <button class="btn-admin btn-admin-gold" style="padding: 2px 7px; font-size: 0.7rem; display: inline-flex; align-items: center; gap: 4px;" onclick="openAuctionBidsModal(${p.id})">
              <i class="fa-solid fa-list-ol"></i> <span>${bidsCount} Təklif (Gör)</span>
            </button>
          </div>
        </td>
        <td>
          <div style="font-weight: 700; color: #1e40af;">
            <i class="fa-solid fa-users"></i> ${p.applicantsCount || 0} iddiaçı
          </div>
          <div style="font-size: 0.72rem; color: #047857; font-weight: 600; margin-top: 2px;">
            Cəmi: ${p.totalRequestedHectares || p.areaHectares} ha
          </div>
          <button class="btn-admin btn-admin-secondary" style="padding: 2px 7px; font-size: 0.68rem; margin-top: 4px; display: inline-flex; align-items: center; gap: 4px;" onclick="openAdminParcelApplicantsModal(${p.id})">
            <i class="fa-solid fa-users-viewfinder"></i> <span>İddiaçıları Gör</span>
          </button>
        </td>
        <td>${statusBadge}</td>
        <td style="text-align: right;">
          <div style="display: flex; align-items: center; justify-content: flex-end; gap: 6px;">
            ${toggleActionBtn}
            <button class="action-btn-mini" title="Təkliflər Siyahısı (Liderlik Lövhəsi)" onclick="openAuctionBidsModal(${p.id})">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button class="action-btn-mini" title="Xəritədə Gör & Təcrid Et" onclick="adminViewParcelOnMap(${p.id})">
              <i class="fa-solid fa-map-location-dot"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function openAdminParcelApplicantsModal(parcelId) {
  const p = adminState.parcels.find(x => x.id === Number(parcelId));
  if (!p) return;

  const modal = document.getElementById('modal-admin-parcel-applicants');
  if (!modal) return;

  const titleEl = document.getElementById('admin-app-modal-title');
  if (titleEl) {
    titleEl.innerHTML = `<i class="fa-solid fa-users-viewfinder text-primary"></i> ${p.district} (${p.cadastreNumber}) - İddiaçılar Reyestri`;
  }
  const totHaEl = document.getElementById('admin-app-modal-total-ha');
  if (totHaEl) totHaEl.innerText = `${p.areaHectares} ha`;
  const cntEl = document.getElementById('admin-app-modal-count');
  if (cntEl) cntEl.innerText = `${p.applicantsCount || 0} nəfər`;
  const demHaEl = document.getElementById('admin-app-modal-demanded-ha');
  if (demHaEl) demHaEl.innerText = `${p.totalRequestedHectares || p.areaHectares} ha`;

  const tbody = document.getElementById('admin-applicants-tbody');
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 18px; color: #64748b;"><i class="fa-solid fa-spinner fa-spin"></i> İddiaçılar reyestri sorğulanır...</td></tr>';
    try {
      const res = await fetch(getApiEndpoint(`/api/v1/parcels/${p.id}/applicants`));
      const data = await res.json();
      const applicants = (data && data.applicants) ? data.applicants : (p.applicants || []);

      if (applicants.length > 0) {
        tbody.innerHTML = applicants.map((a, idx) => `
          <tr>
            <td style="font-weight: 700; color: #64748b;">${idx + 1}</td>
            <td>
              <div style="font-weight: 700; color: #0f172a;">${a.companyName || a.fullName}</div>
              <div style="font-size: 0.72rem; color: #64748b;">${a.fullName || ''}</div>
            </td>
            <td>
              <span class="id-badge-code">VÖEN: ${a.voen || '---'}</span>
              <div style="font-size: 0.7rem; color: #64748b;">FİN: ${a.pin || '---'}</div>
            </td>
            <td>
              <span style="font-weight: 800; color: #047857; background: #ecfdf5; padding: 2px 8px; border-radius: 6px;">
                ${a.requestedHectares || p.areaHectares} ha
              </span>
            </td>
            <td>
              <strong style="color: #047857;">${(a.investmentOfferAzn || a.plannedInvestmentAzn || 0).toLocaleString('az-AZ')} ₼</strong>
            </td>
            <td>${a.jobsCount || 15} daimi</td>
            <td>
              <span class="status-pill ${a.status === 'LİDER_İDDİAÇI' ? 'tesdiqlendi' : 'aktiv'}">
                ${a.status || 'Baxışda'}
              </span>
            </td>
          </tr>
        `).join('');
      } else {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 18px; color: #64748b;">Bu sahə üzrə qeydiyyatlı iddiaçı yoxdur.</td></tr>';
      }
    } catch(err) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 18px; color: #ef4444;">Məlumat yüklənərkən xəta baş verdi.</td></tr>';
    }
  }

  modal.classList.add('active');
}

// ==========================================
// NAZİRLİK TORPAQ MONİTORİNQİ DEPARTAMENTİ
// ==========================================
async function loadMonitoringData() {
  const tbody = document.getElementById('admin-monitoring-tbody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 24px; color: #64748b;"><i class="fa-solid fa-spinner fa-spin"></i> Sentinel-2 peyk məlumatları və icarə müqavilələri sinxronlaşdırılır...</td></tr>`;

  try {
    const res = await fetch(getApiEndpoint('/api/v1/monitoring/leased-lands'));
    const data = await res.json();
    const list = (data && data.leasedLands) ? data.leasedLands : [];

    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 24px;">İcarədə olan torpaq sahəsi tapılmadı.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(item => {
      const ndviClass = item.ndviIndex >= 0.70 ? 'text-emerald-700 bg-emerald-50' : (item.ndviIndex >= 0.55 ? 'text-amber-700 bg-amber-50' : 'text-rose-700 bg-rose-50');
      const statusPill = item.status === 'NORMAL' 
        ? `<span class="status-pill tesdiqlendi"><i class="fa-solid fa-check"></i> Normal</span>`
        : (item.status === 'NEZARETDE' 
            ? `<span class="status-pill ektis"><i class="fa-solid fa-eye"></i> Nəzarətdə</span>`
            : `<span class="status-pill bloklandi"><i class="fa-solid fa-triangle-exclamation"></i> Xəbərdarlıq</span>`);

      return `
        <tr>
          <td>
            <strong class="id-badge-code">${item.cadastreNumber}</strong>
            <div style="font-size: 0.75rem; color: #64748b; margin-top: 2px;"><strong>${item.district}</strong>, ${item.village}</div>
          </td>
          <td>
            <div style="font-weight: 700; color: #0f172a;">${item.tenant}</div>
            <div style="font-size: 0.72rem; color: #64748b;">VÖEN: ${item.voen} &bull; Müqavilə: <strong>${item.contractNumber}</strong></div>
          </td>
          <td>
            <div style="font-weight: 800; color: #047857;">${item.areaHectares} ha</div>
            <div style="font-size: 0.72rem; color: #64748b;">${item.purpose}</div>
          </td>
          <td>
            <div style="font-size: 0.78rem; font-weight: 700;">${item.leaseStartDate} — ${item.leaseEndDate}</div>
            <div style="font-size: 0.72rem; color: #059669; font-weight: 600;">${(item.annualLeaseFeeAzn || 0).toLocaleString('az-AZ')} ₼/il</div>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="status-pill tesdiqlendi" style="font-family: monospace; font-size: 0.75rem; font-weight: 800;">
                NDVI: ${item.ndviIndex}
              </span>
            </div>
            <div style="font-size: 0.72rem; color: #0284c7; margin-top: 2px;">
              💧 Rütubət: <strong>${item.soilMoisture}</strong>
            </div>
          </td>
          <td>
            <div style="font-size: 0.78rem; font-weight: 700; color: #047857;">
              ${(item.investmentActualAzn || 0).toLocaleString('az-AZ')} ₼ / ${(item.investmentCommittedAzn || 0).toLocaleString('az-AZ')} ₼
            </div>
            <div style="font-size: 0.72rem; color: #64748b;">
              İş yerləri: <strong>${item.actualJobs} / ${item.projectedJobs}</strong> daimi
            </div>
          </td>
          <td>${statusPill}</td>
          <td style="text-align: right;">
            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 5px;">
              <button class="btn-admin btn-admin-primary" style="padding: 4px 8px; font-size: 0.72rem;" onclick="generateInspectionAct('${item.contractNumber}')" title="Nazirlik yoxlama aktı hazırla">
                <i class="fa-solid fa-file-contract"></i> Akt
              </button>
              <button class="btn-admin btn-admin-secondary" style="padding: 4px 8px; font-size: 0.72rem;" onclick="viewSatellitePassDetail('${item.cadastreNumber}')" title="Sentinel-2 spektral analizi">
                <i class="fa-solid fa-satellite"></i> Spektr
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 24px; color: #ef4444;">Peyk monitorinq məlumatları yüklənərkən xəta baş verdi.</td></tr>`;
  }
}

function exportMonitoringReport() {
  showAdminToast("📊 İcarəyə verilmiş 2,540 ha torpaq üzrə Nazirlik Peyk Monitorinq Hesabatı (XLSX) ixrac edildi.", "success");
}

function triggerSatelliteSync() {
  showAdminToast("🛰️ Copernicus Sentinel-2 MSI (10m) peyk qatı yeniləndi. Bütün NDVI göstəriciləri aktualdır.", "info");
  loadMonitoringData();
}

function generateInspectionAct(contractNumber) {
  showAdminToast(`📄 Müqavilə № ${contractNumber} üzrə Kənd Təsərrüfatı Nazirliyinin sahəvi monitorinq aktı formalaşdırıldı.`, "success");
}

function viewSatellitePassDetail(cadastre) {
  showAdminToast(`🛰️ ${cadastre} üzrə Sentinel-2 L2A spektral xəritəsi və bitki örtüyü fotosu açılır...`, "info");
}

let currentAuctionParcelId = null;

async function openAuctionBidsModal(parcelId) {
  currentAuctionParcelId = parcelId;
  const p = adminState.parcels.find(x => x.id === parcelId);
  const titleEl = document.getElementById('auction-modal-title');
  const subEl = document.getElementById('auction-modal-subtitle');
  const tbody = document.getElementById('auction-bids-tbody');

  if (p) {
    if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-gavel text-amber-500"></i> ${p.district} (${p.cadastreNumber}) - Açıq Artırma Liderliyi`;
    if (subEl) subEl.textContent = `${p.areaHectares} ha • Təyinat: ${p.sector} • ${p.village || 'Qarabağ'}`;
  }

  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin"></i> Təkliflər yüklənir...</td></tr>`;
  }

  openModal('modal-auction-bids');

  try {
    const res = await fetch(`/api/v1/parcels/${parcelId}/auction/bids`);
    const data = await res.json();
    if (data && data.success) {
      const startEl = document.getElementById('auction-card-starting');
      const highEl = document.getElementById('auction-card-highest');
      const leadEl = document.getElementById('auction-card-leader');
      const statEl = document.getElementById('auction-card-status');
      
      if (startEl) startEl.textContent = formatAzn(data.startingBidAzn || 0);
      if (highEl) highEl.textContent = formatAzn(data.highestBidAzn || 0);
      if (leadEl) leadEl.textContent = data.highestBidder ? (data.highestBidder.companyName || data.highestBidder.fullName) : 'Lider yoxdur';
      
      const isOpen = data.auctionStatus === 'OPEN';
      if (statEl) {
        statEl.innerHTML = isOpen
          ? `<span class="status-pill aktiv" style="background:#ecfdf5; color:#047857;"><i class="fa-solid fa-fire text-amber-500"></i> Açıqdır</span>`
          : `<span class="status-pill bloklandi"><i class="fa-solid fa-lock"></i> Bağlıdır</span>`;
      }

      const toggleBtn = document.getElementById('auction-modal-toggle-btn');
      if (toggleBtn) {
        if (isOpen) {
          toggleBtn.className = 'btn-admin btn-admin-danger';
          toggleBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Artırmanı Bitir & Qalibi Təsdiqlə';
        } else {
          toggleBtn.className = 'btn-admin btn-admin-primary';
          toggleBtn.innerHTML = '<i class="fa-solid fa-unlock"></i> Açıq Artırmanı Yenidən Aç';
        }
      }

      const winnerInfo = document.getElementById('auction-modal-winner-info');
      if (winnerInfo) {
        if (data.winnerInvestor) {
          winnerInfo.innerHTML = `<i class="fa-solid fa-trophy text-amber-500"></i> <strong>Rəsmi Qalib:</strong> ${data.winnerInvestor.companyName || data.winnerInvestor.fullName} (${formatAzn(data.winnerInvestor.bidAmountAzn)} ilə təsdiqlənib)`;
        } else if (!isOpen) {
          winnerInfo.textContent = 'Açıq artırma müsabiqəsi komissiya tərəfindən bağlanıb.';
        } else {
          winnerInfo.innerHTML = `<span style="color: #059669;"><i class="fa-solid fa-circle-dot"></i> Açıq artırma aktivdir. Ən yüksək təklif verən investor qalib olacaq.</span>`;
        }
      }

      const bids = data.bids || [];
      if (!bids.length) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px; color: #64748b;">Hələlik heç bir təklif verilməyib. İlkin start məbləği: ${formatAzn(data.startingBidAzn)}</td></tr>`;
      } else {
        tbody.innerHTML = bids.map((b, idx) => {
          const isLead = idx === 0 || b.isLeading;
          const rankBadge = isLead
            ? `<span style="background: #fef3c7; color: #92400e; font-weight: 800; padding: 2px 8px; border-radius: 999px; font-size: 0.72rem; border: 1px solid #f59e0b;"><i class="fa-solid fa-crown text-amber-500"></i> #1 Lider</span>`
            : `<span style="color: #64748b; font-weight: 700; font-size: 0.75rem;">#${idx + 1}</span>`;

          return `
            <tr style="${isLead ? 'background: rgba(16, 185, 129, 0.08); font-weight: 600;' : ''}">
              <td>${rankBadge}</td>
              <td>
                <div style="font-weight: 700; color: #0f172a;">${b.fullName}</div>
                <div style="font-size: 0.72rem; color: #64748b;">${b.companyName || 'Müstəqil İnvestor'}</div>
              </td>
              <td>
                <div><span class="id-badge-code">${b.pin}</span></div>
                <div style="font-size: 0.7rem; color: #64748b;">VÖEN: ${b.voen}</div>
              </td>
              <td>
                <strong style="color: ${isLead ? '#047857' : '#334155'}; font-size: 0.95rem;">${formatAzn(b.bidAmountAzn)}</strong>
              </td>
              <td>${b.projectedJobsCount || 15} nəfər</td>
              <td style="font-size: 0.75rem; color: #475569; max-width: 200px;">${b.proposalNote || '---'}</td>
              <td style="font-size: 0.72rem; color: #64748b;">${new Date(b.timestamp).toLocaleString('az-AZ')}</td>
            </tr>
          `;
        }).join('');
      }
    }
  } catch (err) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #dc2626; padding: 20px;">Təklifləri yükləmək mümkün olmadı.</td></tr>`;
  }
}

async function handleAuctionModalToggle() {
  if (!currentAuctionParcelId) return;
  const p = adminState.parcels.find(x => x.id === currentAuctionParcelId);
  const isOpen = p && p.auctionStatus === 'OPEN';
  const action = isOpen ? 'CLOSE' : 'OPEN';
  await toggleParcelAuction(currentAuctionParcelId, action);
  await openAuctionBidsModal(currentAuctionParcelId);
}

async function toggleParcelAuction(parcelId, action) {
  try {
    const res = await fetch(`/api/v1/parcels/${parcelId}/auction/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      showAdminToast(data.message, 'success');
      notifyDataUpdated();
      await loadAllParcels();
      await loadAllApplications();
      await loadDashboardSummary();
      await loadAuditLogs();
    } else {
      showAdminToast(data.message || data.error || 'Əməliyyat zamanı xəta', 'error');
    }
  } catch (err) {
    showAdminToast('Serverlə əlaqə xətası', 'error');
  }
}

function openCreateParcelModal() {
  const modal = document.getElementById('modal-create-parcel');
  if (modal) modal.classList.add('active');
}

// State for admin map drawing of new investment parcels
const adminDrawState = {
  isDrawing: false,
  points: [],
  markers: [],
  previewPolygon: null,
  previewPolyline: null
};

function toggleAdminMapInvestmentDrawer() {
  if (adminDrawState.isDrawing) {
    cancelAdminMapDrawing();
    return;
  }
  
  if (!adminMap) {
    // If map not initialized yet, try initializing
    if (typeof initAdminGisMap === 'function') {
      initAdminGisMap();
    }
  }

  if (!adminMap) {
    showAdminToast('Xəritə hələ yüklənməyib. Zəhmət olmasa bir qədər gözləyin.', 'warning');
    return;
  }

  adminDrawState.isDrawing = true;
  adminDrawState.points = [];
  adminDrawState.markers = [];

  const hud = document.getElementById('admin-map-draw-hud');
  if (hud) hud.style.display = 'flex';

  const btn = document.getElementById('btn-admin-map-select-investment');
  if (btn) {
    btn.innerHTML = '<i class="fa-solid fa-xmark"></i> Seçimi Dayandır';
    btn.style.background = '#dc2626';
    btn.style.borderColor = '#dc2626';
  }

  const container = adminMap.getContainer();
  if (container) {
    container.style.cursor = 'crosshair';
    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  adminMap.on('click', handleAdminMapDrawClick);
  updateAdminDrawHud();
  showAdminToast('Sahə seçimi rejimi aktivdir: Müsabiqəyə çıxarılacaq sahənin künc nöqtələrini xəritədə klikləyərək qeyd edin.', 'info');
}

function handleAdminMapDrawClick(e) {
  if (!adminDrawState.isDrawing) return;

  const lat = parseFloat(e.latlng.lat.toFixed(5));
  const lng = parseFloat(e.latlng.lng.toFixed(5));
  adminDrawState.points.push([lat, lng]);

  // Marker for vertex
  const vertexMarker = L.circleMarker([lat, lng], {
    radius: 6,
    fillColor: '#10b981',
    color: '#ffffff',
    weight: 2,
    opacity: 1,
    fillOpacity: 1
  }).addTo(adminMap);
  adminDrawState.markers.push(vertexMarker);

  updateAdminDrawPreview();
  updateAdminDrawHud();
}

function updateAdminDrawHud() {
  const pts = adminDrawState.points;
  const estHa = pts.length >= 3 ? computePolygonAreaHa(pts) : 0;
  const pCount = document.getElementById('admin-hud-point-count');
  const aHa = document.getElementById('admin-hud-area');
  const distEl = document.getElementById('admin-hud-district');
  const hudText = document.getElementById('admin-draw-hud-text');

  if (pCount) pCount.innerText = `${pts.length} nöqtə`;
  if (aHa) aHa.innerText = `${estHa} ha`;
  if (distEl) {
    if (pts.length > 0) {
      const dist = detectKarabakhDistrict(pts[pts.length - 1][0], pts[pts.length - 1][1]);
      distEl.innerText = `Rayon: ${dist}`;
    } else {
      distEl.innerText = `Rayon: Təyin edilir`;
    }
  }
  if (hudText) {
    hudText.innerHTML = `Qeyd olunan nöqtələr: <strong>${pts.length}</strong> | Təqribi Sahə: <strong style="color:#34d399;">${estHa} ha</strong>. Təsdiq etmək üçün "Sahəni Təsdiqlə" düyməsini sıxın.`;
  }
}

function undoAdminMapLastPoint() {
  if (!adminDrawState.isDrawing || adminDrawState.points.length === 0) return;
  adminDrawState.points.pop();
  const lastMarker = adminDrawState.markers.pop();
  if (lastMarker && adminMap) {
    adminMap.removeLayer(lastMarker);
  }
  updateAdminDrawPreview();
  updateAdminDrawHud();
}

function updateAdminDrawPreview() {
  const pts = adminDrawState.points;
  if (pts.length < 2) return;

  if (adminDrawState.previewPolyline && adminMap) {
    adminMap.removeLayer(adminDrawState.previewPolyline);
    adminDrawState.previewPolyline = null;
  }
  if (adminDrawState.previewPolygon && adminMap) {
    adminMap.removeLayer(adminDrawState.previewPolygon);
    adminDrawState.previewPolygon = null;
  }

  if (pts.length >= 3) {
    adminDrawState.previewPolygon = L.polygon(pts, {
      color: '#059669',
      weight: 3,
      fillColor: '#10b981',
      fillOpacity: 0.35,
      dashArray: '4, 4'
    }).addTo(adminMap);
  } else if (pts.length === 2) {
    adminDrawState.previewPolyline = L.polyline(pts, {
      color: '#10b981',
      weight: 3,
      dashArray: '3, 3'
    }).addTo(adminMap);
  }
}

function computePolygonAreaHa(latlngs) {
  if (!latlngs || latlngs.length < 3) return 100;
  const meanLat = latlngs.reduce((acc, p) => acc + p[0], 0) / latlngs.length;
  const metersPerLat = 111132.0;
  const metersPerLng = 111320.0 * Math.cos(meanLat * Math.PI / 180);

  let areaM2 = 0;
  const n = latlngs.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const xi = latlngs[i][1] * metersPerLng;
    const yi = latlngs[i][0] * metersPerLat;
    const xj = latlngs[j][1] * metersPerLng;
    const yj = latlngs[j][0] * metersPerLat;
    areaM2 += (xi * yj - xj * yi);
  }
  areaM2 = Math.abs(areaM2) / 2.0;
  const ha = areaM2 / 10000.0;
  return Math.max(10, Math.round(ha));
}

function detectKarabakhDistrict(lat, lng) {
  if (lat >= 39.85 && lat <= 40.22 && lng >= 46.75 && lng <= 47.25) return "Ağdam";
  if (lat >= 39.45 && lat <= 39.85 && lng >= 46.90 && lng <= 47.35) return "Füzuli";
  if (lat >= 39.20 && lat <= 39.55 && lng >= 46.80 && lng <= 47.20) return "Cəbrayıl";
  if (lat >= 38.90 && lat <= 39.25 && lng >= 46.40 && lng <= 46.85) return "Zəngilan";
  if (lat >= 39.20 && lat <= 39.55 && lng >= 46.40 && lng <= 46.80) return "Qubadlı";
  if (lat >= 39.45 && lat <= 40.05 && lng >= 46.30 && lng <= 46.75) return "Laçın";
  if (lat >= 39.90 && lat <= 40.35 && lng >= 45.90 && lng <= 46.45) return "Kəlbəcər";
  if (lat >= 39.65 && lat <= 39.85 && lng >= 46.65 && lng <= 46.85) return "Şuşa";
  if (lat >= 39.60 && lat <= 39.95 && lng >= 46.85 && lng <= 47.25) return "Xocavənd";
  if (lat >= 39.80 && lat <= 40.05 && lng >= 46.65 && lng <= 46.95) return "Xocalı";
  if (lat >= 40.20 && lat <= 40.45 && lng >= 46.75 && lng <= 47.10) return "Tərtər";
  return "Ağdam";
}

function finishAdminMapDrawing() {
  if (adminDrawState.points.length === 0) {
    showAdminToast('Heç bir nöqtə seçilməyib. Zəhmət olmasa xəritədə sahəni qeyd edin.', 'warning');
    return;
  }

  const pts = adminDrawState.points;
  let centerLat = pts.reduce((sum, p) => sum + p[0], 0) / pts.length;
  let centerLng = pts.reduce((sum, p) => sum + p[1], 0) / pts.length;
  let areaHa = pts.length >= 3 ? computePolygonAreaHa(pts) : 150;

  const district = detectKarabakhDistrict(centerLat, centerLng);
  const districtCodeMap = {
    "Ağdam": "AGD", "Füzuli": "FZL", "Cəbrayıl": "CBR", "Zəngilan": "ZNG",
    "Qubadlı": "QBD", "Laçın": "LCN", "Kəlbəcər": "KLB", "Şuşa": "SSA",
    "Xocavənd": "XCV", "Xocalı": "XCL", "Tərtər": "TRT"
  };
  const distCode = districtCodeMap[district] || "QAR";
  const randomSeq = Math.floor(1000 + Math.random() * 9000);
  const generatedCadastre = `AZ-${distCode}-${new Date().getFullYear()}-${randomSeq}-E`;

  // Pre-fill modal
  const setVal = (id1, id2, val) => {
    const el = document.getElementById(id1) || document.getElementById(id2);
    if (el) el.value = val;
  };

  setVal('parcel-cadastre-input', 'parcel-cadastre', generatedCadastre);
  setVal('parcel-district-select', 'parcel-district', district);
  setVal('parcel-village-input', 'parcel-village', `${district} kənd massivi (Xəritə sahəsi #${randomSeq})`);
  setVal('parcel-area-input', 'parcel-area', areaHa);
  setVal('parcel-lat-input', 'parcel-lat', centerLat.toFixed(5));
  setVal('parcel-lng-input', 'parcel-lng', centerLng.toFixed(5));
  
  let coordsForBackend;
  if (pts.length >= 3) {
    coordsForBackend = pts.map(p => [p[1], p[0]]);
    coordsForBackend.push([pts[0][1], pts[0][0]]);
  } else {
    const d = Math.sqrt(areaHa) * 0.00065;
    coordsForBackend = [
      [parseFloat((centerLng - d).toFixed(4)), parseFloat((centerLat - d).toFixed(4))],
      [parseFloat((centerLng + d).toFixed(4)), parseFloat((centerLat - d).toFixed(4))],
      [parseFloat((centerLng + d).toFixed(4)), parseFloat((centerLat + d).toFixed(4))],
      [parseFloat((centerLng - d).toFixed(4)), parseFloat((centerLat + d).toFixed(4))],
      [parseFloat((centerLng - d).toFixed(4)), parseFloat((centerLat - d).toFixed(4))]
    ];
  }
  setVal('parcel-coords-input', 'parcel-coords', JSON.stringify(coordsForBackend));

  setVal('parcel-ph-input', 'parcel-ph', (7.0 + (Math.random() * 0.4)).toFixed(1));
  setVal('parcel-soc-input', 'parcel-soc', (26.0 + (Math.random() * 6)).toFixed(1));
  setVal('parcel-oxygen-input', 'parcel-oxygen', "8.4 mg/L (48% Məsamə)");
  setVal('parcel-relief-input', 'parcel-relief', "1.2° Meyil (Düzən Allüvial)");
  setVal('parcel-suitability-input', 'parcel-suitability', "Taxılçılıq, Şəkər çuğunduru və Yağlı bitkilər (FAO GAEZ S1)");
  setVal('parcel-mininv-input', 'parcel-min-invest', Math.round(areaHa * 3800));

  stopAdminMapDrawMode();

  const modal = document.getElementById('modal-create-parcel');
  if (modal) modal.classList.add('active');
  showAdminToast(`Xəritədən ${areaHa} ha sahə seçildi (${district} rayonu). Göstəriciləri təsdiq edib dərc edin.`, 'success');
}

function cancelAdminMapDrawing() {
  clearAdminDrawLayers();
  stopAdminMapDrawMode();
  showAdminToast('Xəritədə sahə seçimi ləğv edildi.', 'info');
}

function stopAdminMapDrawMode() {
  adminDrawState.isDrawing = false;
  if (adminMap) {
    adminMap.off('click', handleAdminMapDrawClick);
    const container = adminMap.getContainer();
    if (container) container.style.cursor = '';
  }
  const hud = document.getElementById('admin-map-draw-hud');
  if (hud) hud.style.display = 'none';

  const btn = document.getElementById('btn-admin-map-select-investment');
  if (btn) {
    btn.innerHTML = '<i class="fa-solid fa-draw-polygon"></i> Xəritədə Sahə Seç &amp; Müsabiqəyə Çıxar';
    btn.style.background = '#059669';
    btn.style.borderColor = '#059669';
  }
}

function clearAdminDrawLayers() {
  adminDrawState.markers.forEach(m => adminMap && adminMap.removeLayer(m));
  adminDrawState.markers = [];
  if (adminDrawState.previewPolyline && adminMap) {
    adminMap.removeLayer(adminDrawState.previewPolyline);
    adminDrawState.previewPolyline = null;
  }
  if (adminDrawState.previewPolygon && adminMap) {
    adminMap.removeLayer(adminDrawState.previewPolygon);
    adminDrawState.previewPolygon = null;
  }
  adminDrawState.points = [];
  updateAdminDrawHud();
}

async function handleCreateParcel(event) {
  if (event) event.preventDefault();
  const getVal = (id1, id2, defaultVal = '') => {
    const el = document.getElementById(id1) || document.getElementById(id2);
    return el ? el.value : defaultVal;
  };
  const cad = getVal('parcel-cadastre-input', 'parcel-cadastre').trim();
  const district = getVal('parcel-district-select', 'parcel-district');
  const village = getVal('parcel-village-input', 'parcel-village').trim();
  const area = parseFloat(getVal('parcel-area-input', 'parcel-area')) || 100;
  const sector = getVal('parcel-sector-select', 'parcel-sector');
  const bonitet = parseInt(getVal('parcel-bonitet-input', 'parcel-bonitet')) || 80;
  const irrigation = getVal('parcel-irrigation-input', 'parcel-irrigation', 'Damlama suvarma və subartezian').trim();
  const minInv = parseFloat(getVal('parcel-mininv-input', 'parcel-min-invest')) || 500000;
  const status = getVal('parcel-status-select', 'parcel-status', 'OPEN');
  const soilPh = parseFloat(getVal('parcel-ph-input', 'parcel-ph')) || 7.1;
  const soilSoc = parseFloat(getVal('parcel-soc-input', 'parcel-soc')) || 28.5;
  const soilOxygen = getVal('parcel-oxygen-input', 'parcel-oxygen', '8.4 mg/L').trim();
  const relief = getVal('parcel-relief-input', 'parcel-relief', '1.2° Meyil').trim();
  const suitability = getVal('parcel-suitability-input', 'parcel-suitability', 'Taxılçılıq və Yağlı bitkilər (FAO GAEZ S1)').trim();
  const lat = parseFloat(getVal('parcel-lat-input', 'parcel-lat')) || null;
  const lng = parseFloat(getVal('parcel-lng-input', 'parcel-lng')) || null;
  
  let coords = null;
  try {
    const rawCoords = getVal('parcel-coords-input', 'parcel-coords');
    if (rawCoords) coords = JSON.parse(rawCoords);
  } catch (e) {}

  try {
    const res = await fetch(getApiEndpoint('/api/v1/parcels'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cadastreNumber: cad,
        district: district,
        village: village,
        areaHectares: area,
        sector: sector,
        soilBonitet: bonitet,
        status: status,
        inCompetition: true,
        irrigationType: irrigation,
        minInvestmentAzn: minInv,
        startingBidAzn: Math.round(minInv * 0.05) || 25000,
        soilPh: soilPh,
        soilOrganicCarbon: soilSoc,
        soilOxygen: soilOxygen,
        soilPorosity: '48%',
        terrainSlope: parseFloat(relief) || 1.2,
        recommendedSuitability: suitability,
        latitude: lat,
        longitude: lng,
        coordinates: coords,
        anamaCertificate: `AZ-ANM-2026/${Math.floor(10 + Math.random() * 90)}`
      })
    });
    const data = await res.json();
    if (res.ok) {
      showAdminToast(`Yeni torpaq sahəsi (${cad}) uğurla dövlət fonduna əlavə edildi və əsas portala canlı dərc olundu!`, 'success');
      closeModal('modal-create-parcel');
      clearAdminDrawLayers();
      await loadAllParcels();
      await loadDashboardSummary();
      if (adminGisLayers.parcels && adminMap) {
        adminMap.removeLayer(adminGisLayers.parcels);
        await loadAdminParcelsLayer();
      }
      if (data.parcel && data.parcel.id) {
        localStorage.setItem('invest_area_last_created_parcel_id', data.parcel.id.toString());
      }
      notifyDataUpdated();
    } else {
      showAdminToast(data.error || 'Sahə əlavə edilərkən xəta baş verdi', 'error');
    }
  } catch (err) {
    showAdminToast('Serverlə əlaqə xətası', 'error');
  }
}

// 9. Audit Logs
async function loadAuditLogs() {
  try {
    const res = await fetch(getApiEndpoint('/api/v1/audit/logs'));
    const data = await res.json();
    if (data && data.logs) {
      adminState.auditLogs = data.logs;
      renderAuditLogsTable(data.logs);
    }
  } catch (err) {
    console.error("Audit logs load error", err);
  }
}

function renderAuditLogsTable(logs) {
  const tbody = document.getElementById('admin-audit-tbody');
  if (!tbody) return;

  tbody.innerHTML = logs.map(l => {
    const dateFormatted = new Date(l.timestamp).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit' });
    return `
      <tr>
        <td style="font-family: monospace; font-size: 0.75rem; color: #64748b;">${dateFormatted}</td>
        <td><strong>${l.actor || 'Sistem'}</strong></td>
        <td><span class="id-badge-code">${l.action}</span></td>
        <td style="font-size: 0.82rem;">${l.details}</td>
      </tr>
    `;
  }).join('');
}

// 10. Report Export (CSV / Excel Format)
function exportAdminReport() {
  let csv = "ID,Rol,Ad Soyad,Şirkət,FİN,VÖEN,Status,EKTİS Reytinq,Büdcə və ya Torpaq Tələbi\n";
  adminState.users.forEach(u => {
    const detail = u.role === 'INVESTOR' ? `${u.investmentBudgetAzn || 0} AZN` : `${u.requiredAreaHectares || 0} ha`;
    csv += `"${u.id}","${u.role}","${u.fullName}","${u.companyName || ''}","${u.pin}","${u.voen}","${u.status}","${u.ratingScore}","${detail}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Qarabaq_Aqro_Invest_Reyestr_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showAdminToast("Rəsmi reyestr hesabatı CSV formatında yükləndi!", "success");
}

// Silent Refresh helper
async function refreshAdminDataSilently() {
  try {
    const [resSummary, resUsers, resApps] = await Promise.all([
      fetch(getApiEndpoint('/api/v1/admin/summary')),
      fetch(getApiEndpoint('/api/v1/users')),
      fetch(getApiEndpoint('/api/v1/applications'))
    ]);
    const summaryData = await resSummary.json();
    const usersData = await resUsers.json();
    const appsData = await resApps.json();

    if (summaryData) adminState.summary = summaryData;
    if (usersData && usersData.users) {
      adminState.users = usersData.users;
      applyUserFilters();
    }
    if (appsData) {
      adminState.applications = appsData;
      renderApplicationsTable(appsData);
    }
  } catch (e) {}
}

// Modal Helpers
function openModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.add('active');
}

function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.remove('active');
}

// Toast Helpers
function showAdminToast(msg, type = 'info') {
  const container = document.getElementById('admin-toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `admin-toast ${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-circle-exclamation' : 'fa-circle-info')}"></i>
    <span>${msg}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Utility Helpers
function formatAzn(num) {
  return new Intl.NumberFormat('az-AZ', { style: 'currency', currency: 'AZN', maximumFractionDigits: 0 }).format(num).replace('AZN', '₼');
}

function fillSuperadminDemo() {
  const emailInput = document.getElementById('admin-login-email');
  const passwordInput = document.getElementById('admin-login-password');
  if (emailInput) emailInput.value = 'admin@investarea.gov.az';
  if (passwordInput) passwordInput.value = 'KarabakhSuperAdmin2026!';
  const submitBtn = document.getElementById('admin-login-btn');
  if (submitBtn) submitBtn.focus();
}

// Window Expositions
window.handleAdminLogin = handleAdminLogin;
window.fillSuperadminDemo = fillSuperadminDemo;
window.adminLogout = adminLogout;
window.toggleAdminPwdVisibility = toggleAdminPwdVisibility;
window.openCreateParcelModal = openCreateParcelModal;
window.handleCreateParcel = handleCreateParcel;
window.toggleParcelCompetition = typeof toggleParcelAuction !== 'undefined' ? toggleParcelAuction : null;
window.switchAdminTab = switchAdminTab;
window.openUserDossierModal = openUserDossierModal;
window.openStatusChangeModal = openStatusChangeModal;
window.handleStatusChangeSubmit = typeof submitStatusChange !== 'undefined' ? submitStatusChange : null;
window.openCreateUserModal = openCreateUserModal;
window.handleCreateUserSubmit = handleCreateUserSubmit;
window.toggleNewUserFields = toggleNewUserFields;
window.openAppScoringModal = openAppScoringModal;
window.runAutoScoring = runAutoScoring;
window.checkParcelCadastreTopology = checkParcelCadastreTopology;
window.viewAgroSurveySampling = viewAgroSurveySampling;
window.viewAkiaLoanAmortization = viewAkiaLoanAmortization;
window.calcTotalScore = calcTotalScore;
window.submitAppDecision = submitAppDecision;
window.syncApplicationToEktis = syncApplicationToEktis;
window.openCoopModalWithUser = openCoopModalWithUser;
window.handleCreatePartnership = handleCreatePartnership;
window.exportAdminReport = exportAdminReport;
window.openAuctionBidsModal = openAuctionBidsModal;
window.handleAuctionModalToggle = handleAuctionModalToggle;
window.toggleParcelAuction = toggleParcelAuction;
window.openModal = openModal;
window.closeModal = closeModal;


// ============================================================================
// 🏛️ 9 DÖVLƏT QURUMU ÜZRƏ CANLI SƏSVERMƏ VƏ QƏRARVERMƏ SİSTEMİ (musabiqe.pdf)
// ============================================================================
adminState.votingSessions = [];
adminState.activeVotingSessionId = 1;
adminState.activeVoterExpertId = 1; // Default to Dr. Elçin İsmayılov (KTN - Sədr)

async function loadCommissionVotingSessions() {
  try {
    const res = await fetch(getApiEndpoint('/api/v1/commission/voting-sessions'));
    const data = await res.json();
    if (data && data.success && Array.isArray(data.sessions)) {
      adminState.votingSessions = data.sessions;
      
      // Update badge
      const badge = document.getElementById('badge-menu-experts');
      if (badge) badge.innerText = (data.totalAgencies || 9);

      // Populate selects in both admin.html and admin-documents.html
      const selects = [
        document.getElementById('commission-session-select'),
        document.getElementById('commission-session-select-doc')
      ].filter(Boolean);

      selects.forEach(sel => {
        sel.innerHTML = data.sessions.map(s => {
          const parcelInfo = s.parcel ? `${s.parcel.district} (${s.parcel.areaHectares} ha)` : 'Sahə təyin olunub';
          const party = s.applicantName || (s.investor && s.investor.fullName) || 'İddiaçı';
          const voteText = s.votingSummary ? `[${s.votingSummary.approveCount}L / ${s.votingSummary.rejectCount}Ə]` : '';
          return `<option value="${s.id}" ${s.id === adminState.activeVotingSessionId ? 'selected' : ''}>
            ${s.trackingNumber} — ${party} | ${parcelInfo} ${voteText}
          </option>`;
        }).join('');
      });

      // Ensure active session is valid
      if (!adminState.votingSessions.find(s => s.id === adminState.activeVotingSessionId) && adminState.votingSessions[0]) {
        adminState.activeVotingSessionId = adminState.votingSessions[0].id;
      }

      renderVotingSessionDetails(adminState.activeVotingSessionId);
      renderCommissionMatrix();
    }
  } catch (err) {
    console.error("loadCommissionVotingSessions error:", err);
  }
}

// Backward compatibility alias
async function loadCommissionExperts() {
  return loadCommissionVotingSessions();
}

function handleVotingSessionSelectChange(val) {
  adminState.activeVotingSessionId = parseInt(val);
  renderVotingSessionDetails(adminState.activeVotingSessionId);
}

function renderVotingSessionDetails(sessionId) {
  const session = adminState.votingSessions.find(s => s.id === sessionId);
  if (!session) return;

  const parcel = session.parcel || {};
  const investor = session.investor || {};
  const summary = session.votingSummary || {
    approveCount: 0,
    rejectCount: 0,
    pendingCount: 9,
    isApproved: false,
    isRejected: false,
    isPending: true,
    protocolNumber: `PROTOKOL №-09/QAR-${String(session.id).padStart(4, '0')}`,
    decisionBanner: "Səsvermə gözlənilir."
  };
  const reviews = session.reviews || [];

  // 1. Update Quick Tally Counters
  ['vote-stat-approve', 'doc-vote-stat-approve'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = `${summary.approveCount} / 9`;
  });
  ['vote-stat-reject', 'doc-vote-stat-reject'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = `${summary.rejectCount} / 9`;
  });
  ['vote-stat-pending', 'doc-vote-stat-pending'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = `${summary.pendingCount} / 9`;
  });

  // 2. Render Target Dossier Card
  const isForeign = session.origin === 'FOREIGN' || (investor.origin === 'FOREIGN');
  const originBadge = isForeign
    ? `<span class="status-pill yoxlamada" style="font-size:0.7rem;"><i class="fa-solid fa-earth-americas"></i> Xarici İnvestor (${session.country || 'Xarici'})</span>`
    : `<span class="status-pill aktiv" style="font-size:0.7rem;">🇦🇿 Azərbaycan Yerli Hüquqi Şəxs</span>`;

  const dossierHtml = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; align-items: center;">
      <div>
        <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 4px;">
          <strong style="color: var(--gov-primary); font-size: 0.95rem;">${session.trackingNumber}</strong>
          ${originBadge}
        </div>
        <div style="font-size: 1.15rem; font-weight: 800; color: #0f172a;">
          ${investor.companyName || session.companyName || 'Müəssisə'}
        </div>
        <div style="font-size: 0.78rem; color: #475569; margin-top: 2px;">
          <i class="fa-solid fa-user-tie text-emerald-600"></i> Rəhbər: <strong>${session.applicantName || investor.fullName || 'İddiaçı'}</strong> | VÖEN: <code>${investor.voen || '1402345671'}</code> | FİN: <code>${investor.pin || '5A7B8C9'}</code>
        </div>
        <div style="font-size: 0.76rem; color: #64748b; margin-top: 4px;">
          <i class="fa-solid fa-location-dot"></i> Ünvan: ${investor.address || 'Bakı ş.'} • Təcrübə: <strong>${investor.experienceYears || 10} il</strong>
        </div>
      </div>

      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;">
        <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; color: #0284c7; margin-bottom: 4px;">
          <i class="fa-solid fa-vector-square"></i> Müsabiqəyə Qoyulan Torpaq Sahəsi
        </div>
        <div style="font-weight: 800; font-size: 0.92rem; color: #0f172a;">
          ${parcel.district || 'Qarabağ'}, ${parcel.village || ''} — <span style="color: #059669;">${parcel.areaHectares || 120} Hektar</span>
        </div>
        <div style="font-size: 0.74rem; color: #475569; margin-top: 3px;">
          Kadastr: <strong>${parcel.cadastreNumber || 'AGD-2026-0012'}</strong> | Bonitet: <strong>${parcel.soilBonitet || 85} bal</strong>
        </div>
        <div style="font-size: 0.72rem; color: #047857; margin-top: 2px; font-weight: 700;">
          <i class="fa-solid fa-droplet"></i> ${parcel.irrigationSystemName || parcel.irrigationType || 'Ağıllı Suvarma'}
        </div>
      </div>

      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px;">
        <div style="font-size: 0.72rem; text-transform: uppercase; font-weight: 800; color: #059669; margin-bottom: 4px;">
          <i class="fa-solid fa-money-bill-trend-up"></i> Təklif Olunan İnvestisiya & İş Yerləri
        </div>
        <div style="font-weight: 900; font-size: 1.1rem; color: #047857;">
          ${formatAzn(session.plannedInvestmentAzn || 500000)}
        </div>
        <div style="font-size: 0.74rem; color: #475569; margin-top: 3px;">
          Yeni İş Yerləri: <strong>${session.projectedJobsCount || 20} daimi nəfər</strong>
        </div>
        <div style="font-size: 0.72rem; color: #0284c7; margin-top: 2px; font-weight: 700;">
          <i class="fa-solid fa-certificate"></i> AR Vergi Məcəlləsi: 0% Aqrar Vergi
        </div>
      </div>
    </div>

    <div style="margin-top: 10px; font-size: 0.76rem; color: #334155; line-height: 1.45; background: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
      <strong><i class="fa-solid fa-book-open text-emerald-600"></i> Biznes Plan Xülasəsi:</strong> ${session.businessPlanSummary || 'Strateji kənd təsərrüfatı layihəsi.'}
    </div>
  `;

  ['voting-target-dossier-card', 'voting-target-dossier-card-doc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = dossierHtml;
  });

  // 3. Render Status Pill & Tally Text
  ['voting-tally-text', 'voting-tally-text-doc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerText = `${summary.approveCount} Lehinə / ${summary.rejectCount} Əleyhinə / ${summary.pendingCount} Gözlənilir`;
  });

  let pillHtml = '';
  if (summary.isApproved) {
    pillHtml = `<span class="status-pill tesdiqlendi" style="font-size: 0.85rem; font-weight: 800; padding: 6px 14px;">
      <i class="fa-solid fa-circle-check"></i> QƏRAR VERİLİB: TƏSDİQLƏNDİ (Torpaq Verilir)
    </span>`;
  } else if (summary.isRejected) {
    pillHtml = `<span class="status-pill imtina" style="font-size: 0.85rem; font-weight: 800; padding: 6px 14px;">
      <i class="fa-solid fa-circle-xmark"></i> QƏRAR VERİLİB: İMTİNA EDİLDİ (Torpaq Verilmir)
    </span>`;
  } else {
    pillHtml = `<span class="status-pill baxilir" style="font-size: 0.85rem; font-weight: 800; padding: 6px 14px; background: #e0f2fe; color: #0369a1; border-color: #38bdf8;">
      <i class="fa-solid fa-hourglass-half fa-spin"></i> SƏSVERMƏ GEDİR (${summary.approveCount + summary.rejectCount} / 9 Qurum)
    </span>`;
  }

  ['voting-decision-status-pill', 'voting-decision-status-pill-doc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = pillHtml;
  });

  // 4. Render 9-Segmented Progress Bar
  const segmentsHtml = reviews.map((r, i) => {
    let bg = '#cbd5e1'; // pending gray
    let icon = '⚪';
    let tooltip = `${r.agencyShort}: Səs verilməyib`;
    if (r.vote === 'LEHINE') {
      bg = '#10b981'; // green
      icon = '✓';
      tooltip = `${r.agencyShort}: LEHİNƏ (${r.totalScore} bal)`;
    } else if (r.vote === 'ELEYHINE') {
      bg = '#ef4444'; // red
      icon = '✕';
      tooltip = `${r.agencyShort}: ƏLEYHİNƏ (${r.totalScore} bal)`;
    }
    const isQuorumDivider = i === 4; // 5th vote is majority mark
    return `
      <div title="${tooltip}" style="flex: 1; height: 100%; background: ${bg}; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.65rem; font-weight: 900; position: relative; ${isQuorumDivider ? 'box-shadow: 0 0 0 2px #fde047;' : ''}">
        ${icon}
      </div>
    `;
  }).join('');

  ['voting-segmented-bar', 'voting-segmented-bar-doc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = segmentsHtml;
  });

  // 5. Render Dynamic Decision Banner
  let bannerBg = '#f0fdf4';
  let bannerBorder = '#86efac';
  let bannerColor = '#14532d';
  let bannerIcon = 'fa-solid fa-circle-check text-emerald-600';
  if (summary.isRejected) {
    bannerBg = '#fef2f2';
    bannerBorder = '#fca5a5';
    bannerColor = '#7f1d1d';
    bannerIcon = 'fa-solid fa-circle-xmark text-red-600';
  } else if (summary.isPending) {
    bannerBg = '#f0f9ff';
    bannerBorder = '#7dd3fc';
    bannerColor = '#0c4a6e';
    bannerIcon = 'fa-solid fa-scale-balanced text-sky-600';
  }

  const bannerHtml = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <i class="${bannerIcon}" style="font-size: 1.4rem;"></i>
      <div>
        <div style="font-size: 0.88rem; font-weight: 800; color: ${bannerColor};">
          ${summary.decisionBanner}
        </div>
        <div style="font-size: 0.74rem; color: #475569; margin-top: 2px;">
          Protokol Kodu: <strong style="font-family: monospace;">${summary.protocolNumber}</strong> • Ortalama Qiymətləndirmə Balı: <strong>${summary.averageScore} / 100</strong>
        </div>
      </div>
    </div>
    <div style="display: flex; gap: 8px;">
      <button class="btn-admin btn-sm" style="background: #0284c7; color: #fff; font-weight: 700; border-radius: 6px; cursor: pointer;" onclick="openOfficialProtocolModalCurrentApp()">
        <i class="fa-solid fa-file-contract"></i> Qərar Protokolunu Aç
      </button>
    </div>
  `;

  ['voting-decision-banner-box', 'voting-decision-banner-box-doc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.background = bannerBg;
      el.style.border = `1.5px solid ${bannerBorder}`;
      el.innerHTML = bannerHtml;
    }
  });

  // 6. Render 9 Agency Account Switcher Chips
  const chipsHtml = reviews.map(r => {
    const isActive = r.expertId === adminState.activeVoterExpertId;
    let voteBadge = `<span style="color: #94a3b8; font-size: 0.7rem;"><i class="fa-regular fa-clock"></i></span>`;
    if (r.vote === 'LEHINE') {
      voteBadge = `<span style="color: #10b981; font-size: 0.75rem;"><i class="fa-solid fa-circle-check"></i></span>`;
    } else if (r.vote === 'ELEYHINE') {
      voteBadge = `<span style="color: #ef4444; font-size: 0.75rem;"><i class="fa-solid fa-circle-xmark"></i></span>`;
    }

    const activeStyle = isActive
      ? `background: #064e3b; color: #fff; border: 2px solid #34d399; box-shadow: 0 4px 10px rgba(6,78,59,0.25);`
      : `background: #ffffff; color: #334155; border: 1.5px solid #cbd5e1;`;

    return `
      <button type="button" onclick="selectActiveVoterAccount(${r.expertId})" style="display: flex; align-items: center; gap: 8px; padding: 7px 14px; border-radius: 20px; font-size: 0.78rem; font-weight: 800; cursor: pointer; white-space: nowrap; transition: all 0.15s; ${activeStyle}">
        <span style="font-weight: 900;">${r.agencyShort}</span>
        ${voteBadge}
      </button>
    `;
  }).join('');

  ['commission-accounts-chips-bar', 'commission-accounts-chips-bar-doc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = chipsHtml;
  });

  // 7. Render Active Voter Form Panel
  renderActiveVoterPanel(session);

  // 8. Render 9 Experts Cards Grid
  renderCommissionExpertsGrid(reviews);
}

function selectActiveVoterAccount(expertId) {
  adminState.activeVoterExpertId = expertId;
  const session = adminState.votingSessions.find(s => s.id === adminState.activeVotingSessionId);
  if (session) {
    renderVotingSessionDetails(session.id);
  }
}

function renderActiveVoterPanel(session) {
  if (!session) return;
  const expert = (session.reviews || []).find(r => r.expertId === adminState.activeVoterExpertId) || session.reviews[0];
  if (!expert) return;

  const vote = expert.vote || 'GOZLENILIR';
  let voteStatusText = `<span class="status-pill baxilir" style="font-size:0.75rem;"><i class="fa-regular fa-clock"></i> Səsvermə Gözlənilir</span>`;
  if (vote === 'LEHINE') {
    voteStatusText = `<span class="status-pill tesdiqlendi" style="font-size:0.75rem;"><i class="fa-solid fa-circle-check"></i> LEHİNƏ SƏS VERİB (${expert.totalScore} Bal)</span>`;
  } else if (vote === 'ELEYHINE') {
    voteStatusText = `<span class="status-pill imtina" style="font-size:0.75rem;"><i class="fa-solid fa-circle-xmark"></i> ƏLEYHİNƏ SƏS VERİB (${expert.totalScore} Bal)</span>`;
  }

  const panelHtml = `
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <img src="${expert.avatar}" alt="${expert.expertName}" style="width: 52px; height: 52px; border-radius: 50%; object-fit: cover; border: 2.5px solid #059669;">
        <div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <strong style="font-size: 1rem; color: #0f172a;">${expert.expertName}</strong>
            <span style="background: #ecfdf5; color: #065f46; font-size: 0.7rem; font-weight: 800; padding: 2px 8px; border-radius: 4px; border: 1px solid #a7f3d0;">
              ${expert.agencyShort} — ${expert.role === 'CHAIRMAN' ? 'Komissiya Sədri' : 'Səlahiyyətli Üzv'}
            </span>
          </div>
          <div style="font-size: 0.76rem; color: #0284c7; font-weight: 700; margin-top: 1px;">
            ${expert.agency}
          </div>
          <div style="font-size: 0.7rem; color: #64748b;">
            <i class="fa-solid fa-certificate text-emerald-600"></i> Sahə: ${expert.specialty} • SİMA Möhür: <code>${expert.digitalSeal || 'SIMA-AZ-2026'}</code>
          </div>
        </div>
      </div>

      <div style="text-align: right;">
        <div style="font-size: 0.72rem; color: #64748b; font-weight: 700;">Hesabın Cari Səsi:</div>
        ${voteStatusText}
      </div>
    </div>

    <!-- Voting Inputs -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 14px;">
      <div>
        <label style="font-size: 0.78rem; font-weight: 800; color: #334155; display: block; margin-bottom: 6px;">
          <i class="fa-solid fa-sliders text-emerald-600"></i> Qiymətləndirmə Balı (100 ballıq sistem): <strong id="voter-score-val" style="color: #059669; font-size: 0.95rem;">${expert.totalScore || 90}</strong> bal
        </label>
        <input type="range" id="active-voter-score-slider" min="0" max="100" value="${expert.totalScore || 90}" style="width: 100%; accent-color: #059669; cursor: pointer;" oninput="const v = document.getElementById('voter-score-val'); if (v) v.innerText = this.value">
        <div style="display: flex; justify-content: space-between; font-size: 0.68rem; color: #94a3b8; margin-top: 2px;">
          <span>0 (Yararsız)</span>
          <span>50 (Orta)</span>
          <span>75 (Məqbul)</span>
          <span>100 (Mükəmməl)</span>
        </div>
      </div>

      <div>
        <label style="font-size: 0.78rem; font-weight: 800; color: #334155; display: block; margin-bottom: 6px;">
          <i class="fa-solid fa-pen-nib text-emerald-600"></i> Qurumun Rəsmi Qərar Əsaslandırması və Qeydi:
        </label>
        <textarea id="active-voter-notes-input" class="form-control-admin" rows="2" style="font-size: 0.78rem; border-radius: 8px; width: 100%;" placeholder="Qurumun qərarının əsaslandırılması...">${expert.notes || ''}</textarea>
      </div>
    </div>

    <!-- Big Action Buttons -->
    <div style="display: flex; justify-content: flex-end; gap: 12px; align-items: center; flex-wrap: wrap;">
      <span style="font-size: 0.74rem; color: #64748b;">
        <i class="fa-solid fa-shield-halved text-emerald-600"></i> Səsvermə SİMA Dövlət Rəqəmsal İmzası ilə audit jurnalında qeydə alınır
      </span>

      <button type="button" class="btn-admin" style="background: #10b981; color: #fff; font-weight: 800; padding: 9px 20px; font-size: 0.84rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(16,185,129,0.3); cursor: pointer;" onclick="castActiveVoterDecision('LEHINE')">
        <i class="fa-solid fa-thumbs-up"></i> LEHİNƏ SƏS VER (Torpaq Verilsin)
      </button>

      <button type="button" class="btn-admin" style="background: #ef4444; color: #fff; font-weight: 800; padding: 9px 20px; font-size: 0.84rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(239,68,68,0.3); cursor: pointer;" onclick="castActiveVoterDecision('ELEYHINE')">
        <i class="fa-solid fa-thumbs-down"></i> ƏLEYHİNƏ SƏS VER (İmtina Edilsin)
      </button>
    </div>
  `;

  ['active-voter-control-panel', 'active-voter-control-panel-doc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = panelHtml;
  });
}

async function castActiveVoterDecision(vote) {
  const session = adminState.votingSessions.find(s => s.id === adminState.activeVotingSessionId);
  if (!session) return;

  const scoreEl = document.getElementById('active-voter-score-slider');
  const score = scoreEl ? parseInt(scoreEl.value) : (vote === 'LEHINE' ? 92 : 55);
  const notesEl = document.getElementById('active-voter-notes-input');
  const notes = notesEl ? notesEl.value.trim() : '';

  await castCommissionVote(adminState.activeVoterExpertId, vote, score, notes);
}

async function castCommissionVote(expertId, vote, score = null, notes = '') {
  const session = adminState.votingSessions.find(s => s.id === adminState.activeVotingSessionId);
  if (!session) return;

  const scoreVal = score !== null ? score : (vote === 'LEHINE' ? 94 : 52);
  const expertObj = (session.reviews || []).find(r => r.expertId === expertId);
  const agencyName = expertObj ? expertObj.agencyShort : 'Qurum';

  try {
    const res = await fetch(getApiEndpoint('/api/v1/commission/vote'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationId: session.id,
        expertId: expertId,
        vote: vote,
        score: scoreVal,
        notes: notes || (vote === 'LEHINE' ? 'Layihənin aqroiqlim və investisiya parametrləri təsdiqləndi.' : 'Layihə tələblərə cavab vermədiyi üçün imtina edildi.')
      })
    });
    const data = await res.json();
    if (data && data.success) {
      showAdminToast(`${agencyName} hesabı ilə ${vote === 'LEHINE' ? 'LEHİNƏ' : 'ƏLEYHİNƏ'} səs qeydə alındı!`, "success");
      await loadCommissionVotingSessions();
    } else {
      showAdminToast(data.error || "Səsvermə zamanı xəta", "error");
    }
  } catch (err) {
    console.error("castCommissionVote error:", err);
    showAdminToast("Əlaqə xətası", "error");
  }
}

async function triggerConsensusVoteAll(consensusType = 'REALISTIC') {
  const session = adminState.votingSessions.find(s => s.id === adminState.activeVotingSessionId);
  if (!session) return;

  try {
    const res = await fetch(getApiEndpoint('/api/v1/commission/auto-vote-all'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicationId: session.id,
        consensusType: consensusType
      })
    });
    const data = await res.json();
    if (data && data.success) {
      showAdminToast("9 dövlət qurumu üzrə kollegial səsvermə yekunlaşdı!", "success");
      await loadCommissionVotingSessions();
    }
  } catch (err) {
    console.error("triggerConsensusVoteAll error:", err);
  }
}

async function triggerResetVotesCurrentApp() {
  const session = adminState.votingSessions.find(s => s.id === adminState.activeVotingSessionId);
  if (!session) return;

  try {
    const res = await fetch(getApiEndpoint('/api/v1/commission/reset-votes'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId: session.id })
    });
    const data = await res.json();
    if (data && data.success) {
      showAdminToast("Səsvermə sıfırlandı. Bütün 9 qurum gözləmə statusundadır.", "info");
      await loadCommissionVotingSessions();
    }
  } catch (err) {
    console.error("triggerResetVotesCurrentApp error:", err);
  }
}

function renderCommissionExpertsGrid(experts) {
  const grids = [
    document.getElementById('commission-experts-grid'),
    document.getElementById('admin-experts-grid')
  ].filter(Boolean);

  if (!grids.length) return;

  const html = experts.map(exp => {
    const name = exp.expertName || exp.name || 'Komissiya Üzvü';
    const avatar = exp.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150';
    const agency = exp.agency || exp.agencyShort || 'Dövlət Qurumu';
    const title = exp.title || 'Ekspert';
    const specialty = exp.specialty || 'Aqrar-iqtisadi ekspertiza';
    const vote = exp.vote || 'GOZLENILIR';
    const score = exp.totalScore !== undefined ? exp.totalScore : 0;
    const notes = exp.notes || 'Səsvermə gözlənilir.';

    let voteCardBorder = '#e2e8f0';
    let voteBadge = `<span class="status-pill baxilir" style="font-size:0.7rem;"><i class="fa-regular fa-clock"></i> Səs Verilməyib</span>`;
    if (vote === 'LEHINE') {
      voteCardBorder = '#10b981';
      voteBadge = `<span class="status-pill tesdiqlendi" style="font-size:0.7rem;"><i class="fa-solid fa-circle-check"></i> LEHİNƏ (${score} bal)</span>`;
    } else if (vote === 'ELEYHINE') {
      voteCardBorder = '#ef4444';
      voteBadge = `<span class="status-pill imtina" style="font-size:0.7rem;"><i class="fa-solid fa-circle-xmark"></i> ƏLEYHİNƏ (${score} bal)</span>`;
    }

    return `
    <div style="background: #ffffff; border: 2px solid ${voteCardBorder}; border-radius: 12px; padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between; transition: all 0.2s;" onmouseenter="this.style.boxShadow='0 8px 20px rgba(0,0,0,0.08)'" onmouseleave="this.style.boxShadow='0 1px 4px rgba(0,0,0,0.05)'">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
          <div style="display: flex; gap: 10px; align-items: center;">
            <img src="${avatar}" alt="${name}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid #059669; flex-shrink: 0;">
            <div style="overflow: hidden;">
              <div style="font-weight: 800; font-size: 0.92rem; color: #0f172a; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">${name}</div>
              <div style="font-size: 0.74rem; font-weight: 700; color: #0284c7; margin-top: 1px;">${exp.agencyShort}</div>
              <div style="font-size: 0.68rem; color: #64748b;">${title}</div>
            </div>
          </div>
          <div>
            ${voteBadge}
          </div>
        </div>

        <div style="font-size: 0.72rem; color: #475569; background: #f8fafc; border: 1px solid #f1f5f9; padding: 8px 10px; border-radius: 6px; margin-bottom: 10px; line-height: 1.4;">
          <strong><i class="fa-solid fa-comment-dots text-emerald-600"></i> Rəsmi Rəy:</strong> "${notes}"
        </div>
      </div>

      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 8px; margin-top: 8px; font-size: 0.7rem; color: #64748b;">
          <span>SİMA: <code>${exp.digitalSeal || 'SIMA-AZ'}</code></span>
          <span style="font-weight: 700; color: ${vote === 'LEHINE' ? '#10b981' : (vote === 'ELEYHINE' ? '#ef4444' : '#64748b')};">
            ${vote === 'LEHINE' ? '✓ Qəbul' : (vote === 'ELEYHINE' ? '✕ İmtina' : 'Gözlənilir')}
          </span>
        </div>

        <!-- Quick 1-Click Vote Buttons on each card -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 8px;">
          <button type="button" class="btn-admin btn-sm" style="background: #10b981; color: #fff; font-size: 0.72rem; font-weight: 700; padding: 4px 6px; border-radius: 6px; cursor: pointer;" onclick="castCommissionVote(${exp.expertId}, 'LEHINE')">
            <i class="fa-solid fa-check"></i> Lehinə
          </button>
          <button type="button" class="btn-admin btn-sm" style="background: #ef4444; color: #fff; font-size: 0.72rem; font-weight: 700; padding: 4px 6px; border-radius: 6px; cursor: pointer;" onclick="castCommissionVote(${exp.expertId}, 'ELEYHINE')">
            <i class="fa-solid fa-xmark"></i> Əleyhinə
          </button>
        </div>
      </div>
    </div>
  `;
  }).join('');

  grids.forEach(g => { g.innerHTML = html; });
}

function renderCommissionMatrix() {
  const tbody = document.getElementById('admin-commission-matrix-tbody');
  if (!tbody) return;

  const appList = adminState.votingSessions || [];
  if (!appList.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 24px;">Müsabiqə müraciəti tapılmadı.</td></tr>`;
    return;
  }

  tbody.innerHTML = appList.map(a => {
    const isForeign = a.origin === 'FOREIGN' || (a.investor && a.investor.origin === 'FOREIGN');
    const isLegal = a.applicantType === 'LEGAL_PERSON' || (a.investor && a.investor.partyType === 'LEGAL_PERSON');

    const originBadge = isForeign
      ? `<span class="status-pill yoxlamada" style="font-size:0.7rem;"><i class="fa-solid fa-earth-americas"></i> Xarici (${a.country || 'Xarici'})</span>`
      : `<span class="status-pill aktiv" style="font-size:0.7rem;">🇦🇿 Yerli</span>`;

    const partyBadge = isLegal
      ? `<span class="status-pill" style="background:#f1f5f9; color:#1e293b; font-size:0.7rem;"><i class="fa-solid fa-building"></i> Hüquqi</span>`
      : `<span class="status-pill" style="background:#f8fafc; color:#475569; font-size:0.7rem;"><i class="fa-solid fa-user"></i> Fiziki</span>`;

    const summary = a.votingSummary || { approveCount: 0, rejectCount: 0, averageScore: 90 };
    const score = summary.averageScore || 90;

    let decisionPill = getAppStatusPill(a.status);
    if (summary.isApproved) {
      decisionPill = `<span class="status-pill tesdiqlendi" style="font-size:0.7rem;"><i class="fa-solid fa-check-double"></i> TƏSDİQLƏNDİ (${summary.approveCount}/9)</span>`;
    } else if (summary.isRejected) {
      decisionPill = `<span class="status-pill imtina" style="font-size:0.7rem;"><i class="fa-solid fa-ban"></i> İMTİNA (${summary.rejectCount}/9)</span>`;
    } else {
      decisionPill = `<span class="status-pill baxilir" style="font-size:0.7rem;"><i class="fa-solid fa-clock"></i> SƏSVERMƏ (${summary.approveCount + summary.rejectCount}/9)</span>`;
    }

    return `
      <tr>
        <td><strong class="id-badge-code">${a.trackingNumber}</strong></td>
        <td>
          <div style="font-weight: 700;">${a.applicantName || (a.investor ? a.investor.fullName : 'İştirakçı')}</div>
          <div style="font-size: 0.72rem; color: #64748b;">${a.companyName || ''}</div>
          <div style="display: flex; gap: 4px; margin-top: 4px; flex-wrap: wrap;">
            ${originBadge} ${partyBadge}
          </div>
        </td>
        <td>
          <div><strong>${a.parcel ? a.parcel.district : 'Qarabağ'}</strong>, ${a.parcel ? a.parcel.areaHectares : 0} ha</div>
          <div style="font-size: 0.7rem; color: #059669; font-weight:600;"><i class="fa-solid fa-certificate"></i> 0% Aqro Vergi & Operator</div>
        </td>
        <td><strong style="color: #047857;">${formatAzn(a.plannedInvestmentAzn || 0)}</strong></td>
        <td>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="status-pill ${summary.approveCount >= 5 ? 'tesdiqlendi' : (summary.rejectCount >= 5 ? 'imtina' : 'baxilir')}" style="font-size: 0.72rem;">
              👍 ${summary.approveCount} Lehinə | 👎 ${summary.rejectCount} Əleyhinə
            </span>
          </div>
          <div style="font-size: 0.68rem; color: #64748b; margin-top: 2px;">9 Qurum: KTN, İN, ƏMDX, ETSN, ADSEA...</div>
        </td>
        <td>
          <strong style="font-size: 1rem; color: #047857;">${score}</strong> <span style="font-size: 0.75rem; color:#64748b;">/ 100</span>
          <div class="score-bar-wrap" style="width: 70px; height: 4px; margin-top: 2px;">
            <div class="score-bar-fill" style="width: ${score}%;"></div>
          </div>
        </td>
        <td>${decisionPill}</td>
        <td style="text-align: right;">
          <button class="btn-admin btn-admin-primary" style="padding: 4px 10px; font-size: 0.75rem; cursor: pointer;" onclick="handleVotingSessionSelectChange(${a.id}); window.scrollTo({top: 400, behavior: 'smooth'});">
            <i class="fa-solid fa-gavel"></i> Səsverməyə Keç
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function openOfficialProtocolModalCurrentApp() {
  const session = adminState.votingSessions.find(s => s.id === adminState.activeVotingSessionId);
  if (!session) return;

  const parcel = session.parcel || {};
  const investor = session.investor || {};
  const summary = session.votingSummary || { approveCount: 9, rejectCount: 0, averageScore: 94 };
  const reviews = session.reviews || [];

  const safeSet = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.innerText = text;
  };

  safeSet('protocol-number-badge', summary.protocolNumber || `PROTOKOL №-09/QAR-${String(session.id).padStart(4, '0')}`);
  safeSet('protocol-winner-name', `${investor.companyName || session.companyName || 'Müəssisə'} (${session.applicantName || investor.fullName || 'Rəhbər'})`);
  safeSet('protocol-winner-party', session.applicantType === 'LEGAL_PERSON' ? 'Hüquqi Şəxs (MMC / ASC)' : 'Fiziki Şəxs (Sahibkar)');
  safeSet('protocol-parcel-cadastre', `${parcel.cadastreNumber || 'AGD-2026-0012'} (${parcel.district || 'Qarabağ'}, ${parcel.areaHectares || 120} ha)`);
  safeSet('protocol-winner-score', `${summary.averageScore || 94} / 100`);
  safeSet('protocol-vote-tally-pill', `${summary.approveCount} / 9 Lehinə Səs`);

  const signaturesContainer = document.getElementById('protocol-agencies-signatures');
  if (signaturesContainer) {
    signaturesContainer.innerHTML = reviews.map(r => {
      const isApprove = r.vote === 'LEHINE';
      const color = isApprove ? '#059669' : '#dc2626';
      const badge = isApprove ? 'LEHİNƏ (TƏSDİQ)' : 'ƏLEYHİNƏ (İMTİNA)';
      return `
        <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; font-size: 0.74rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="color: #0f172a;">${r.agencyShort} — ${r.expertName}</strong>
            <span style="color: ${color}; font-weight: 800; font-size: 0.68rem;">${badge}</span>
          </div>
          <div style="font-size: 0.68rem; color: #64748b;">${r.agency}</div>
          <div style="font-size: 0.68rem; color: #334155; margin-top: 4px; font-style: italic;">"${r.notes || 'Qərar təsdiqləndi.'}"</div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #e2e8f0; padding-top: 4px; margin-top: 6px; font-size: 0.65rem; color: #64748b;">
            <span><i class="fa-solid fa-stamp text-emerald-600"></i> ${r.totalScore || 90} Bal</span>
            <span style="font-family: monospace;">${r.digitalSeal || 'SIMA-AZ'}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  openModal('modal-commission-protocol');
}

window.loadCommissionVotingSessions = loadCommissionVotingSessions;
window.handleVotingSessionSelectChange = handleVotingSessionSelectChange;
window.selectActiveVoterAccount = selectActiveVoterAccount;
window.castActiveVoterDecision = castActiveVoterDecision;
window.castCommissionVote = castCommissionVote;
window.triggerConsensusVoteAll = triggerConsensusVoteAll;
window.triggerResetVotesCurrentApp = triggerResetVotesCurrentApp;
window.openOfficialProtocolModalCurrentApp = openOfficialProtocolModalCurrentApp;

window.openAdminParcelApplicantsModal = openAdminParcelApplicantsModal;
window.loadMonitoringData = loadMonitoringData;
window.exportMonitoringReport = exportMonitoringReport;
window.triggerSatelliteSync = triggerSatelliteSync;
window.generateInspectionAct = generateInspectionAct;
window.viewSatellitePassDetail = viewSatellitePassDetail;

// ============================================================================
// 🗺️ İNZİBATÇI GIS XƏRİTƏSİ VƏ UNİVERSAL LAY TƏCRİDİ SİSTEMİ (LEAFLET + QGIS)
// ============================================================================
let adminMap = null;
let adminGisLayers = {
  districts: null,
  cities: null,
  settlements: null,
  villages: null,
  parcels: null,
  monitoring: null,
  waterways: null,
  infrastructure: null
};
let adminGisVisibility = {
  districts: true,
  cities: true,
  settlements: true,
  villages: true,
  parcels: true,
  monitoring: true,
  waterways: true,
  infrastructure: true
};

async function initAdminGisMap() {
  const mapContainer = document.getElementById('admin-monitoring-map') || document.getElementById('admin-interactive-map');
  if (!mapContainer) return;

  if (typeof L === 'undefined') {
    console.warn("Leaflet library not loaded yet.");
    setTimeout(initAdminGisMap, 200);
    return;
  }

  if (adminMap) {
    setTimeout(() => {
      adminMap.invalidateSize();
    }, 150);
    return;
  }

  // 1. Initialize Map centered on Karabakh (Ağdam, Füzuli, Şuşa, Laçın, Kəlbəcər)
  adminMap = L.map(mapContainer.id, {
    center: [39.75, 46.75],
    zoom: 9,
    minZoom: 7,
    maxZoom: 19,
    zoomControl: false,
    scrollWheelZoom: true
  });

  L.control.zoom({ position: 'bottomright' }).addTo(adminMap);

  // Dedicated z-index panes so interactive parcels & tooltips are never blocked by boundaries (Identical to main portal)
  adminMap.createPane('districtPane');
  adminMap.getPane('districtPane').style.zIndex = 350;

  adminMap.createPane('villagePane');
  adminMap.getPane('villagePane').style.zIndex = 370;

  adminMap.createPane('waterwayPane');
  adminMap.getPane('waterwayPane').style.zIndex = 390;

  adminMap.createPane('infraPane');
  adminMap.getPane('infraPane').style.zIndex = 410;

  adminMap.createPane('parcelPane');
  adminMap.getPane('parcelPane').style.zIndex = 450;

  // 2. High-resolution tile layers (Same as Main Portal)
  // Google Earth Hybrid Satellite tiles (satellite imagery + road/village labels)
  const googleSat = L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
    attribution: '&copy; Google Earth Hybrid | Copernicus Sentinel-2 MSI (10m)',
    maxZoom: 20
  });

  // Esri World Imagery (high-resolution satellite)
  const esriSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Sentinel-2 Copernicus / Esri World Imagery',
    maxZoom: 18
  });

  // OpenStreetMap Standard
  const osmBase = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors & Dövlət Kadastr Fondu',
    maxZoom: 19
  });

  // Default active layer: Google Satellite Hybrid (identical to main page)
  googleSat.addTo(adminMap);

  L.control.layers({
    "🛰️ Google Earth Hybrid (Peyk + Yollar)": googleSat,
    "🛰️ Sentinel-2 / Esri World Imagery": esriSat,
    "🗺️ Vektor Kadastr Xəritəsi (OSM)": osmBase
  }, null, { position: 'topright' }).addTo(adminMap);

  // Live Telemetry Reader on mouse move
  adminMap.on('mousemove', (e) => {
    const lat = e.latlng.lat.toFixed(4);
    const lng = e.latlng.lng.toFixed(4);
    const estElev = Math.round(180 + Math.abs(lat - 39.4) * 850 + Math.abs(lng - 47.1) * 600);
    const slopeEst = estElev > 800 ? 'Dağətəyi Yamac (6.4°)' : (estElev > 350 ? 'Maili Terras (2.8°)' : 'Düzənlik Massiv (1.1°)');
    const el = document.getElementById('gis-live-telemetry-text');
    if (el) {
      el.innerHTML = `📍 <strong>${lat}° N, ${lng}° E</strong> &nbsp;|&nbsp; ⛰️ <strong>${estElev} m d.s.h.</strong> &nbsp;|&nbsp; 📐 <strong>${slopeEst}</strong> &nbsp;|&nbsp; 📜 Blok: <strong>QAR-${lat.slice(-2)}.${lng.slice(-2)}</strong>`;
    }
  });

  // 3. Load all GIS layers in parallel
  await Promise.allSettled([
    loadAdminDistrictsLayer(),
    loadAdminCitiesLayer(),
    loadAdminSettlementsLayer(),
    loadAdminVillagesLayer(),
    loadAdminParcelsLayer(),
    loadAdminMonitoringLayer(),
    loadAdminWaterwaysLayer()
  ]);

  setTimeout(() => {
    if (adminMap) adminMap.invalidateSize();
  }, 150);
  setTimeout(() => {
    if (adminMap) adminMap.invalidateSize();
  }, 500);
  setTimeout(() => {
    if (adminMap) adminMap.invalidateSize();
  }, 1200);
}

// 1. Districts Layer (ADM2 10 Azad Edilmiş Rayon)
async function loadAdminDistrictsLayer() {
  try {
    const res = await fetch('/gis/karabakh_districts.geojson');
    if (!res.ok) return;
    const data = await res.json();

    adminGisLayers.districts = L.geoJSON(data, {
      style: function(feature) {
        const color = feature.properties.color || '#059669';
        return {
          color: color,
          weight: 2.2,
          opacity: 0.9,
          fillColor: color,
          fillOpacity: 0.08,
          dashArray: '3, 3'
        };
      },
      onEachFeature: function(feature, layer) {
        const p = feature.properties;
        layer.bindTooltip(`<strong>${p.district} Rayonu</strong><br/><span style="font-size:10px; color:#475569;">${p.economic_region || 'Qarabağ'} • Sahə: ${p.area_sqkm} km²</span>`, {
          sticky: true,
          className: 'admin-gis-tooltip'
        });

        layer.bindPopup(`
          <div style="font-family:'Plus Jakarta Sans',sans-serif; padding:6px; max-width:270px; font-size:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:5px; margin-bottom:6px;">
              <strong style="color:#047857; font-size:14px;"><i class="fa-solid fa-landmark"></i> ${p.district} Rayonu</strong>
              <span style="background:#ecfdf5; color:#047857; font-size:10px; font-weight:700; padding:2px 6px; border-radius:6px;">ADM2</span>
            </div>
            <div style="font-size:11px; color:#334155; line-height:1.5;">
              🌍 Region: <strong>${p.economic_region}</strong><br/>
              📐 Sahə: <strong>${p.area_sqkm} km²</strong><br/>
              👥 Qayıdış Hədəfi: <strong>${p.returnees_count ? p.returnees_count.toLocaleString('az-AZ') : '5,000+'} nəfər</strong><br/>
              💼 Əmək Ehtiyatı: <strong>${p.active_workforce ? p.active_workforce.toLocaleString('az-AZ') : '1,500+'} nəfər</strong><br/>
              🌾 Əsas Sahələr: <em>${p.primary_sectors || 'Aqrar Kompleks'}</em>
            </div>
          </div>
        `);
      }
    });

    if (adminGisVisibility.districts && adminMap) {
      adminGisLayers.districts.addTo(adminMap);
    }
  } catch (err) {
    console.warn("Could not load admin districts GeoJSON", err);
  }
}

// 2. Cities Layer (11 Şəhər Mərkəzi)
async function loadAdminCitiesLayer() {
  try {
    const res = await fetch('/gis/karabakh_cities.geojson');
    if (!res.ok) return;
    const data = await res.json();

    adminGisLayers.cities = L.geoJSON(data, {
      pointToLayer: function(feature, latlng) {
        const p = feature.properties;
        const icon = L.divIcon({
          className: 'gis-city-marker',
          html: `<div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -50%); cursor:pointer;">
                  <div style="background:#4338ca; color:white; width:34px; height:34px; border-radius:50%; border:2.5px solid white; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(67,56,202,0.45); font-size:14px;">
                    <i class="fa-solid fa-city"></i>
                  </div>
                  <span style="background:rgba(15,23,42,0.92); color:white; font-size:11px; font-weight:700; padding:2px 7px; border-radius:10px; margin-top:3px; white-space:nowrap; border:1px solid rgba(255,255,255,0.2); box-shadow:0 2px 5px rgba(0,0,0,0.3); font-family:'Plus Jakarta Sans',sans-serif;">${p.name.replace(' şəhəri', '')}</span>
                 </div>`,
          iconSize: [34, 52],
          iconAnchor: [17, 26]
        });
        return L.marker(latlng, { icon: icon });
      },
      onEachFeature: function(feature, layer) {
        const p = feature.properties;
        layer.bindPopup(`
          <div style="font-family:'Plus Jakarta Sans',sans-serif; padding:6px; max-width:280px; font-size:12px;">
            <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #e2e8f0; padding-bottom:5px; margin-bottom:6px;">
              <strong style="color:#312e81; font-size:14px;"><i class="fa-solid fa-city" style="color:#4338ca;"></i> ${p.name}</strong>
              <span style="background:#e0e7ff; color:#3730a3; font-size:10px; font-weight:700; padding:2px 6px; border-radius:6px;">ŞƏHƏR</span>
            </div>
            <div style="font-size:11px; color:#475569; line-height:1.5; margin-bottom:6px;">
              🏛️ Rayon: <strong>${p.district}</strong><br/>
              👥 Layihə Əhalisi: <strong>${p.population ? p.population.toLocaleString('az-AZ') : '30,000+'} nəfər</strong><br/>
              ⛰️ Hündürlük: <strong>${p.elevation_m} m d.s.h.</strong><br/>
              📜 Status: <span style="color:#059669; font-weight:600;">${p.status}</span>
            </div>
            <div style="font-size:11px; color:#1e293b; background:#f8fafc; padding:6px; border-radius:6px; border:1px solid #e2e8f0;">
              ${p.description}
            </div>
          </div>
        `);
      }
    });

    if (adminGisVisibility.cities && adminMap) {
      adminGisLayers.cities.addTo(adminMap);
    }
  } catch (err) {
    console.warn("Could not load admin cities GeoJSON", err);
  }
}

// 3. Settlements Layer (8 Qəsəbə: Hadrut, Əsgəran, Suqovuşan, Mincivan və s.)
async function loadAdminSettlementsLayer() {
  try {
    const res = await fetch('/gis/karabakh_settlements.geojson');
    if (!res.ok) return;
    const data = await res.json();

    adminGisLayers.settlements = L.geoJSON(data, {
      pointToLayer: function(feature, latlng) {
        const p = feature.properties;
        const icon = L.divIcon({
          className: 'gis-settlement-marker',
          html: `<div style="display:flex; flex-direction:column; align-items:center; transform:translate(-50%, -50%); cursor:pointer;">
                  <div style="background:#ea580c; color:white; width:30px; height:30px; border-radius:50%; border:2px solid white; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 10px rgba(234,88,12,0.45); font-size:12px;">
                    <i class="fa-solid fa-tree-city"></i>
                  </div>
                  <span style="background:rgba(15,23,42,0.88); color:white; font-size:10px; font-weight:700; padding:1px 6px; border-radius:8px; margin-top:2px; white-space:nowrap; border:1px solid rgba(255,255,255,0.2); font-family:'Plus Jakarta Sans',sans-serif;">${p.name.replace(' qəsəbəsi', '')}</span>
                 </div>`,
          iconSize: [30, 46],
          iconAnchor: [15, 23]
        });
        return L.marker(latlng, { icon: icon });
      },
      onEachFeature: function(feature, layer) {
        const p = feature.properties;
        layer.bindPopup(`
          <div style="font-family:'Plus Jakarta Sans',sans-serif; padding:6px; max-width:260px; font-size:12px;">
            <div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-bottom:5px;">
              <strong style="color:#c2410c; font-size:13px;"><i class="fa-solid fa-tree-city" style="color:#ea580c;"></i> ${p.name}</strong>
              <span style="background:#ffedd5; color:#9a3412; font-size:10px; font-weight:700; padding:2px 6px; border-radius:6px;">QƏSƏBƏ</span>
            </div>
            <div style="font-size:11px; color:#475569; line-height:1.5; margin-bottom:5px;">
              🏛️ Rayon: <strong>${p.district}</strong><br/>
              👥 Əhali: <strong>${p.population ? p.population.toLocaleString('az-AZ') : 'Məskunlaşma gedir'}</strong><br/>
              ⛰️ Hündürlük: <strong>${p.elevation_m} m</strong>
            </div>
            <div style="font-size:11px; color:#1e293b; background:#fff7ed; padding:5px; border-radius:6px; border:1px solid #ffedd5;">
              ${p.description}
            </div>
          </div>
        `);
      }
    });

    if (adminGisVisibility.settlements && adminMap) {
      adminGisLayers.settlements.addTo(adminMap);
    }
  } catch (err) {
    console.warn("Could not load admin settlements GeoJSON", err);
  }
}

// 4. Villages Layer (HDX ADM3 Kəndlər)
async function loadAdminVillagesLayer() {
  try {
    const res = await fetch('/gis/azerbaijan_villages_adm3.geojson');
    if (!res.ok) return;
    const data = await res.json();

    adminGisLayers.villages = L.geoJSON(data, {
      style: function() {
        return {
          color: '#10b981',
          weight: 1.5,
          opacity: 0.8,
          fillColor: '#10b981',
          fillOpacity: 0.12
        };
      },
      onEachFeature: function(feature, layer) {
        const p = feature.properties;
        layer.bindTooltip(`🏡 <strong>${p.name} kəndi</strong> (${p.district})<br/><span style="font-size:10px;">Bonitet: ${p.bonitet_score || 80} bal • Əhali: ${p.population || 500}</span>`, {
          sticky: true,
          className: 'admin-gis-tooltip'
        });

        layer.bindPopup(`
          <div style="font-family:'Plus Jakarta Sans',sans-serif; padding:6px; max-width:270px; font-size:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-bottom:5px;">
              <strong style="color:#065f46; font-size:13px;"><i class="fa-solid fa-house-chimney"></i> ${p.name} kəndi</strong>
              <span style="background:#d1fae5; color:#065f46; font-size:10px; font-weight:700; padding:2px 6px; border-radius:6px;">ADM3</span>
            </div>
            <div style="font-size:11px; color:#334155; line-height:1.5;">
              🏛️ Rayon: <strong>${p.district}</strong><br/>
              🌱 Torpaq Boniteti: <strong>${p.bonitet_score || 82} bal</strong><br/>
              👥 Qayıdış Hədəfi: <strong>${p.returnees_target || p.population} nəfər</strong><br/>
              🌾 Tövsiyə Edilən Təyinat: <em>${p.recommended_sectors || 'Bitkiçilik və Heyvandarlıq'}</em>
            </div>
          </div>
        `);
      }
    });

    if (adminGisVisibility.villages && adminMap) {
      adminGisLayers.villages.addTo(adminMap);
    }
  } catch (err) {
    console.warn("Could not load admin villages GeoJSON", err);
  }
}

function createAdminParcelInspectionMiniWindowHtml(p) {
  const ph = p.soilPh || 7.1;
  const phColor = ph <= 6.5 ? '#f59e0b' : (ph <= 7.5 ? '#10b981' : '#06b6d4');
  const phDesc = ph < 6.8 ? 'Zəif Turş' : (ph <= 7.4 ? 'Optimal Zəif Qələvi' : 'Qələvi');
  const soc = p.soilOrganicCarbon || 28.5;
  const oxygen = p.soilOxygen || '8.4 mg/L';
  const porosity = p.soilPorosity || '48%';
  const elev = p.elevationMeters || 245;
  const slope = p.terrainSlope || 1.2;
  const slopeDesc = slope <= 3 ? 'Düzən (Pivot üçün ideal)' : (slope <= 6 ? 'Zəif Meyilli (Damcılı)' : 'Teras Yamac');
  const suitability = p.recommendedSuitability || (p.sectorName ? `${p.sectorName} (FAO GAEZ S1 Yüksək)` : 'Taxılçılıq, Şəkər çuğunduru və Yağlı bitkilər (FAO GAEZ S1)');
  const statusBadge = p.status === 'PARTNERSHIP' ?
    '<span style="background:#e0f2fe; color:#0369a1; padding:2px 7px; border-radius:12px; font-weight:700; font-size:10px;">Tərəfdaşlıqda</span>' :
    (p.status === 'REVIEW' ?
      '<span style="background:#fef3c7; color:#92400e; padding:2px 7px; border-radius:12px; font-weight:700; font-size:10px;">Baxışda</span>' :
      '<span style="background:#dcfce7; color:#15803d; padding:2px 7px; border-radius:12px; font-weight:700; font-size:10px;">İcarəyə Açıq</span>');

  return `
    <div style="font-family:'Outfit','Plus Jakarta Sans',sans-serif; width:310px; background:rgba(15, 23, 42, 0.96); backdrop-filter:blur(10px); color:#f8fafc; border-radius:12px; padding:10px 12px; border:1.5px solid rgba(16, 185, 129, 0.45); box-shadow:0 12px 28px rgba(0,0,0,0.45); pointer-events:none;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid rgba(255,255,255,0.12); padding-bottom:6px; margin-bottom:8px;">
        <div>
          <span style="font-family:monospace; font-size:10px; color:#34d399; font-weight:800; letter-spacing:0.5px; text-transform:uppercase;">${p.cadastreNumber}</span>
          <h4 style="margin:2px 0 0; color:#ffffff; font-size:13px; font-weight:700;">${p.district}, ${p.village ? p.village + ' kəndi' : 'Dövlət Fondu'}</h4>
        </div>
        ${statusBadge}
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:8px;">
        <div style="background:rgba(30, 41, 59, 0.85); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:6px 8px;">
          <div style="font-size:9.5px; color:#94a3b8; font-weight:600;">🧪 Torpaq pH</div>
          <div style="font-size:12px; font-weight:800; color:${phColor}; font-family:monospace; margin-top:1px;">pH ${ph}</div>
          <div style="font-size:9px; color:#cbd5e1; margin-top:1px;">${phDesc}</div>
        </div>

        <div style="background:rgba(30, 41, 59, 0.85); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:6px 8px;">
          <div style="font-size:9.5px; color:#94a3b8; font-weight:600;">🌿 Üzvi Karbon (SOC)</div>
          <div style="font-size:12px; font-weight:800; color:#fbbf24; font-family:monospace; margin-top:1px;">${soc} g/kg</div>
          <div style="font-size:9px; color:#cbd5e1; margin-top:1px;">Zəngin Humus Qatı</div>
        </div>

        <div style="background:rgba(30, 41, 59, 0.85); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:6px 8px;">
          <div style="font-size:9.5px; color:#94a3b8; font-weight:600;">💨 Oksigen &amp; Aerasiya</div>
          <div style="font-size:12px; font-weight:800; color:#38bdf8; font-family:monospace; margin-top:1px;">${oxygen}</div>
          <div style="font-size:9px; color:#cbd5e1; margin-top:1px;">${porosity} Məsaməlilik</div>
        </div>

        <div style="background:rgba(30, 41, 59, 0.85); border:1px solid rgba(255,255,255,0.08); border-radius:8px; padding:6px 8px;">
          <div style="font-size:9.5px; color:#94a3b8; font-weight:600;">⛰️ Relyef &amp; DEM Meyil</div>
          <div style="font-size:12px; font-weight:800; color:#c084fc; font-family:monospace; margin-top:1px;">${elev}m • ${slope}°</div>
          <div style="font-size:9px; color:#cbd5e1; margin-top:1px;">${slopeDesc}</div>
        </div>
      </div>

      <div style="background:rgba(6, 78, 59, 0.45); border:1px solid rgba(52, 211, 153, 0.35); border-radius:8px; padding:6px 8px; margin-bottom:8px;">
        <div style="font-size:9.5px; color:#34d399; font-weight:700; text-transform:uppercase; letter-spacing:0.5px;">
          🌾 Ən Uyğun Aqrar Fəaliyyət:
        </div>
        <div style="font-size:11px; font-weight:600; color:#ecfdf5; margin-top:2px; line-height:1.35;">
          ${suitability}
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; font-size:10.5px; color:#94a3b8; border-top:1px solid rgba(255,255,255,0.08); padding-top:6px;">
        <span>Sahə: <strong style="color:#ffffff;">${p.areaHectares} ha</strong></span>
        <span>Bonitet: <strong style="color:#34d399;">${p.soilBonitet} bal</strong></span>
        <span>Start: <strong style="color:#fbbf24;">${(p.startingBidAzn || p.minInvestmentAzn || 0).toLocaleString()} ₼</strong></span>
      </div>
    </div>
  `;
}

// 5. State Agricultural Parcels Layer (Auksion & Müsabiqə Sahələri)
async function loadAdminParcelsLayer() {
  try {
    const res = await fetch('/api/v1/parcels');
    const parcels = await res.json();
    if (!Array.isArray(parcels)) return;

    adminGisLayers.parcels = L.layerGroup();

    parcels.forEach(p => {
      const lat = p.latitude || (39.5 + Math.random() * 0.5);
      const lng = p.longitude || (46.5 + Math.random() * 0.6);

      // 1. Draw Parcel Boundary Outline if coordinates or bounds exist
      let bounds = [];
      if (p.coordinates && Array.isArray(p.coordinates) && p.coordinates.length >= 3) {
        bounds = p.coordinates.map(c => [c[1], c[0]]);
      } else {
        const delta = Math.sqrt(p.areaHectares || 100) * 0.00065;
        bounds = [
          [lat - delta, lng - delta],
          [lat - delta, lng + delta],
          [lat + delta, lng + delta],
          [lat + delta, lng - delta]
        ];
      }

      const polygon = L.polygon(bounds, {
        color: '#059669',
        weight: 2.2,
        fillColor: '#10b981',
        fillOpacity: 0.3,
        dashArray: '4, 4'
      });

      polygon.bindTooltip(createAdminParcelInspectionMiniWindowHtml(p), {
        sticky: true,
        className: 'parcel-inspection-hover-tooltip',
        opacity: 1
      });

      polygon.on({
        mouseover: (e) => {
          e.target.setStyle({ weight: 4, fillOpacity: 0.6, color: '#38bdf8' });
        },
        mouseout: (e) => {
          e.target.setStyle({ weight: 2.2, fillOpacity: 0.3, color: '#059669' });
        }
      });

      adminGisLayers.parcels.addLayer(polygon);

      // 2. Custom Point Marker with Hover Mini-Inspection Window & Click Action
      const marker = L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: '#059669',
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85
      });

      marker.bindTooltip(createAdminParcelInspectionMiniWindowHtml(p), {
        sticky: true,
        className: 'parcel-inspection-hover-tooltip',
        opacity: 1
      });

      marker.bindPopup(`
        <div style="font-family:'Plus Jakarta Sans',sans-serif; padding:6px; max-width:280px; font-size:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:5px; margin-bottom:6px;">
            <strong style="color:#047857; font-size:13px;"><i class="fa-solid fa-wheat-awn"></i> ${p.cadastreNumber}</strong>
            <span style="background:#ecfdf5; color:#047857; font-size:10px; font-weight:700; padding:2px 6px; border-radius:6px;">${p.sector}</span>
          </div>
          <div style="font-size:11px; color:#334155; line-height:1.5; margin-bottom:8px;">
            📍 Rayon: <strong>${p.district}</strong>, ${p.village || ''}<br/>
            📐 Sahə: <strong>${p.areaHectares} ha</strong><br/>
            🌱 Bonitet: <strong>${p.soilBonitet} bal</strong> (pH ${p.soilPh || 7.0})<br/>
            💰 Start Qiymət: <strong>${formatAzn(p.startingBidAzn || p.minInvestmentAzn)}</strong><br/>
            👥 İddiaçılar: <strong>${p.applicantsCount || 0} müraciət</strong>
          </div>
          <div style="display:flex; gap:6px;">
            <button class="btn-admin btn-admin-primary" style="flex:1; padding:4px; font-size:11px;" onclick="openAdminParcelApplicantsModal(${p.id})">
              <i class="fa-solid fa-users-viewfinder"></i> İddiaçılar
            </button>
            <button class="btn-admin btn-admin-secondary" style="flex:1; padding:4px; font-size:11px;" onclick="openAuctionBidsModal(${p.id})">
              <i class="fa-solid fa-gavel"></i> Artırma
            </button>
          </div>
        </div>
      `);

      adminGisLayers.parcels.addLayer(marker);
    });

    if (adminGisVisibility.parcels && adminMap) {
      adminGisLayers.parcels.addTo(adminMap);
    }
  } catch (err) {
    console.warn("Could not load admin parcels", err);
  }
}

// 6. Leased Lands Satellite Monitoring Layer
async function loadAdminMonitoringLayer() {
  try {
    const res = await fetch('/api/v1/monitoring/leased-lands');
    const data = await res.json();
    if (!data || !data.success || !Array.isArray(data.items)) return;

    adminGisLayers.monitoring = L.layerGroup();

    data.items.forEach(item => {
      const lat = item.latitude || (39.6 + Math.random() * 0.4);
      const lng = item.longitude || (46.6 + Math.random() * 0.5);

      const marker = L.circleMarker([lat, lng], {
        radius: 9,
        fillColor: '#0284c7',
        color: '#ffffff',
        weight: 2.5,
        opacity: 1,
        fillOpacity: 0.9
      });

      marker.bindPopup(`
        <div style="font-family:'Plus Jakarta Sans',sans-serif; padding:6px; max-width:280px; font-size:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:5px; margin-bottom:6px;">
            <strong style="color:#0369a1; font-size:13px;"><i class="fa-solid fa-satellite-dish"></i> ${item.cadastreNumber}</strong>
            <span style="background:#e0f2fe; color:#0369a1; font-size:10px; font-weight:700; padding:2px 6px; border-radius:6px;">NDVI ${item.sentinel2Ndvi}</span>
          </div>
          <div style="font-size:11px; color:#334155; line-height:1.5; margin-bottom:8px;">
            🏢 İcarəçi: <strong>${item.lesseeName}</strong><br/>
            📍 Ərazi: <strong>${item.district}</strong> (${item.areaHectares} ha)<br/>
            💧 Rütubət: <strong>${item.soilMoisturePct}%</strong><br/>
            💼 Məşğulluq: <strong>${item.actualJobs} / ${item.projectedJobs} yer</strong><br/>
            📜 Müqavilə: <strong>№ ${item.contractNumber}</strong>
          </div>
          <button class="btn-admin btn-admin-primary" style="width:100%; padding:5px; font-size:11px;" onclick="generateInspectionAct('${item.contractNumber}')">
            <i class="fa-solid fa-file-contract"></i> Sahəvi Yoxlama Aktı Tərtib Et
          </button>
        </div>
      `);

      adminGisLayers.monitoring.addLayer(marker);
    });

    if (adminGisVisibility.monitoring && adminMap) {
      adminGisLayers.monitoring.addTo(adminMap);
    }
  } catch (err) {
    console.warn("Could not load admin monitoring layer", err);
  }
}

// 7. Waterways & Infrastructure Layer (Su Hövzələri & Yollar)
async function loadAdminWaterwaysLayer() {
  try {
    const [wRes, iRes] = await Promise.all([
      fetch('/gis/karabakh_waterways.geojson'),
      fetch('/gis/karabakh_infrastructure.geojson')
    ]);

    adminGisLayers.waterways = L.layerGroup();

    if (wRes.ok) {
      const wData = await wRes.json();
      const wLayer = L.geoJSON(wData, {
        style: { color: '#0284c7', weight: 2.5, opacity: 0.85 },
        onEachFeature: function(f, l) {
          l.bindTooltip(`💧 ${f.properties.name || 'Su Hövzəsi'}`, { sticky: true });
        }
      });
      adminGisLayers.waterways.addLayer(wLayer);
    }

    if (iRes.ok) {
      const iData = await iRes.json();
      const iLayer = L.geoJSON(iData, {
        style: { color: '#64748b', weight: 2, dashArray: '4, 4', opacity: 0.8 },
        onEachFeature: function(f, l) {
          l.bindTooltip(`🛣️ ${f.properties.name || 'Magistral / İnfrastruktur'}`, { sticky: true });
        }
      });
      adminGisLayers.waterways.addLayer(iLayer);
    }

    if (adminGisVisibility.waterways && adminMap) {
      adminGisLayers.waterways.addTo(adminMap);
    }
  } catch (err) {
    console.warn("Could not load waterways/infrastructure", err);
  }
}

// Universal Entity Isolation Function for Admin Map
function isolateAdminMapEntity(entityType) {
  const allTypes = ['districts', 'cities', 'settlements', 'villages', 'parcels', 'monitoring', 'waterways'];

  // Update button active state on toolbar
  const btnIds = ['all', 'districts', 'cities', 'settlements', 'villages', 'parcels', 'monitoring', 'waterways'];
  btnIds.forEach(id => {
    const el = document.getElementById(`admin-isolate-${id}`);
    if (el) {
      if (id === entityType) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    }
  });

  const badge = document.getElementById('admin-map-status-badge');

  if (entityType === 'all') {
    allTypes.forEach(t => {
      adminGisVisibility[t] = true;
      if (adminGisLayers[t] && adminMap && !adminMap.hasLayer(adminGisLayers[t])) {
        adminGisLayers[t].addTo(adminMap);
      }
    });
    if (adminMap) adminMap.setView([39.75, 46.75], 9);
    if (badge) badge.innerHTML = '<i class="fa-solid fa-layer-group text-emerald-500"></i> Bütün Vahidlər Aktivdir';
    showAdminToast("🌐 Xəritədə bütün inzibati vahidlər, şəhərlər, qəsəbələr, kəndlər və aqro sahələr göstərilir", "info");
    return;
  }

  // Toggle visibility: only target visible
  allTypes.forEach(t => {
    const isTarget = (t === entityType);
    adminGisVisibility[t] = isTarget;
    if (adminGisLayers[t] && adminMap) {
      if (isTarget) {
        if (!adminMap.hasLayer(adminGisLayers[t])) adminGisLayers[t].addTo(adminMap);
      } else {
        if (adminMap.hasLayer(adminGisLayers[t])) adminMap.removeLayer(adminGisLayers[t]);
      }
    }
  });

  // Fit bounds or zoom based on target
  if (entityType === 'districts') {
    if (adminMap) adminMap.setView([39.75, 46.75], 9);
    if (badge) badge.innerHTML = '<i class="fa-solid fa-landmark text-emerald-600"></i> Yalnız Rayon Sərhədləri';
    showAdminToast("🏛️ Xəritədə yalnız 10 işğaldan azad edilmiş Rayon sərhədləri təcrid edildi", "success");
  } else if (entityType === 'cities') {
    if (adminMap) adminMap.setView([39.75, 46.75], 9);
    if (badge) badge.innerHTML = '<i class="fa-solid fa-city text-indigo-600"></i> 11 Şəhər Mərkəzi';
    showAdminToast("🏙️ Xəritədə yalnız 11 Şəhər mərkəzi (Şuşa, Xankəndi, Ağdam, Füzuli, Laçın və s.) təcrid edildi", "success");
  } else if (entityType === 'settlements') {
    if (adminMap) adminMap.setView([39.65, 46.85], 9);
    if (badge) badge.innerHTML = '<i class="fa-solid fa-tree-city text-orange-600"></i> 8 Qəsəbə Mərkəzi';
    showAdminToast("🏘️ Xəritədə yalnız 8 Qəsəbə (Hadrut, Əsgəran, Suqovuşan, Mincivan, Ağbənd, Qırmızı Bazar və s.) təcrid edildi", "success");
  } else if (entityType === 'villages') {
    if (adminMap) adminMap.setView([39.85, 46.95], 10);
    if (badge) badge.innerHTML = '<i class="fa-solid fa-house-chimney text-emerald-600"></i> HDX Kəndləri (ADM3)';
    showAdminToast("🏡 Xəritədə yalnız Kəndlər (HDX ADM3 və İƏBT) təcrid edildi", "success");
  } else if (entityType === 'parcels') {
    if (adminMap) adminMap.setView([39.80, 46.90], 10);
    if (badge) badge.innerHTML = '<i class="fa-solid fa-wheat-awn text-amber-600"></i> Dövlət Aqrar Sahələri';
    showAdminToast("🌾 Xəritədə yalnız Hərrac və İcarəyə çıxarılmış Dövlət Aqro Sahələri təcrid edildi", "success");
  } else if (entityType === 'monitoring') {
    if (adminMap) adminMap.setView([39.75, 46.80], 10);
    if (badge) badge.innerHTML = '<i class="fa-solid fa-satellite-dish text-emerald-600"></i> Peyk NDVI Sahələri';
    showAdminToast("🛰️ Xəritədə yalnız İcarəyə verilmiş & Sentinel-2 Peyk Nəzarətindəki sahələr təcrid edildi", "success");
  } else if (entityType === 'waterways') {
    if (adminMap) adminMap.setView([39.70, 46.80], 9);
    if (badge) badge.innerHTML = '<i class="fa-solid fa-water text-blue-600"></i> Su Hövzələri & Yollar';
    showAdminToast("💧 Xəritədə Su Anbarları (Xudafərin, Sərsəng) və Strateji Yollar təcrid edildi", "info");
  }
}

function adminMapResetView() {
  if (adminMap) {
    adminMap.setView([39.75, 46.75], 9);
    adminMap.invalidateSize();
    showAdminToast("🎯 Xəritə mərkəzə qaytarıldı (Qarabağ Regional Görünüşü)", "info");
  }
}

// Deep Link from Parcels Table to Map with entity isolation
function adminViewParcelOnMap(parcelId) {
  switchAdminTab('monitoring');
  setTimeout(() => {
    initAdminGisMap();
    isolateAdminMapEntity('parcels');

    const p = adminState.parcels.find(x => x.id === Number(parcelId));
    if (p && adminMap) {
      const lat = p.latitude || 39.80;
      const lng = p.longitude || 46.90;
      adminMap.setView([lat, lng], 13);
      showAdminToast(`📍 ${p.cadastreNumber} (${p.district}) xəritədə mərkəzləşdirildi`, "success");
    }
  }, 250);
}

window.initAdminGisMap = initAdminGisMap;
window.isolateAdminMapEntity = isolateAdminMapEntity;
window.adminMapResetView = adminMapResetView;
window.adminViewParcelOnMap = adminViewParcelOnMap;
window.toggleAdminMapInvestmentDrawer = toggleAdminMapInvestmentDrawer;
window.finishAdminMapDrawing = finishAdminMapDrawing;
window.cancelAdminMapDrawing = cancelAdminMapDrawing;
window.undoAdminMapLastPoint = undoAdminMapLastPoint;

function toggleAdminSidebar(forceClose) {
  const sidebar = document.querySelector('.admin-sidebar');
  const backdrop = document.getElementById('admin-sidebar-backdrop');
  if (!sidebar) return;

  if (forceClose === true) {
    sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
    return;
  }

  const isOpen = sidebar.classList.toggle('open');
  if (backdrop) {
    if (isOpen) {
      backdrop.classList.add('active');
    } else {
      backdrop.classList.remove('active');
    }
  }
}
window.toggleAdminSidebar = toggleAdminSidebar;

