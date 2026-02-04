const { getFirestore } = require('../config/firebase.config');
const logger = require('../utils/logger');
const { serializeDocs, serializeDoc } = require('../utils/serializer');

class VehicleReportService {
    constructor() {
        this.db = getFirestore();
    }

    /**
     * Calculate multiplier for a given layer index based on packaging structure
     */
    calculateMultiplier(structure, layerIndex) {
        if (!structure) return 1;
        if (Array.isArray(structure)) {
            if (layerIndex >= structure.length) return 1;
            let multiplier = 1;
            for (let i = layerIndex + 1; i < structure.length; i++) {
                multiplier *= (structure[i].qty || 1);
            }
            return multiplier;
        }
        let multiplier = 1;
        if (layerIndex === 0) {
            multiplier = (structure.cartonSize || 1) * (structure.packetSize || 1);
        } else if (layerIndex === 1) {
            multiplier = structure.packetSize || 1;
        }
        return multiplier;
    }

    /**
     * Calculate total stock in hand for a vehicle inventory item using layers
     */
    async calculateStockInHand(item) {
        if (item.stock !== undefined && item.stock !== null) return item.stock; // Legacy or simple stock support

        // If layers exist, calculate from layers
        if (item.layers && item.layers.length > 0) {
            // Need packaging structure to calculate totals
            // Retrieve from inventory collection
            try {
                const invDoc = await this.db.collection('inventory').doc(item.inventoryId).get();
                if (!invDoc.exists) return 0;

                const structure = invDoc.data().packagingStructure;
                let totalStock = 0;

                for (const layer of item.layers) {
                    const multiplier = this.calculateMultiplier(structure, layer.layerIndex);
                    totalStock += (layer.quantity || 0) * multiplier;
                }
                return totalStock;
            } catch (err) {
                console.error('Error calculating stock from layers:', err);
                return 0;
            }
        }
        return 0;
    }

