/**
 * Qarabağ Aqro-AI Agenti - Google Gemini & GeoAI Multi-Modul Konsultant
 * Bələdçi, GeoAI Peyk Analitiki və 5 İllik ROI Simulyatorunun vahid agent daxilində birləşməsi
 */

(function() {
  'use strict';

  const AGRO_AI_STORAGE_KEY = 'investarea_gemini_api_key';

  const aiState = {
    isOpen: false,
    isExpanded: false,
    isLoading: false,
    isListening: false,
    apiKey: localStorage.getItem(AGRO_AI_STORAGE_KEY) || '',
    hasServerKey: false,
    providerName: 'Google Gemini',
    recognition: null,
    messages: [
      {
        id: 'msg-welcome',
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `### Salam! Mən **Qarabağ Aqro-AI** Agentiyəm 🤖🌱\n\nGoogle Gemini və GeoAI peyk telemetriyası əsasında işğaldan azad edilmiş torpaqlar üzrə **3 əsas istiqamətdə** sizə bələdçilik edirəm:\n\n1. 📜 **236 nömrəli Fərman & Qanunvericilik:** 50 ₼ rüsum, 0% kənd təsərrüfatı vergisi və AKİA güzəştləri.\n2. 🛰️ **GeoAI & Aqro-İqlim:** Sentinel-2 NDVI peyk vegetasiyası, torpaq pH-ı, relyef və suvarma təminatı.\n3. 📈 **5 İllik Maliyyə & ROI:** İnvestisiyanın maya dəyəri, subsidiyalar və xərcin çıxma (Break-Even) müddəti.\n\nAşağıdakı hazır suallardan birini seçə və ya sərbəst müraciətinizi yaza bilərsiniz:`,
        structuredData: {
          quickSuggestions: [
            "🌾 500k ₼ büdcə ilə ən gəlirli sahə",
            "🍇 Cəbrayılda üzümçülük üçün torpaq",
            "💧 Füzulidə suvarma və torpaq analizi",
            "📈 Badam bağı üzrə 5 illik ROI hesabla",
            "📜 236 nömrəli Fərman və AKİA subsidiyaları"
          ]
        }
      }
    ]
  };

  // Initialize Speech Recognition if supported
  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        aiState.recognition = new SpeechRecognition();
        aiState.recognition.lang = 'az-AZ';
        aiState.recognition.continuous = false;
        aiState.recognition.interimResults = false;

        aiState.recognition.onstart = function() {
          aiState.isListening = true;
          updateMicButtonState();
        };

        aiState.recognition.onresult = function(event) {
          if (event.results && event.results[0] && event.results[0][0]) {
            const transcript = event.results[0][0].transcript;
            const inputEl = document.getElementById('agro-ai-input');
            if (inputEl) {
              inputEl.value = transcript;
              inputEl.focus();
            }
          }
        };

        aiState.recognition.onerror = function(event) {
          console.warn('Speech recognition error:', event.error);
          aiState.isListening = false;
          updateMicButtonState();
        };

        aiState.recognition.onend = function() {
          aiState.isListening = false;
          updateMicButtonState();
        };
      } catch (e) {
        console.warn('Speech recognition could not be initialized:', e);
      }
    }
  }

  function updateMicButtonState() {
    const micBtn = document.getElementById('agro-ai-mic-btn');
    if (!micBtn) return;
    if (aiState.isListening) {
      micBtn.classList.add('bg-red-500', 'text-white', 'animate-pulse');
      micBtn.classList.remove('text-slate-500', 'hover:text-emerald-600');
      micBtn.setAttribute('title', 'Dinlənilir... Danışın');
    } else {
      micBtn.classList.remove('bg-red-500', 'text-white', 'animate-pulse');
      micBtn.classList.add('text-slate-500', 'hover:text-emerald-600');
      micBtn.setAttribute('title', 'Səslə daxil edin (Azərbaycan dili)');
    }
  }

  // Toggle speech recognition
  window.toggleAgroAiSpeech = function() {
    if (!aiState.recognition) {
      initSpeechRecognition();
    }
    if (!aiState.recognition) {
      alert('Sizin brauzeriniz səsli daxiletməni (Web Speech API) dəstəkləmir. Zəhmət olmasa Google Chrome və ya Edge istifadə edin.');
      return;
    }

    if (aiState.isListening) {
      aiState.recognition.stop();
    } else {
      try {
        aiState.recognition.start();
      } catch (err) {
        console.error('Error starting recognition:', err);
      }
    }
  };

  // Check AI Agent Server Status
  async function checkAiAgentStatus() {
    try {
      const res = await fetch('/api/v1/ai/status');
      const data = await res.json();
      if (data && data.success) {
        aiState.hasServerKey = data.hasServerKey;
        aiState.model = data.model || 'Gemini 3.8 Flash';
        updateAiHeaderStatusPill();
      }
    } catch (e) {
      console.warn('AI status check failed:', e);
    }
  }

  function updateAiHeaderStatusPill() {
    const pill = document.getElementById('agro-ai-status-pill');
    if (!pill) return;

    if (aiState.apiKey || aiState.hasServerKey) {
      const modelLabel = aiState.model ? (aiState.model.includes('3.8') ? 'Gemini 3.8 Flash' : aiState.model) : 'Gemini 3.8 Flash';
      pill.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span class="text-xs font-bold text-emerald-700 dark:text-emerald-300">${modelLabel}</span>
      `;
      pill.className = "flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 cursor-pointer transition-all hover:bg-emerald-100";
      pill.setAttribute('title', 'Google Gemini API aktivdir. Dəyişmək üçün klikləyin');
    } else {
      pill.innerHTML = `
        <span class="w-2 h-2 rounded-full bg-amber-400"></span>
        <span class="text-xs font-bold text-amber-700 dark:text-amber-300">Aqro-AI Mühərrik</span>
      `;
      pill.className = "flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 cursor-pointer transition-all hover:bg-amber-100";
      pill.setAttribute('title', 'Avtonom rejimdədir. Gemini API açarı daxil etmək üçün klikləyin');
    }
  }

  // Toggle Panel open/close
  window.toggleAgroAiPanel = function(forceOpen) {
    const panel = document.getElementById('agro-ai-agent-panel');
    const trigger = document.getElementById('agro-ai-trigger-btn');
    if (!panel) return;

    if (typeof forceOpen === 'boolean') {
      aiState.isOpen = forceOpen;
    } else {
      aiState.isOpen = !aiState.isOpen;
    }

    if (aiState.isOpen) {
      panel.classList.remove('hidden');
      setTimeout(() => {
        panel.style.transform = 'translateY(0) scale(1)';
        panel.style.opacity = '1';
        panel.style.pointerEvents = 'all';
      }, 10);
      if (trigger) trigger.classList.add('scale-90', 'opacity-75');
      const inputEl = document.getElementById('agro-ai-input');
      if (inputEl) inputEl.focus();
      scrollMessagesToBottom();
    } else {
      panel.style.transform = 'translateY(20px) scale(0.95)';
      panel.style.opacity = '0';
      panel.style.pointerEvents = 'none';
      setTimeout(() => {
        panel.classList.add('hidden');
      }, 250);
      if (trigger) trigger.classList.remove('scale-90', 'opacity-75');
    }
  };

  // Toggle full/compact size
  window.toggleAgroAiFullscreen = function() {
    const panel = document.getElementById('agro-ai-agent-panel');
    const icon = document.getElementById('agro-ai-expand-icon');
    if (!panel) return;

    aiState.isExpanded = !aiState.isExpanded;
    if (aiState.isExpanded) {
      panel.classList.remove('w-[420px]', 'max-w-[calc(100vw-32px)]', 'h-[640px]');
      panel.classList.add('w-[840px]', 'max-w-[calc(100vw-48px)]', 'h-[800px]', 'max-h-[calc(100vh-100px)]');
      if (icon) icon.innerText = 'close_fullscreen';
    } else {
      panel.classList.remove('w-[840px]', 'max-w-[calc(100vw-48px)]', 'h-[800px]', 'max-h-[calc(100vh-100px)]');
      panel.classList.add('w-[420px]', 'max-w-[calc(100vw-32px)]', 'h-[640px]');
      if (icon) icon.innerText = 'open_in_full';
    }
  };

  // Scroll messages container to bottom
  function scrollMessagesToBottom() {
    const container = document.getElementById('agro-ai-messages-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  // Parse markdown simplified
  function formatMarkdown(text) {
    if (!text) return '';
    let html = text
      .replace(/### (.*?)\n/g, '<h4 class="font-bold text-slate-900 dark:text-white text-base mt-2 mb-1">$1</h4>')
      .replace(/#### (.*?)\n/g, '<h5 class="font-bold text-emerald-800 dark:text-emerald-400 text-sm mt-3 mb-1 flex items-center gap-1.5">$1</h5>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 font-mono text-xs">$1</code>')
      .replace(/---/g, '<hr class="my-2 border-slate-200 dark:border-slate-700"/>')
      .replace(/\n\n/g, '<p class="my-1.5"></p>')
      .replace(/\* (.*?)\n/g, '<div class="flex items-start gap-1.5 my-1 ml-1 text-xs"><span class="text-emerald-500 font-bold">•</span><span>$1</span></div>');
    return html;
  }

  // Render All Messages
  function renderAiMessages() {
    const container = document.getElementById('agro-ai-messages-container');
    if (!container) return;

    container.innerHTML = '';

    aiState.messages.forEach(msg => {
      const msgDiv = document.createElement('div');
      msgDiv.className = `flex flex-col mb-4 ${msg.role === 'user' ? 'items-end' : 'items-start'}`;

      if (msg.role === 'user') {
        msgDiv.innerHTML = `
          <div class="max-w-[85%] rounded-2xl rounded-tr-xs bg-emerald-600 text-white px-4 py-2.5 shadow-sm text-sm">
            ${escapeHtml(msg.text)}
          </div>
          <span class="text-[10px] text-slate-400 mt-1 px-1">${msg.timestamp}</span>
        `;
      } else {
        // Assistant Message with rich formatting and structured interactive card
        let structuredHtml = '';
        if (msg.structuredData) {
          structuredHtml = buildStructuredCardHtml(msg.structuredData);
        }

        msgDiv.innerHTML = `
          <div class="flex items-start gap-2.5 max-w-[95%] sm:max-w-[90%]">
            <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-xs mt-0.5">
              <span class="material-symbols-outlined text-[15px]">auto_awesome</span>
            </div>
            <div class="flex-1">
              <div class="rounded-2xl rounded-tl-xs bg-white dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700 p-3.5 shadow-xs text-xs sm:text-[13px] text-slate-800 dark:text-slate-200 leading-relaxed">
                ${formatMarkdown(msg.text)}
                ${structuredHtml}
              </div>
              <div class="flex items-center gap-2 mt-1 px-1">
                <span class="text-[10px] text-slate-400">${msg.timestamp}</span>
                ${msg.isLiveGemini ? `<span class="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">Google Gemini Canlı</span>` : ''}
              </div>
            </div>
          </div>
        `;
      }

      container.appendChild(msgDiv);
    });

    if (aiState.isLoading) {
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'flex items-start gap-2.5 mb-4';
      loadingDiv.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shrink-0 animate-pulse shadow-xs">
          <span class="material-symbols-outlined text-[15px]">auto_awesome</span>
        </div>
        <div class="rounded-2xl rounded-tl-xs bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 px-4 py-3 shadow-xs flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 0s;"></div>
          <div class="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 0.2s;"></div>
          <div class="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style="animation-delay: 0.4s;"></div>
          <span class="text-xs text-slate-500 dark:text-slate-400 font-medium ml-1">Peyk və torpaq bazası analiz edilir...</span>
        </div>
      `;
      container.appendChild(loadingDiv);
    }

    scrollMessagesToBottom();
  }

  // Build Interactive Action Card from structured JSON
  function buildStructuredCardHtml(data) {
    if (!data) return '';
    let html = '';

    const p = data.recommendedParcel;
    const geo = data.geoAnalytics;
    const roi = data.roiSimulation;
    const act = data.action;

    if (p || roi) {
      html += `
        <div class="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-700/80 flex flex-col gap-2.5">
          ${p ? `
            <!-- Parcel Summary Banner -->
            <div class="p-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between">
              <div>
                <div class="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Tövsiyə Edilən Torpaq Sahəsi</div>
                <div class="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                  <span class="material-symbols-outlined text-[16px] text-emerald-600">location_on</span>
                  <span>${p.district} (${p.village || 'Qarabağ'}) • ${p.hectares} ha</span>
                </div>
                <div class="text-[11px] text-slate-600 dark:text-slate-400 font-mono mt-0.5">Kadastr: <strong>${p.cadastreNumber}</strong></div>
              </div>
              <div class="text-right">
                <span class="px-2 py-1 rounded-lg bg-emerald-600 text-white font-black text-xs shadow-xs">
                  ${p.suitabilityPercent || 94}% Uyğunluq
                </span>
              </div>
            </div>
          ` : ''}

          ${geo ? `
            <!-- GeoAI & Satellite Telemetry Metrics -->
            <div class="grid grid-cols-4 gap-1.5 text-center text-[10px]">
              <div class="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span class="text-slate-400 block text-[9px]">Torpaq pH</span>
                <strong class="text-emerald-700 dark:text-emerald-400 text-xs">${geo.soilPh}</strong>
              </div>
              <div class="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span class="text-slate-400 block text-[9px]">Peyk NDVI</span>
                <strong class="text-teal-700 dark:text-teal-400 text-xs">${geo.ndvi}</strong>
              </div>
              <div class="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span class="text-slate-400 block text-[9px]">Bonitet</span>
                <strong class="text-indigo-700 dark:text-indigo-400 text-xs">${geo.soilBonitet || 85} bal</strong>
              </div>
              <div class="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span class="text-slate-400 block text-[9px]">Relyef</span>
                <strong class="text-amber-700 dark:text-amber-400 text-xs">${geo.slopeDeg || 1.2}° meyil</strong>
              </div>
            </div>
          ` : ''}

          ${roi ? `
            <!-- 5-Year Financial Simulator Preview -->
            <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px] text-amber-500">trending_up</span>
                  5 İllik Maliyyə Modeli (${roi.crop})
                </span>
                <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">AKİA Subsidiyalı</span>
              </div>
              <div class="grid grid-cols-3 gap-2 text-[11px]">
                <div>
                  <span class="text-slate-400 block text-[9px]">İnvestisiya (CapEx)</span>
                  <strong class="text-slate-900 dark:text-white">${formatCurrency(roi.totalInvestmentAzn)} ₼</strong>
                </div>
                <div>
                  <span class="text-slate-400 block text-[9px]">İllik Xalis Mənfəət</span>
                  <strong class="text-emerald-600 dark:text-emerald-400">+${formatCurrency(roi.annualNetProfitAzn)} ₼</strong>
                </div>
                <div>
                  <span class="text-slate-400 block text-[9px]">Break-Even</span>
                  <strong class="text-indigo-600 dark:text-indigo-400">${roi.paybackYears} il</strong>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Agentic Action Buttons -->
          <div class="flex flex-wrap items-center gap-2 mt-1">
            ${p ? `
              <button type="button" class="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer border-none shadow-xs transition-transform active:scale-95" onclick="window.agroAiFlyToParcel('${p.cadastreNumber}', ${p.latitude}, ${p.longitude}, ${p.id || 1})">
                <span class="material-symbols-outlined text-[15px]">explore</span>
                <span>Xəritədə Sahəyə Get</span>
              </button>
            ` : ''}

            ${p ? `
              <button type="button" class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer border-none shadow-xs transition-transform active:scale-95" onclick="window.agroAiOpenApplyModal('${p.cadastreNumber}', '${p.district}')">
                <span class="material-symbols-outlined text-[15px]">assignment_turned_in</span>
                <span>Müraciət Et (50 ₼)</span>
              </button>
            ` : ''}

            ${roi ? `
              <button type="button" class="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1 cursor-pointer border-none transition-colors" onclick="window.agroAiOpenRoiModal(${JSON.stringify(roi).replace(/"/g, '&quot;')})">
                <span class="material-symbols-outlined text-[15px]">bar_chart</span>
                <span>ROI Cədvəli</span>
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }

    // Quick next suggestion chips
    if (data.quickSuggestions && data.quickSuggestions.length) {
      html += `
        <div class="mt-3 flex flex-wrap gap-1.5">
          ${data.quickSuggestions.map(q => `
            <button type="button" class="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 hover:border-emerald-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-700 transition-all cursor-pointer" onclick="window.sendAgroAiQuickPrompt('${escapeHtml(q)}')">
              ${escapeHtml(q)}
            </button>
          `).join('')}
        </div>
      `;
    }

    return html;
  }

  // Action: Fly map to parcel
  window.agroAiFlyToParcel = function(cadastreNumber, lat, lng, parcelId) {
    if (window.map && lat && lng) {
      window.map.flyTo([lat, lng], 14, {
        animate: true,
        duration: 1.5
      });

      // Find parcel in allParcels or parcels store
      const allList = window.allParcels || window.parcels || [];
      const matched = allList.find(p => p.cadastreNumber === cadastreNumber || p.id === parcelId);
      if (matched) {
        if (typeof window.highlightSelectedInvestmentParcel === 'function') {
          window.highlightSelectedInvestmentParcel(matched, true);
        }
        if (typeof window.updateSelectedPlotCard === 'function') {
          window.updateSelectedPlotCard(matched);
        }
      }

      // If on mobile screen, close or collapse panel so user sees the map
      if (window.innerWidth < 640) {
        window.toggleAgroAiPanel(false);
      }
    } else {
      alert(`Kadastr Kodu: ${cadastreNumber}\nKoordinatlar: ${lat}° N, ${lng}° E`);
    }
  };

  // Action: Open Application modal prefilled
  window.agroAiOpenApplyModal = function(cadastreNumber, district) {
    if (typeof window.openApplyModal === 'function') {
      window.openApplyModal(cadastreNumber, `${district} İnvestisiya Sahəsi`);
      window.toggleAgroAiPanel(false);
    } else {
      alert(`Müraciət Forması: ${cadastreNumber} sahəsi üzrə Fərman № 236 əsasında müraciət açılır.`);
    }
  };

  // Action: Open ROI Detail Modal
  window.agroAiOpenRoiModal = function(roi) {
    const modal = document.getElementById('modal-agro-ai-roi');
    if (!modal) return;

    document.getElementById('ai-roi-crop-name').innerText = roi.crop || 'Aqrar Layihə';
    document.getElementById('ai-roi-hectares').innerText = `${roi.hectares || 85} ha`;
    document.getElementById('ai-roi-capex').innerText = `${formatCurrency(roi.totalInvestmentAzn)} ₼`;
    document.getElementById('ai-roi-subsidy').innerText = `-${formatCurrency(roi.akiaSubsidyAzn)} ₼`;
    document.getElementById('ai-roi-net-capex').innerText = `${formatCurrency(roi.netInvestmentAzn)} ₼`;
    document.getElementById('ai-roi-annual-rev').innerText = `${formatCurrency(roi.annualRevenueAzn)} ₼`;
    document.getElementById('ai-roi-annual-opex').innerText = `-${formatCurrency(roi.annualOpExAzn)} ₼`;
    document.getElementById('ai-roi-annual-profit').innerText = `+${formatCurrency(roi.annualNetProfitAzn)} ₼`;
    document.getElementById('ai-roi-payback').innerText = `${roi.paybackYears} İl`;
    document.getElementById('ai-roi-five-year-profit').innerText = `+${formatCurrency(roi.fiveYearNetProfitAzn)} ₼`;

    modal.classList.remove('hidden');
  };

  window.closeAgroAiRoiModal = function() {
    const modal = document.getElementById('modal-agro-ai-roi');
    if (modal) modal.classList.add('hidden');
  };

  // Send message to backend / Gemini
  window.sendAgroAiMessage = async function(customText) {
    const inputEl = document.getElementById('agro-ai-input');
    const text = customText || (inputEl ? inputEl.value.trim() : '');
    if (!text || aiState.isLoading) return;

    if (inputEl) inputEl.value = '';

    // Add user message
    const userMsg = {
      id: 'usr-' + Date.now(),
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: text
    };
    aiState.messages.push(userMsg);
    aiState.isLoading = true;
    renderAiMessages();

    // Prepare current map context
    const currentParcel = window.currentSelectedParcel || null;
    const context = {
      selectedParcelId: currentParcel ? currentParcel.id : null,
      selectedCadastre: currentParcel ? currentParcel.cadastreNumber : null,
      selectedDistrict: currentParcel ? currentParcel.district : null
    };

    try {
      const res = await fetch('/api/v1/ai/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: context,
          customApiKey: aiState.apiKey
        })
      });

      const data = await res.json();
      if (data && data.success) {
        aiState.messages.push({
          id: 'asst-' + Date.now(),
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: data.replyText,
          structuredData: data.structuredData,
          isLiveGemini: data.isLiveGemini
        });
      } else {
        aiState.messages.push({
          id: 'err-' + Date.now(),
          role: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `⚠️ Üzr istəyirik, sorğunun icrası zamanı xəta baş verdi: ${data ? data.error : 'Bilinməyən xəta'}. Zəhmət olmasa yenidən cəhd edin.`
        });
      }
    } catch (err) {
      console.error('sendAgroAiMessage error:', err);
      aiState.messages.push({
        id: 'err-' + Date.now(),
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `⚠️ Şəbəkə xətası baş verdi. Server ilə əlaqə qurula bilmədi.`
      });
    } finally {
      aiState.isLoading = false;
      renderAiMessages();
    }
  };

  window.sendAgroAiQuickPrompt = function(promptText) {
    window.sendAgroAiMessage(promptText);
  };

  // Analyze currently selected parcel on map
  window.agroAiAnalyzeCurrentParcel = function() {
    const current = window.currentSelectedParcel;
    if (!current) {
      window.sendAgroAiMessage("Xəritədəki ən perspektivli torpaq sahəsini analiz et.");
    } else {
      window.sendAgroAiMessage(`Seçilmiş ${current.district} rayonu üzrə ${current.cadastreNumber} kadastr sahəsini (${current.areaHectares} ha) GeoAI və ROI baxımından tam analiz et.`);
    }
  };

  // API Key Settings Modal
  window.openGeminiKeySettings = function() {
    const modal = document.getElementById('modal-gemini-key-settings');
    const input = document.getElementById('gemini-api-key-input');
    const statusMsg = document.getElementById('gemini-key-status-msg');
    if (input) input.value = aiState.apiKey || '';
    if (statusMsg) statusMsg.innerHTML = '';
    if (modal) modal.classList.remove('hidden');
  };

  window.closeGeminiKeySettings = function() {
    const modal = document.getElementById('modal-gemini-key-settings');
    if (modal) modal.classList.add('hidden');
  };

  window.saveGeminiApiKey = async function() {
    const input = document.getElementById('gemini-api-key-input');
    const statusMsg = document.getElementById('gemini-key-status-msg');
    const testKey = input ? input.value.trim() : '';

    if (!testKey) {
      localStorage.removeItem(AGRO_AI_STORAGE_KEY);
      aiState.apiKey = '';
      updateAiHeaderStatusPill();
      if (statusMsg) {
        statusMsg.innerHTML = '<span class="text-amber-600 font-bold">Açar təmizləndi. Avtonom rejim aktivdir.</span>';
      }
      setTimeout(closeGeminiKeySettings, 1000);
      return;
    }

    if (statusMsg) {
      statusMsg.innerHTML = '<span class="text-blue-600 font-medium animate-pulse">Google Gemini API açarı yoxlanılır...</span>';
    }

    try {
      const res = await fetch('/api/v1/ai/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: testKey })
      });
      const data = await res.json();
      if (data && data.success) {
        localStorage.setItem(AGRO_AI_STORAGE_KEY, testKey);
        aiState.apiKey = testKey;
        updateAiHeaderStatusPill();
        if (statusMsg) {
          statusMsg.innerHTML = '<span class="text-emerald-600 font-bold">✓ Təsdiqləndi! Google Gemini 1.5 Flash aktiv edildi.</span>';
        }
        setTimeout(closeGeminiKeySettings, 1200);
      } else {
        if (statusMsg) {
          statusMsg.innerHTML = `<span class="text-red-600 font-bold">Xəta: ${data.error || 'Açar etibarsızdır'}</span>`;
        }
      }
    } catch (e) {
      if (statusMsg) {
        statusMsg.innerHTML = `<span class="text-red-600 font-bold">Yoxlama xətası: ${e.message}</span>`;
      }
    }
  };

  // Helper utils
  function formatCurrency(val) {
    if (!val && val !== 0) return '0';
    return Math.round(val).toLocaleString('az-AZ');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // On DOM Ready
  document.addEventListener('DOMContentLoaded', function() {
    checkAiAgentStatus();
    renderAiMessages();

    // Enter key sends message
    const inputEl = document.getElementById('agro-ai-input');
    if (inputEl) {
      inputEl.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          window.sendAgroAiMessage();
        }
      });
    }
  });

})();
