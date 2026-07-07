const Cake3D = {
    initialized: false,
    scene: null,
    camera: null,
    renderer: null,
    container: null,
    cakeGroup: null,
    particles: null,
    particlePositions: null,
    isDragging: false,
    prevX: 0,
    targetRotY: 0,
    currentRotY: 0,
    clock: null,
    animFrame: null,

    tiers: 2,
    flavor: 'Vainilla',
    decoration: 'Por definir',
    autoRotateSpeed: 0.004,
    interactive: true,

    flavorColors: {
        'Vainilla':   { body: 0xf5f0e8, accent: 0xe8dfd3, frosting: 0xfffaf5, ribbon: 0xd4af37 },
        'Chocolate':  { body: 0x7b4a2a, accent: 0x5c3a21, frosting: 0xf5e6d3, ribbon: 0x8b6914 },
        'Red Velvet': { body: 0x9e2a2b, accent: 0x7a1a1b, frosting: 0xfff5f5, ribbon: 0xc0c0c0 }
    },

    init(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container || typeof THREE === 'undefined') return;

        const defaults = {
            tiers: 2, flavor: 'Vainilla', decoration: 'Por definir',
            autoRotateSpeed: 0.004, interactive: true,
            cameraZ: 10, cameraY: 3.5, particleCount: 80
        };
        const opts = { ...defaults, ...options };
        this.tiers = opts.tiers;
        this.flavor = opts.flavor;
        this.decoration = opts.decoration;
        this.autoRotateSpeed = opts.autoRotateSpeed;
        this.interactive = opts.interactive;
        this.options = opts;

        const w = this.container.clientWidth || 400;
        const h = this.container.clientHeight || 380;

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(28, w / h, 0.1, 50);
        this.camera.position.set(0, opts.cameraY, opts.cameraZ);
        this.camera.lookAt(0, 1.5, 0);

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(w, h);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.container.appendChild(this.renderer.domElement);

        this.clock = new THREE.Clock();

        this._setupLights();
        this._buildCake();
        this._createParticles();
        this._setupInteraction();
        this._onResize();

        this.initialized = true;
        this._animate();
    },

    _setupLights() {
        const ambient = new THREE.AmbientLight(0xfff5ee, 0.6);
        this.scene.add(ambient);

        const key = new THREE.DirectionalLight(0xffffff, 2.0);
        key.position.set(4, 8, 6);
        key.castShadow = true;
        key.shadow.mapSize.width = 512;
        key.shadow.mapSize.height = 512;
        this.scene.add(key);

        const fill = new THREE.DirectionalLight(0xffeedd, 0.6);
        fill.position.set(-3, 4, -4);
        this.scene.add(fill);

        const rim = new THREE.DirectionalLight(0xffffff, 0.4);
        rim.position.set(0, -1, -8);
        this.scene.add(rim);

        const top = new THREE.PointLight(0xffeedd, 0.3);
        top.position.set(0, 6, 0);
        this.scene.add(top);
    },

    _buildCake() {
        if (this.cakeGroup) {
            this.scene.remove(this.cakeGroup);
            this.cakeGroup = null;
        }

        const group = new THREE.Group();
        const colors = this.flavorColors[this.flavor] || this.flavorColors['Vainilla'];

        const tierConfigs = {
            2: [
                { radius: 2.6, height: 1.1, y: 0.55 },
                { radius: 1.7, height: 0.9,  y: 1.55 }
            ],
            3: [
                { radius: 2.6, height: 1.0,  y: 0.5 },
                { radius: 2.0, height: 0.9,  y: 1.45 },
                { radius: 1.4, height: 0.8,  y: 2.3 }
            ],
            4: [
                { radius: 2.6, height: 0.95, y: 0.475 },
                { radius: 2.15, height: 0.85, y: 1.375 },
                { radius: 1.65, height: 0.8,  y: 2.2 },
                { radius: 1.15, height: 0.75, y: 2.975 }
            ]
        };

        const configs = tierConfigs[this.tiers] || tierConfigs[2];

        // Stand
        const standMat = new THREE.MeshStandardMaterial({
            color: 0xd4cdc3, metalness: 0.2, roughness: 0.7
        });
        const stand = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.2, 0.2, 32), standMat);
        stand.position.y = -0.1;
        stand.receiveShadow = true;
        group.add(stand);

        const footMat = new THREE.MeshStandardMaterial({
            color: 0xc8c0b5, metalness: 0.15, roughness: 0.8
        });
        const foot = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.25, 32), footMat);
        foot.position.y = -0.325;
        foot.receiveShadow = true;
        group.add(foot);

        // Tiers
        configs.forEach((cfg, i) => {
            const bodyMat = new THREE.MeshStandardMaterial({
                color: colors.body, roughness: 0.85, metalness: 0.0
            });
            const body = new THREE.Mesh(
                new THREE.CylinderGeometry(cfg.radius, cfg.radius, cfg.height, 48),
                bodyMat
            );
            body.position.y = cfg.y;
            body.castShadow = true;
            body.receiveShadow = true;
            group.add(body);

            // Frosting rim
            const frostingMat = new THREE.MeshStandardMaterial({
                color: colors.frosting, roughness: 0.6, metalness: 0.0
            });
            const rim = new THREE.Mesh(
                new THREE.CylinderGeometry(cfg.radius + 0.04, cfg.radius + 0.04, 0.06, 48),
                frostingMat
            );
            rim.position.y = cfg.y + cfg.height / 2 + 0.03;
            group.add(rim);

            // Decorative dots
            const dotCount = Math.floor(cfg.radius * 8);
            for (let j = 0; j < dotCount; j++) {
                const angle = (j / dotCount) * Math.PI * 2;
                const dot = new THREE.Mesh(
                    new THREE.SphereGeometry(0.05, 6, 6),
                    new THREE.MeshStandardMaterial({ color: colors.frosting, roughness: 0.3 })
                );
                dot.position.set(
                    Math.cos(angle) * (cfg.radius - 0.03),
                    cfg.y + cfg.height / 2 + 0.06,
                    Math.sin(angle) * (cfg.radius - 0.03)
                );
                group.add(dot);
            }

            // Ribbon on middle of each tier except top
            if (i < configs.length - 1 || this.decoration === 'Pan de Oro y Texturas') {
                const ribbonMat = new THREE.MeshStandardMaterial({
                    color: colors.ribbon, metalness: 0.6, roughness: 0.3
                });
                const ribbon = new THREE.Mesh(
                    new THREE.CylinderGeometry(cfg.radius + 0.02, cfg.radius + 0.02, 0.05, 48),
                    ribbonMat
                );
                ribbon.position.y = cfg.y - cfg.height / 3;
                group.add(ribbon);
            }

            // Pillars between tiers
            if (i < configs.length - 1) {
                const nextCfg = configs[i + 1];
                const pillarH = nextCfg.y - nextCfg.height / 2 - (cfg.y + cfg.height / 2);
                const pillarCount = 6;
                for (let p = 0; p < pillarCount; p++) {
                    const pAngle = (p / pillarCount) * Math.PI * 2;
                    const pRadius = cfg.radius - 0.2;
                    const pillarMat = new THREE.MeshStandardMaterial({
                        color: colors.ribbon, metalness: 0.5, roughness: 0.4
                    });
                    const pillar = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.04, 0.05, pillarH, 6),
                        pillarMat
                    );
                    pillar.position.set(
                        Math.cos(pAngle) * pRadius,
                        cfg.y + cfg.height / 2 + pillarH / 2,
                        Math.sin(pAngle) * pRadius
                    );
                    group.add(pillar);
                }
            }
        });

        // Top decoration
        if (this.decoration === 'Flores Naturales') {
            const flowerColors = [0xffd6e0, 0xfff0f5, 0xffe4e1, 0xffb7c5, 0xffc0cb];
            const topY = configs[configs.length - 1].y + configs[configs.length - 1].height / 2;
            const topR = configs[configs.length - 1].radius;

            for (let f = 0; f < 6; f++) {
                const fAngle = (f / 6) * Math.PI * 2 + 0.2;
                const fR = topR * 0.55;
                const fColor = flowerColors[f % flowerColors.length];

                const fGroup = new THREE.Group();
                for (let p = 0; p < 6; p++) {
                    const petal = new THREE.Mesh(
                        new THREE.SphereGeometry(0.09, 6, 6),
                        new THREE.MeshStandardMaterial({ color: fColor, roughness: 0.3 })
                    );
                    petal.scale.set(1, 0.3, 1.6);
                    const pa = (p / 6) * Math.PI * 2;
                    petal.position.set(Math.cos(pa) * 0.13, 0, Math.sin(pa) * 0.13);
                    fGroup.add(petal);
                }
                const center = new THREE.Mesh(
                    new THREE.SphereGeometry(0.035, 6, 6),
                    new THREE.MeshStandardMaterial({ color: 0xfff8dc, roughness: 0.2 })
                );
                fGroup.add(center);
                fGroup.position.set(Math.cos(fAngle) * fR, topY + 0.05, Math.sin(fAngle) * fR);
                group.add(fGroup);
            }
        }

        if (this.decoration === 'Pan de Oro y Texturas') {
            const topY = configs[configs.length - 1].y + configs[configs.length - 1].height / 2;
            const topR = configs[configs.length - 1].radius;

            // Gold top ornament
            const goldMat = new THREE.MeshStandardMaterial({
                color: 0xd4af37, metalness: 0.9, roughness: 0.1, emissive: 0xd4af37, emissiveIntensity: 0.05
            });
            const ornament = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), goldMat);
            ornament.position.y = topY + 0.12;
            ornament.scale.y = 1.5;
            group.add(ornament);

            // Small gold dots around top
            for (let d = 0; d < 8; d++) {
                const dAngle = (d / 8) * Math.PI * 2;
                const dot = new THREE.Mesh(
                    new THREE.SphereGeometry(0.04, 6, 6),
                    goldMat
                );
                dot.position.set(
                    Math.cos(dAngle) * (topR - 0.2),
                    topY + 0.04,
                    Math.sin(dAngle) * (topR - 0.2)
                );
                group.add(dot);
            }

            // Gold leaf accents on all tiers
            configs.forEach((cfg) => {
                for (let d = 0; d < 6; d++) {
                    const dAngle = (d / 6) * Math.PI * 2 + 0.15;
                    const flake = new THREE.Mesh(
                        new THREE.PlaneGeometry(0.08, 0.05),
                        new THREE.MeshStandardMaterial({
                            color: 0xd4af37, metalness: 0.9, roughness: 0.1, side: THREE.DoubleSide
                        })
                    );
                    flake.position.set(
                        Math.cos(dAngle) * (cfg.radius + 0.01),
                        cfg.y,
                        Math.sin(dAngle) * (cfg.radius + 0.01)
                    );
                    flake.lookAt(0, cfg.y, 0);
                    group.add(flake);
                }
            });
        }

        this.cakeGroup = group;
        this.scene.add(group);
    },

    _createParticles() {
        const count = this.options?.particleCount || 80;
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = Math.random() * 5;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
            sizes[i] = 0.02 + Math.random() * 0.03;
        }
        this.particlePositions = positions;

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const mat = new THREE.PointsMaterial({
            color: 0xd4af37,
            size: 0.04,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        this.particles = new THREE.Points(geo, mat);
        this.scene.add(this.particles);
    },

    _setupInteraction() {
        if (!this.interactive) return;
        const el = this.renderer.domElement;

        el.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.prevX = e.clientX;
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            const dx = e.clientX - this.prevX;
            this.targetRotY += dx * 0.008;
            this.prevX = e.clientX;
        });

        window.addEventListener('mouseup', () => { this.isDragging = false; });

        el.addEventListener('touchstart', (e) => {
            this.isDragging = true;
            this.prevX = e.touches[0].clientX;
        }, { passive: true });

        el.addEventListener('touchmove', (e) => {
            if (!this.isDragging) return;
            const dx = e.touches[0].clientX - this.prevX;
            this.targetRotY += dx * 0.008;
            this.prevX = e.touches[0].clientX;
        }, { passive: true });

        el.addEventListener('touchend', () => { this.isDragging = false; }, { passive: true });
    },

    _onResize() {
        const resize = () => {
            if (!this.container || !this.renderer) return;
            const w = this.container.clientWidth;
            const h = this.container.clientHeight;
            if (w === 0 || h === 0) return;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
        };
        window.addEventListener('resize', resize);
        this._resizeFn = resize;
    },

    updateTiers(count) {
        this.tiers = count;
        if (this.initialized) this._buildCake();
    },

    updateFlavor(flavor) {
        this.flavor = flavor;
        if (this.initialized) this._buildCake();
    },

    updateDecoration(deco) {
        this.decoration = deco;
        if (this.initialized) this._buildCake();
    },

    _animate() {
        this.animFrame = requestAnimationFrame(() => this._animate());

        if (!this.isDragging) {
            this.targetRotY += this.autoRotateSpeed;
        }
        this.currentRotY += (this.targetRotY - this.currentRotY) * 0.08;

        if (this.cakeGroup) {
            this.cakeGroup.rotation.y = this.currentRotY;
        }

        // Animate particles
        if (this.particles && this.particlePositions) {
            const pos = this.particlePositions;
            for (let i = 0; i < pos.length / 3; i++) {
                pos[i * 3 + 1] += 0.005;
                if (pos[i * 3 + 1] > 5) {
                    pos[i * 3 + 1] = 0;
                    pos[i * 3] = (Math.random() - 0.5) * 10;
                    pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
                }
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
        }

        this.renderer.render(this.scene, this.camera);
    },

    destroy() {
        if (this.animFrame) cancelAnimationFrame(this.animFrame);
        if (this._resizeFn) window.removeEventListener('resize', this._resizeFn);
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.renderer.domElement.parentElement) {
                this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
            }
        }
        this.initialized = false;
    }
};
