import express, { Application } from 'express';
import cors from 'cors';
import routes from '../src/routes';

const app: Application = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

app.get('/test3', (_req, res) => {
  res.send('Hello 3 World!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

module.exports = app;