import fs from 'fs';
import path from 'path';

export function validatePricingFile(): boolean {
  console.log('[Validator] Validating scrap pricing schema and integrity...');
  const targetPath = path.resolve(process.cwd(), 'src/data/pricing.json');

  if (!fs.existsSync(targetPath)) {
    console.error(`[Validator] ERROR: Pricing file missing at ${targetPath}`);
    return false;
  }

  try {
    const content = fs.readFileSync(targetPath, 'utf8');
    const records = JSON.parse(content);

    if (!Array.isArray(records) || records.length === 0) {
      console.error('[Validator] ERROR: Pricing records array is empty or invalid.');
      return false;
    }

    for (const item of records) {
      if (!item.material || typeof item.material !== 'string') {
        console.error('[Validator] Invalid material name:', item);
        return false;
      }
      if (typeof item.indicativePrice !== 'number' || item.indicativePrice <= 0) {
        console.error('[Validator] Invalid numeric price:', item);
        return false;
      }
      if (!['kg', 'piece', 'unit', 'set'].includes(item.unit)) {
        console.error('[Validator] Invalid unit:', item);
        return false;
      }
    }

    console.log(`[Validator] PASSED: All ${records.length} records verified successfully.`);
    return true;
  } catch (err) {
    console.error('[Validator] ERROR reading or parsing pricing file:', err);
    return false;
  }
}

if (process.argv[1]?.endsWith('validate-prices.ts') || process.argv[1]?.endsWith('validate-prices.js')) {
  validatePricingFile();
}
