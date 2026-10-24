/**
 * InvestArea — PWA (Progressive Web Application) & Oflayn Rejim Meneceri
 * 100% Responsive, İstənilən Cihaz və Brauzerdə Quraşdırılma, Oflayn Keş və Sinxronizasiya
 */

(function () {
  'use strict';

  let deferredInstallPrompt = null;
  let isAppInstalled = false;

  // 1. SERVICE WORKER QEYDİYYATI
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('[PWA] Service Worker uğurla qeydiyyatdan keçdi:', registration.scope);

          // Yenilənmələri yoxla
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  showPwaToast('⚡ Yeni yenilənmə hazırdır — səhifəni yeniləyərək ən son versiyanı əldə edin.', 4000);
                }
              };
            }
          };
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker qeydiyyat xətası:', err);
        });
    });
  }

  // 2. QURAŞDIRILMA PROMPT-U (beforeinstallprompt)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    console.log('[PWA] Quraşdırılma sorğusu hazırdır');

    // UI elementini yenilə
    updatePwaInstallUi(true);
  });

  window.addEventListener('appinstalled', () => {
    isAppInstalled = true;
    deferredInstallPrompt = null;
    console.log('[PWA] Tətbiq uğurla cihaza quraşdırıldı');
    showPwaToast('🎉 InvestArea uğurla cihazınıza quraşdırıldı! Artıq ana ekrandan birbaşa aça bilərsiniz.', 4000);
    updatePwaInstallUi(false);
  });

  // Tətbiqi cihaza quraşdır
  function installPwa() {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA] İstifadəçi quraşdırmanı qəbul etdi');
        } else {
          console.log('[PWA] İstifadəçi quraşdırmadan imtina etdi');
        }
        deferredInstallPrompt = null;
      });
    } else {
      // iOS Safari və ya standart quraşdırma təlimatı
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIos) {
        showPwaToast('📲 Safari-də: Aşağıdakı "Paylaş" (Share) düyməsinə toxunun və "Ana Ekrana Əlavə Et" (Add to Home Screen) seçin.', 6000);
      } else {
        showPwaToast('📲 Brauzerinizin menyusundan (⋮ və ya ⋯) "Tətbiqi Quraşdır" və ya "Ana ekrana əlavə et" seçin.', 5000);
      }
    }
  }
  window.installPwa = installPwa;

  function updatePwaInstallUi(canInstall) {
    const installBtn = document.getElementById('pwa-install-trigger');
    const modalInstallBtn = document.getElementById('btn-pwa-install-now');
    if (installBtn) {
      installBtn.style.display = 'inline-flex';
    }
    if (modalInstallBtn) {
      modalInstallBtn.style.display = 'inline-flex';
      modalInstallBtn.innerHTML = canInstall 
        ? '<i class="fa-solid fa-download"></i> Cihaza Quraşdır'
        : '<i class="fa-solid fa-circle-check"></i> Artıq Quraşdırılıb';
    }
  }

  // 3. ŞƏBƏKƏ STATUSU (ONLINE / OFFLINE)
  function handleNetworkChange() {
    const isOnline = navigator.onLine;
    const dot = document.getElementById('pwa-status-dot');
    const pillText = document.getElementById('pwa-status-pill-text');

    if (isOnline) {
      if (dot) {
        dot.className = 'inline-block w-2 h-2 rounded-full bg-emerald-400';
      }
      if (pillText) {
        pillText.innerText = '⚡ Oflayn Hazır';
      }
      showPwaToast('🟢 Onlayn Rejim: İnternet bərpa olundu. Bütün məlumatlar sinxronlaşdırıldı.', 3500, 'success');
      syncOfflineOutbox();
    } else {
      if (dot) {
        dot.className = 'inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse';
      }
      if (pillText) {
        pillText.innerText = '⚠️ Oflayn Rejim (Aktivdir)';
      }
      showPwaToast('⚠️ İnternet kəsildi: Oflayn rejim aktivdir. Əvvəl yüklənmiş xəritə, kadastr və torpaq analizləri tam işləkdir.', 5000, 'warning');
    }
  }

  window.addEventListener('online', handleNetworkChange);
  window.addEventListener('offline', handleNetworkChange);

  // 4. OFFLINE DATA STORAGE & SYNC HELPER
  function cacheParcelsLocally(parcelsData) {
    if (!parcelsData || !Array.isArray(parcelsData)) return;
    try {
      localStorage.setItem('investarea_offline_parcels', JSON.stringify(parcelsData));
      localStorage.setItem('investarea_offline_timestamp', new Date().toISOString());
      console.log(`[PWA] ${parcelsData.length} torpaq sahəsi yerli oflayn yaddaşa yazıldı`);
    } catch (e) {
      console.warn('[PWA] Yerli yaddaşa yazılma xətası:', e);
    }
  }
  window.cacheParcelsLocally = cacheParcelsLocally;

  function getLocalCachedParcels() {
    try {
      const data = localStorage.getItem('investarea_offline_parcels');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }
  window.getLocalCachedParcels = getLocalCachedParcels;

  // Oflayn növbə (Outbox): internet olmayanda verilən təklifləri saxlayır
  function queueOfflineAction(actionType, payload) {
    try {
      const queue = JSON.parse(localStorage.getItem('investarea_offline_outbox') || '[]');
      queue.push({
        id: 'outbox_' + Date.now(),
        action: actionType,
        payload: payload,
        queuedAt: new Date().toISOString()
      });
      localStorage.setItem('investarea_offline_outbox', JSON.stringify(queue));
      showPwaToast('📥 Oflayn qeydiyyat: Müraciətiniz yerli yaddaşda saxlanıldı. İnternet bərpa olunan kimi avtomatik göndəriləcək.', 5000, 'warning');
    } catch (e) {
      console.error('[PWA] Oflayn növbə xətası:', e);
    }
  }
  window.queueOfflineAction = queueOfflineAction;

  // İnternet bərpa olunduqda oflayn növbəni serverə göndər
  async function syncOfflineOutbox() {
    try {
      const queue = JSON.parse(localStorage.getItem('investarea_offline_outbox') || '[]');
      if (queue.length === 0) return;

      console.log(`[PWA] ${queue.length} oflayn müraciət sinxronlaşdırılır...`);
      const remaining = [];

      for (const item of queue) {
        try {
          if (item.action === 'BID') {
            await fetch('/api/v1/bids', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item.payload)
            });
          } else if (item.action === 'APPLICATION') {
            await fetch('/api/v1/applications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item.payload)
            });
          }
        } catch (err) {
          remaining.push(item);
        }
      }

      localStorage.setItem('investarea_offline_outbox', JSON.stringify(remaining));
      if (remaining.length === 0) {
        showPwaToast('✅ Bütün oflayn təklif və müraciətləriniz uğurla serverə göndərildi!', 4000, 'success');
      }
    } catch (e) {
      console.warn('[PWA] Sinxronizasiya xətası:', e);
    }
  }
  window.syncOfflineOutbox = syncOfflineOutbox;

  // 5. KOMPAKT PWA MƏLUMAT MODALI ("cox da boyuk yer tutmasin da tebii ki, o geyd")
  function togglePwaInfoModal(show) {
    let modal = document.getElementById('pwaInfoModal');
    if (!modal) {
      modal = createPwaInfoModal();
    }
    if (show) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    } else {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }
  window.togglePwaInfoModal = togglePwaInfoModal;

  function createPwaInfoModal() {
    const div = document.createElement('div');
    div.id = 'pwaInfoModal';
    div.className = 'hidden fixed inset-0 z-50 items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in';
    div.onclick = (e) => {
      if (e.target === div) togglePwaInfoModal(false);
    };

    div.innerHTML = `
      <div class="relative w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-2xl text-slate-100 font-sans" onclick="event.stopPropagation()">
        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-lg shadow-sm">
              <i class="fa-solid fa-mobile-screen-button"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-white tracking-wide">PWA &amp; Oflayn Rejim</h3>
              <p class="text-[11px] text-emerald-400 font-medium">İstənilən Cihazda • İnternetsiz Tam İşlək</p>
            </div>
          </div>
          <button type="button" class="text-slate-400 hover:text-white p-1 rounded-lg text-lg transition-colors cursor-pointer" onclick="togglePwaInfoModal(false)">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Body: Kompakt və Aydın Məlumat -->
        <div class="py-3.5 space-y-2.5 text-xs text-slate-300">
          <div class="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <span class="text-emerald-400 text-sm mt-0.5"><i class="fa-solid fa-wifi-slash"></i></span>
            <div>
              <strong class="text-white block font-semibold">İnternetsiz İşləyir (Oflayn Keş)</strong>
              <span>Qarabağda ərazidə olarkən internet kəsilsə belə, portalın xəritəsi, 64 kadastr sahəsi, torpaq təhlilləri və filtrləri cihazınızın yerli yaddaşından işləməyə davam edir.</span>
            </div>
          </div>

          <div class="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <span class="text-emerald-400 text-sm mt-0.5"><i class="fa-solid fa-download"></i></span>
            <div>
              <strong class="text-white block font-semibold">Bütün Brauzerlərdən Quraşdırıla Bilər</strong>
              <span>Chrome, Safari (iOS/macOS), Samsung Internet, Edge və ya Android TV-dən birbaşa telefon, planşet və ya kompüterinizə tətbiq kimi əlavə olunur.</span>
            </div>
          </div>

          <div class="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <span class="text-emerald-400 text-sm mt-0.5"><i class="fa-solid fa-arrows-rotate"></i></span>
            <div>
              <strong class="text-white block font-semibold">Avtomatik Sinxronizasiya</strong>
              <span>Oflayn vaxtı etdiyiniz qeydlər internet bərpa olan kimi avtomatik dövlət portalına ötürülür.</span>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="pt-2 flex items-center justify-between gap-2">
          <button type="button" id="btn-pwa-install-now" class="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer" onclick="installPwa()">
            <i class="fa-solid fa-download"></i> <span>Tətbiqi Cihaza Quraşdır</span>
          </button>
          <button type="button" class="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer" onclick="togglePwaInfoModal(false)">
            Bağla
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(div);
    return div;
  }

  // 6. GÖZƏ ÇARPMYAN DİSKRET TOAST BİLDİRİŞ (SLIM TOAST)
  function showPwaToast(msg, duration = 3500, type = 'info') {
    let container = document.getElementById('pwa-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'pwa-toast-container';
      container.className = 'fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none px-4 w-full max-w-md';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bgClass = type === 'warning' 
      ? 'bg-amber-950/95 border-amber-500/60 text-amber-200' 
      : (type === 'success' ? 'bg-emerald-950/95 border-emerald-500/60 text-emerald-200' : 'bg-slate-900/95 border-slate-700 text-slate-200');

    toast.className = `pointer-events-auto flex items-center gap-2 py-2 px-3.5 rounded-full text-xs font-medium border shadow-xl backdrop-blur-md transition-all duration-300 opacity-0 translate-y-2 ${bgClass}`;
    toast.innerHTML = `<span>${msg}</span>`;

    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.remove('opacity-0', 'translate-y-2');
      toast.classList.add('opacity-100', 'translate-y-0');
    });

    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
  window.showPwaToast = showPwaToast;

  // 7. BAŞLANĞIC STATUSUNUN TƏYİNİ
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (!navigator.onLine) {
        handleNetworkChange();
      }
    });
  } else {
    if (!navigator.onLine) {
      handleNetworkChange();
    }
  }

})();
