import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const accountId = '6381104411';
const containerId = '266369056';
const publicId = 'GTM-5BCC6JL8';
const metaPixelId = '1314112957191765';
const ga4Id = 'G-5WZ8DNW2PD';

const container = {
  exportFormatVersion: 2,
  exportTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
  containerVersion: {
    path: `accounts/${accountId}/containers/${containerId}/versions/0`,
    accountId,
    containerId,
    container: {
      name: 'www.sujatanutrilive.com',
      publicId,
      usageContext: ['WEB']
    },
    tag: [
      // 1. Google Ads Conversion Linker
      {
        accountId,
        containerId,
        tagId: '1',
        name: 'Google Ads - Conversion Linker',
        type: 'gclidw',
        firingTriggerId: ['2147479553'],
        parameter: [{ type: 'BOOLEAN', key: 'enableCookieOverride', value: 'false' }]
      },
      // 2. Meta Pixel Base Code & PageView
      {
        accountId,
        containerId,
        tagId: '2',
        name: 'Meta Pixel - Base Code & PageView',
        type: 'html',
        firingTriggerId: ['2147479553'],
        parameter: [
          {
            type: 'TEMPLATE',
            key: 'html',
            value: `<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '{{Const - Meta Pixel ID}}');
fbq('track', 'PageView');
</script>`
          }
        ]
      },
      // 3. Meta Pixel - ViewContent
      {
        accountId,
        containerId,
        tagId: '3',
        name: 'Meta Pixel - ViewContent',
        type: 'html',
        firingTriggerId: ['101'],
        parameter: [
          {
            type: 'TEMPLATE',
            key: 'html',
            value: `<script>
if (typeof fbq === 'function') {
  var pId = '{{DLV - Product ID}}' || 'sujata_item';
  var pTitle = '{{DLV - Product Title}}' || 'Sujata Formulation';
  var pVal = Number('{{DLV - Product Price}}') || Number('{{DLV - Ecommerce Value}}') || 0;
  var eId = '{{DLV - Event ID}}' || '';
  fbq('track', 'ViewContent', {
    content_name: pTitle,
    content_ids: [String(pId)],
    content_type: 'product',
    value: pVal,
    currency: 'INR'
  }, eId ? { eventID: eId } : undefined);
}
</script>`
          }
        ]
      },
      // 4. Meta Pixel - AddToCart
      {
        accountId,
        containerId,
        tagId: '4',
        name: 'Meta Pixel - AddToCart',
        type: 'html',
        firingTriggerId: ['102'],
        parameter: [
          {
            type: 'TEMPLATE',
            key: 'html',
            value: `<script>
if (typeof fbq === 'function') {
  var pId = '{{DLV - Product ID}}' || 'sujata_item';
  var pTitle = '{{DLV - Product Title}}' || 'Sujata Formulation';
  var pVal = Number('{{DLV - Product Price}}') || Number('{{DLV - Ecommerce Value}}') || 0;
  var eId = '{{DLV - Event ID}}' || '';
  fbq('track', 'AddToCart', {
    content_name: pTitle,
    content_ids: [String(pId)],
    content_type: 'product',
    value: pVal,
    currency: 'INR'
  }, eId ? { eventID: eId } : undefined);
}
</script>`
          }
        ]
      },
      // 5. Meta Pixel - InitiateCheckout
      {
        accountId,
        containerId,
        tagId: '5',
        name: 'Meta Pixel - InitiateCheckout',
        type: 'html',
        firingTriggerId: ['103'],
        parameter: [
          {
            type: 'TEMPLATE',
            key: 'html',
            value: `<script>
if (typeof fbq === 'function') {
  var totalVal = Number('{{DLV - Order Total}}') || Number('{{DLV - Ecommerce Value}}') || 0;
  var eId = '{{DLV - Event ID}}' || '';
  fbq('track', 'InitiateCheckout', {
    value: totalVal,
    currency: 'INR'
  }, eId ? { eventID: eId } : undefined);
}
</script>`
          }
        ]
      },
      // 6. Meta Pixel - Purchase (Enterprise Grade with CAPI EventID Deduplication)
      {
        accountId,
        containerId,
        tagId: '6',
        name: 'Meta Pixel - Purchase',
        type: 'html',
        firingTriggerId: ['106'],
        parameter: [
          {
            type: 'TEMPLATE',
            key: 'html',
            value: `<script>
if (typeof fbq === 'function') {
  var purchaseVal = Number('{{DLV - Ecommerce Value}}') || Number('{{DLV - Order Total}}') || 0;
  var eId = '{{DLV - Event ID}}' || ('order_' + ('{{DLV - Transaction ID}}' || Date.now()));
  var cur = '{{DLV - Currency}}' || 'INR';
  fbq('track', 'Purchase', {
    value: purchaseVal,
    currency: cur,
    content_type: 'product'
  }, { eventID: eId });
}
</script>`
          }
        ]
      },
      // 7. Meta Pixel - Lead (Quiz / Routine Finder)
      {
        accountId,
        containerId,
        tagId: '7',
        name: 'Meta Pixel - Lead',
        type: 'html',
        firingTriggerId: ['104'],
        parameter: [
          {
            type: 'TEMPLATE',
            key: 'html',
            value: `<script>
if (typeof fbq === 'function') {
  var eId = '{{DLV - Event ID}}' || '';
  fbq('track', 'Lead', {
    content_name: '1-Minute Routine Finder Quiz',
    currency: 'INR',
    value: 0
  }, eId ? { eventID: eId } : undefined);
}
</script>`
          }
        ]
      },
      // 8. Meta Pixel - Contact (WhatsApp Concierge)
      {
        accountId,
        containerId,
        tagId: '8',
        name: 'Meta Pixel - Contact',
        type: 'html',
        firingTriggerId: ['105'],
        parameter: [
          {
            type: 'TEMPLATE',
            key: 'html',
            value: `<script>
if (typeof fbq === 'function') {
  var eId = '{{DLV - Event ID}}' || '';
  fbq('track', 'Contact', {
    content_name: '{{DLV - Contact Channel}}' || 'WhatsApp Support'
  }, eId ? { eventID: eId } : undefined);
}
</script>`
          }
        ]
      },
      // 9. Google Tag (GA4 Base Configuration)
      {
        accountId,
        containerId,
        tagId: '9',
        name: 'Google Tag (GA4 Base)',
        type: 'googtag',
        firingTriggerId: ['2147479553'],
        parameter: [
          { type: 'TEMPLATE', key: 'tagId', value: '{{Const - GA4 Measurement ID}}' }
        ]
      },
      // 10. GA4 - view_item (Native E-commerce Event)
      {
        accountId,
        containerId,
        tagId: '10',
        name: 'GA4 - view_item',
        type: 'gaawe',
        firingTriggerId: ['107'],
        parameter: [
          { type: 'TEMPLATE', key: 'measurementId', value: '{{Const - GA4 Measurement ID}}' },
          { type: 'TEMPLATE', key: 'eventName', value: 'view_item' },
          { type: 'BOOLEAN', key: 'sendEcommerceData', value: 'true' }
        ]
      },
      // 11. GA4 - add_to_cart (Native E-commerce Event)
      {
        accountId,
        containerId,
        tagId: '11',
        name: 'GA4 - add_to_cart',
        type: 'gaawe',
        firingTriggerId: ['108'],
        parameter: [
          { type: 'TEMPLATE', key: 'measurementId', value: '{{Const - GA4 Measurement ID}}' },
          { type: 'TEMPLATE', key: 'eventName', value: 'add_to_cart' },
          { type: 'BOOLEAN', key: 'sendEcommerceData', value: 'true' }
        ]
      },
      // 12. GA4 - begin_checkout (Native E-commerce Event)
      {
        accountId,
        containerId,
        tagId: '12',
        name: 'GA4 - begin_checkout',
        type: 'gaawe',
        firingTriggerId: ['109'],
        parameter: [
          { type: 'TEMPLATE', key: 'measurementId', value: '{{Const - GA4 Measurement ID}}' },
          { type: 'TEMPLATE', key: 'eventName', value: 'begin_checkout' },
          { type: 'BOOLEAN', key: 'sendEcommerceData', value: 'true' }
        ]
      },
      // 13. GA4 - purchase (Native E-commerce Event)
      {
        accountId,
        containerId,
        tagId: '13',
        name: 'GA4 - purchase',
        type: 'gaawe',
        firingTriggerId: ['110'],
        parameter: [
          { type: 'TEMPLATE', key: 'measurementId', value: '{{Const - GA4 Measurement ID}}' },
          { type: 'TEMPLATE', key: 'eventName', value: 'purchase' },
          { type: 'BOOLEAN', key: 'sendEcommerceData', value: 'true' }
        ]
      }
    ],
    trigger: [
      // All Pages
      {
        accountId,
        containerId,
        triggerId: '2147479553',
        name: 'All Pages',
        type: 'PAGEVIEW'
      },
      // 101. Custom Event - ViewContent (Supports both ViewContent and view_item)
      {
        accountId,
        containerId,
        triggerId: '101',
        name: 'Custom Event - ViewContent',
        type: 'CUSTOM_EVENT',
        customEventFilter: [
          {
            type: 'MATCH_REGEX',
            parameter: [
              { type: 'TEMPLATE', key: 'arg0', value: '{{_event}}' },
              { type: 'TEMPLATE', key: 'arg1', value: '^(ViewContent|view_item)$' }
            ]
          }
        ]
      },
      // 102. Custom Event - AddToCart (Supports both AddToCart and add_to_cart)
      {
        accountId,
        containerId,
        triggerId: '102',
        name: 'Custom Event - AddToCart',
        type: 'CUSTOM_EVENT',
        customEventFilter: [
          {
            type: 'MATCH_REGEX',
            parameter: [
              { type: 'TEMPLATE', key: 'arg0', value: '{{_event}}' },
              { type: 'TEMPLATE', key: 'arg1', value: '^(AddToCart|add_to_cart)$' }
            ]
          }
        ]
      },
      // 103. Custom Event - InitiateCheckout (Supports both InitiateCheckout and begin_checkout)
      {
        accountId,
        containerId,
        triggerId: '103',
        name: 'Custom Event - InitiateCheckout',
        type: 'CUSTOM_EVENT',
        customEventFilter: [
          {
            type: 'MATCH_REGEX',
            parameter: [
              { type: 'TEMPLATE', key: 'arg0', value: '{{_event}}' },
              { type: 'TEMPLATE', key: 'arg1', value: '^(InitiateCheckout|begin_checkout)$' }
            ]
          }
        ]
      },
      // 104. Custom Event - CompleteRegistration / Lead
      {
        accountId,
        containerId,
        triggerId: '104',
        name: 'Custom Event - CompleteRegistration (Quiz)',
        type: 'CUSTOM_EVENT',
        customEventFilter: [
          {
            type: 'MATCH_REGEX',
            parameter: [
              { type: 'TEMPLATE', key: 'arg0', value: '{{_event}}' },
              { type: 'TEMPLATE', key: 'arg1', value: '^(CompleteRegistration|generate_lead|sign_up)$' }
            ]
          }
        ]
      },
      // 105. Custom Event - Contact
      {
        accountId,
        containerId,
        triggerId: '105',
        name: 'Custom Event - Contact',
        type: 'CUSTOM_EVENT',
        customEventFilter: [
          {
            type: 'MATCH_REGEX',
            parameter: [
              { type: 'TEMPLATE', key: 'arg0', value: '{{_event}}' },
              { type: 'TEMPLATE', key: 'arg1', value: '^(Contact|contact)$' }
            ]
          }
        ]
      },
      // 106. Custom Event - Purchase
      {
        accountId,
        containerId,
        triggerId: '106',
        name: 'Custom Event - Purchase',
        type: 'CUSTOM_EVENT',
        customEventFilter: [
          {
            type: 'MATCH_REGEX',
            parameter: [
              { type: 'TEMPLATE', key: 'arg0', value: '{{_event}}' },
              { type: 'TEMPLATE', key: 'arg1', value: '^(Purchase|purchase)$' }
            ]
          }
        ]
      },
      // 107. GA4 Trigger - view_item
      {
        accountId,
        containerId,
        triggerId: '107',
        name: 'GA4 Event - view_item',
        type: 'CUSTOM_EVENT',
        customEventFilter: [
          {
            type: 'EQUALS',
            parameter: [
              { type: 'TEMPLATE', key: 'arg0', value: '{{_event}}' },
              { type: 'TEMPLATE', key: 'arg1', value: 'view_item' }
            ]
          }
        ]
      },
      // 108. GA4 Trigger - add_to_cart
      {
        accountId,
        containerId,
        triggerId: '108',
        name: 'GA4 Event - add_to_cart',
        type: 'CUSTOM_EVENT',
        customEventFilter: [
          {
            type: 'EQUALS',
            parameter: [
              { type: 'TEMPLATE', key: 'arg0', value: '{{_event}}' },
              { type: 'TEMPLATE', key: 'arg1', value: 'add_to_cart' }
            ]
          }
        ]
      },
      // 109. GA4 Trigger - begin_checkout
      {
        accountId,
        containerId,
        triggerId: '109',
        name: 'GA4 Event - begin_checkout',
        type: 'CUSTOM_EVENT',
        customEventFilter: [
          {
            type: 'EQUALS',
            parameter: [
              { type: 'TEMPLATE', key: 'arg0', value: '{{_event}}' },
              { type: 'TEMPLATE', key: 'arg1', value: 'begin_checkout' }
            ]
          }
        ]
      },
      // 110. GA4 Trigger - purchase
      {
        accountId,
        containerId,
        triggerId: '110',
        name: 'GA4 Event - purchase',
        type: 'CUSTOM_EVENT',
        customEventFilter: [
          {
            type: 'EQUALS',
            parameter: [
              { type: 'TEMPLATE', key: 'arg0', value: '{{_event}}' },
              { type: 'TEMPLATE', key: 'arg1', value: 'purchase' }
            ]
          }
        ]
      }
    ],
    variable: [
      {
        accountId,
        containerId,
        variableId: '1',
        name: 'Const - Meta Pixel ID',
        type: 'c',
        parameter: [{ type: 'TEMPLATE', key: 'value', value: metaPixelId }]
      },
      {
        accountId,
        containerId,
        variableId: '2',
        name: 'Const - GA4 Measurement ID',
        type: 'c',
        parameter: [{ type: 'TEMPLATE', key: 'value', value: ga4Id }]
      },
      {
        accountId,
        containerId,
        variableId: '3',
        name: 'DLV - Event ID',
        type: 'v',
        parameter: [
          { type: 'INTEGER', key: 'dataLayerVersion', value: '2' },
          { type: 'TEMPLATE', key: 'name', value: 'event_id' }
        ]
      },
      {
        accountId,
        containerId,
        variableId: '4',
        name: 'DLV - Product ID',
        type: 'v',
        parameter: [
          { type: 'INTEGER', key: 'dataLayerVersion', value: '2' },
          { type: 'TEMPLATE', key: 'name', value: 'event_data.id' }
        ]
      },
      {
        accountId,
        containerId,
        variableId: '5',
        name: 'DLV - Product Title',
        type: 'v',
        parameter: [
          { type: 'INTEGER', key: 'dataLayerVersion', value: '2' },
          { type: 'TEMPLATE', key: 'name', value: 'event_data.title' }
        ]
      },
      {
        accountId,
        containerId,
        variableId: '6',
        name: 'DLV - Product Price',
        type: 'v',
        parameter: [
          { type: 'INTEGER', key: 'dataLayerVersion', value: '2' },
          { type: 'TEMPLATE', key: 'name', value: 'event_data.price' }
        ]
      },
      {
        accountId,
        containerId,
        variableId: '7',
        name: 'DLV - Order Total',
        type: 'v',
        parameter: [
          { type: 'INTEGER', key: 'dataLayerVersion', value: '2' },
          { type: 'TEMPLATE', key: 'name', value: 'event_data.total' }
        ]
      },
      {
        accountId,
        containerId,
        variableId: '8',
        name: 'DLV - Contact Channel',
        type: 'v',
        parameter: [
          { type: 'INTEGER', key: 'dataLayerVersion', value: '2' },
          { type: 'TEMPLATE', key: 'name', value: 'event_data.channel' }
        ]
      },
      {
        accountId,
        containerId,
        variableId: '9',
        name: 'DLV - Ecommerce Value',
        type: 'v',
        parameter: [
          { type: 'INTEGER', key: 'dataLayerVersion', value: '2' },
          { type: 'TEMPLATE', key: 'name', value: 'ecommerce.value' }
        ]
      },
      {
        accountId,
        containerId,
        variableId: '10',
        name: 'DLV - Currency',
        type: 'v',
        parameter: [
          { type: 'INTEGER', key: 'dataLayerVersion', value: '2' },
          { type: 'TEMPLATE', key: 'name', value: 'ecommerce.currency' }
        ]
      },
      {
        accountId,
        containerId,
        variableId: '11',
        name: 'DLV - Transaction ID',
        type: 'v',
        parameter: [
          { type: 'INTEGER', key: 'dataLayerVersion', value: '2' },
          { type: 'TEMPLATE', key: 'name', value: 'ecommerce.transaction_id' }
        ]
      },
      {
        accountId,
        containerId,
        variableId: '12',
        name: 'DLV - User FBP',
        type: 'v',
        parameter: [
          { type: 'INTEGER', key: 'dataLayerVersion', value: '2' },
          { type: 'TEMPLATE', key: 'name', value: 'user_data.fbp' }
        ]
      },
      {
        accountId,
        containerId,
        variableId: '13',
        name: 'DLV - User FBC',
        type: 'v',
        parameter: [
          { type: 'INTEGER', key: 'dataLayerVersion', value: '2' },
          { type: 'TEMPLATE', key: 'name', value: 'user_data.fbc' }
        ]
      }
    ]
  }
};

const targetPath = path.join(rootDir, 'sujata_gtm_container.json');
fs.writeFileSync(targetPath, JSON.stringify(container, null, 2), 'utf8');
console.log('✅ Enterprise GTM Container JSON successfully generated at:', targetPath);
console.log(`Tags: ${container.containerVersion.tag.length}`);
console.log(`Triggers: ${container.containerVersion.trigger.length}`);
console.log(`Variables: ${container.containerVersion.variable.length}`);
