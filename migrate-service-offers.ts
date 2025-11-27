import { db } from './db/index.js';
import { serviceOffers, serviceRequests, transactions } from './shared/schema.js';
import { eq } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

async function migrateServiceOffers() {
  try {
    // Get all paid service offers with their request info
    const paidOffers = await db
      .select({
        offerId: serviceOffers.id,
        serviceRequestId: serviceOffers.serviceRequestId,
        serviceName: serviceOffers.serviceName,
        price: serviceOffers.price,
        createdAt: serviceOffers.createdAt,
        requesterId: serviceRequests.requesterId,
        title: serviceRequests.title,
      })
      .from(serviceOffers)
      .innerJoin(serviceRequests, eq(serviceOffers.serviceRequestId, serviceRequests.id))
      .where(eq(serviceOffers.status, 'paid'));

    console.log(`Found ${paidOffers.length} paid offers to migrate`);

    for (const offer of paidOffers) {
      const totalAmount = parseFloat(offer.price as string);
      const platformCommission = totalAmount * 0.05;
      const vendorEarnings = totalAmount - platformCommission;

      // Check if transaction already exists
      const existing = await db
        .select()
        .from(transactions)
        .where(eq(transactions.stripePaymentIntentId, `service-offer-${offer.offerId}`));

      if (existing.length > 0) {
        console.log(`✓ Transaction already exists for offer ${offer.offerId}`);
        continue;
      }

      // Create transaction record with preserved creation date
      await db.insert(transactions).values({
        vendorId: offer.requesterId,
        customerId: null as any,
        totalAmount: totalAmount,
        platformCommission: platformCommission,
        vendorEarnings: vendorEarnings,
        paymentMethod: 'service_offer',
        status: 'completed',
        currency: 'hkd',
        stripePaymentIntentId: `service-offer-${offer.offerId}`,
        stripeChargeId: null,
        orderId: null,
        cashAmount: totalAmount,
        tdAmount: 0,
        createdAt: offer.createdAt || new Date(),
      });

      console.log(`✓ Created transaction for offer ${offer.offerId} (HK$${totalAmount})`);
    }

    console.log('✅ Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateServiceOffers();
