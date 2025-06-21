// Carrusel de Integrantes
class Carrusel {
    constructor() {
        this.track = null;
        this.items = [];
        this.currentIndex = 0;
        this.isSpinning = false;
        this.itemWidth = this.getItemWidth();
        
        this.init();
    }
    
    getItemWidth() {
        // Ajustar ancho según el tamaño de pantalla
        return window.innerWidth <= 768 ? 280 : 320;
    }
    
    init() {
        this.track = document.getElementById('carrusel-track');
        this.items = Array.from(document.querySelectorAll('.carrusel-item'));
        
        if (!this.track || this.items.length === 0) {
            console.error('Carrusel: elementos no encontrados');
            return;
        }
        
        // Duplicar items para efecto infinito
        this.duplicateItems();
        
        // Posición inicial
        this.setInitialPosition();
        
        console.log('Carrusel inicializado correctamente');
    }
    
    duplicateItems() {
        // Duplicar items al principio y al final para efecto infinito
        const originalItems = [...this.items];
        
        // Agregar copias al final
        originalItems.forEach(item => {
            const clone = item.cloneNode(true);
            this.track.appendChild(clone);
        });
        
        // Agregar copias al principio
        originalItems.reverse().forEach(item => {
            const clone = item.cloneNode(true);
            this.track.insertBefore(clone, this.track.firstChild);
        });
        
        // Actualizar lista de items
        this.items = Array.from(document.querySelectorAll('.carrusel-item'));
        this.totalItems = this.items.length;
        this.originalItemsCount = originalItems.length;
    }
    
    setInitialPosition() {
        // Posicionar en el primer set de items originales
        this.currentIndex = this.originalItemsCount;
        this.updatePosition(false);
    }
    
    updatePosition(animate = true) {
        const translateX = -this.currentIndex * this.itemWidth;
        
        if (animate) {
            this.track.style.transition = 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        } else {
            this.track.style.transition = 'none';
        }
        
        this.track.style.transform = `translateX(${translateX}px)`;
        
        // Actualizar clases de selección
        this.updateSelection();
    }
    
    updateSelection() {
        this.items.forEach((item, index) => {
            item.classList.remove('selected');
        });
        
        if (this.items[this.currentIndex]) {
            this.items[this.currentIndex].classList.add('selected');
        }
    }
    
    spin() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        
        // Generar número aleatorio de pasos
        const minSpins = 8; // Mínimo 2 vueltas completas
        const maxSpins = 16; // Máximo 4 vueltas completas
        const totalSteps = minSpins + Math.floor(Math.random() * (maxSpins - minSpins));
        
        // Elegir posición final aleatoria dentro de los items originales
        const finalPosition = Math.floor(Math.random() * this.originalItemsCount);
        const targetIndex = this.originalItemsCount + finalPosition;
        
        this.animateToPosition(targetIndex, totalSteps);
    }
    
    animateToPosition(targetIndex, totalSteps) {
        let currentStep = 0;
        const startIndex = this.currentIndex;
        
        const animate = () => {
            currentStep++;
            
            // Calcular velocidad decreciente
            const progress = currentStep / totalSteps;
            const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
            
            // Calcular posición actual
            const stepSize = totalSteps / 4; // Dividir en pasos más pequeños
            this.currentIndex = startIndex + Math.floor(easeProgress * stepSize);
            
            // Asegurar que no se salga de los límites
            if (this.currentIndex >= this.totalItems - this.originalItemsCount) {
                this.currentIndex = this.originalItemsCount + (this.currentIndex % this.originalItemsCount);
            }
            
            this.updatePosition(true);
            
            if (currentStep < totalSteps) {
                setTimeout(animate, 50 + (progress * 100)); // Velocidad decreciente
            } else {
                // Animación final hacia la posición exacta
                this.currentIndex = targetIndex;
                this.updatePosition(true);
                
                setTimeout(() => {
                    this.isSpinning = false;
                    this.onSpinComplete();
                }, 800);
            }
        };
        
        animate();
    }
    
    onSpinComplete() {
        // Obtener el color del item seleccionado
        const selectedItem = this.items[this.currentIndex];
        if (selectedItem) {
            const color = selectedItem.getAttribute('data-color');
            
            // Crear efecto de confeti
            this.createConfetti();
            
            // Notificar a la aplicación principal
            if (window.aceptaCookiesApp) {
                window.aceptaCookiesApp.onCarruselResult(color);
            }
        }
    }
    
    createConfetti() {
        const colors = ['#FF4757', '#3742FA', '#57606F', '#A55EEA', '#FFFFFF', '#FFD700'];
        const confettiCount = 30;
        
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
    
    reset() {
        this.isSpinning = false;
        this.setInitialPosition();
    }
    
    getCurrentColor() {
        const selectedItem = this.items[this.currentIndex];
        return selectedItem ? selectedItem.getAttribute('data-color') : null;
    }
}

// Inicializar carrusel
window.carrusel = new Carrusel();
