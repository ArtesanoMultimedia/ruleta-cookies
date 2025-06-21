// Aplicación ACEPTA COOKIES - Lógica Principal
class AceptaCookiesApp {
    constructor() {
        this.currentState = 'ruleta';
        this.selectedColor = null;
        this.selectedAction = null;
        this.isAnimating = false;
        
        // Configuración de colores
        this.colors = {
            rojo: { name: 'ROJO', hex: '#FF4757', gradient: 'linear-gradient(45deg, #FF4757, #FF6B7A)' },
            azul: { name: 'AZUL', hex: '#3742FA', gradient: 'linear-gradient(45deg, #3742FA, #5A67D8)' },
            gris: { name: 'GRIS', hex: '#57606F', gradient: 'linear-gradient(45deg, #57606F, #718096)' },
            morado: { name: 'MORADO', hex: '#A55EEA', gradient: 'linear-gradient(45deg, #A55EEA, #B794F6)' }
        };
        
        // Acciones del dado
        this.actions = ['NÚMERO', 'BESO', 'CANCIÓN', 'ATREVIMIENTO', 'VERDAD', 'BAILE'];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.createParticles();
        this.showSection('ruleta-section');
        
        // Animación de entrada inicial
        setTimeout(() => {
            document.querySelector('.header').classList.add('section-enter');
            document.querySelector('#ruleta-section').classList.add('section-enter');
        }, 100);
    }
    
