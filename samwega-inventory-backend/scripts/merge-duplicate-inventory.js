/**
 * One-time script to merge duplicate inventory items.
 * Duplicates are items with the same productNameLower and warehouseId.
 * The script keeps the first found item, merges stock into it, and deletes the rest.
 *
 * Run with: node scripts/merge-duplicate-inventory.js
 */

const { getFirestore, initializeFirebase, admin } = require('../src/config/firebase.config');

initializeFirebase();
const db = getFirestore();

async function mergeDuplicates() {
    console.log('🔍 Fetching all inventory items...');
    const snapshot = await db.collection('inventory').get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`📦 Total items found: ${items.length}`);

    // Group by productNameLower + warehouseId (or 'no-warehouse' if missing)
    const groups = {};
    for (const item of items) {
        const key = `${(item.productNameLower || '').trim()}||${item.warehouseId || 'no-warehouse'}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
    }

    const duplicateGroups = Object.entries(groups).filter(([, grp]) => grp.length > 1);
    console.log(`🔁 Found ${duplicateGroups.length} duplicate groups to merge.\n`);

    if (duplicateGroups.length === 0) {
        console.log('✅ No duplicates found. Nothing to do.');
        process.exit(0);
    }

    let totalMerged = 0;
    let totalDeleted = 0;

    for (const [key, group] of duplicateGroups) {
        // Sort by createdAt ascending — keep the oldest as primary
        group.sort((a, b) => {
            const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            return aTime - bTime;
        });

        const primary = group[0];
        const duplicates = group.slice(1);

        // Sum up all stock
        const totalStock = group.reduce((sum, item) => sum + (item.stock || 0), 0);

        console.log(`📝 "${primary.productName}" (warehouse: ${primary.warehouseName || 'none'})`);
        console.log(`   Primary ID: ${primary.id}`);
        console.log(`   Merging ${duplicates.length} duplicate(s). Combined stock: ${totalStock}`);

        // Update primary item with merged stock
        await db.collection('inventory').doc(primary.id).update({
            stock: totalStock,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Delete duplicate items
        const batch = db.batch();
        for (const dup of duplicates) {
            console.log(`   🗑 Deleting duplicate: ${dup.id} (stock was ${dup.stock || 0})`);
            batch.delete(db.collection('inventory').doc(dup.id));
            totalDeleted++;
        }
        await batch.commit();
        totalMerged++;
        console.log();
    }

    console.log(`\n✅ Done! Merged ${totalMerged} groups, deleted ${totalDeleted} duplicate items.`);
    process.exit(0);
}

mergeDuplicates().catch(err => {
    console.error('❌ Error during merge:', err);
    process.exit(1);
});
