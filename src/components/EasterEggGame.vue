<template>
  <div class="game-container">
    <div class="game-info">
      <div class="score">Pontuação: {{ score }}</div>
      <div class="time">Tempo: {{ timeLeft }}s</div>
    </div>

    <div class="game-area" ref="gameArea" tabindex="0" @keydown="handleKeyPress">
      <!-- Cobra (cabeça e segmentos do corpo) -->
      <div 
        v-for="(segment, index) in snake" 
        :key="'snake-'+index" 
        class="snake-segment"
        :style="{
          left: segment.x + 'px',
          top: segment.y + 'px',
          backgroundColor: index === 0 ? '#2196F3' : '#4CAF50'
        }"
      ></div>
      
      <!-- Comida -->
      <div 
        class="food" 
        :style="{
          left: food.x + 'px',
          top: food.y + 'px',
          backgroundColor: food.color
        }"
      ></div>
      
      <div class="instructions" v-if="!gameStarted">
        <h3>Snake Game</h3>
        <p>Use as setas direcionais para mover a cobrinha.</p>
        <p>Colete os blocos coloridos para crescer e ganhar pontos!</p>
        <button @click="startGame" class="start-btn">Iniciar Jogo</button>
      </div>
      
      <div class="game-over" v-if="gameOver">
        <h3>Fim de Jogo!</h3>
        <p>Sua pontuação final: {{ score }}</p>
        <button @click="resetGame" class="restart-btn">Jogar Novamente</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SnakeGame',
  emits: ['game-complete'],
  data() {
    return {
      score: 0,
      timeLeft: 60,
      timer: null,
      gameTimer: null,
      gameStarted: false,
      gameOver: false,
      direction: 'right', // 'up', 'down', 'left', 'right'
      nextDirection: 'right',
      snake: [], // array de segmentos {x, y}
      food: { x: 0, y: 0, color: '#FF5252' },
      gameAreaWidth: 0,
      gameAreaHeight: 0,
      gridSize: 20, // tamanho de cada segmento/bloco
      colors: ['#FF5252', '#FFC107', '#9C27B0', '#E91E63', '#F44336']
    }
  },
  methods: {
    startGame() {
      this.gameStarted = true;
      this.gameOver = false;
      this.score = 0;
      this.timeLeft = 60;
      this.direction = 'right';
      this.nextDirection = 'right';
      
      // Inicializa a cobra com 3 segmentos
      const startX = Math.floor(this.gameAreaWidth / (2 * this.gridSize)) * this.gridSize;
      const startY = Math.floor(this.gameAreaHeight / (2 * this.gridSize)) * this.gridSize;
      
      this.snake = [
        { x: startX, y: startY },             // Cabeça
        { x: startX - this.gridSize, y: startY },  // Corpo
        { x: startX - this.gridSize * 2, y: startY }   // Cauda
      ];
      
      // Gerar comida inicial
      this.spawnFood();
      
      // Iniciar temporizadores
      this.timer = setInterval(() => {
        this.timeLeft--;
        if (this.timeLeft <= 0) {
          this.endGame();
        }
      }, 1000);
      
      // Velocidade do jogo (movimento da cobra)
      this.gameTimer = setInterval(() => {
        this.moveSnake();
      }, 150); // velocidade inicial: 150ms

      // Dar foco ao elemento de jogo para capturar eventos de teclado
      this.$nextTick(() => {
        this.$refs.gameArea.focus();
      });
    },
    
    resetGame() {
      this.clearTimers();
      this.startGame();
    },
    
    endGame() {
      this.clearTimers();
      this.gameOver = true;
      this.gameStarted = false;
      this.$emit('game-complete', this.score);
    },
    
    clearTimers() {
      if (this.timer) clearInterval(this.timer);
      if (this.gameTimer) clearInterval(this.gameTimer);
    },
    
    spawnFood() {
      // Gera comida em uma posição aleatória alinhada à grade
      const maxX = Math.floor(this.gameAreaWidth / this.gridSize) - 1;
      const maxY = Math.floor(this.gameAreaHeight / this.gridSize) - 1;
      
      let newX, newY;
      let validPosition = false;
      
      // Garante que a comida não apareça sobre a cobra
      while (!validPosition) {
        newX = Math.floor(Math.random() * maxX) * this.gridSize;
        newY = Math.floor(Math.random() * maxY) * this.gridSize;
        
        validPosition = !this.snake.some(segment => 
          segment.x === newX && segment.y === newY
        );
      }
      
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      this.food = { x: newX, y: newY, color };
    },
    
    handleKeyPress(e) {
      if (!this.gameStarted || this.gameOver) return;
      
      // Prevenir que a cobra faça 180° imediatamente
      switch (e.key) {
        case 'ArrowUp':
          if (this.direction !== 'down') this.nextDirection = 'up';
          break;
        case 'ArrowDown':
          if (this.direction !== 'up') this.nextDirection = 'down';
          break;
        case 'ArrowLeft':
          if (this.direction !== 'right') this.nextDirection = 'left';
          break;
        case 'ArrowRight':
          if (this.direction !== 'left') this.nextDirection = 'right';
          break;
      }
      
      e.preventDefault(); // Previne a rolagem da página com as teclas de seta
    },
    
    moveSnake() {
      if (!this.gameStarted || this.gameOver) return;
      
      // Atualiza a direção atual com a próxima direção
      this.direction = this.nextDirection;
      
      // Posição atual da cabeça
      const head = { ...this.snake[0] };
      
      // Calcula nova posição baseada na direção
      switch (this.direction) {
        case 'up':
          head.y -= this.gridSize;
          break;
        case 'down':
          head.y += this.gridSize;
          break;
        case 'left':
          head.x -= this.gridSize;
          break;
        case 'right':
          head.x += this.gridSize;
          break;
      }
      
      // Verificar colisão com parede
      if (
        head.x < 0 || 
        head.y < 0 || 
        head.x >= this.gameAreaWidth || 
        head.y >= this.gameAreaHeight
      ) {
        this.endGame();
        return;
      }
      
      // Verificar colisão com o próprio corpo
      if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        this.endGame();
        return;
      }
      
      // Adiciona nova cabeça
      this.snake.unshift(head);
      
      // Verificar se comeu a comida
      if (head.x === this.food.x && head.y === this.food.y) {
        // Incrementa score e spawna nova comida
        this.score += 10;
        this.spawnFood();
        
        // Adiciona tempo extra
        this.timeLeft = Math.min(this.timeLeft + 5, 60);
        
        // Aumenta a velocidade a cada 50 pontos
        if (this.score % 50 === 0) {
          clearInterval(this.gameTimer);
          const newSpeed = Math.max(50, 150 - Math.floor(this.score / 50) * 10);
          this.gameTimer = setInterval(() => {
            this.moveSnake();
          }, newSpeed);
        }
      } else {
        // Remove a cauda se não comeu comida
        this.snake.pop();
      }
    }
  },
  mounted() {
    // Obtém as dimensões da área de jogo
    this.$nextTick(() => {
      if (this.$refs.gameArea) {
        this.gameAreaWidth = this.$refs.gameArea.clientWidth;
        this.gameAreaHeight = this.$refs.gameArea.clientHeight;
        
        // Ajustar dimensões para grid perfeito
        this.gameAreaWidth = Math.floor(this.gameAreaWidth / this.gridSize) * this.gridSize;
        this.gameAreaHeight = Math.floor(this.gameAreaHeight / this.gridSize) * this.gridSize;
      }
    });
  },
  beforeUnmount() {
    this.clearTimers();
  }
}
</script>

<style scoped>
.game-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  color: white;
}

.game-info {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  font-size: 18px;
  margin-bottom: 10px;
}

.game-area {
  position: relative;
  width: 100%;
  height: 300px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  overflow: hidden;
  outline: none; /* remove o contorno de foco */
}

.snake-segment {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
}

.food {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.instructions, .game-over {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 20;
}

.start-btn, .restart-btn {
  background: linear-gradient(135deg, #2196F3, #0D47A1);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-size: 16px;
  margin-top: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.start-btn:hover, .restart-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(33, 150, 243, 0.4);
}

h3 {
  margin-bottom: 10px;
  font-size: 22px;
  color: #2196F3;
}
</style>
