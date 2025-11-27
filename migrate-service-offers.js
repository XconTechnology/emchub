const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrateServiceOffers() {
  try {
    // Get all paid service offers
    const offersResult = await pool.query(
      `SELECT so.id, so.service_request_id, so.service_name, so.price, so.created_at, 
              sr.requester_id, sr.title
       FROM service_offers so
       JOIN service_requests sr ON so.service_request_id = sr.id
       WHERE so.status = 'paid'`
    );

    console.log(`Found ${offersResult.rows.length} paid offers to migrate`);

    for (const offer of offersResult.rows) {
      const totalAmount = parseFloat(offer.price);
      const platformCommission = totalAmount * 0.05;
      const vendorEarnings = totalAmount - platformCommission;

      // Check if transaction already exists
      const existingTx = await pool.query(
        `SELECT id FROM transactions 
         WHERE stripe_payment_intent_id = $1`,
        [`service-offer-${offer.id}`]
      );

      if (existingTx.rows.length > 0) {
        console.log(`✓ Transaction already exists for offer ${offer.id}`);
        continue;
      }

      // Create transaction record
      const txResult = await pool.query(
        `INSERT INTO transactions (
          vendor_id, customer_id, total_amount, platform_commission, vendor_earnings,
          payment_method, status, currency, stripe_payment_intent_id, order_id, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NULL, $10)
        RETURNING id`,
        [
          offer.requester_id,          // vendor_id
          null,                         // customer_id (was system)
          totalAmount,                  // total_amount
          platformCommission,           // platform_commission
          vendorEarnings,              // vendor_earnings
          'service_offer',             // payment_method
          'completed',                 // status
          'hkd',                       // currency
          `service-offer-${offer.id}`, // stripe_payment_intent_id
          offer.created_at             // created_at (preserve original date)
        ]
      );

      console.log(`✓ Created transaction ${txResult.rows[0].id} for offer ${offer.id} (HK$${totalAmount})`);
    }

    console.log('✅ Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateServiceOffers();
