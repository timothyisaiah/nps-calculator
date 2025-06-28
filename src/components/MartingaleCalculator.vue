<template>
  <div class="martingale-calculator">
    <!-- Header with gradient background -->
    <div class="header-section">
      <div class="header-content">
        <div class="app-title">
          <q-icon name="trending_up" size="2rem" color="white" class="q-mr-sm" />
          <span>Martingale Calculator</span>
        </div>
        <div class="app-subtitle">Real-time Crypto Position Sizing</div>
      </div>
    </div>

    <div class="main-content">
      <!-- Top Row: Token Selection and Current Price -->
      <div class="top-row">
        <div class="token-section">
          <div class="token-selector-container">
            <label for="token-select" class="token-label">Select Token</label>
            <select id="token-select" v-model="selectedTokenId" @change="onTokenChange" class="token-select"
              :disabled="tokenLoading">
              <option value="" disabled>Choose a token...</option>
              <option v-for="token in availableTokens" :key="token.id" :value="token.id" class="token-option">
                {{ token.name }} ({{ token.symbol }})
              </option>
            </select>
            <div v-if="tokenLoading" class="token-loading">
              <q-spinner-dots size="20px" color="primary" />
            </div>
          </div>
        </div>

        <div class="price-section">
          <div class="card current-price-card">
            <div class="price-label">Current Price</div>
            <div class="price-value">${{ currentPrice || '0.00' }}</div>
            <q-btn color="primary" icon="refresh" size="sm" round @click="refreshPrice" :loading="priceLoading"
              class="refresh-btn" />
          </div>
        </div>
      </div>

      <!-- Strategy Inputs Row -->
      <div class="inputs-row">
        <div class="input-group">
          <q-input v-model.number="capital" label="Capital (USD)" type="number" outlined dense
            :rules="[val => val > 0 || 'Capital must be greater than 0']" suffix="$" min="0.01" step="0.01"
            class="strategy-input" bg-color="white" />
        </div>
        <div class="input-group">
          <q-input v-model.number="entryPrice" label="Entry Price" type="number" outlined dense
            :rules="[val => val > 0 || 'Entry price must be greater than 0']" suffix="$" min="0.01" step="0.01"
            class="strategy-input" bg-color="white" hint="Auto-filled with current price" />
        </div>
        <div class="input-group">
          <q-input v-model.number="totalDropPercentage" label="Total Drop %" type="number" outlined dense :rules="[
            val => val > 0 || 'Drop must be greater than 0',
            val => val < 100 || 'Drop must be less than 100%'
          ]" suffix="%" min="0.01" max="99.99" step="0.01" class="strategy-input" bg-color="white" />
        </div>
        <div class="input-group">
          <q-input v-model.number="takeProfitRatio" label="Take Profit Ratio" type="number" outlined dense
            :rules="[val => val > 1 || 'Ratio must be greater than 1']" hint="e.g., 1.5 for 50% profit" min="1.01"
            step="0.01" class="strategy-input" bg-color="white" />
        </div>
      </div>

      <!-- Chart and Results Row -->
      <div class="chart-results-row">
        <!-- Price Chart -->
        <div class="chart-section">
          <PriceChart :token-id="selectedToken?.id" :token-name="selectedToken?.name || ''"
            :historical-data="historicalData" :loading="chartLoading" :error="chartError" />
        </div>

        <!-- Strategy Results -->
        <div v-if="results.length > 0" class="results-section">
          <div class="results-header">
            <q-icon name="analytics" color="primary" size="1.5rem" />
            <span class="results-title">Strategy Results</span>
          </div>
          <div class="results-table-container">
            <q-table :rows="results" :columns="tableColumns" row-key="level" flat bordered
              table-header-style="background-color: #f8f9fa;" :pagination="{ rowsPerPage: 0 }" class="results-table"
              :loading="loading" loading-label="Calculating strategy..." :rows-per-page-options="[0]" hide-pagination>
              <!-- Custom row styling -->
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="level" :props="props">
                    {{ props.row.level === 0 ? 'FBA' : 'MC' + (props.row.level + 1) }}
                  </q-td>
                  <q-td key="priceLevel" :props="props">
                    ${{ props.row.priceLevel.toFixed(2) }}
                  </q-td>
                  <q-td key="dropPercentage" :props="props">
                    {{ props.row.dropPercentage.toFixed(1) }}%
                  </q-td>
                  <q-td key="buyInRatio" :props="props">
                    {{ props.row.buyInRatio.toFixed(1) }}x
                  </q-td>
                  <q-td key="buyInAmount" :props="props">
                    ${{ props.row.buyInAmount.toFixed(0) }}
                  </q-td>
                  <q-td key="unitsBought" :props="props">
                    {{ props.row.unitsBought.toFixed(3) }}
                  </q-td>
                  <q-td key="cumulativeCost" :props="props">
                    ${{ props.row.cumulativeCost.toFixed(0) }}
                  </q-td>
                  <q-td key="averageEntry" :props="props">
                    ${{ props.row.averageEntry.toFixed(2) }}
                  </q-td>
                  <q-td key="targetSellPrice" :props="props">
                    ${{ props.row.targetSellPrice.toFixed(2) }}
                  </q-td>
                  <q-td key="floatingLossDollar" :props="props" :class="getPnLClass(props.row.floatingLossDollar)">
                    ${{ props.row.floatingLossDollar.toFixed(0) }}
                  </q-td>
                  <q-td key="floatingLossPercent" :props="props" :class="getPnLClass(props.row.floatingLossPercent)">
                    {{ props.row.floatingLossPercent.toFixed(1) }}%
                  </q-td>
                </q-tr>
              </template>

              <!-- No data template -->
              <template v-slot:no-data>
                <div class="no-data">
                  <q-icon name="info" size="2rem" color="grey-4" />
                  <div class="no-data-text">No strategy data available</div>
                </div>
              </template>
            </q-table>
          </div>
        </div>

        <!-- Error Display Section -->
        <div v-if="chartError" class="error-section">
          <div class="error-card">
            <q-icon name="warning" color="negative" size="2rem" />
            <div class="error-content">
              <div class="error-title">API Error</div>
              <div class="error-message">{{ chartError }}</div>
              <div class="error-help">
                <strong>What you can do:</strong>
                <ul>
                  <li>Wait a moment and try refreshing the price</li>
                  <li>Try selecting a different token</li>
                  <li>Check your internet connection</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import PriceChart from './PriceChart.vue'
