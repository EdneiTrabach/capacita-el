<template>
  <div class="chart-wrapper">
    <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script>
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default {
  name: 'DashboardChart',
  components: { Bar },
  props: {
    matriculasPorCurso: {
      type: Object,
      required: true
    }
  },
  computed: {
    chartData() {
      return {
        labels: Object.keys(this.matriculasPorCurso),
        datasets: [{
          label: 'Matrículas por Curso',
          data: Object.values(this.matriculasPorCurso),
          backgroundColor: '#3498db'
        }]
      }
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          title: { display: false }
        }
      }
    }
  }
}
</script>

<style scoped>
.chart-wrapper {
  height: 400px;
  margin: 20px 0;
}
</style>