    setupEventListeners() {
        // Botón girar ruleta
        document.getElementById('girar-ruleta').addEventListener('click', () => {
            if (!this.isAnimating) {
                this.spinRuleta();
            }
        });
        
        // Botón lanzar dado
        document.getElementById('lanzar-dado').addEventListener('click', () => {
            if (!this.isAnimating) {
                this.showDadoSection();
            }
        });
        
        // Botón nueva ronda
        document.getElementById('nueva-ronda').addEventListener('click', () => {
            if (!this.isAnimating) {
                this.resetGame();
            }
        });
        
        // Prevenir zoom en móviles al hacer doble tap
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        });
        
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
    
    showSection(sectionId) {
        // Ocultar todas las secciones
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Mostrar la sección solicitada
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.classList.add('section-enter');
            
            // Remover clase de animación después de completarse
            setTimeout(() => {
                targetSection.classList.remove('section-enter');
            }, 600);
        }
    }
    
    spinRuleta() {
        this.isAnimating = true;
        const ruleta = document.getElementById('ruleta');
        const button = document.getElementById('girar-ruleta');
        
        // Deshabilitar botón
        button.disabled = true;
        button.classList.add('shimmer');
        
        // Primero elegir el color ganador aleatoriamente
        const colorKeys = Object.keys(this.colors);
        const randomColorIndex = Math.floor(Math.random() * colorKeys.length);
        this.selectedColor = colorKeys[randomColorIndex];
        
        // Definir los ángulos centrales de cada color (donde debe detenerse la flecha)
        const colorCenterAngles = {
            'rojo': 0,      // Centro del sector rojo
            'azul': 90,     // Centro del sector azul  
            'gris': 180,    // Centro del sector gris
            'morado': 270   // Centro del sector morado
        };
        
        // Calcular el ángulo final para que se detenga en el centro del color elegido
        const targetAngle = colorCenterAngles[this.selectedColor];
        
        // Generar número de vueltas aleatorio
        const minSpins = 5; // Mínimo 5 vueltas completas
        const maxSpins = 8; // Máximo 8 vueltas completas
        const spins = minSpins + Math.random() * (maxSpins - minSpins);
        
        // Calcular rotación total: vueltas completas + ángulo objetivo
        // Nota: Restamos el ángulo objetivo porque la ruleta gira en sentido horario
        // pero queremos que la flecha (que está fija) apunte al color correcto
        const totalRotation = (spins * 360) + (360 - targetAngle);
        
        // Configurar animación
        ruleta.style.setProperty('--spin-degrees', `${totalRotation}deg`);
        ruleta.style.setProperty('--spin-duration', '3s');
        
        // Iniciar animación
        ruleta.classList.add('spinning');
        
        // Cuando termine la animación
        setTimeout(() => {
            ruleta.classList.remove('spinning');
            button.disabled = false;
            button.classList.remove('shimmer');
            this.isAnimating = false;
            
            // Mostrar resultado
            this.showColorResult();
        }, 3000);
    }
    
    showColorResult() {
        const colorData = this.colors[this.selectedColor];
        
        // Actualizar elementos del resultado
        const colorCircle = document.querySelector('#color-elegido .color-circle');
        const colorName = document.querySelector('#color-elegido .color-name');
        
        colorCircle.style.background = colorData.gradient;
        colorName.textContent = colorData.name;
        
        // Crear confeti
        this.createConfetti(colorData.hex);
        
        // Transición a la siguiente sección
        setTimeout(() => {
            this.showSection('resultado-persona');
            
            // Animación de aparición del resultado
            document.getElementById('color-elegido').classList.add('result-reveal');
            
            setTimeout(() => {
                document.getElementById('color-elegido').classList.remove('result-reveal');
            }, 800);
        }, 500);
    }
    
    showDadoSection() {
        // Actualizar mini indicador de persona elegida
        const miniColor = document.querySelector('#persona-mini .mini-color');
        const miniText = document.querySelector('#persona-mini .mini-text');
        const colorData = this.colors[this.selectedColor];
        
        miniColor.style.background = colorData.gradient;
        miniText.textContent = colorData.name;
        
        // Mostrar sección del dado
        this.showSection('dado-section');
        
        // Inicializar dado 3D si no está ya inicializado
        if (window.dado3D && !window.dado3D.initialized) {
            window.dado3D.init();
        }
    }
    
    onDadoResult(action) {
        this.selectedAction = action;
        this.showFinalResult();
    }
    
    showFinalResult() {
        const colorData = this.colors[this.selectedColor];
        
        // Actualizar elementos del resultado final
        const finalColor = document.querySelector('.final-color');
        const finalColorName = document.querySelector('.final-color-name');
        const finalActionText = document.querySelector('.final-accion-text');
        
        finalColor.style.background = colorData.gradient;
        finalColorName.textContent = colorData.name;
        finalActionText.textContent = this.selectedAction;
        
        // Crear confeti especial para el resultado final
        this.createConfetti(colorData.hex, true);
        
        // Mostrar sección final
        this.showSection('resultado-final');
        
        // Animaciones de aparición
        setTimeout(() => {
            document.querySelector('.final-persona').classList.add('slide-in-left');
            document.querySelector('.final-accion').classList.add('slide-in-right');
            document.querySelector('.final-plus').classList.add('bounce');
        }, 200);
        
        // Limpiar clases de animación
        setTimeout(() => {
            document.querySelector('.final-persona').classList.remove('slide-in-left');
            document.querySelector('.final-accion').classList.remove('slide-in-right');
            document.querySelector('.final-plus').classList.remove('bounce');
        }, 1200);
    }
    
    resetGame() {
        this.isAnimating = true;
        
        // Limpiar estado
        this.selectedColor = null;
        this.selectedAction = null;
        
        // Limpiar confeti
        this.clearConfetti();
        
        // Resetear ruleta
        const ruleta = document.getElementById('ruleta');
        ruleta.style.transform = 'rotate(0deg)';
        
        // Resetear dado 3D si existe
        if (window.dado3D && window.dado3D.reset) {
            window.dado3D.reset();
        }
        
        // Volver a la sección inicial
        setTimeout(() => {
            this.showSection('ruleta-section');
            this.isAnimating = false;
        }, 300);
    }
    
    createParticles() {
        const particlesContainer = document.getElementById('particles');
        const particleCount = window.innerWidth < 768 ? 15 : 25;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Posición aleatoria
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            
            // Duración y delay aleatorios
            particle.style.setProperty('--float-duration', (4 + Math.random() * 4) + 's');
            particle.style.setProperty('--float-delay', Math.random() * 2 + 's');
            
            particlesContainer.appendChild(particle);
        }
    }
    
    createConfetti(color, intense = false) {
        const colors = [color, '#FFFFFF', '#FFD700'];
        const confettiCount = intense ? 50 : 30;
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            
            // Color aleatorio del array
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.setProperty('--confetti-color', randomColor);
            
            // Posición aleatoria
            confetti.style.left = Math.random() * 100 + '%';
            
            // Duración y delay aleatorios
            confetti.style.setProperty('--fall-duration', (2 + Math.random() * 2) + 's');
            confetti.style.setProperty('--delay', Math.random() * 1 + 's');
            
            document.body.appendChild(confetti);
            
            // Remover después de la animación
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 4000);
        }
    }
    
    clearConfetti() {
        document.querySelectorAll('.confetti').forEach(confetti => {
            if (confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        });
    }
    
    // Método para ser llamado desde el dado 3D
    static getInstance() {
        return window.aceptaCookiesApp;
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.aceptaCookiesApp = new AceptaCookiesApp();
});

// Manejar cambios de orientación en móviles
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        // Recalcular partículas si es necesario
        if (window.aceptaCookiesApp) {
            const particlesContainer = document.getElementById('particles');
            particlesContainer.innerHTML = '';
            window.aceptaCookiesApp.createParticles();
        }
    }, 500);
});

// Prevenir comportamientos no deseados en móviles
document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
});

document.addEventListener('gesturechange', (e) => {
    e.preventDefault();
});

document.addEventListener('gestureend', (e) => {
    e.preventDefault();
});
