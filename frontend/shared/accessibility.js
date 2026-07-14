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
        bigLineHeight: false,
        ruler: false
    },
    speechSynth: window.speechSynthesis,

    init() {
        const saved = JSON.parse(localStorage.getItem(this._key) || '{}');
        this.settings = { ...this.settings, ...saved };
        this._injectWidget();
        this._apply();
        this._updateToggles();
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

                <!-- SECCIÓN 1: IDIOMA -->
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

                <!-- SECCIÓN 2: PERFIL -->
                <div class="acc-section">
                    <div class="acc-section-label">Perfil</div>
                    <div class="acc-profile-list" id="acc-profiles">
                        <div class="acc-profile-option ${s.profile === 'vision_baja' ? 'active' : ''}" data-profile="vision_baja">
                            <div class="acc-radio"></div>
                            <span>Visión Baja</span>
                        </div>
                        <div class="acc-profile-option ${s.profile === 'dislexia' ? 'active' : ''}" data-profile="dislexia">
                            <div class="acc-radio"></div>
                            <span>Dislexia</span>
                        </div>
                        <div class="acc-profile-option ${s.profile === 'tdah' ? 'active' : ''}" data-profile="tdah">
                            <div class="acc-radio"></div>
                            <span>TDHA</span>
                        </div>
                        <div class="acc-profile-option ${s.profile === 'daltonismo' ? 'active' : ''}" data-profile="daltonismo">
                            <div class="acc-radio"></div>
                            <span>Daltonismo</span>
                        </div>
                    </div>
                </div>

                <!-- SECCIÓN 3: AJUSTES VISUALES -->
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
                            <span>Contrastes</span>
                            <div class="acc-toggle-switch"></div>
                        </button>

                        <button class="acc-toggle-btn ${s.cursor ? 'active' : ''}" data-setting="cursor" id="acc-cursor">
                            <span>Cursor</span>
                            <div class="acc-toggle-switch"></div>
                        </button>

                        <button class="acc-toggle-btn ${s.readingMask ? 'active' : ''}" data-setting="readingMask" id="acc-mask">
                            <span>Máscara de lectura</span>
                            <div class="acc-toggle-switch"></div>
                        </button>

                        <button class="acc-toggle-btn ${s.dyslexiaFriendly ? 'active' : ''}" data-setting="dyslexiaFriendly" id="acc-dyslexia">
                            <span>Dislexia amigable</span>
                            <div class="acc-toggle-switch"></div>
                        </button>

                        <button class="acc-toggle-btn ${s.bigLineHeight ? 'active' : ''}" data-setting="bigLineHeight" id="acc-lineheight">
                            <span>Interlineado</span>
                            <div class="acc-toggle-switch"></div>
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
                this.settings.profile = this.settings.profile === profile ? null : profile;
                document.querySelectorAll('.acc-profile-option').forEach(o => o.classList.remove('active'));
                if (this.settings.profile) el.classList.add('active');
                this._save();
                this._applyProfile();
            };
        });

        const toggles = ['contrast', 'cursor', 'readingMask', 'dyslexiaFriendly', 'bigLineHeight'];
        toggles.forEach(key => {
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
        const panel = document.getElementById('acc-panel');
        const overlay = document.getElementById('acc-overlay');
        panel.classList.toggle('show');
        overlay.classList.toggle('show');
    },

    reset() {
        this.settings = {
            fontSize: 100,
            language: 'es',
            profile: null,
            contrast: false,
            cursor: false,
            readingMask: false,
            dyslexiaFriendly: false,
            bigLineHeight: false,
            ruler: false
        };
        this._save();
        this._apply();
        this._updateToggles();
        this._updateProfileUI();
        this._updateLanguage();
        const slider = document.getElementById('acc-font-slider');
        if (slider) slider.value = 100;
        const fv = document.getElementById('acc-font-value');
        if (fv) fv.textContent = '100%';
        const lang = document.getElementById('acc-language');
        if (lang) lang.value = 'es';
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

        const mask = document.getElementById('acc-reading-mask');
        if (s.readingMask && !mask) {
            const m = document.createElement('div');
            m.id = 'acc-reading-mask';
            m.className = 'acc-reading-mask-track';
            m.style.top = '0px';
            document.body.appendChild(m);
            document.addEventListener('mousemove', this._maskHandler);
        } else if (!s.readingMask && mask) {
            mask.remove();
            document.removeEventListener('mousemove', this._maskHandler);
        }

        if (s.profile === 'tdah' && !document.getElementById('acc-ruler') && s.ruler !== false) {
            this._enableRuler();
        }
        if (s.profile !== 'tdah') {
            this._disableRuler();
        }

        this._applyProfile();
    },

    _maskHandler: function(e) {
        const mask = document.getElementById('acc-reading-mask');
        if (mask) {
            mask.style.top = (e.clientY - 60) + 'px';
        }
    },

    _enableRuler() {
        if (document.getElementById('acc-ruler')) return;
        const ruler = document.createElement('div');
        ruler.id = 'acc-ruler';
        ruler.className = 'acc-ruler';
        document.body.appendChild(ruler);
        document.addEventListener('mousemove', this._rulerMoveHandler);
    },

    _disableRuler() {
        const ruler = document.getElementById('acc-ruler');
        if (ruler) ruler.remove();
        document.removeEventListener('mousemove', this._rulerMoveHandler);
    },

    _rulerMoveHandler: function(e) {
        const ruler = document.getElementById('acc-ruler');
        if (ruler) ruler.style.top = (e.clientY - 2) + 'px';
    },

    _applyProfile() {
        const html = document.documentElement;
        html.classList.remove('acc-profile-vision', 'acc-profile-dislexia', 'acc-profile-tdah', 'acc-profile-daltonismo');

        switch (this.settings.profile) {
            case 'vision_baja':
                html.classList.add('acc-profile-vision');
                this.settings.fontSize = Math.max(this.settings.fontSize, 130);
                this.settings.contrast = true;
                const sl = document.getElementById('acc-font-slider');
                if (sl) sl.value = this.settings.fontSize;
                const fv = document.getElementById('acc-font-value');
                if (fv) fv.textContent = this.settings.fontSize + '%';
                this._apply();
                this._updateToggles();
                break;

            case 'dislexia':
                html.classList.add('acc-profile-dislexia');
                this.settings.dyslexiaFriendly = true;
                this.settings.bigLineHeight = true;
                this._apply();
                this._updateToggles();
                break;

            case 'tdah':
                html.classList.add('acc-profile-tdah');
                this._enableRuler();
                break;

            case 'daltonismo':
                html.classList.add('acc-profile-daltonismo');
                break;
        }
    },

    _updateToggles() {
        const s = this.settings;
        const pairs = {
            'acc-contrast': s.contrast,
            'acc-cursor': s.cursor,
            'acc-mask': s.readingMask,
            'acc-dyslexia': s.dyslexiaFriendly,
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

    _updateLanguage() {
        const langLabels = { es: 'Español ✓', en: 'English ✓', qu: 'Runasimi ✓' };
        document.querySelectorAll('#acc-language option').forEach(opt => {
            const val = opt.value;
            const active = val === this.settings.language;
            opt.textContent = langLabels[val] || opt.textContent.replace(' ✓', '') + (active ? ' ✓' : '');
        });
    },

    _speak(text) {
        if (!this.speechSynth) return;
        this.speechSynth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.settings.language === 'en' ? 'en-US' :
                         this.settings.language === 'qu' ? 'qu-PE' : 'es-PE';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        this.speechSynth.speak(utterance);
    }
};

document.addEventListener('DOMContentLoaded', () => Accessibility.init());
