<template>
  <div class="game-container">
    <div class="game-info">
      <div class="score">Pontuação: {{ score }}</div>
      <div class="time">Tempo: {{ timeLeft }}s</div>
    </div>

    <div class="game-area" ref="gameArea" @mousemove="movePlayer" @click="collectItem">
      <div class="player" :style="playerStyle"></div>
      
      <div 
        v-for="(item, index) in items" 
        :key="index" 
        class="item" 
        :style="{
          left: item.x + 'px',
          top: item.y + 'px',
          backgroundColor: item.color
        }"
      ></div>
      
      <div class="instructions" v-if="!gameStarted">
        <h3>Coletador de Códigos</h3>
        <p>Clique nos quadrados coloridos para coletar pontos!</p>
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
  name: 'EasterEggGame',
  emits: ['game-complete'],
  data() {
    return {
      score: 0,
      timeLeft: 30,
      timer: null,
      gameStarted: false,
      gameOver: false,
      playerX: 0,
      playerY: 0,
      items: [],
      gameAreaWidth: 0,
      gameAreaHeight: 0,
      colors: ['#FF5252', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0']
    }
  },
  computed: {
    playerStyle() {
      return {
        left: this.playerX + 'px',
        top: this.playerY + 'px'
      }
    }
  },
  methods: {
    startGame() {
      this.gameStarted = true;
      this.gameOver = false;
      this.score = 0;
      this.timeLeft = 30;
      this.spawnItems();
      
      this.timer = setInterval(() => {
        this.timeLeft--;
        if (this.timeLeft <= 0) {
          this.endGame();
        }
      }, 1000);
    },
    
    resetGame() {
      this.items = [];
      this.startGame();
    },
    
    endGame() {
      clearInterval(this.timer);
      this.gameOver = true;
      this.gameStarted = false;
      this.$emit('game-complete', this.score);
    },
    
    spawnItems() {
      // Limpa os itens existentes
      this.items = [];
      
      // Cria 8 itens aleatórios
      for (let i = 0; i < 8; i++) {
        this.createRandomItem();
      }
    },
    
    createRandomItem() {
      const padding = 30; // Espaço da borda
      const x = Math.random() * (this.gameAreaWidth - 2 * padding) + padding;
      const y = Math.random() * (this.gameAreaHeight - 2 * padding) + padding;
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];
      
      this.items.push({ x, y, color });
    },
    
    movePlayer(e) {
      if (!this.gameStarted || this.gameOver) return;
      
      const rect = this.$refs.gameArea.getBoundingClientRect();
      this.playerX = e.clientX - rect.left - 15; // 15 é metade do tamanho do jogador
      this.playerY = e.clientY - rect.top - 15;
    },
    
    collectItem(e) {
      if (!this.gameStarted || this.gameOver) return;
      
      const rect = this.$refs.gameArea.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      // Verificar se clicou em algum item
      for (let i = this.items.length - 1; i >= 0; i--) {
        const item = this.items[i];
        const distance = Math.sqrt(
          Math.pow(clickX - (item.x + 10), 2) + 
          Math.pow(clickY - (item.y + 10), 2)
        );
        
        if (distance < 20) {
          // Item coletado
          this.score += 10;
          this.items.splice(i, 1);
          this.createRandomItem();
          
          // Adiciona tempo extra
          this.timeLeft = Math.min(this.timeLeft + 2, 30);
          
          break;
        }
      }
    }
  },
  mounted() {
    // Obtém as dimensões da área de jogo
    this.$nextTick(() => {
      if (this.$refs.gameArea) {
        this.gameAreaWidth = this.$refs.gameArea.clientWidth;
        this.gameAreaHeight = this.$refs.gameArea.clientHeight;
        
        // Posiciona o player no centro inicialmente
        this.playerX = this.gameAreaWidth / 2 - 15;
        this.playerY = this.gameAreaHeight / 2 - 15;
      }
    });
  },
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
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
  cursor: crosshair;
}

.player {
  position: absolute;
  width: 30px;
  height: 30px;
  background-color: white;
  border: 2px solid #2196F3;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 10;
  box-shadow: 0 0 10px rgba(33, 150, 243, 0.8);
}

.item {
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  transition: transform 0.2s;
}

.item:hover {
  transform: scale(1.2);
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
