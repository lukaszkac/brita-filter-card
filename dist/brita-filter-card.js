/**
 * brita-filter-card
 * Animated Lovelace card for the Brita Filter integration
 * https://github.com/lukaszkac/brita-filter-card
 */

const TRANSLATIONS = {
  en: {
    title: "Brita Water Filter",
    remaining: "REMAINING",
    days_used: "days used",
    days_left: "days left",
    display: "display",
    replace_soon: "Replace soon",
    replace_now: "Replace now!",
  },
  pl: {
    title: "Filtr wody Brita",
    remaining: "ZOSTAŁO",
    days_used: "dni pracy",
    days_left: "dni zostało",
    display: "wyświetlacz",
    replace_soon: "Wkrótce wymień",
    replace_now: "Wymień filtr!",
  },
};

function t(hass, key, config) {
  const lang = config?.language || hass?.locale?.language || "en";
  const dict = TRANSLATIONS[lang] || TRANSLATIONS["en"];
  return dict[key] ?? TRANSLATIONS["en"][key] ?? key;
}

// Detect HA theme: returns "dark" or "light"
function detectHATheme() {
  try {
    const ha = document.querySelector("home-assistant");
    const theme = ha?.shadowRoot?.querySelector("home-assistant-main")
      ?.shadowRoot?.querySelector("ha-panel-lovelace")
      ?.shadowRoot?.querySelector("hui-root")
      ?.getAttribute("dark") ?? null;
    if (theme !== null) return "dark";
  } catch (_) {}
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const THEMES = {
  dark: {
    cardBg: "#0f1923",
    cardBorder: "rgba(79,195,232,0.12)",
    titleColor: "#4fc3e8",
    textPrimary: "#e8f4f8",
    textSecondary: "#4a7a9b",
    divider: "rgba(255,255,255,0.08)",
    statusGood: "#4fc3e8",
    statusSoon: "#f0a855",
    statusNow: "#e05c5c",
    waterGoodTop: "#4fc3e8",
    waterGoodBot: "#1a7fa8",
    waterSoonTop: "#f0a855",
    waterSoonBot: "#c07020",
    waterNowTop: "#e05c5c",
    waterNowBot: "#a03030",
    dropBg: "rgba(255,255,255,0.04)",
    dropStroke: "rgba(255,255,255,0.12)",
    shadow: "rgba(30,120,180,0.5)",
    pctText: "#ffffff",
    pctSub: "rgba(255,255,255,0.6)",
  },
  light: {
    cardBg: "#f0f8ff",
    cardBorder: "rgba(26,127,168,0.18)",
    titleColor: "#1a7fa8",
    textPrimary: "#1a2a3a",
    textSecondary: "#5a8aab",
    divider: "rgba(0,0,0,0.1)",
    statusGood: "#1a7fa8",
    statusSoon: "#c07020",
    statusNow: "#c03030",
    waterGoodTop: "#4fc3e8",
    waterGoodBot: "#1a7fa8",
    waterSoonTop: "#f0a855",
    waterSoonBot: "#c07020",
    waterNowTop: "#e05c5c",
    waterNowBot: "#a03030",
    dropBg: "rgba(26,127,168,0.06)",
    dropStroke: "rgba(26,127,168,0.25)",
    shadow: "rgba(26,127,168,0.25)",
    pctText: "#ffffff",
    pctSub: "rgba(255,255,255,0.85)",
  },
};

class BritaFilterCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("Please define entity (sensor.brita_filter_remaining)");
    }
    this.config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  // Derive sibling entity IDs from the configured remaining entity.
  // e.g. sensor.brita_filter_remaining → base = sensor.brita_filter
  //      sensor.brita_filter_2_remaining → base = sensor.brita_filter_2
  _getEntity(suffix) {
    const base = this.config.entity.replace(/_remaining$/, "");
    return this._hass.states[`${base}${suffix}`];
  }

  _resolveTheme() {
    const cfg = this.config.theme || "auto";
    if (cfg === "dark") return THEMES.dark;
    if (cfg === "light") return THEMES.light;
    // auto: detect from HA
    return detectHATheme() === "dark" ? THEMES.dark : THEMES.light;
  }

  _render() {
    const hass = this._hass;
    const cfg = this.config;
    const th = this._resolveTheme();

    const pctEntity = hass.states[cfg.entity];
    if (!pctEntity) {
      this.shadowRoot.innerHTML = `<ha-card><div style="padding:16px;color:red;">Entity not found: ${cfg.entity}</div></ha-card>`;
      return;
    }

    const pct = parseInt(pctEntity.state) || 0;
    const daysEntity   = this._getEntity("_days_since");
    const statusEntity = this._getEntity("_status");
    const displayEntity = this._getEntity("_display_level");

    const days = daysEntity ? parseInt(daysEntity.state) || 0 : 0;
    const lifetime = pctEntity.attributes.filter_lifetime_days || 28;
    const left = Math.max(lifetime - days, 0);
    const displayLevel = displayEntity ? displayEntity.state : "-";
    const statusRaw = statusEntity ? statusEntity.state : "good";

    const statusLabel = statusRaw === "replace_soon" ? t(hass, "replace_soon", cfg)
                      : statusRaw === "replace_now"  ? t(hass, "replace_now", cfg)
                      : "";
    const statusColor = statusRaw === "replace_soon" ? th.statusSoon
                      : statusRaw === "replace_now"  ? th.statusNow
                      : th.statusGood;

    const waterTop = pct > 50 ? th.waterGoodTop : pct > 15 ? th.waterSoonTop : th.waterNowTop;
    const waterBot = pct > 50 ? th.waterGoodBot : pct > 15 ? th.waterSoonBot : th.waterNowBot;

    const fillY  = 90 - pct * 0.72;
    const fillY2 = fillY + 3;
    const title  = cfg.title || t(hass, "title", cfg);

    this.shadowRoot.innerHTML = `
      <style>
        ha-card {
          padding: 24px;
          box-sizing: border-box;
          background: ${th.cardBg};
          border: 1px solid ${th.cardBorder};
        }
        .wrap { width: 100%; text-align: center; }
        .title {
          font-size: 11px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: ${th.titleColor};
          margin-bottom: 14px;
        }
        .drop {
          display: block;
          margin: 0 auto 16px;
          filter: drop-shadow(0 4px 16px ${th.shadow});
        }
        .stats {
          display: inline-flex;
          gap: 0;
          justify-content: center;
          margin-bottom: ${statusLabel ? "12px" : "0"};
        }
        .stat { padding: 0 16px; text-align: center; }
        .stat-val {
          font-size: 20px;
          font-weight: 600;
          color: ${th.textPrimary};
        }
        .stat-lbl {
          font-size: 9px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: ${th.textSecondary};
          margin-top: 2px;
        }
        .divider {
          width: 1px;
          background: ${th.divider};
          margin: 4px 0;
        }
        .status {
          font-size: 11px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: ${statusColor};
        }
        @keyframes bwave1 {
          0%,100% { d: path("M0,${fillY} Q15,${fillY-6} 30,${fillY} Q45,${fillY+6} 60,${fillY} Q75,${fillY-6} 90,${fillY} Q105,${fillY+6} 120,${fillY} L120,120 L0,120 Z"); }
          50%     { d: path("M0,${fillY} Q15,${fillY+6} 30,${fillY} Q45,${fillY-6} 60,${fillY} Q75,${fillY+6} 90,${fillY} Q105,${fillY-6} 120,${fillY} L120,120 L0,120 Z"); }
        }
        @keyframes bwave2 {
          0%,100% { d: path("M0,${fillY2} Q15,${fillY2+5} 30,${fillY2} Q45,${fillY2-5} 60,${fillY2} Q75,${fillY2+5} 90,${fillY2} Q105,${fillY2-5} 120,${fillY2} L120,120 L0,120 Z"); }
          50%     { d: path("M0,${fillY2} Q15,${fillY2-5} 30,${fillY2} Q45,${fillY2+5} 60,${fillY2} Q75,${fillY2-5} 90,${fillY2} Q105,${fillY2+5} 120,${fillY2} L120,120 L0,120 Z"); }
        }
        .bw1 { animation: bwave1 2.4s ease-in-out infinite; }
        .bw2 { animation: bwave2 1.8s ease-in-out infinite; }
      </style>
      <ha-card>
        <div class="wrap">
          <div class="title">💧 ${title}</div>
          <svg class="drop" viewBox="0 0 120 120" width="120" height="120" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <clipPath id="bfc-clip">
                <path d="M60 8 C60 8,20 55,20 75 A40 40 0 0 0 100 75 C100 55,60 8,60 8Z"/>
              </clipPath>
              <linearGradient id="bfc-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="${waterTop}" stop-opacity="0.9"/>
                <stop offset="100%" stop-color="${waterBot}"/>
              </linearGradient>
            </defs>
            <path d="M60 8 C60 8,20 55,20 75 A40 40 0 0 0 100 75 C100 55,60 8,60 8Z"
                  fill="${th.dropBg}" stroke="${th.dropStroke}" stroke-width="1.5"/>
            <g clip-path="url(#bfc-clip)">
              <rect x="0" y="${fillY}" width="120" height="${120-fillY}" fill="url(#bfc-grad)" opacity="0.85"/>
              <path class="bw2" d="M0,${fillY2} Q15,${fillY2+5} 30,${fillY2} Q45,${fillY2-5} 60,${fillY2} Q75,${fillY2+5} 90,${fillY2} Q105,${fillY2-5} 120,${fillY2} L120,120 L0,120 Z" fill="url(#bfc-grad)" opacity="0.4"/>
              <path class="bw1" d="M0,${fillY} Q15,${fillY-6} 30,${fillY} Q45,${fillY+6} 60,${fillY} Q75,${fillY-6} 90,${fillY} Q105,${fillY+6} 120,${fillY} L120,120 L0,120 Z" fill="url(#bfc-grad)" opacity="0.6"/>
            </g>
            <text x="60" y="74" text-anchor="middle" font-family="Georgia,serif" font-size="22" font-weight="bold" fill="${th.pctText}">${pct}%</text>
            <text x="60" y="87" text-anchor="middle" font-family="Arial,sans-serif" font-size="7" fill="${th.pctSub}" letter-spacing="1.5">${t(hass, "remaining", cfg)}</text>
          </svg>
          <div class="stats">
            <div class="stat">
              <div class="stat-val">${days}</div>
              <div class="stat-lbl">${t(hass, "days_used", cfg)}</div>
            </div>
            <div class="divider"></div>
            <div class="stat">
              <div class="stat-val">${left}</div>
              <div class="stat-lbl">${t(hass, "days_left", cfg)}</div>
            </div>
            <div class="divider"></div>
            <div class="stat">
              <div class="stat-val">${displayLevel}</div>
              <div class="stat-lbl">${t(hass, "display", cfg)}</div>
            </div>
          </div>
          ${statusLabel ? `<div class="status">${statusLabel}</div>` : ""}
        </div>
      </ha-card>
    `;
  }

  getCardSize() { return 4; }

  static getConfigElement() {
    return document.createElement("brita-filter-card-editor");
  }

  static getStubConfig() {
    return { entity: "sensor.brita_filter_remaining" };
  }
}

class BritaFilterCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
  }

  _render() {
    const langs = Object.keys(TRANSLATIONS).join(", ");
    this.shadowRoot.innerHTML = `
      <style>
        .row { padding: 8px 16px; }
        label { display:block; font-size:12px; font-weight:500; margin-bottom:4px; }
        input, select { width:100%; padding:8px; box-sizing:border-box; }
        small { color: var(--secondary-text-color); font-size:11px; }
      </style>
      <div class="row">
        <label>Entity (sensor.brita_filter_remaining)</label>
        <input id="entity" value="${this._config?.entity || ""}"/>
      </div>
      <div class="row">
        <label>Title (optional)</label>
        <input id="title" value="${this._config?.title || ""}"/>
      </div>
      <div class="row">
        <label>Language (optional)</label>
        <input id="language" value="${this._config?.language || ""}" placeholder="auto"/>
        <small>Available: ${langs}. Leave empty to auto-detect from HA.</small>
      </div>
      <div class="row">
        <label>Theme</label>
        <select id="theme">
          <option value="auto" ${(this._config?.theme || "auto") === "auto" ? "selected" : ""}>Auto (follow HA)</option>
          <option value="dark"  ${this._config?.theme === "dark"  ? "selected" : ""}>Dark</option>
          <option value="light" ${this._config?.theme === "light" ? "selected" : ""}>Light</option>
        </select>
      </div>
    `;

    ["entity", "title", "language", "theme"].forEach(field => {
      this.shadowRoot.querySelector(`#${field}`).addEventListener("change", (e) => {
        const val = e.target.value.trim();
        const updated = { ...this._config };
        if (val && !(field === "theme" && val === "auto")) updated[field] = val;
        else delete updated[field];
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: updated } }));
      });
    });
  }
}

customElements.define("brita-filter-card", BritaFilterCard);
customElements.define("brita-filter-card-editor", BritaFilterCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "brita-filter-card",
  name: "Brita Filter Card",
  description: "Animated water drop card for Brita Filter integration",
  preview: true,
});
