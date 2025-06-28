<template>
  <div class="price-chart">
    <div class="chart-header">
      <div class="chart-title">
        <q-icon name="show_chart" color="primary" size="1.5rem" />
        <span>{{ tokenName }} Price Chart (7 Days)</span>
      </div>
    </div>

    <div v-if="loading" class="chart-loading">
      <q-spinner-dots size="50px" color="primary" />
      <div class="loading-text">Loading chart data...</div>
    </div>

    <div v-else-if="error" class="chart-error">
      <q-icon name="error" size="50px" color="negative" />
      <div class="error-text">{{ error }}</div>
    </div>

    <div v-else-if="chartData.length > 0" class="chart-container">
      <apex-chart
        type="line"
        height="280"
        :options="chartOptions"
        :series="chartSeries"
      />
    </div>

    <div v-else class="chart-placeholder">
      <q-icon name="show_chart" size="60px" color="grey-4" />
      <div class="placeholder-text">Select a token to view price chart</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tokenId: {
    type: String,
    default: null
  },
  tokenName: {
    type: String,
    default: ''
  },
  historicalData: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
})

// Chart data computed from props
const chartData = computed(() => props.historicalData)

// Chart series configuration
const chartSeries = computed(() => [
  {
    name: `${props.tokenName} Price`,
    data: chartData.value
  }
])

// Chart options configuration
const chartOptions = computed(() => ({
  chart: {
    type: 'line',
    toolbar: {
      show: false
    },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800
    },
    background: 'transparent'
  },
  stroke: {
    curve: 'smooth',
    width: 3
  },
  colors: ['#667eea'],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.1,
      stops: [0, 90, 100],
      colorStops: [
        {
          offset: 0,
          color: '#667eea',
          opacity: 0.7
        },
        {
          offset: 100,
          color: '#667eea',
          opacity: 0.1
        }
      ]
    }
  },
  grid: {
    borderColor: '#e0e0e0',
    strokeDashArray: 5,
    xaxis: {
      lines: {
        show: false
      }
    },
    yaxis: {
      lines: {
        show: true
      }
    }
  },
  xaxis: {
    type: 'datetime',
    labels: {
      format: 'MMM dd',
      style: {
        colors: '#666',
        fontSize: '11px'
      }
    },
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    }
  },
  yaxis: {
    labels: {
      formatter: (value) => `$${value.toFixed(2)}`,
      style: {
        colors: '#666',
        fontSize: '11px'
      }
    },
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    }
  },
  tooltip: {
    x: {
      format: 'MMM dd, yyyy HH:mm'
    },
    y: {
      formatter: (value) => `$${value.toFixed(2)}`
    },
    theme: 'light',
    style: {
      fontSize: '12px'
    }
  },
  markers: {
    size: 4,
    colors: ['#667eea'],
    strokeColors: '#fff',
    strokeWidth: 2,
    hover: {
      size: 6
    }
  },
  dataLabels: {
    enabled: false
  },
  legend: {
    show: false
  },
  responsive: [
    {
      breakpoint: 768,
      options: {
        chart: {
          height: 200
        },
        xaxis: {
          labels: {
            style: {
              fontSize: '10px'
            }
          }
        },
        yaxis: {
          labels: {
            style: {
              fontSize: '10px'
            }
          }
        }
      }
    }
  ]
}))
</script>

<style scoped>
.price-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-header {
  margin-bottom: 1rem;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.chart-loading,
.chart-error,
.chart-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 280px;
}

.loading-text,
.error-text,
.placeholder-text {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.error-text {
  color: #dc3545;
}

.placeholder-text {
  color: #999;
}

.chart-container {
  flex: 1;
  min-height: 280px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .chart-title {
    font-size: 1rem;
  }

  .chart-loading,
  .chart-error,
  .chart-placeholder {
    min-height: 200px;
  }

  .chart-container {
    min-height: 200px;
  }
}
</style>
