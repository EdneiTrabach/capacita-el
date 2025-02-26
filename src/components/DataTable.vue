<template>
  <table class="data-table">
    <thead>
      <tr>
        <th v-for="header in headers" :key="header">{{ header }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in rows" :key="row.id">
        <td v-for="value in row" :key="value">{{ value }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  props: {
    headers: { type: Array, required: true },
    rows: { type: Array, required: true },
  },
};
</script>

<style>

</style>
