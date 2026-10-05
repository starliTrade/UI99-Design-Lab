import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static assets from design-lab folder
app.use(express.static(path.join(__dirname, 'design-lab')));
// Also serve static files from root
app.use(express.static(__dirname));

// Route index to design-lab/index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'design-lab', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`UI99 Design Lab listening on port ${PORT} (0.0.0.0)`);
});
