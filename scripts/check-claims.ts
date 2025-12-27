import dotenv from 'dotenv';
import { getFirebaseApp } from '../src/shared/firebase';

dotenv.config();

const email = process.argv[2];

if (!email) {
  console.error('Usage: pnpm --filter @lumen/api tsx scripts/check-claims.ts user@example.com');
  process.exit(1);
}

async function run() {
  const app = getFirebaseApp();
  const auth = app.auth();
  const user = await auth.getUserByEmail(email);

  console.log('User:', {
    uid: user.uid,
    email: user.email,
    customClaims: user.customClaims ?? null
  });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
