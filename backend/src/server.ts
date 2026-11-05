import { app } from './app.js';
import dotenv from 'dotenv';

dotenv.config();

const port = process.env.PORT || (process.env.NODE_ENV === 'production' ? 3000 : 5001);

app.listen(port, () => {
  console.log(`[server] State Population Browser listening on port ${port}`);
});
