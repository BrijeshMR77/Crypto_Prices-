import express from 'express';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// EJS as templating engine
app.set('view engine', 'ejs');

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// Fetch all cryptos
async function fetchAllCryptos() {
  try {
    const response = await axios.get('https://api.binance.com/api/v3/ticker/price');
    return response.data; // Fetch all available cryptos
  } catch (error) {
    console.error('Error fetching cryptos:', error.message);
    return [];
  }
}

// Home route to display all cryptos and search bar
app.get('/', async (req, res) => {
  const allCryptos = await fetchAllCryptos();
  res.render('index', { prices: allCryptos, error: null });
});

// Handle search request for a specific crypto
app.post('/search', async (req, res) => {
  const cryptoSymbol = req.body.symbol.toUpperCase();
  try {
    const response = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${cryptoSymbol}`);
    const price = response.data;
    res.render('index', { prices: [price], error: null });
  } catch (error) {
    console.error('Error fetching data from Binance API:', error.message);
    const allCryptos = await fetchAllCryptos();
    res.render('index', { prices: allCryptos, error: 'Cryptocurrency not found! Please try again.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
