import axios from 'axios'

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'

// Rate limiting configuration
const RATE_LIMIT_DELAY = 1200 // 1.2 seconds between requests
let lastRequestTime = 0

// Popular crypto tokens for the dropdown
export const AVAILABLE_TOKENS = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum' },
  { id: 'solana', symbol: 'SOL', name: 'Solana' },
  { id: 'cardano', symbol: 'ADA', name: 'Cardano' },
  { id: 'polkadot', symbol: 'DOT', name: 'Polkadot' },
  { id: 'chainlink', symbol: 'LINK', name: 'Chainlink' },
  { id: 'polygon', symbol: 'MATIC', name: 'Polygon' },
  { id: 'avalanche-2', symbol: 'AVAX', name: 'Avalanche' },
  { id: 'binancecoin', symbol: 'BNB', name: 'BNB' },
  { id: 'ripple', symbol: 'XRP', name: 'XRP' },
]

// Rate limiting helper
const rateLimit = async () => {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime

  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest))
  }

  lastRequestTime = Date.now()
}

// Retry helper with exponential backoff
const retryRequest = async (requestFn, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await rateLimit()
      return await requestFn()
    } catch (error) {
      if (error.response?.status === 429) {
        // Rate limited - wait longer and retry
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000) // Max 10 seconds
        console.warn(`Rate limited, waiting ${waitTime}ms before retry ${attempt}/${maxRetries}`)
        await new Promise((resolve) => setTimeout(resolve, waitTime))
        continue
      }

      if (attempt === maxRetries) {
        throw error
      }

      // For other errors, wait a bit before retry
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
    }
  }
}

// Get current price for a token
export const getCurrentPrice = async (tokenId) => {
  try {
    const response = await retryRequest(async () => {
      return axios.get(`${COINGECKO_API_BASE}/simple/price`, {
        params: {
          ids: tokenId,
          vs_currencies: 'usd',
        },
        timeout: 10000, // 10 second timeout
      })
    })

    if (!response.data[tokenId]?.usd) {
      throw new Error('Invalid price data received')
    }

    return response.data[tokenId].usd
  } catch (error) {
    console.error('Error fetching current price:', error)

    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.')
    }

    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection and try again.')
    }

    throw new Error('Failed to fetch current price. Please try again later.')
  }
}

// Get historical price data for the last 7 days
export const getHistoricalData = async (tokenId) => {
  try {
    const endDate = Math.floor(Date.now() / 1000)
    const startDate = endDate - 7 * 24 * 60 * 60 // 7 days ago

    const response = await retryRequest(async () => {
      return axios.get(`${COINGECKO_API_BASE}/coins/${tokenId}/market_chart/range`, {
        params: {
          vs_currency: 'usd',
          from: startDate,
          to: endDate,
        },
        timeout: 15000, // 15 second timeout for historical data
      })
    })

    if (!response.data?.prices || !Array.isArray(response.data.prices)) {
      throw new Error('Invalid historical data received')
    }

    return response.data.prices.map(([timestamp, price]) => ({
      x: new Date(timestamp).toISOString(),
      y: price,
    }))
  } catch (error) {
    console.error('Error fetching historical data:', error)

    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.')
    }

    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection and try again.')
    }

    throw new Error('Failed to fetch historical data. Please try again later.')
  }
}

// Get token info (name, symbol, etc.)
export const getTokenInfo = async (tokenId) => {
  try {
    const response = await retryRequest(async () => {
      return axios.get(`${COINGECKO_API_BASE}/coins/${tokenId}`, {
        timeout: 10000,
      })
    })

    return {
      id: response.data.id,
      symbol: response.data.symbol.toUpperCase(),
      name: response.data.name,
      image: response.data.image.small,
    }
  } catch (error) {
    console.error('Error fetching token info:', error)

    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.')
    }

    throw new Error('Failed to fetch token info. Please try again later.')
  }
}
