import dotenv from 'dotenv';
dotenv.config({ override: true });

import app from './app';

const PORT = process.env.PORT ?? 5000;

app.listen(PORT, () => {
  console.log(`BloodBridge API running on port ${PORT}`);
});