import { AVAILABLE_TOKENS, getCurrentPrice, getHistoricalData } from '../services/cryptoService'

const $q = useQuasar()

// Fallback notification function
const showNotification = (message, type = 'negative') => {
  if ($q && $q.notify) {
    $q.notify({
      type,
      message,
      position: 'top',
      timeout: 5000
    })
  } else {
    // Fallback to console and alert for development
    console.error(message)
    if (type === 'negative') {
      alert(`Error: ${message}`)
    }
  }
}

// Token selection and data
const selectedTokenId = ref('')
const selectedToken = ref(null)
const currentPrice = ref('')
const historicalData = ref([])
const tokenLoading = ref(false)
const priceLoading = ref(false)
const chartLoading = ref(false)
const chartError = ref('')

// Available tokens for dropdown
const availableTokens = ref(AVAILABLE_TOKENS)

// Strategy inputs
const capital = ref(1000)
const entryPrice = ref(100)
const totalDropPercentage = ref(30)
const takeProfitRatio = ref(1.5)

// Results
const results = ref([])
const loading = ref(false)

// Table columns configuration
const tableColumns = [
  {
    name: 'level',
    label: 'Level',
    field: 'level',
    align: 'center',
    sortable: true,
    style: 'width: 60px'
  },
  {
    name: 'priceLevel',
    label: 'Price',
    field: 'priceLevel',
    align: 'center',
    sortable: true,
    format: (val) => `$${val.toFixed(2)}`
  },
  {
    name: 'dropPercentage',
    label: 'Drop %',
    field: 'dropPercentage',
    align: 'center',
    sortable: true,
    format: (val) => `${val.toFixed(1)}%`
  },
  {
    name: 'buyInRatio',
    label: 'Buy-in',
    field: 'buyInRatio',
    align: 'center',
    sortable: true,
    format: (val) => `${val.toFixed(1)}x`
  },
  {
    name: 'buyInAmount',
    label: 'Amount',
    field: 'buyInAmount',
    align: 'center',
    sortable: true,
    format: (val) => `$${val.toFixed(0)}`
  },
  {
    name: 'unitsBought',
    label: 'Units',
    field: 'unitsBought',
    align: 'center',
    sortable: true,
    format: (val) => val.toFixed(3)
  },
  {
    name: 'cumulativeCost',
    label: 'Total Cost',
    field: 'cumulativeCost',
    align: 'center',
    sortable: true,
    format: (val) => `$${val.toFixed(0)}`
  },
  {
    name: 'averageEntry',
    label: 'Avg Entry',
    field: 'averageEntry',
    align: 'center',
    sortable: true,
    format: (val) => `$${val.toFixed(2)}`
  },
  {
    name: 'targetSellPrice',
    label: 'Target',
    field: 'targetSellPrice',
    align: 'center',
    sortable: true,
    format: (val) => `$${val.toFixed(2)}`
  },
  {
    name: 'floatingLossDollar',
    label: 'P&L ($)',
    field: 'floatingLossDollar',
    align: 'center',
    sortable: true,
    format: (val) => `$${val.toFixed(0)}`
  },
  {
    name: 'floatingLossPercent',
    label: 'P&L (%)',
    field: 'floatingLossPercent',
    align: 'center',
    sortable: true,
    format: (val) => `${val.toFixed(1)}%`
  }
]

