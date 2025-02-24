<script setup lang="ts">
import { useNavigation } from './navigationButtons'
import './navigationButtons.css'

const {
  showNavigation,
  isSpecialRoute,
  getBackRoute,
  hasPrevious,
  hasNext,
  goToPrevious,
  goToNext,
  router
} = useNavigation()
</script>

<template>
  <div class="navigation-buttons" v-if="showNavigation">
    <template v-if="isSpecialRoute">
      <button 
        @click="router.push(getBackRoute)"
        class="nav-btn prev-btn"
      >
        <img src="/icons/left.svg" alt="Voltar" class="icon-white" />
        {{ getBackRoute === '/admin' ? 'Voltar para Admin' : 'Voltar para Lista' }}
      </button>
    </template>
    
    <template v-else>
      <button 
        @click="goToPrevious" 
        :disabled="!hasPrevious"
        class="nav-btn prev-btn"
      >
        <img src="/icons/left.svg" alt="Anterior" class="icon-white" />
        Anterior
      </button>
      <button 
        @click="goToNext" 
        :disabled="!hasNext"
        class="nav-btn"
      >
        Próximo
        <img src="/icons/right.svg" alt="Próximo" class="icon-white" />
      </button>
    </template>
  </div>
</template>
