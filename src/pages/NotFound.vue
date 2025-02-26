<template>
  <div class="not-found">
    <h1>Página não encontrada</h1>
    <p>A página que você está procurando não existe.</p>
    <p>Verifique o URL ou volte para a página inicial.</p>
    <button @click="$router.push('/')" class="btn-voltar">
      Voltar para Home
    </button>
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  padding: 2rem;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 2rem auto;
}
.not-found h1 {
  font-size: 2rem;
  color: #343a40;
}
.not-found p {
  font-size: 1rem;
  color: #6c757d;
}
</style>