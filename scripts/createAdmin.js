const bcrypt = require('bcryptjs');

async function main() {
  const password = process.argv[2];

  if (!password) {
    console.error('Usage: node scripts/createAdmin.js <plain-text-password>');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);

  console.log('Add these values to your .env file:');
  console.log('CMS_ADMIN_USERNAME=admin');
  console.log(`CMS_ADMIN_PASSWORD_HASH=${hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
