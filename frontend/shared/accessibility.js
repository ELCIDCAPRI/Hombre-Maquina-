const Accessibility = {
    _key: 'ts_accessibility',
    active: false,
    fontSize: 100,
    readOnHover: false,
    tdahMode: false,
    speechSynth: window.speechSynthesis,
    _ruler: null,
    _lastUtterance: null,

    init() {
        const saved = JSON.parse(localStorage.getItem(this._key) || '{}');
        this.fontSize = saved.fontSize || 100;
        this.active = saved.active || false;
        this.readOnHover = saved.readOnHover || false;
        this.tdahMode = saved.tdahMode || false;
        this._injectWidget();
        window.addEventListener('load', () => this._apply());
    },

    _injectWidget() {
        const btn = document.createElement('button');
        btn.id = 'acc-btn';
        btn.className = 'acc-float-btn';
        btn.setAttribute('aria-label', 'Opciones de accesibilidad');
        btn.setAttribute('title', 'Accesibilidad');
        btn.innerHTML = '<span style="font-size:1.3rem;">♿</span>';
        btn.onclick = () => this.togglePanel();

        const panel = document.createElement('div');
        panel.id = 'acc-panel';
        panel.className = 'acc-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', 'Panel de accesibilidad');
        panel.innerHTML = `
            <div class="acc-panel-header">
                <strong>Accesibilidad</strong>
                <button id="acc-close" aria-label="Cerrar panel">&times;</button>
            </div>
            <div class="acc-panel-body">
                <div class="acc-group">
                    <label>Tamaño de letra</label>
                    <div class="acc-btn-group">
                        <button id="acc-font-down" aria-label="Reducir fuente">A-</button>
                        <span id="acc-font-value">${this.fontSize}%</span>
                        <button id="acc-font-up" aria-label="Aumentar fuente">A+</button>
                    </div>
                </div>
                <div class="acc-group">
                    <label>Alto contraste</label>
                    <button id="acc-contrast" class="acc-toggle" aria-label="Alternar alto contraste">
                        ${this.active ? '✓ Activo' : '✗ Inactivo'}
                    </button>
                </div>
                <div class="acc-group">
                    <label>Escala de grises</label>
                    <button id="acc-grayscale" class="acc-toggle" aria-label="Alternar escala de grises">✗ Inactivo</button>
                </div>
                <div class="acc-group">
                    <label>🔊 Leer al pasar el mouse</label>
                    <button id="acc-readhover" class="acc-toggle" aria-label="Alternar lectura en voz alta al pasar el mouse">
                        ${this.readOnHover ? '✓ Activo' : '✗ Inactivo'}
                    </button>
                </div>
                <div class="acc-group">
                    <label>🧠 Modo TDAH</label>
                    <button id="acc-tdah" class="acc-toggle" aria-label="Alternar modo TDAH">
                        ${this.tdahMode ? '✓ Activo' : '✗ Inactivo'}
                    </button>
                    <small class="acc-hint">Regla de lectura · menos distracciones · fuente más clara</small>
                </div>
                <button id="acc-reset" class="acc-reset-btn">Restablecer</button>
            </div>
        `;

        document.body.appendChild(btn);
        document.body.appendChild(panel);

        document.getElementById('acc-close').onclick = () => this.togglePanel();
        document.getElementById('acc-font-up').onclick = () => this.changeFont(10);
        document.getElementById('acc-font-down').onclick = () => this.changeFont(-10);
        document.getElementById('acc-contrast').onclick = () => this.toggleContrast();
        document.getElementById('acc-grayscale').onclick = () => this.toggleGrayscale();
        document.getElementById('acc-readhover').onclick = () => this.toggleReadOnHover();
        document.getElementById('acc-tdah').onclick = () => this.toggleTDAH();
        document.getElementById('acc-reset').onclick = () => this.reset();
    },

    togglePanel() {
        const panel = document.getElementById('acc-panel');
        panel.classList.toggle('show');
    },

    changeFont(delta) {
        this.fontSize = Math.max(70, Math.min(150, this.fontSize + delta));
        document.getElementById('acc-font-value').textContent = this.fontSize + '%';
        this._save();
        this._apply();
    },

    toggleContrast() {
        this.active = !this.active;
        document.getElementById('acc-contrast').textContent = this.active ? '✓ Activo' : '✗ Inactivo';
        this._save();
        this._apply();
    },

    toggleGrayscale() {
        const html = document.documentElement;
        const isActive = html.classList.toggle('acc-grayscale');
        document.getElementById('acc-grayscale').textContent = isActive ? '✓ Activo' : '✗ Inactivo';
        localStorage.setItem('ts_grayscale', isActive ? '1' : '0');
    },

    toggleReadOnHover() {
        this.readOnHover = !this.readOnHover;
        const btn = document.getElementById('acc-readhover');
        btn.textContent = this.readOnHover ? '✓ Activo' : '✗ Inactivo';
        this._save();
        if (this.readOnHover) {
            this._enableReadOnHover();
        } else {
            this._disableReadOnHover();
        }
    },

    toggleTDAH() {
        this.tdahMode = !this.tdahMode;
        const btn = document.getElementById('acc-tdah');
        btn.textContent = this.tdahMode ? '✓ Activo' : '✗ Inactivo';
        this._save();
        document.documentElement.classList.toggle('acc-tdah', this.tdahMode);
        if (this.tdahMode) {
            this._enableRuler();
        } else {
            this._disableRuler();
        }
    },

    _enableReadOnHover() {
        document.addEventListener('mouseover', this._readHandler, true);
        document.addEventListener('mouseout', this._cancelHandler, true);
    },

    _disableReadOnHover() {
        document.removeEventListener('mouseover', this._readHandler, true);
        document.removeEventListener('mouseout', this._cancelHandler, true);
        this._cancelSpeech();
    },

    _readHandler: (function() {
        let timer = null;
        return function(e) {
            clearTimeout(timer);
            timer = setTimeout(() => {
                const el = e.target;
                if (!el || !el.textContent) return;
                const tag = el.tagName || '';
                if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'BUTTON' || tag === 'A' || tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
                if (el.closest('.acc-panel') || el.closest('.cart-panel') || el.closest('.modal')) return;
                const text = (el.innerText || '').trim();
                if (!text || text.length < 5) return;
                if (window._accLastRead === text) return;
                window._accLastRead = text;
                Accessibility._speak(text);
            }, 300);
        };
    })(),

    _cancelHandler: function() {
        clearTimeout(window._accReadTimer);
        Accessibility._cancelSpeech();
    },

    _speak(text) {
        if (!this.speechSynth) return;
        this.speechSynth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-PE';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        this.speechSynth.speak(utterance);
    },

    _cancelSpeech() {
        if (this.speechSynth) {
            this.speechSynth.cancel();
        }
        window._accLastRead = null;
    },

    _enableRuler() {
        if (this._ruler) return;
        const ruler = document.createElement('div');
        ruler.id = 'acc-ruler';
        ruler.className = 'acc-ruler';
        document.body.appendChild(ruler);
        this._ruler = ruler;
        document.addEventListener('mousemove', this._rulerMoveHandler);
    },

    _disableRuler() {
        if (this._ruler) {
            this._ruler.remove();
            this._ruler = null;
        }
        document.removeEventListener('mousemove', this._rulerMoveHandler);
    },

    _rulerMoveHandler: (function() {
        let rafId = null;
        return function(e) {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const ruler = document.getElementById('acc-ruler');
                if (ruler) {
                    ruler.style.top = (e.clientY - 2) + 'px';
                }
            });
        };
    })(),

    reset() {
        this.fontSize = 100;
        this.active = false;
        document.getElementById('acc-font-value').textContent = '100%';
        document.getElementById('acc-contrast').textContent = '✗ Inactivo';
        document.documentElement.classList.remove('acc-grayscale');
        document.getElementById('acc-grayscale').textContent = '✗ Inactivo';
        localStorage.setItem('ts_grayscale', '0');
        if (this.readOnHover) {
            this.toggleReadOnHover();
        }
        if (this.tdahMode) {
            this.toggleTDAH();
        }
        this._save();
        this._apply();
    },

    _save() {
        localStorage.setItem(this._key, JSON.stringify({
            fontSize: this.fontSize,
            active: this.active,
            readOnHover: this.readOnHover,
            tdahMode: this.tdahMode
        }));
    },

    _apply() {
        const html = document.documentElement;
        html.style.fontSize = this.fontSize + '%';
        html.classList.toggle('acc-high-contrast', this.active);
        if (localStorage.getItem('ts_grayscale') === '1') {
            html.classList.add('acc-grayscale');
        }
        if (this.tdahMode) {
            html.classList.add('acc-tdah');
        }
        if (this.readOnHover) {
            this._enableReadOnHover();
        }
    }
};

document.addEventListener('DOMContentLoaded', () => Accessibility.init());
