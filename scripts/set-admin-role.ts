import dotenv from 'dotenv';
import { getFirebaseApp } from '../src/shared/firebase';

dotenv.config();

const email = process.argv[2] ?? 'jose.easilva00@gmail.com';

async function run() {
  if (!email) {
    console.error('Provide an email: pnpm --filter @lumen/api tsx scripts/set-admin-role.ts user@example.com');
    process.exit(1);
  }

  const app = getFirebaseApp();
  const auth = app.auth();

  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, { roles: ['ADMIN', 'CREATOR', 'SUDO'] });

  console.log(`Roles set for ${email}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
