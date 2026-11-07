// Creates (or promotes) a SuperAdmin account.
// Usage (from the server folder):
//   npm run create-admin -- "Admin Name" admin@example.com StrongPassword123
require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('../src/config/db');

(async () => {
  const [name, email, password] = process.argv.slice(2);
  if (!name || !email || !password) {
    console.error('Usage: npm run create-admin -- "Admin Name" admin@example.com StrongPassword123');
    process.exit(1);
  }
  if (password.length < 6) {
    console.error('Password must be at least 6 characters');
    process.exit(1);
  }

  const normalized = email.trim().toLowerCase();
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email: normalized },
    update: { role: 'SUPER_ADMIN', password: hashed, isBlocked: false },
    create: { name, email: normalized, password: hashed, role: 'SUPER_ADMIN' },
  });
  console.log(`SuperAdmin ready: ${user.email}`);
  await prisma.$disconnect();
})().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
