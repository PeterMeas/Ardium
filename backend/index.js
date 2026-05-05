
const { PORT } = require('./env');
const stockRoutes = require('./routes/stockRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use('/api', stockRoutes);
app.use(errorHandler);
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));

