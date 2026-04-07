import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

/**
 * Fetches historical stock data for the given symbol from the backend API.
 * The backend handles Alpha Vantage interaction, caching, and payload transformation.
 * 
 * @param {string} symbol - The stock ticker symbol (e.g., 'AAPL', 'IBM').
 * @returns {Promise<Object|Array>} A promise that resolves to the stock data payload.
 * @throws {Error} If the network request fails or validation errors occur.
 */
export const fetchStockData = async (symbol) => {
  const response = await api.get(`/stock/${symbol}`);
  return response.data;
};

/**
 * Searches for stock ticker suggestions using a dynamic query.
 * Implements an AbortController signal to prevent race conditions from rapid keystrokes.
 * 
 * @param {string} query - The search string or partial ticker (e.g., 'AAP').
 * @param {AbortSignal} signal - An AbortController signal to cancel stale requests.
 * @returns {Promise<Object>} A promise that resolves to search results.
 * @throws {Error} If the search fails or is deliberately aborted.
 */
export const searchTickers = async (query, signal) => {
  const response = await api.get(`/search/${query}`, { signal });
  return response.data;
};

export default api;
