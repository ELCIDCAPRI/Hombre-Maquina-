const Accessibility = {
    _key: 'ts_accessibility',
    settings: {
        fontSize: 100,
        language: 'es',
        profile: null,
        contrast: false,
        cursor: false,
        readingMask: false,
        dyslexiaFriendly: false,
        bigLineHeight: false
    },
    speechSynth: window.speechSynthesis,

    init() {
        const saved = JSON.parse(localStorage.getItem(this._key) || '{}');
        this.settings = { ...this.settings, ...saved };
        this._injectWidget();
        this._apply();
        this._updateToggles();
        this._updateProfileUI();
        this._updateLanguage();
    },

    _injectWidget() {
        const btn = document.createElement('button');
        btn.id = 'acc-btn';
        btn.className = 'acc-float-btn';
        btn.setAttribute('aria-label', 'Opciones de accesibilidad');
        btn.setAttribute('title', 'Accesibilidad');
        btn.innerHTML = '<span style="font-size:1.3rem;">♿</span>';
        btn.onclick = () => this.togglePanel();

        const overlay = document.createElement('div');
        overlay.id = 'acc-overlay';
        overlay.className = 'acc-overlay';
        overlay.onclick = () => this.togglePanel();

        const panel = document.createElement('div');
        panel.id = 'acc-panel';
        panel.className = 'acc-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', 'Panel de accesibilidad');

        const s = this.settings;

        panel.innerHTML = `
            <div class="acc-panel-header">
                <div class="acc-panel-header-left">
                    <span class="acc-icon">♿</span>
                    <h2 class="acc-title">Accesibilidad</h2>
                </div>
                <button class="acc-panel-close" id="acc-close" aria-label="Cerrar panel">&times;</button>
            </div>
            <div class="acc-panel-body">
                <div class="acc-section">
                    <div class="acc-section-label">Idioma</div>
                    <div class="acc-select-wrapper">
                        <select class="acc-select" id="acc-language">
                            <option value="es" ${s.language === 'es' ? 'selected' : ''}>Español ✓</option>
                            <option value="en" ${s.language === 'en' ? 'selected' : ''}>Inglés</option>
                            <option value="qu" ${s.language === 'qu' ? 'selected' : ''}>Quechua</option>
                        </select>
                    </div>
                </div>

                <div class="acc-section">
                    <div class="acc-section-label">Perfil</div>
                    <div class="acc-profile-list" id="acc-profiles">
                        <div class="acc-profile-option ${s.profile === 'vision_baja' ? 'active' : ''}" data-profile="vision_baja">
                            <div class="acc-radio"></div><span>Visión Baja</span>
                        </div>
                        <div class="acc-profile-option ${s.profile === 'dislexia' ? 'active' : ''}" data-profile="dislexia">
                            <div class="acc-radio"></div><span>Dislexia</span>
                        </div>
                        <div class="acc-profile-option ${s.profile === 'tdah' ? 'active' : ''}" data-profile="tdah">
                            <div class="acc-radio"></div><span>TDHA</span>
                        </div>
                        <div class="acc-profile-option ${s.profile === 'daltonismo' ? 'active' : ''}" data-profile="daltonismo">
                            <div class="acc-radio"></div><span>Daltonismo</span>
                        </div>
                    </div>
                </div>

                <div class="acc-section">
                    <div class="acc-section-label">Ajustes Visuales</div>
                    <div class="acc-toggles-grid">
                        <div>
                            <div style="font-size:0.82rem;color:var(--brown,#4d3e35);margin-bottom:6px;">Tamaño de texto</div>
                            <div class="acc-slider-wrapper">
                                <input type="range" class="acc-slider" id="acc-font-slider" min="70" max="150" step="10" value="${s.fontSize}">
                                <span class="acc-slider-value" id="acc-font-value">${s.fontSize}%</span>
                            </div>
                        </div>
                        <button class="acc-toggle-btn ${s.contrast ? 'active' : ''}" data-setting="contrast" id="acc-contrast">
                            <span>Contrastes</span><div class="acc-toggle-switch"></div>
                        </button>
                        <button class="acc-toggle-btn ${s.cursor ? 'active' : ''}" data-setting="cursor" id="acc-cursor">
                            <span>Cursor</span><div class="acc-toggle-switch"></div>
                        </button>
                        <button class="acc-toggle-btn ${s.readingMask ? 'active' : ''}" data-setting="readingMask" id="acc-mask">
                            <span>Máscara de lectura</span><div class="acc-toggle-switch"></div>
                        </button>
                        <button class="acc-toggle-btn ${s.dyslexiaFriendly ? 'active' : ''}" data-setting="dyslexiaFriendly" id="acc-dyslexia">
                            <span>Dislexia amigable</span><div class="acc-toggle-switch"></div>
                        </button>
                        <button class="acc-toggle-btn ${s.bigLineHeight ? 'active' : ''}" data-setting="bigLineHeight" id="acc-lineheight">
                            <span>Interlineado</span><div class="acc-toggle-switch"></div>
                        </button>
                    </div>
                </div>
            </div>
            <button class="acc-reset-btn" id="acc-reset">Restablecer</button>
        `;

        document.body.appendChild(btn);
        document.body.appendChild(overlay);
        document.body.appendChild(panel);
        this._bindEvents();
    },

    _bindEvents() {
        document.getElementById('acc-close').onclick = () => this.togglePanel();

        document.getElementById('acc-language').onchange = (e) => {
            this.settings.language = e.target.value;
            this._save();
            this._updateLanguage();
        };

        document.querySelectorAll('.acc-profile-option').forEach(el => {
            el.onclick = () => {
                const profile = el.dataset.profile;
                if (this.settings.profile === profile) {
                    this.settings.profile = null;
                } else {
                    this.settings.profile = profile;
                }
                document.querySelectorAll('.acc-profile-option').forEach(o => o.classList.remove('active'));
                if (this.settings.profile) el.classList.add('active');
                this._save();
                this._applyProfile();
                this._apply();
                this._updateToggles();
                this._updateSlider();
            };
        });

        ['contrast', 'cursor', 'readingMask', 'dyslexiaFriendly', 'bigLineHeight'].forEach(key => {
            const id = key === 'contrast' ? 'acc-contrast' :
                       key === 'cursor' ? 'acc-cursor' :
                       key === 'readingMask' ? 'acc-mask' :
                       key === 'dyslexiaFriendly' ? 'acc-dyslexia' :
                       'acc-lineheight';
            document.getElementById(id).onclick = () => {
                this.settings[key] = !this.settings[key];
                this._save();
                this._apply();
                this._updateToggles();
            };
        });

        const slider = document.getElementById('acc-font-slider');
        slider.oninput = () => {
            this.settings.fontSize = parseInt(slider.value);
            document.getElementById('acc-font-value').textContent = this.settings.fontSize + '%';
            this._save();
            this._apply();
        };

        document.getElementById('acc-reset').onclick = () => this.reset();
    },

    togglePanel() {
        document.getElementById('acc-panel').classList.toggle('show');
        document.getElementById('acc-overlay').classList.toggle('show');
    },

    reset() {
        this.settings = {
            fontSize: 100, language: 'es', profile: null,
            contrast: false, cursor: false, readingMask: false,
            dyslexiaFriendly: false, bigLineHeight: false
        };
        this._save();
        this._apply();
        this._updateToggles();
        this._updateProfileUI();
        this._updateLanguage();
        this._updateSlider();
    },

    _save() {
        localStorage.setItem(this._key, JSON.stringify(this.settings));
    },

    _apply() {
        const html = document.documentElement;
        const s = this.settings;

        html.style.fontSize = s.fontSize + '%';
        html.classList.toggle('acc-high-contrast', s.contrast);
        html.classList.toggle('acc-cursor-large', s.cursor);
        html.classList.toggle('acc-dyslexia-friendly', s.dyslexiaFriendly);
        html.classList.toggle('acc-big-line-height', s.bigLineHeight);

        const htmlClasses = html.className.split(' ').filter(c =>
            !c.startsWith('acc-profile-')
        );
        if (s.profile) htmlClasses.push('acc-profile-' + s.profile);
        html.className = htmlClasses.join(' ');

        this._applyReadingMask(s.readingMask);
    },

    _applyReadingMask(active) {
        const existing = document.getElementById('acc-reading-mask');
        if (active && !existing) {
            const mask = document.createElement('div');
            mask.id = 'acc-reading-mask';
            mask.className = 'acc-reading-mask-track';
            mask.style.top = '0px';
            document.body.appendChild(mask);
            this._maskMoveHandler = (e) => {
                mask.style.top = (e.clientY - 60) + 'px';
            };
            document.addEventListener('mousemove', this._maskMoveHandler);
        } else if (!active && existing) {
            existing.remove();
            if (this._maskMoveHandler) {
                document.removeEventListener('mousemove', this._maskMoveHandler);
                this._maskMoveHandler = null;
            }
        }
    },

    _applyProfile() {
        const s = this.settings;
        switch (s.profile) {
            case 'vision_baja':
                s.fontSize = Math.max(s.fontSize, 130);
                s.contrast = true;
                break;
            case 'dislexia':
                s.dyslexiaFriendly = true;
                s.bigLineHeight = true;
                break;
            case 'tdah':
                break;
            case 'daltonismo':
                break;
        }
    },

    _updateToggles() {
        const s = this.settings;
        const pairs = {
            'acc-contrast': s.contrast, 'acc-cursor': s.cursor,
            'acc-mask': s.readingMask, 'acc-dyslexia': s.dyslexiaFriendly,
            'acc-lineheight': s.bigLineHeight
        };
        Object.entries(pairs).forEach(([id, active]) => {
            const el = document.getElementById(id);
            if (el) el.classList.toggle('active', active);
        });
    },

    _updateProfileUI() {
        document.querySelectorAll('.acc-profile-option').forEach(el => {
            el.classList.toggle('active', el.dataset.profile === this.settings.profile);
        });
    },

    _updateSlider() {
        const sl = document.getElementById('acc-font-slider');
        const fv = document.getElementById('acc-font-value');
        if (sl) sl.value = this.settings.fontSize;
        if (fv) fv.textContent = this.settings.fontSize + '%';
    },

    _updateLanguage() {
        const lang = document.getElementById('acc-language');
        if (lang) lang.value = this.settings.language;
    },

    _speak(text) {
        if (!this.speechSynth) return;
        this.speechSynth.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = this.settings.language === 'en' ? 'en-US' :
                 this.settings.language === 'qu' ? 'qu-PE' : 'es-PE';
        u.rate = 0.9;
        this.speechSynth.speak(u);
    }
};

document.addEventListener('DOMContentLoaded', () => Accessibility.init());