    /**
     * Get Vehicle Inventory Report
     * @param {Object} filters
     * @returns {Promise<Object>}
     */
    async getVehicleInventoryReport(filters = {}) {
        try {
            const { vehicleId, startDate, endDate } = filters;
            console.log('Generating Vehicle Inventory Report with filters:', filters);

            // 1. Fetch Vehicles
            let vehiclesQuery = this.db.collection('vehicles').where('isActive', '==', true);
            if (vehicleId) {
                vehiclesQuery = vehiclesQuery.where('__name__', '==', vehicleId);
            }

            const vehiclesSnapshot = await vehiclesQuery.get();
            const vehicles = serializeDocs(vehiclesSnapshot);

            // 2. Process each vehicle
            const reportRows = [];

            for (const vehicle of vehicles) {
                // Get Vehicle Inventory
                const inventorySnapshot = await this.db.collection('vehicle_inventory')
                    .where('vehicleId', '==', vehicle.id)
                    .get();

                const vehicleInventory = serializeDocs(inventorySnapshot);

                if (vehicleInventory.length === 0) {
                    continue; // Skip vehicles with no inventory
                }

                // Process each inventory item
                for (const item of vehicleInventory) {
                    // Calculate TRUE remaining stock from layers
                    const quantityRemaining = await this.calculateStockInHand(item);

                    // Determine Vehicle Status (based on valid stock)
                    let vehicleStatus = 'At Warehouse';
                    if (vehicle.assignedUserId && quantityRemaining > 0) {
                        vehicleStatus = 'On Route';
                    }

                    // Find last transfer for this item to this vehicle
                    // Note: 'type' field might not exist on transfers, so we rely on structure.
                    // We check for statuses that imply the item is on the vehicle.
                    let transferQuery = this.db.collection('stock_transfers')
                        .where('vehicleId', '==', vehicle.id)
                        .where('status', 'in', ['approved', 'collected', 'partially_collected', 'completed']) // Include all valid active statuses
                        .orderBy('createdAt', 'desc');

                    const allTransfersSnapshot = await transferQuery.get();

                    // Filter in memory for the specific inventory item since Firestore array-contains is limited for objects
                    let lastTransfer = null;
                    // We need to find the most recent transfer that contained this item
                    for (const doc of allTransfersSnapshot.docs) {
                        const tData = doc.data();
                        const hasItem = tData.items && tData.items.some(i => i.inventoryId === item.inventoryId);
                        if (hasItem) {
                            lastTransfer = serializeDoc(doc);
                            break;
                        }
                    }

                    let quantityLoaded = quantityRemaining; // Default to current stock if no sales history
                    let loadedDate = new Date(0); // Default to beginning of time if no transfer found (capture all sales)
                    let unitCost = 0;
                    let sellingPrice = item.sellingPrice || 0;

                    if (lastTransfer) {
                        loadedDate = new Date(lastTransfer.createdAt);
                        // We rely on Reverse Calculation below
                    }

                    // Calculate Sold: Sum of sales since loadedDate
                    let quantitySold = 0;
                    let valueSold = 0;
                    const salesSnapshot = await this.db.collection('sales')
                        .where('vehicleId', '==', vehicle.id)
                        .where('status', '==', 'completed')
                        .where('saleDate', '>=', loadedDate)
                        .get();

                    salesSnapshot.forEach(doc => {
                        const sale = doc.data();
                        const saleItem = sale.items.find(i => i.inventoryId === item.inventoryId);
                        if (saleItem) {
                            quantitySold += saleItem.quantity;
                            // Accumulate actual value sold (from POS input)
                            // saleItem should have 'subTotal' (qty * price) or we calculate it
                            const itemTotal = saleItem.subTotal || (saleItem.quantity * saleItem.unitPrice) || 0;
                            valueSold += itemTotal;
                        }
                    });

                    // Recalculate Loaded: Loaded = Remaining + Sold
                    quantityLoaded = quantityRemaining + quantitySold;

                    // Fetch Unit Cost, Selling Price, and Minimum Price if needed (from main inventory)
                    let minimumPrice = 0;
                    if (unitCost === 0 || minimumPrice === 0 || sellingPrice === 0) {
                        const mainInvDoc = await this.db.collection('inventory').doc(item.inventoryId).get();
                        if (mainInvDoc.exists) {
                            const data = mainInvDoc.data();
                            unitCost = unitCost || data.buyingPrice || 0;
                            minimumPrice = data.minimumPrice || 0;
                            sellingPrice = sellingPrice || data.sellingPrice || 0;
                        }
                    }

                    const row = {
                        vehicleId: vehicle.id,
                        vehicleName: vehicle.vehicleName,
                        registrationNumber: vehicle.vehicleNumber, // Note: Schema calls it vehicleNumber
                        vehicleStatus,
                        stockLoadedDate: loadedDate,
                        itemName: item.productName,
                        itemCategory: item.category || 'General',
                        quantityLoaded,
                        quantitySold,
                        quantityRemaining,
                        unitCost,
                        unitSellingPrice: sellingPrice,
                        minimumPrice,
                        totalValueLoaded: quantityLoaded * unitCost, // Loaded usually valued at Cost
                        // Update: Remaining Stock valued at Minimum Selling Price (as requested)
                        totalValueRemaining: quantityRemaining * minimumPrice,
                        // Update: Sold Stock valued at Actual Sales Amount
                        totalValueSold: valueSold,
                        salesRepresentative: vehicle.assignedUserName || 'Unassigned'
                    };

                    reportRows.push(row);
                }
            }

            // 3. Sorting (Default by Vehicle Name then Item Name)
            reportRows.sort((a, b) => {
                if (a.vehicleName !== b.vehicleName) return a.vehicleName.localeCompare(b.vehicleName);
                return a.itemName.localeCompare(b.itemName);
            });

            // 4. Summary Metrics
            // These should be filtered if the UI has filters, but here we return summary of the returned rows
            const summary = {
                totalVehiclesTracked: new Set(reportRows.map(r => r.vehicleId)).size,
                totalValueLoadedStock: reportRows.reduce((sum, r) => sum + r.totalValueLoaded, 0),
                totalValueSold: reportRows.reduce((sum, r) => sum + r.totalValueSold, 0),
                totalValueRemaining: reportRows.reduce((sum, r) => sum + r.totalValueRemaining, 0)
            };

            return {
                data: reportRows,
                summary
            };

        } catch (error) {
            logger.error('Get vehicle inventory report error:', error);
            throw error;
        }
    }
}

module.exports = new VehicleReportService();
