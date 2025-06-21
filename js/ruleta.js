// Lógica específica de la ruleta
class RuletaController {
    constructor() {
        this.isSpinning = false;
        this.currentRotation = 0;
        this.sectors = ['rojo', 'azul', 'gris', 'morado'];
        this.sectorAngles = {
            rojo: { start: 315, end: 45 },
            azul: { start: 45, end: 135 },
            gris: { start: 135, end: 225 },
            morado: { start: 225, end: 315 }
        };
        
        this.init();
    }
    
    init() {
        this.setupRuletaInteractions();
        this.addVisualEnhancements();
    }
    
    setupRuletaInteractions() {
        const ruleta = document.getElementById('ruleta');
        const sectors = document.querySelectorAll('.sector');
        
        // Efectos hover para sectores (solo en desktop)
        if (!this.isMobile()) {
            sectors.forEach(sector => {
                sector.addEventListener('mouseenter', () => {
                    if (!this.isSpinning) {
                        sector.style.transform = sector.style.transform + ' scale(1.05)';
                        sector.style.filter = 'brightness(1.1)';
                        sector.style.transition = 'all 0.3s ease';
                    }
                });
                
                sector.addEventListener('mouseleave', () => {
                    if (!this.isSpinning) {
                        sector.style.transform = sector.style.transform.replace(' scale(1.05)', '');
                        sector.style.filter = 'brightness(1)';
                    }
                });
            });
        }
        
        // Efecto de click en la ruleta
        ruleta.addEventListener('click', (e) => {
            if (!this.isSpinning) {
                this.createClickRipple(e, ruleta);
            }
        });
    }
    
