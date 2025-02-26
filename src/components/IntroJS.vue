<template>
  <div class="intro-config" v-if="showSetupButton">
    <button class="intro-button" @click="startIntro">
      <img src="/public/icons/help.svg" alt="Ajuda" class="intro-icon"/>
      Tutorial
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, defineExpose } from 'vue';
import introJs from 'intro.js';
import 'intro.js/introjs.css';
import 'intro.js/themes/introjs-modern.css';

const props = defineProps({
  steps: {
    type: Array,
    required: true
  },
  options: {
    type: Object,
    default: () => ({})
  },
  showSetupButton: {
    type: Boolean,
    default: true
  }
});

const intro = ref(null);

onMounted(() => {
  intro.value = introJs();
  
  // Configurações padrão
  const defaultOptions = {
    nextLabel: 'Próximo',
    prevLabel: 'Anterior',
    doneLabel: 'Concluir',
    skipLabel: 'X',
    hidePrev: false,
    hideNext: false,
    exitOnOverlayClick: false,
    showStepNumbers: true,
    showBullets: true,
    showProgress: true,
    scrollToElement: true,
    keyboardNavigation: true,
    disableInteraction: false
  };
  
  // Mescla opções padrão com as personalizadas
  const mergedOptions = { ...defaultOptions, ...props.options };
  
  intro.value.setOptions(mergedOptions);
  intro.value.setOptions({ steps: props.steps });
});

const startIntro = () => {
  if (intro.value) {
    intro.value.start();
  }
};

// Expõe o método para permitir que o componente pai inicie o tutorial
defineExpose({ startIntro });
</script>

<style scoped>
/* Estilo para o botão de tutorial */
.intro-config {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.intro-button {
  background-color: #193155;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 12px 24px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0,0,0,0.25);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  font-size: 14px;
  letter-spacing: 0.5px;
}


.intro-button:hover {
  background-color: #254677;
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(25, 49, 85, 0.4);
}

.intro-button:active {
  transform: translateY(-1px);
}

.intro-icon {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1);
  transition: transform 0.3s ease;
}

.intro-button:hover .intro-icon {
  transform: rotate(15deg);
}

/* Customização global do Intro.js */
:global(.introjs-tooltip) {
  background-color: #254677c2;
  backdrop-filter: blur(10px);
  border-radius: 12px;
  font-family: 'JetBrains Mono', monospace;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border: none;
  max-width: 400px;
  padding: 20px;
}

:global(.introjs-tooltip-title) {
  color: #fff;
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 10px;
  border-bottom: 1px solid #eaeaea;
  padding-bottom: 10px;
}

:global(.introjs-tooltiptext) {
  color: #fff;
  line-height: 1.6;
  font-size: 14px;
}

:global(.introjs-helperLayer) {
  box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(25, 49, 85, 0.2);
  transition: all 0.3s ease-out;
  border-radius: 4px;
}

:global(.introjs-button) {
  background-color: #099934;
  color: white;
  border: none;
  box-shadow: none;
  text-shadow: none;
  transition: all 0.3s ease;
  border-radius: 6px;
  padding: 8px 16px;
  margin: 4px;
  font-weight: 500;
  font-size: 14px;
}

:global(.introjs-button:hover) {
  background-color: #254677;
  color: white;
  box-shadow: 0 2px 8px rgba(25, 49, 85, 0.3);
}

:global(.introjs-skipbutton) {
  color: #ca1a11;
  background-color: #fff;
  border: 1px solid #d2d2d2;
}

:global(.introjs-skipbutton:hover) {
  background-color: #990800;
  color: #ffffff;
}

:global(.introjs-prevbutton) {
  border-radius: 6px 0 0 6px;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

:global(.introjs-nextbutton) {
  border-radius: 0 6px 6px 0;
}

:global(.introjs-bullets ul li a) {
  background: #d4d4d4;
  width: 8px;
  height: 8px;
  transition: all 0.2s ease;
}

:global(.introjs-bullets ul li a.active) {
  background: #193155;
  transform: scale(1.2);
}

:global(.introjs-progress) {
  background-color: #e9ecef;
  height: 6px;
  border-radius: 3px;
  margin: 10px 0;
}

:global(.introjs-progressbar) {
  background: linear-gradient(90deg, #195530 0%, #209c3b 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

:global(.introjs-arrow) {
  border: 10px solid transparent;
}

:global(.introjs-arrow.top) {
  border-bottom-color: white;
  filter: drop-shadow(0 -2px 3px rgba(0, 0, 0, 0.1));
}

:global(.introjs-arrow.bottom) {
  border-top-color: white;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.1));
}

:global(.introjs-arrow.left) {
  border-right-color: white;
  filter: drop-shadow(-2px 0 3px rgba(0, 0, 0, 0.1));
}

:global(.introjs-arrow.right) {
  border-left-color: white;
  filter: drop-shadow(2px 0 3px rgba(0, 0, 0, 0.1));
}

:global(.introjs-overlay) {
  transition: opacity 0.4s ease;
}

@media (max-width: 768px) {
  :global(.introjs-tooltip) {
    max-width: 300px;
    padding: 15px;
  }
  
  .intro-button {
    padding: 10px 18px;
    font-size: 13px;
  }
}
</style>
