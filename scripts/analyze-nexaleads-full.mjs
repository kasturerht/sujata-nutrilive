import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccountPath = 'C:\\Users\\Admin\\Downloads\\nexaleads-98a12-firebase-adminsdk-fbsvc-2d9799d686.json';
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

const app = initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore(app);
const orgId = 'ORG_SUJATA_NUTRILIVE_8117';
const orgRef = db.collection('organizations').doc(orgId);

async function analyze() {
  console.log(`Starting deep analysis for organization: ${orgId}`);

  // 1. Fetch Users
  const usersSnap = await orgRef.collection('users').get();
  const usersMap = {};
  usersSnap.forEach(doc => {
    usersMap[doc.id] = { id: doc.id, ...doc.data() };
  });
  console.log(`Loaded ${Object.keys(usersMap).length} users.`);

  // 2. Fetch Orders
  const ordersSnap = await orgRef.collection('orders_data').get();
  const orders = [];
  ordersSnap.forEach(doc => {
    orders.push({ id: doc.id, ...doc.data() });
  });
  console.log(`Loaded ${orders.length} orders in orders_data.`);

  // 3. Fetch Leads
  const leadsSnap = await orgRef.collection('leads').get();
  const leads = [];
  leadsSnap.forEach(doc => {
    leads.push({ id: doc.id, ...doc.data() });
  });
  console.log(`Loaded ${leads.length} leads in leads.`);

  // 4. Fetch Interactions
  const interactionsSnap = await orgRef.collection('interactions').get();
  const interactions = [];
  interactionsSnap.forEach(doc => {
    interactions.push({ id: doc.id, ...doc.data() });
  });
  console.log(`Loaded ${interactions.length} interactions.`);

  // Map interactions by leadId
  const interactionsByLead = new Map();
  const interactionsByCaller = new Map();
  interactions.forEach(item => {
    if (item.leadId) {
      if (!interactionsByLead.has(item.leadId)) {
        interactionsByLead.set(item.leadId, []);
      }
      interactionsByLead.get(item.leadId).push(item);
    }
    const cId = item.callerId || 'unknown';
    interactionsByCaller.set(cId, (interactionsByCaller.get(cId) || 0) + 1);
  });

  // Map orders by lead/customer Id
  const ordersByCustomer = new Map();
  const ordersByCaller = new Map();
  orders.forEach(o => {
    if (o.customerId) {
      ordersByCustomer.set(o.customerId, o);
    }
    const cId = o.assignedTo || 'unknown';
    ordersByCaller.set(cId, (ordersByCaller.get(cId) || 0) + 1);
  });

  // Unique Telecallers from users & leads
  const telecallerStats = {};

  // Initialize with known users
  Object.values(usersMap).forEach(u => {
    telecallerStats[u.id] = {
      id: u.id,
      name: u.name || 'Unnamed',
      role: u.role || 'telecaller',
      email: u.email || '',
      phone: u.contactNumber || '',
      isActive: u.isActive !== false,
      totalLeadsAssigned: 0,
      leadsWithInteraction: 0,
      leadsDataFedInApp: 0, // Had notes, subStatus, product, address or status != New
      statusBreakdown: {},
      subStatusBreakdown: {},
      convertedOrders: 0,
      orderValueTotal: 0,
      missedOrUntouchedLeads: 0,
      sourcesBreakdown: {}
    };
  });

  // Process all leads
  let unassignedCount = 0;
  const leadStatusesOverall = {};

  leads.forEach(l => {
    const callerId = l.assignedTo || 'unassigned';
    if (!telecallerStats[callerId]) {
      telecallerStats[callerId] = {
        id: callerId,
        name: l.assignedToName || (callerId === 'unassigned' ? 'Unassigned / Orphan' : `Unknown (${callerId})`),
        role: 'telecaller',
        email: '',
        phone: '',
        isActive: true,
        totalLeadsAssigned: 0,
        leadsWithInteraction: 0,
        leadsDataFedInApp: 0,
        statusBreakdown: {},
        subStatusBreakdown: {},
        convertedOrders: 0,
        orderValueTotal: 0,
        missedOrUntouchedLeads: 0,
        sourcesBreakdown: {}
      };
    }

    const t = telecallerStats[callerId];
    t.totalLeadsAssigned++;

    const status = (l.status || 'Unknown').trim();
    leadStatusesOverall[status] = (leadStatusesOverall[status] || 0) + 1;
    t.statusBreakdown[status] = (t.statusBreakdown[status] || 0) + 1;

    if (l.subStatus) {
      t.subStatusBreakdown[l.subStatus] = (t.subStatusBreakdown[l.subStatus] || 0) + 1;
    }

    if (l.source) {
      t.sourcesBreakdown[l.source] = (t.sourcesBreakdown[l.source] || 0) + 1;
    }

    const hasInteractions = interactionsByLead.has(l.id);
    if (hasInteractions) {
      t.leadsWithInteraction++;
    }

    // Check if data was fed into app:
    // Either interaction exists, or status changed from "New", or notes/address/product added
    const isDataFed = (
      (status !== 'New' && status !== 'Unknown') ||
      hasInteractions ||
      (l.notes && l.notes.trim() !== '') ||
      (l.subStatus && l.subStatus.trim() !== '') ||
      (l.product && l.product.trim() !== '') ||
      (l.address && l.address.trim() !== '') ||
      (l.events && l.events.length > 0)
    );

    if (isDataFed) {
      t.leadsDataFedInApp++;
    } else {
      t.missedOrUntouchedLeads++;
    }

    // Check Conversion
    const isOrderPlaced = (
      status === 'Order Placed' ||
      status === 'Dispatched' ||
      status === 'Delivered' ||
      l.convertedAt != null ||
      ordersByCustomer.has(l.id)
    );

    if (isOrderPlaced) {
      t.convertedOrders++;
      const val = Number(l.orderAmountNum || l.orderAmount || 0);
      t.orderValueTotal += isNaN(val) ? 0 : val;
    }
  });

  // Calculate ratios
  Object.values(telecallerStats).forEach(t => {
    t.dataFedPercentage = t.totalLeadsAssigned > 0 
      ? ((t.leadsDataFedInApp / t.totalLeadsAssigned) * 100).toFixed(1) + '%' 
      : '0%';
    t.conversionRate = t.totalLeadsAssigned > 0 
      ? ((t.convertedOrders / t.totalLeadsAssigned) * 100).toFixed(1) + '%' 
      : '0%';
    t.conversionFromDataFed = t.leadsDataFedInApp > 0
      ? ((t.convertedOrders / t.leadsDataFedInApp) * 100).toFixed(1) + '%'
      : '0%';
    t.missedPercentage = t.totalLeadsAssigned > 0
      ? ((t.missedOrUntouchedLeads / t.totalLeadsAssigned) * 100).toFixed(1) + '%'
      : '0%';
  });

  // Write out full report JSON
  fs.writeFileSync('scripts/nexaleads_analysis_report.json', JSON.stringify({
    summary: {
      totalLeads: leads.length,
      totalOrdersInData: orders.length,
      totalInteractions: interactions.length,
      leadStatusesOverall
    },
    telecallerStats
  }, null, 2));

  console.log('\n================ TELECALLER AUDIT TABLE ================');
  console.table(Object.values(telecallerStats).map(t => ({
    'Caller Name': t.name,
    'Role': t.role,
    'Active?': t.isActive,
    'Total Leads': t.totalLeadsAssigned,
    'Data Fed': t.leadsDataFedInApp,
    'Data Fed %': t.dataFedPercentage,
    'Missed/Untouched': t.missedOrUntouchedLeads,
    'Missed %': t.missedPercentage,
    'Converted': t.convertedOrders,
    'Conv Ratio %': t.conversionRate,
    'Revenue (₹)': t.orderValueTotal
  })));
}

analyze().then(() => process.exit(0)).catch(console.error);
