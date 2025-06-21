// Dado 3D Interactivo con Three.js
class Dado3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.dado = null;
        this.isSpinning = false;
        this.isDragging = false;
        this.initialized = false;
        
        // Configuración del dado
        this.actions = ['NÚMERO', 'BESO', 'CANCIÓN', 'ATREVIMIENTO', 'VERDAD', 'BAILE'];
        this.faceColors = [
            0xFF4757, // Rojo
            0x3742FA, // Azul
            0x57606F, // Gris
            0xA55EEA, // Morado
            0x2ED573, // Verde
            0xFFA502  // Naranja
        ];
        
        // Variables de interacción
        this.mouse = { x: 0, y: 0 };
        this.previousMouse = { x: 0, y: 0 };
        this.rotationVelocity = { x: 0, y: 0 };
        
        // Configuración de cámara
        this.cameraDistance = 5;
        this.cameraTarget = { x: 0, y: 0, z: 0 };
    }
    
    init() {
        if (this.initialized) return;
        
        const canvas = document.getElementById('dado-canvas');
        if (!canvas) {
            console.error('Canvas del dado no encontrado');
            return;
        }
        
        this.setupScene(canvas);
        this.createDado();
        this.setupLighting();
        this.setupControls();
        this.animate();
        
        this.initialized = true;
        console.log('Dado 3D inicializado correctamente');
    }
    
    setupScene(canvas) {
        // Crear escena
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        this.scene.background.setHSL(0.6, 0, 0.1);
        
        // Configurar cámara
        const aspect = canvas.clientWidth / canvas.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(0, 0, this.cameraDistance);
        this.camera.lookAt(0, 0, 0);
        
        // Configurar renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
    }
    
    createDado() {
        // Geometría del dado
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        
        // Crear materiales para cada cara
        const materials = this.actions.map((action, index) => {
            // Crear canvas para el texto
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 256;
            
            // Fondo de la cara
            const gradient = context.createLinearGradient(0, 0, 256, 256);
            gradient.addColorStop(0, `#${this.faceColors[index].toString(16).padStart(6, '0')}`);
            gradient.addColorStop(1, `#${this.lightenColor(this.faceColors[index], 0.3).toString(16).padStart(6, '0')}`);
            
            context.fillStyle = gradient;
            context.fillRect(0, 0, 256, 256);
            
            // Borde
            context.strokeStyle = '#FFFFFF';
            context.lineWidth = 8;
            context.strokeRect(4, 4, 248, 248);
            
            // Texto
            context.fillStyle = '#FFFFFF';
            context.font = 'bold 28px Poppins, Arial, sans-serif';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.shadowColor = 'rgba(0, 0, 0, 0.5)';
            context.shadowBlur = 4;
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            
            // Dividir texto en líneas si es necesario
            const words = action.split(' ');
            if (words.length > 1) {
                words.forEach((word, i) => {
                    context.fillText(word, 128, 128 + (i - 0.5) * 35);
                });
            } else {
                context.fillText(action, 128, 128);
            }
            
            // Crear textura
            const texture = new THREE.CanvasTexture(canvas);
            texture.generateMipmaps = false;
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            texture.minFilter = THREE.LinearFilter;
            
            return new THREE.MeshPhongMaterial({
                map: texture,
                shininess: 30,
                specular: 0x222222
            });
        });
        
        // Crear el dado
        this.dado = new THREE.Mesh(geometry, materials);
        this.dado.castShadow = true;
        this.dado.receiveShadow = true;
        
        // Rotación inicial aleatoria
        this.dado.rotation.x = Math.random() * Math.PI * 2;
        this.dado.rotation.y = Math.random() * Math.PI * 2;
        this.dado.rotation.z = Math.random() * Math.PI * 2;
        
        this.scene.add(this.dado);
    }
    
    setupLighting() {
        // Luz ambiental
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Luz direccional principal
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        this.scene.add(directionalLight);
        
        // Luz de relleno
        const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
        fillLight.position.set(-5, 0, -5);
        this.scene.add(fillLight);
        
        // Luz puntual para efectos
        const pointLight = new THREE.PointLight(0xffffff, 0.5, 10);
        pointLight.position.set(0, 3, 3);
        this.scene.add(pointLight);
    }
    
    setupControls() {
        const canvas = this.renderer.domElement;
        
        // Eventos de mouse
        canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        canvas.addEventListener('click', this.onClick.bind(this));
        
        // Eventos táctiles
        canvas.addEventListener('touchstart', this.onTouchStart.bind(this));
        canvas.addEventListener('touchmove', this.onTouchMove.bind(this));
        canvas.addEventListener('touchend', this.onTouchEnd.bind(this));
        
        // Prevenir menú contextual
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Redimensionamiento
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }
    
    onMouseDown(event) {
        if (this.isSpinning) return;
        
        this.isDragging = true;
        this.updateMousePosition(event);
        this.previousMouse = { ...this.mouse };
        this.rotationVelocity = { x: 0, y: 0 };
        
        document.addEventListener('mousemove', this.onDocumentMouseMove.bind(this));
        document.addEventListener('mouseup', this.onDocumentMouseUp.bind(this));
    }
    
    onMouseMove(event) {
        this.updateMousePosition(event);
    }
    
    onMouseUp(event) {
        this.isDragging = false;
        document.removeEventListener('mousemove', this.onDocumentMouseMove);
        document.removeEventListener('mouseup', this.onDocumentMouseUp);
    }
    
    onDocumentMouseMove(event) {
        if (!this.isDragging || this.isSpinning) return;
        
        this.updateMousePosition(event);
        this.rotateDado();
    }
    
    onDocumentMouseUp(event) {
        this.onMouseUp(event);
    }
    
    onTouchStart(event) {
        if (this.isSpinning) return;
        
        event.preventDefault();
        if (event.touches.length === 1) {
            this.isDragging = true;
            this.updateTouchPosition(event.touches[0]);
            this.previousMouse = { ...this.mouse };
            this.rotationVelocity = { x: 0, y: 0 };
        }
    }
    
    onTouchMove(event) {
        event.preventDefault();
        if (event.touches.length === 1 && this.isDragging && !this.isSpinning) {
            this.updateTouchPosition(event.touches[0]);
            this.rotateDado();
        }
    }
    
    onTouchEnd(event) {
        event.preventDefault();
        if (event.touches.length === 0) {
            this.isDragging = false;
        }
    }
    
    onClick(event) {
        if (!this.isDragging && !this.isSpinning) {
            this.spinDado();
        }
    }
    
    updateMousePosition(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }
    
    updateTouchPosition(touch) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
    }
    
    rotateDado() {
        const deltaX = this.mouse.x - this.previousMouse.x;
        const deltaY = this.mouse.y - this.previousMouse.y;
        
        this.rotationVelocity.x = deltaY * 5;
        this.rotationVelocity.y = deltaX * 5;
        
        this.dado.rotation.x += this.rotationVelocity.x;
        this.dado.rotation.y += this.rotationVelocity.y;
        
        this.previousMouse = { ...this.mouse };
    }
    
    spinDado() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        
        // Generar rotación aleatoria
        const spins = 3 + Math.random() * 3; // 3-6 vueltas
        const finalRotationX = this.dado.rotation.x + (spins * Math.PI * 2) + (Math.random() * Math.PI * 2);
        const finalRotationY = this.dado.rotation.y + (spins * Math.PI * 2) + (Math.random() * Math.PI * 2);
        const finalRotationZ = this.dado.rotation.z + (spins * Math.PI * 2) + (Math.random() * Math.PI * 2);
        
        // Animación con easing
        const startTime = Date.now();
        const duration = 2000; // 2 segundos
        const startRotation = {
            x: this.dado.rotation.x,
            y: this.dado.rotation.y,
            z: this.dado.rotation.z
        };
        
        const animateSpin = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            this.dado.rotation.x = startRotation.x + (finalRotationX - startRotation.x) * easeProgress;
            this.dado.rotation.y = startRotation.y + (finalRotationY - startRotation.y) * easeProgress;
            this.dado.rotation.z = startRotation.z + (finalRotationZ - startRotation.z) * easeProgress;
            
            if (progress < 1) {
                requestAnimationFrame(animateSpin);
            } else {
                this.isSpinning = false;
                this.determineResult();
            }
        };
        
        animateSpin();
    }
    
    determineResult() {
        // Determinar qué cara está hacia arriba
        const upVector = new THREE.Vector3(0, 1, 0);
        const dadoMatrix = this.dado.matrixWorld;
        
        // Vectores normales de cada cara del cubo
        const faceNormals = [
            new THREE.Vector3(1, 0, 0),   // Derecha
            new THREE.Vector3(-1, 0, 0),  // Izquierda
            new THREE.Vector3(0, 1, 0),   // Arriba
            new THREE.Vector3(0, -1, 0),  // Abajo
            new THREE.Vector3(0, 0, 1),   // Frente
            new THREE.Vector3(0, 0, -1)   // Atrás
        ];
        
        let maxDot = -1;
        let winningFace = 0;
        
        faceNormals.forEach((normal, index) => {
            const transformedNormal = normal.clone().transformDirection(dadoMatrix);
            const dot = transformedNormal.dot(upVector);
            
            if (dot > maxDot) {
                maxDot = dot;
                winningFace = index;
            }
        });
        
        const selectedAction = this.actions[winningFace];
        
        // Crear efecto de resultado
        this.createResultEffect(selectedAction);
        
        // Notificar a la aplicación principal
        setTimeout(() => {
            if (window.aceptaCookiesApp) {
                window.aceptaCookiesApp.onDadoResult(selectedAction);
            }
        }, 1000);
    }
    
    createResultEffect(action) {
        // Efecto de partículas de resultado
        const particleCount = 20;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.05, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: this.faceColors[Math.floor(Math.random() * this.faceColors.length)],
                transparent: true,
                opacity: 0.8
            });
            
            const particle = new THREE.Mesh(geometry, material);
            particle.position.set(
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4
            );
            
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.1,
                Math.random() * 0.1,
                (Math.random() - 0.5) * 0.1
            );
            
            this.scene.add(particle);
            particles.push(particle);
        }
        
        // Animar partículas
        const animateParticles = () => {
            particles.forEach(particle => {
                particle.position.add(particle.velocity);
                particle.material.opacity *= 0.95;
                
                if (particle.material.opacity < 0.01) {
                    this.scene.remove(particle);
                }
            });
            
            if (particles.some(p => p.material.opacity > 0.01)) {
                requestAnimationFrame(animateParticles);
            }
        };
        
        animateParticles();
    }
    
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Aplicar inercia cuando no se está arrastrando
        if (!this.isDragging && !this.isSpinning) {
            this.rotationVelocity.x *= 0.95;
            this.rotationVelocity.y *= 0.95;
            
            this.dado.rotation.x += this.rotationVelocity.x * 0.01;
            this.dado.rotation.y += this.rotationVelocity.y * 0.01;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        
        const canvas = this.renderer.domElement;
        const aspect = canvas.clientWidth / canvas.clientHeight;
        
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }
    
    reset() {
        if (!this.dado) return;
        
        this.isSpinning = false;
        this.isDragging = false;
        this.rotationVelocity = { x: 0, y: 0 };
        
        // Rotación inicial aleatoria
        this.dado.rotation.x = Math.random() * Math.PI * 2;
        this.dado.rotation.y = Math.random() * Math.PI * 2;
        this.dado.rotation.z = Math.random() * Math.PI * 2;
    }
    
    lightenColor(color, amount) {
        const r = (color >> 16) & 0xff;
        const g = (color >> 8) & 0xff;
        const b = color & 0xff;
        
        return ((Math.min(255, r + amount * 255) << 16) |
                (Math.min(255, g + amount * 255) << 8) |
                Math.min(255, b + amount * 255));
    }
}

// Inicializar dado 3D
window.dado3D = new Dado3D();

// Inicializar cuando Three.js esté disponible
document.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE !== 'undefined') {
        // Three.js ya está cargado, pero esperamos a que se muestre la sección del dado
        console.log('Three.js cargado, dado 3D listo para inicializar');
    } else {
        console.error('Three.js no está disponible');
    }
});
