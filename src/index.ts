import express from 'express';

const app = express();
const PORT = 5000;

app.use(express.json());

// We can just grab Request and Response directly from the express namespace
app.get('/', (req: express.Request, res: express.Response) => {
  res.json({ message: 'TypeScript backend is up and running!' });
});

app.listen(PORT, () => {
  console.log(`Server is executing smoothly on http://localhost:${PORT}`);
});