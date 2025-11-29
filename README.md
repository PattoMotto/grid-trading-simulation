<div align="center">
<img width="1200" height="475" alt="Grid Trading Simulation Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# Grid Trading Simulation

**A forward-testing environment for Grid Trading strategies using stochastic pricing models**

[![Deploy to GitHub Pages](https://github.com/PattoMotto/grid-trading-simulation/actions/workflows/deploy.yml/badge.svg)](https://github.com/PattoMotto/grid-trading-simulation/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Live Demo](https://pattomotto.github.io/grid-trading-simulation/) • [Report Bug](https://github.com/PattoMotto/grid-trading-simulation/issues) • [Request Feature](https://github.com/PattoMotto/grid-trading-simulation/issues)

</div>

---

## 📖 About

Grid Trading Simulation is an interactive web application that allows traders and developers to test grid trading strategies in simulated market conditions. The app uses advanced stochastic pricing models to generate realistic price movements, helping you understand how grid trading bots perform under different market scenarios.

### Key Features

- **🎯 Multiple Pricing Models**
  - Geometric Brownian Motion (GBM)
  - Ornstein-Uhlenbeck (OU) Mean Reversion
  - Jump Diffusion (JD)

- **⚙️ Flexible Grid Configuration**
  - Arithmetic and Geometric grid spacing
  - Customizable grid levels and price ranges
  - Stop-loss and price limit controls
  - Long-only, Short-only, and Neutral strategies
  - Entry filters (RSI, Bollinger Bands, None)

- **📊 Real-time Visualization**
  - Interactive price charts with grid levels
  - Profit/Loss tracking
  - Trade execution visualization
  - Comprehensive statistics dashboard

- **🚀 Performance Metrics**
  - Total P&L and ROI
  - Win rate and trade count
  - Maximum drawdown
  - Sharpe ratio
  - Detailed trade logs

## 🛠️ Tech Stack

- **Frontend Framework:** React 19 with TypeScript
- **Build Tool:** Vite 6
- **Charts:** Recharts
- **Icons:** Lucide React
- **Styling:** Tailwind CSS
- **Deployment:** GitHub Pages

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PattoMotto/grid-trading-simulation.git
   cd grid-trading-simulation
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   
   Navigate to `http://localhost:5173` to see the app in action.

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 📦 Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Automatic Deployment

Every push to the `main` branch triggers an automatic deployment:

1. The workflow builds the project
2. Deploys to the `gh-pages` branch
3. Your site is live at `https://pattomotto.github.io/grid-trading-simulation/`

### Manual Deployment

You can also trigger deployment manually from the Actions tab in GitHub.

## 📁 Project Structure

```
grid-trading-simulation/
├── components/           # React components
│   ├── BottomPanel.tsx  # Trade logs and data tables
│   ├── Charts.tsx       # Price and P&L charts
│   ├── ControlPanel.tsx # Simulation controls
│   └── StatsCard.tsx    # Statistics display
├── services/            # Business logic
│   ├── simulationEngine.ts  # Core simulation logic
│   └── pricingModels.ts     # Stochastic models
├── App.tsx              # Main application component
├── types.ts             # TypeScript type definitions
├── index.tsx            # Application entry point
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
└── package.json         # Project dependencies
```

## 🎮 Usage

1. **Configure Market Parameters**
   - Select a pricing model (GBM, OU, or JD)
   - Adjust volatility, drift, and model-specific parameters
   - Set the number of simulation steps

2. **Set Up Grid Strategy**
   - Define upper and lower price bounds
   - Choose number of grid levels
   - Set initial capital and amount per grid
   - Configure stop-loss and price limits
   - Select strategy direction and entry filters

3. **Run Simulation**
   - Click "Run Simulation" to execute
   - View real-time results in charts and statistics
   - Analyze trade logs and performance metrics

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://react.dev/)
- Charts powered by [Recharts](https://recharts.org/)
- Icons from [Lucide](https://lucide.dev/)
- Deployed on [GitHub Pages](https://pages.github.com/)

---

<div align="center">

**Made with ❤️ by [PattoMotto](https://github.com/PattoMotto)**

⭐ Star this repo if you find it helpful!

</div>
