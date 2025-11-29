/**
 * Box-Muller transform to generate Standard Normal Distribution (Gaussian) random numbers.
 * Mean = 0, StdDev = 1
 */
export const boxMullerRandom = (): number => {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
};

/**
 * Generates a Geometric Brownian Motion price path.
 * P_t = P_{t-1} * e^((mu - 0.5 * sigma^2) * dt + sigma * epsilon * sqrt(dt))
 * Simplified for discrete steps: P_new = P_old * (1 + drift + volatility * Z)
 */
export const generateGBMPath = (
  startPrice: number,
  steps: number,
  drift: number,
  volatility: number
): number[] => {
  const prices: number[] = [startPrice];
  let currentPrice = startPrice;

  // Adjust drift to be "per step" roughly
  // const dt = 1 / steps; 

  for (let i = 1; i <= steps; i++) {
    // Random shock
    const shock = boxMullerRandom();
    
    // Simple approximation for visual simulation
    // Drift is effectively "trend per step", Volatility is "noise per step"
    const change = currentPrice * (drift + volatility * shock);
    
    currentPrice = currentPrice + change;
    
    if (currentPrice < 0.01) currentPrice = 0.01; // Prevent negative prices
    prices.push(currentPrice);
  }

  return prices;
};

/**
 * Generates a path based on Geometric Ornstein-Uhlenbeck process (Mean Reversion).
 * Works on Log Price to ensure non-negativity.
 * d(ln P) = speed * (ln(Mean) - ln(P)) * dt + vol * dW
 */
export const generateOUPath = (
  startPrice: number,
  steps: number,
  volatility: number,
  speed: number,
  longTermMean: number
): number[] => {
  const prices: number[] = [startPrice];
  let currentPrice = startPrice;
  const logMean = Math.log(longTermMean);

  for (let i = 1; i <= steps; i++) {
    const shock = boxMullerRandom();
    const currentLogPrice = Math.log(currentPrice);
    
    // Discretized Mean Reversion for Log Price
    // speed acts as theta * dt
    const nextLogPrice = currentLogPrice + speed * (logMean - currentLogPrice) + volatility * shock;
    
    currentPrice = Math.exp(nextLogPrice);
    prices.push(currentPrice);
  }
  return prices;
};

/**
 * Generates a Merton Jump Diffusion path.
 * GBM + Poisson Jumps
 */
export const generateJDPath = (
  startPrice: number,
  steps: number,
  drift: number,
  volatility: number,
  jumpIntensity: number,
  jumpMean: number,
  jumpStd: number
): number[] => {
  const prices: number[] = [startPrice];
  let currentPrice = startPrice;

  for (let i = 1; i <= steps; i++) {
    const shock = boxMullerRandom();
    
    // Base GBM component
    let return_t = drift + volatility * shock;
    
    // Jump component
    if (Math.random() < jumpIntensity) {
      // Jump occurs
      const jumpSize = boxMullerRandom() * jumpStd + jumpMean;
      return_t += jumpSize;
    }
    
    const change = currentPrice * return_t;
    currentPrice += change;
    
    if (currentPrice < 0.01) currentPrice = 0.01;
    prices.push(currentPrice);
  }
  return prices;
};

/**
 * Calculates grid levels based on parameters
 */
export const calculateGridLevels = (
  lower: number,
  upper: number,
  count: number,
  type: 'Arithmetic' | 'Geometric'
): number[] => {
  const levels: number[] = [];
  
  if (type === 'Arithmetic') {
    const range = upper - lower;
    const step = range / count;
    for (let i = 0; i <= count; i++) {
      levels.push(lower + i * step);
    }
  } else {
    // Geometric: P_i = Lower * r^i
    // r = (Upper/Lower)^(1/count)
    const r = Math.pow(upper / lower, 1 / count);
    for (let i = 0; i <= count; i++) {
      levels.push(lower * Math.pow(r, i));
    }
  }
  return levels;
};