import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static assets from dist
const distPath = __dirname.endsWith('dist') ? __dirname : path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req: any, res: any) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
