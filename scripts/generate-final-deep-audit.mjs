import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

const serviceAccountPath = 'C:\\Users\\Admin\\Downloads\\nexaleads-98a12-firebase-adminsdk-fbsvc-2d9799d686.json';
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);
const orgRef = db.collection('organizations').doc('ORG_SUJATA_NUTRILIVE_8117');

async function comprehensiveAudit() {
  const usersSnap = await orgRef.collection('users').get();
  const users = {};
  usersSnap.forEach(d => {
    users[d.id] = { id: d.id, ...d.data() };
  });

  const leadsSnap = await orgRef.collection('leads').get();
  const interactionsSnap = await orgRef.collection('interactions').get();
  const ordersSnap = await orgRef.collection('orders_data').get();

  // Map interactions by leadId
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

  const telecallerProfiles = {};

  function getProfile(name) {
    if (!telecallerProfiles[name]) {
      telecallerProfiles[name] = {
        name,
        totalLeads: 0,
        // Status counts
        statusCounts: {},
        // Data feeding metrics
        leadsWithInteractions: 0,
        totalInteractionsLogged: 0,
        leadsWithDetailedNotes: 0,
        leadsWithoutNotes: 0,
        leadsWithSubStatus: 0,
        leadsWithFollowupDate: 0,
        // Missed / Leakage metrics
        leadsUntouchedNew: 0,
        leadsAbandonedNotAnswered: 0, // Not answered and only 1 or 0 attempts
        leadsNotAnsweredMultipleAttempts: 0,
        // Conversion & Revenue
        ordersConfirmed: 0,
        totalRevenue: 0,
        ordersWithFullAddress: 0,
        ordersMissingAddress: 0,
        // Timelines
        firstActivity: null,
        lastActivity: null
      };
    }
    return telecallerProfiles[name];
  }

  leadsSnap.forEach(doc => {
    const l = doc.data();
    let callerName = l.assignedToName;
    if (!callerName && l.assignedTo && users[l.assignedTo]) {
      callerName = users[l.assignedTo].name;
    }
    if (!callerName) callerName = 'Unassigned';
    callerName = callerName.trim();

    const p = getProfile(callerName);
    p.totalLeads++;

    const status = (l.status || 'New').trim();
    p.statusCounts[status] = (p.statusCounts[status] || 0) + 1;

    const leadInteractions = interactionsByLead.get(doc.id) || [];
    p.totalInteractionsLogged += leadInteractions.length;

    if (leadInteractions.length > 0) {
      p.leadsWithInteractions++;
    }

    if (l.notes && l.notes.trim() !== '') {
      p.leadsWithDetailedNotes++;
    } else {
      p.leadsWithoutNotes++;
    }

    if (l.subStatus && l.subStatus.trim() !== '') {
      p.leadsWithSubStatus++;
    }

    if (l.followUpDate) {
      p.leadsWithFollowupDate++;
    }

    if (status === 'New') {
      p.leadsUntouchedNew++;
    }

    if (status === 'Call Not Answered') {
      if (leadInteractions.length <= 1) {
        p.leadsAbandonedNotAnswered++;
      } else {
        p.leadsNotAnsweredMultipleAttempts++;
      }
    }

    const isConverted = (
      status === 'Order Placed' ||
      status === 'Dispatched' ||
      status === 'Delivered' ||
      l.convertedAt != null
    );

    if (isConverted) {
      p.ordersConfirmed++;
      const val = Number(l.orderAmountNum || l.orderAmount || 0);
      p.totalRevenue += isNaN(val) ? 0 : val;

      if (l.address && l.address.trim().length > 5) {
        p.ordersWithFullAddress++;
      } else {
        p.ordersMissingAddress++;
      }
    }
  });

  const finalReport = Object.values(telecallerProfiles).map(p => {
    const convRate = p.totalLeads > 0 ? ((p.ordersConfirmed / p.totalLeads) * 100).toFixed(1) + '%' : '0%';
    const noteFeedRate = p.totalLeads > 0 ? ((p.leadsWithDetailedNotes / p.totalLeads) * 100).toFixed(1) + '%' : '0%';
    const callLogRate = p.totalLeads > 0 ? ((p.leadsWithInteractions / p.totalLeads) * 100).toFixed(1) + '%' : '0%';
    const abandonedRate = p.totalLeads > 0 ? ((p.leadsAbandonedNotAnswered / p.totalLeads) * 100).toFixed(1) + '%' : '0%';

    return {
      telecaller: p.name,
      totalLeads: p.totalLeads,
      ordersConfirmed: p.ordersConfirmed,
      conversionRate: convRate,
      totalRevenue: p.totalRevenue,
      leadsWithInteractions: p.leadsWithInteractions,
      callLogRate,
      leadsWithNotes: p.leadsWithDetailedNotes,
      leadsWithoutNotes: p.leadsWithoutNotes,
      noteFeedRate,
      leadsUntouchedNew: p.leadsUntountouchedNew || p.leadsUntouchedNew,
      leadsAbandonedNotAnswered: p.leadsAbandonedNotAnswered,
      abandonedRate,
      notAnsweredRetried: p.leadsNotAnsweredMultipleAttempts,
      followupsScheduled: p.leadsWithFollowupDate,
      ordersMissingAddress: p.ordersMissingAddress,
      statusBreakdown: p.statusCounts
    };
  });

  fs.writeFileSync('scripts/final_telecaller_deep_audit.json', JSON.stringify(finalReport, null, 2));
  console.log('Final deep audit report generated successfully.');
}

comprehensiveAudit().then(() => process.exit(0)).catch(console.error);