// Computed property to check if form is valid
const isFormValid = computed(() => {
  return capital.value > 0 &&
    entryPrice.value > 0 &&
    totalDropPercentage.value > 0 &&
    totalDropPercentage.value < 100 &&
    takeProfitRatio.value > 1
})

// Watch for changes in strategy inputs and auto-recalculate
watch([entryPrice, capital, totalDropPercentage, takeProfitRatio], () => {
  if (isFormValid.value && results.value.length > 0) {
    calculateMartingale()
  }
}, { deep: true })

// Get P&L color class
const getPnLClass = (value) => {
  if (value >= 0) return 'text-positive text-weight-medium'
  return 'text-negative text-weight-medium'
}

// Handle token selection change
const onTokenChange = async (event) => {
  const tokenId = event.target.value
  if (!tokenId) return

  const token = availableTokens.value.find(t => t.id === tokenId)
  if (!token) return

  selectedToken.value = token
  tokenLoading.value = true

  try {
    // Fetch current price and historical data
    await Promise.all([
      fetchCurrentPrice(tokenId),
      fetchHistoricalData(tokenId)
    ])

    // Trigger initial calculation after price is fetched
    if (isFormValid.value) {
      calculateMartingale()
    }
  } catch (error) {
    console.error('Token change error:', error)
    showNotification(error.message || 'Failed to load token data')
  } finally {
    tokenLoading.value = false
  }
}

// Fetch current price
const fetchCurrentPrice = async (tokenId) => {
  try {
    priceLoading.value = true
    const price = await getCurrentPrice(tokenId)
    currentPrice.value = price.toFixed(2)
    entryPrice.value = price // Auto-fill entry price
  } catch (error) {
    showNotification(error.message || 'Failed to fetch current price')
    throw error
  } finally {
    priceLoading.value = false
  }
}

// Fetch historical data
const fetchHistoricalData = async (tokenId) => {
  try {
    chartLoading.value = true
    chartError.value = ''
    const data = await getHistoricalData(tokenId)
    historicalData.value = data
  } catch (error) {
    chartError.value = error.message || 'Failed to load historical data'
    showNotification(error.message || 'Failed to fetch historical data')
    throw error
  } finally {
    chartLoading.value = false
  }
}

// Refresh current price
const refreshPrice = async () => {
  if (selectedToken.value) {
    try {
      await fetchCurrentPrice(selectedToken.value.id)
      // Trigger recalculation after price refresh
      if (isFormValid.value) {
        calculateMartingale()
      }
    } catch (error) {
      console.error('Price refresh error:', error)
      // Error already shown by fetchCurrentPrice
    }
  }
}

