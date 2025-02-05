<template>
  <div class="not-found">
    <h1>Página não encontrada</h1>
    <p>A página que você está procurando não existe.</p>
    <button @click="$router.push('/')" class="btn-voltar">
      Voltar para Home
    </button>
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  padding: 2rem;
}
.btn-voltar {
  background-color: #193155;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>