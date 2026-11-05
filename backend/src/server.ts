import { app } from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || 5001;

app.listen(port, () => {
  console.log(`[server] State Population Browser backend listening on port ${port}`);
});