// Calculate martingale strategy
const calculateMartingale = () => {
  loading.value = true

  // Additional validation
  if (!isFormValid.value) {
    loading.value = false
    return
  }

  const resultsArray = []
  let cumulativeCost = 0
  let totalUnits = 0
  const numLevels = 5

  // Define buy-in ratios (1x, 2x, 4x, 8x, 16x)
  const buyInRatios = [1, 2, 4, 8, 16]
  const totalRatio = buyInRatios.reduce((sum, ratio) => sum + ratio, 0)

  // Calculate drop percentage per level
  const dropPerLevel = totalDropPercentage.value / numLevels

  for (let level = 0; level < numLevels; level++) {
    // Price Level = Entry Price × (1 - cumulative % drop)
    const cumulativeDrop = dropPerLevel * (level + 1)
    const priceLevel = entryPrice.value * (1 - cumulativeDrop / 100)

    // Buy-in Amount ($) = Capital × (buy-in ratio / sum of all ratios)
    const buyInRatio = buyInRatios[level]
    const buyInAmount = capital.value * (buyInRatio / totalRatio)

    // Units Bought = Buy-in Amount ÷ Price Level
    const unitsBought = buyInAmount / priceLevel

    // Update cumulative values
    cumulativeCost += buyInAmount
    totalUnits += unitsBought

    // Average Entry = Total Invested ÷ Total Units
    const averageEntry = cumulativeCost / totalUnits

    // Target Sell Price = Avg Entry × Take Profit Ratio
    const targetSellPrice = averageEntry * takeProfitRatio.value

    // Est. Floating Loss = Unrealized PnL in $ and %
    const currentValue = priceLevel * totalUnits
    const floatingLossDollar = currentValue - cumulativeCost
    const floatingLossPercent = (floatingLossDollar / cumulativeCost) * 100

    resultsArray.push({
      level,
      priceLevel,
      dropPercentage: cumulativeDrop,
      buyInRatio,
      buyInAmount,
      unitsBought,
      cumulativeCost,
      averageEntry,
      targetSellPrice,
      floatingLossDollar,
      floatingLossPercent
    })
  }

  results.value = resultsArray
  loading.value = false
}

// Initialize with Bitcoin as default token on mount
onMounted(async () => {
  const bitcoinToken = availableTokens.value.find(t => t.id === 'bitcoin')
  if (bitcoinToken) {
    selectedTokenId.value = 'bitcoin'
    selectedToken.value = bitcoinToken
    await onTokenChange({ target: { value: 'bitcoin' } })
  }
})
</script>

<style scoped>
.martingale-calculator {
  min-height: 100vh;
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
}

.header-section {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  padding: 2rem 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
}

.app-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.app-subtitle {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 300;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.top-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
}

.token-section {
  flex: 1;
  max-width: 300px;
}

.price-section {
  flex: 0 0 auto;
}

.current-price-card {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 15px rgba(238, 90, 36, 0.3);
  position: relative;
}

.price-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.price-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.refresh-btn {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
}

.inputs-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.input-group {
  width: 100%;
}

.strategy-input {
  width: 100%;
}

.chart-results-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  align-items: start;
}

.chart-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.results-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-height: 600px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.results-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.results-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.results-table-container {
  flex: 1;
  overflow-y: auto;
}

.results-table {
  font-size: 0.8rem;
  border-radius: 8px;
  overflow: hidden;
}

.results-table .q-table__top,
.results-table .q-table__bottom {
  display: none;
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #999;
}

.no-data-text {
  margin-top: 1rem;
  font-size: 1rem;
}

.text-positive {
  color: #28a745 !important;
}

.text-negative {
  color: #dc3545 !important;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .chart-results-row {
    grid-template-columns: 1fr;
  }

  .results-section {
    max-height: 400px;
  }
}

@media (max-width: 768px) {
  .app-title {
    font-size: 2rem;
  }

  .top-row {
    flex-direction: column;
    align-items: stretch;
  }

  .token-section {
    max-width: none;
  }

  .token-selector-container {
    margin-bottom: 1rem;
  }

  .inputs-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .input-group {
    width: 100%;
  }

  .current-price-card {
    justify-content: center;
  }
}

.token-selector-container {
  position: relative;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.token-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #666;
  margin-bottom: 0.5rem;
  padding-left: 0.5rem;
}

.token-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  outline: none;
  font-size: 1rem;
  background: white;
  color: #333;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1rem;
  padding-right: 2.5rem;
}

.token-select:focus {
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.token-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.token-option {
  padding: 0.5rem;
}

.token-loading {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.error-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
}

.error-card {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.error-content {
  flex: 1;
}

.error-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
}

.error-message {
  font-size: 1rem;
  color: white;
  margin-bottom: 1rem;
}

.error-help {
  font-size: 0.9rem;
  color: white;
}

.error-help ul {
  list-style-type: disc;
  padding-left: 20px;
}

.api-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.api-loading-text {
  font-size: 0.9rem;
  color: #666;
}
</style>
