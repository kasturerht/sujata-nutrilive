import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccountPath = 'C:\\Users\\Admin\\Downloads\\nexaleads-98a12-firebase-adminsdk-fbsvc-2d9799d686.json';
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);
const orgRef = db.collection('organizations').doc('ORG_SUJATA_NUTRILIVE_8117');

async function checkDetails() {
  const usersSnap = await orgRef.collection('users').get();
  const users = {};
  usersSnap.forEach(d => {
    users[d.id] = { id: d.id, ...d.data() };
  });

  const leadsSnap = await orgRef.collection('leads').get();
  const interactionsSnap = await orgRef.collection('interactions').get();

  const interactionsByLead = new Map();
  interactionsSnap.forEach(d => {
    const data = d.data();
    if (data.leadId) {
      if (!interactionsByLead.has(data.leadId)) {
        interactionsByLead.set(data.leadId, []);
      }
      interactionsByLead.get(data.leadId).push(data);
    }
  });

  // Group by Telecaller Unified Name
  const callers = {};

  leadsSnap.forEach(doc => {
    const l = doc.data();
    // Resolve clean name
    let callerName = l.assignedToName;
    if (!callerName && l.assignedTo && users[l.assignedTo]) {
      callerName = users[l.assignedTo].name;
    }
    if (!callerName) callerName = 'Unassigned';
    callerName = callerName.trim();

    if (!callers[callerName]) {
      callers[callerName] = {
        name: callerName,
        userIds: new Set(),
        totalLeads: 0,
        leadsWithZeroInteractions: 0,
        leadsWithInteractions: 0,
        leadsStatusNew: 0,
        leadsCallNotAnswered: 0,
        leadsProductEnquiry: 0,
        leadsFollowup: 0,
        leadsNotInterested: 0,
        leadsOrderPlaced: 0,
        leadsNoNotes: 0,
        ordersMissingAddress: 0,
        leadsConverted: 0,
        totalRevenue: 0,
        dateMin: null,
        dateMax: null
      };
    }

    const c = callers[callerName];
    if (l.assignedTo) c.userIds.add(l.assignedTo);
    c.totalLeads++;

    const interactions = interactionsByLead.get(doc.id) || [];
    if (interactions.length === 0) {
      c.leadsWithZeroInteractions++;
    } else {
      c.leadsWithInteractions++;
    }

    const st = (l.status || '').trim();
    if (st === 'New') c.leadsStatusNew++;
    else if (st === 'Call Not Answered') c.leadsCallNotAnswered++;
    else if (st === 'Product Enquiry' || st === 'Product Inquiry Only') c.leadsProductEnquiry++;
    else if (st === 'Follow-up') c.leadsFollowup++;
    else if (st === 'Not Interested') c.leadsNotInterested++;
    else if (st === 'Order Placed' || st === 'Dispatched' || st === 'Delivered') {
      c.leadsOrderPlaced++;
      c.leadsConverted++;
      const val = Number(l.orderAmountNum || l.orderAmount || 0);
      c.totalRevenue += isNaN(val) ? 0 : val;
      if (!l.address || l.address.trim() === '') {
        c.ordersMissingAddress++;
      }
    }

    if (!l.notes || l.notes.trim() === '') {
      c.leadsNoNotes++;
    }

    // Check dates if any
    let leadDate = null;
    if (l.createdAt) {
      leadDate = new Date(l.createdAt._seconds ? l.createdAt._seconds * 1000 : l.createdAt);
    } else if (interactions.length > 0 && interactions[0].timestamp) {
      leadDate = new Date(interactions[0].timestamp);
    }
    if (leadDate && !isNaN(leadDate.getTime())) {
      if (!c.dateMin || leadDate < c.dateMin) c.dateMin = leadDate;
      if (!c.dateMax || leadDate > c.dateMax) c.dateMax = leadDate;
    }
  });

  console.log('\n=== UNIFIED TELECALLER REPORT ===');
  const summaryTable = Object.values(callers).map(c => ({
    'Telecaller': c.name,
    'Total Leads': c.totalLeads,
    'Has Calls/Logs': c.leadsWithInteractions,
    'Zero Logs (Missed)': c.leadsWithZeroInteractions,
    'Status Still New': c.leadsStatusNew,
    'No Notes': c.leadsNoNotes,
    'Not Answered': c.leadsCallNotAnswered,
    'Enquiry/Followup': c.leadsProductEnquiry + c.leadsFollowup,
    'Not Interested': c.leadsNotInterested,
    'Converted Orders': c.leadsConverted,
    'Conv Ratio %': ((c.leadsConverted / c.totalLeads) * 100).toFixed(1) + '%',
    'Orders Missing Addr': c.ordersMissingAddress,
    'Total Sales (₹)': c.totalRevenue
  }));

  console.table(summaryTable);

  fs.writeFileSync('scripts/unified_telecaller_summary.json', JSON.stringify(summaryTable, null, 2));
}

checkDetails().then(() => process.exit(0)).catch(console.error);