    addVisualEnhancements() {
        // Añadir brillo sutil a los sectores
        const sectors = document.querySelectorAll('.sector');
        sectors.forEach((sector, index) => {
            // Crear elemento de brillo
            const shine = document.createElement('div');
            shine.className = 'sector-shine';
            shine.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%);
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
            `;
            sector.appendChild(shine);
            
            // Animación de brillo periódica
            setTimeout(() => {
                this.animateShine(shine);
            }, index * 1000);
        });
        
        // Añadir indicadores de posición
        this.addPositionIndicators();
    }
    
    addPositionIndicators() {
        const ruletaWrapper = document.querySelector('.ruleta-wrapper');
        
        // Crear marcadores alrededor de la ruleta
        for (let i = 0; i < 8; i++) {
            const marker = document.createElement('div');
            marker.className = 'position-marker';
            marker.style.cssText = `
                position: absolute;
                width: 4px;
                height: 15px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 2px;
                transform-origin: 2px 150px;
                transform: rotate(${i * 45}deg);
                top: -7px;
                left: 50%;
                margin-left: -2px;
            `;
            ruletaWrapper.appendChild(marker);
        }
    }
    
    animateShine(shineElement) {
        const animate = () => {
            shineElement.style.opacity = '1';
            setTimeout(() => {
                shineElement.style.opacity = '0';
            }, 500);
            
            // Repetir cada 8-12 segundos
            setTimeout(animate, 8000 + Math.random() * 4000);
        };
        
        animate();
    }
    
    createClickRipple(event, element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
            left: ${centerX - 10}px;
            top: ${centerY - 10}px;
            width: 20px;
            height: 20px;
        `;
        
        element.appendChild(ripple);
        
        // Crear keyframes para la animación si no existen
        if (!document.querySelector('#ripple-keyframes')) {
            const style = document.createElement('style');
            style.id = 'ripple-keyframes';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    // Método para obtener el sector basado en el ángulo
    getSectorFromAngle(angle) {
        const normalizedAngle = ((angle % 360) + 360) % 360;
        
        for (const [sector, angles] of Object.entries(this.sectorAngles)) {
            if (angles.start > angles.end) {
                // Caso especial para el sector rojo que cruza 0°
                if (normalizedAngle >= angles.start || normalizedAngle < angles.end) {
                    return sector;
                }
            } else {
                if (normalizedAngle >= angles.start && normalizedAngle < angles.end) {
                    return sector;
                }
            }
        }
        
        return 'rojo'; // Fallback
    }
    
    // Método para calcular el ángulo más cercano al centro de un sector
    getAngleForSector(sector) {
        const angles = this.sectorAngles[sector];
        if (angles.start > angles.end) {
            // Sector que cruza 0°
            return 0;
        } else {
            return (angles.start + angles.end) / 2;
        }
    }
    
    // Añadir efectos de partículas durante el giro
    addSpinParticles() {
        const ruletaWrapper = document.querySelector('.ruleta-wrapper');
        const particleCount = 12;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'spin-particle';
            particle.style.cssText = `
                position: absolute;
                width: 6px;
                height: 6px;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 50%;
                pointer-events: none;
                animation: spinParticle 3s linear infinite;
                animation-delay: ${i * 0.25}s;
            `;
            
            // Posición en círculo alrededor de la ruleta
            const angle = (i / particleCount) * 360;
            const radius = 160;
            const x = Math.cos(angle * Math.PI / 180) * radius;
            const y = Math.sin(angle * Math.PI / 180) * radius;
            
            particle.style.left = `calc(50% + ${x}px)`;
            particle.style.top = `calc(50% + ${y}px)`;
            
            ruletaWrapper.appendChild(particle);
        }
        
        // Crear animación de partículas si no existe
        if (!document.querySelector('#spin-particle-keyframes')) {
            const style = document.createElement('style');
            style.id = 'spin-particle-keyframes';
            style.textContent = `
                @keyframes spinParticle {
                    0% {
                        transform: scale(1) rotate(0deg);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.5) rotate(180deg);
                        opacity: 0.7;
                    }
                    100% {
                        transform: scale(0.5) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Remover partículas después de la animación
        setTimeout(() => {
            document.querySelectorAll('.spin-particle').forEach(particle => {
                particle.remove();
            });
        }, 3000);
    }
    
    // Método para activar efectos durante el giro
    startSpinEffects() {
        this.isSpinning = true;
        this.addSpinParticles();
        
        // Añadir clase de giro al wrapper para efectos adicionales
        const ruletaWrapper = document.querySelector('.ruleta-wrapper');
        ruletaWrapper.classList.add('spinning-effects');
        
        // Efecto de vibración sutil
        ruletaWrapper.style.animation = 'subtleVibration 0.1s infinite';
        
        // Crear keyframes de vibración si no existen
        if (!document.querySelector('#vibration-keyframes')) {
            const style = document.createElement('style');
            style.id = 'vibration-keyframes';
            style.textContent = `
                @keyframes subtleVibration {
                    0%, 100% { transform: translate(0, 0); }
                    25% { transform: translate(1px, 0); }
                    50% { transform: translate(0, 1px); }
                    75% { transform: translate(-1px, 0); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Método para detener efectos después del giro
    stopSpinEffects() {
        this.isSpinning = false;
        
        const ruletaWrapper = document.querySelector('.ruleta-wrapper');
        ruletaWrapper.classList.remove('spinning-effects');
        ruletaWrapper.style.animation = '';
        
        // Remover partículas restantes
        document.querySelectorAll('.spin-particle').forEach(particle => {
            particle.remove();
        });
    }
    
    isMobile() {
        return window.innerWidth <= 768 || 'ontouchstart' in window;
    }
}

// Inicializar controlador de ruleta cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.ruletaController = new RuletaController();
    
    // Conectar con la aplicación principal
    const originalSpinRuleta = window.aceptaCookiesApp?.spinRuleta;
    if (originalSpinRuleta) {
        window.aceptaCookiesApp.spinRuleta = function() {
            window.ruletaController.startSpinEffects();
            
            // Llamar al método original
            const result = originalSpinRuleta.call(this);
            
            // Detener efectos después de la animación
            setTimeout(() => {
                window.ruletaController.stopSpinEffects();
            }, 3000);
            
            return result;
        };
    }
});
