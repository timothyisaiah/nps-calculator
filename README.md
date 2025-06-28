# Martingale Calculator

A modern, real-time crypto Martingale position size calculator built with Vue 3 and Quasar. Features live price data, interactive charts, and dynamic strategy calculations.

## ✨ Features

- **Real-time Crypto Data**: Live prices from CoinGecko API
- **Token Selection**: Choose from popular cryptocurrencies (BTC, ETH, SOL, etc.)
- **Interactive Price Charts**: 7-day historical price data with ApexCharts
- **Dynamic Calculations**: Real-time Martingale strategy calculations
- **Modern UI**: Beautiful gradient design with intuitive layout
- **Responsive Design**: Works perfectly on desktop and mobile
- **Auto-fill Functionality**: Entry price automatically filled with current market price

## 🚀 Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Start development server:**

   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:9000`

## 📊 How to Use

1. **Select a Token**: Choose from the dropdown (Bitcoin, Ethereum, Solana, etc.)
2. **Review Current Price**: The current market price is displayed and auto-fills the entry price
3. **Set Your Strategy**:
   - **Capital**: Your total investment amount in USD
   - **Entry Price**: Auto-filled with current price (can be adjusted)
   - **Total Drop %**: Expected maximum price drop percentage
   - **Take Profit Ratio**: Target profit multiplier (e.g., 1.5 for 50% profit)
4. **View Results**: Strategy calculations update automatically in real-time
5. **Analyze Results**: Review the detailed breakdown of each Martingale level

## 📈 Strategy Results

The calculator shows:

- **Level**: Martingale level (1-5)
- **Price**: Buy-in price at each level
- **Drop %**: Cumulative percentage drop from entry
- **Buy-in**: Position size multiplier (1x, 2x, 4x, 8x, 16x)
- **Amount**: USD investment at each level
- **Units**: Number of tokens purchased
- **Total Cost**: Cumulative investment so far
- **Avg Entry**: Weighted average entry price
- **Target**: Price needed to achieve profit target
- **P&L**: Estimated profit/loss in dollars and percentage

## 🛠 Technology Stack

- **Vue 3**: Progressive JavaScript framework with Composition API
- **Quasar**: Vue.js framework for responsive web apps
- **ApexCharts**: Interactive charts and data visualization
- **CoinGecko API**: Real-time cryptocurrency data
- **Vite**: Fast build tool and development server

## 📱 Responsive Design

The app is fully responsive and optimized for:

- **Desktop**: Full-featured layout with side-by-side chart and results
- **Tablet**: Adaptive layout with stacked sections
- **Mobile**: Touch-friendly interface with optimized spacing

## 🎨 Design Features

- **Gradient Backgrounds**: Modern purple-blue gradient theme
- **Color-coded Results**: Green for profits, red for losses
- **Interactive Elements**: Hover effects and smooth animations
- **Clean Typography**: Easy-to-read fonts and proper hierarchy
- **Card-based Layout**: Organized sections with subtle shadows

## 🚀 Deployment

### Automatic Deployment (Recommended)

This project is configured for automatic deployment to GitHub Pages:

1. **Push to main branch**: Any push to `main` or `master` triggers automatic deployment
2. **GitHub Actions**: The workflow builds and deploys to the `gh-pages` branch
3. **Live URL**: Available at `https://[username].github.io/nps-calculator/`

#### Setup Steps:

1. **Enable GitHub Pages**:
   - Go to your repository Settings → Pages
   - Set Source to "Deploy from a branch"
   - Select `gh-pages` branch and `/ (root)` folder
   - Click Save

2. **Enable GitHub Actions**:
   - Go to Settings → Actions → General
   - Ensure "Allow all actions and reusable workflows" is selected
   - Click Save

3. **Push your code**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

### Manual Deployment

#### Option 1: Using npm scripts

```bash
# Quick deployment
npm run deploy

# Full deployment with script
npm run deploy:manual
```

#### Option 2: Using the deployment script

```bash
# Make script executable (first time only)
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

#### Option 3: Manual steps

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Deploy to GitHub Pages
npx gh-pages -d dist/spa
```

### Deployment Configuration

The deployment is configured in:

- **GitHub Actions**: `.github/workflows/deploy.yml`
- **Quasar Config**: `quasar.config.js` (publicPath setting)
- **Package.json**: Deployment scripts

### Troubleshooting

#### Common Issues:

1. **Build fails**:
   - Check for linting errors: `npm run lint`
   - Ensure all dependencies are installed: `npm install`
   - Check Node.js version (requires 18+)

2. **Deployment fails**:
   - Verify GitHub Pages is enabled in repository settings
   - Check GitHub Actions permissions
   - Ensure `GITHUB_TOKEN` secret is available

3. **App not loading**:
   - Verify the correct publicPath in `quasar.config.js`
   - Check if the `gh-pages` branch exists
   - Clear browser cache and try again

#### GitHub Actions Logs:

- Go to Actions tab in your repository
- Click on the latest workflow run
- Check the build and deploy steps for errors

### Custom Domain (Optional)

To use a custom domain:

1. Add your domain to the `cname` field in `.github/workflows/deploy.yml`
2. Configure DNS settings for your domain
3. Add a `CNAME` file to your repository root with your domain

### Environment Variables

For production builds, you can set environment variables in GitHub Actions:

```yaml
- name: Build
  run: npm run build
  env:
    NODE_ENV: production
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.
