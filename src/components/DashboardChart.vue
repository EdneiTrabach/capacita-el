<template>
  <div class="chart-wrapper">
    <component 
      :is="chartType" 
      v-if="chartData" 
      :data="chartData" 
      :options="chartOptions" 
    />
  </div>
</template>

<script>
import { Bar, Line, Pie, Doughnut, Bubble } from 'vue-chartjs'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement,
  LineElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js'

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement,
  LineElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend
)

export default {
  name: 'DashboardChart',
  components: { Bar, Line, Pie, Doughnut, Bubble },
  props: {
    type: {
      type: String,
      default: 'Bar',
      validator: value => ['Bar', 'Line', 'Pie', 'Doughnut', 'Bubble'].includes(value)
    },
    data: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    chartType() {
      return this.type
    },
    chartData() {
      return this.data
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        ...this.options,
        plugins: {
          legend: { position: 'top' },
          title: { display: true },
          ...this.options.plugins
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