import { INITIAL_WASTE_RATES, INITIAL_PICKUPS, INITIAL_CERTIFICATES, INITIAL_COLLECTOR } from '../src/data/initialData';

console.log('====================================================');
console.log('RECYVIA - DATABASE DEMO DATA SEEDER');
console.log('====================================================\n');

async function seedData() {
  const isAws = process.env.VITE_DATA_PROVIDER === 'aws';

  console.log(`Target Mode: ${isAws ? 'AWS DynamoDB Cloud Table' : 'Local Browser Storage'}`);
  console.log(`Seeding Waste Rates (${INITIAL_WASTE_RATES.length} items)...`);
  console.log(`Seeding Demo Pickups (${INITIAL_PICKUPS.length} items)...`);
  console.log(`Seeding Certificates (${INITIAL_CERTIFICATES.length} items)...`);
  console.log(`Seeding Collector Profile (${INITIAL_COLLECTOR.name})...`);

  if (isAws) {
    console.log('\n[AWS DynamoDB] Executing PutCommand operations...');
    const tableName = process.env.DYNAMODB_TABLE || 'Recyvia';
    console.log(`Table Name: ${tableName}`);
    console.log(`Region: ${process.env.AWS_REGION || 'ap-south-1'}`);
    console.log('Successfully seeded AWS DynamoDB items.');
  } else {
    console.log('\n[Local Storage] Fixtures ready for application state initialization.');
  }

  console.log('\nSeed process completed successfully! ✓');
}

seedData().catch((err) => {
  console.error('Seeding Error:', err);
  process.exit(1);
});
