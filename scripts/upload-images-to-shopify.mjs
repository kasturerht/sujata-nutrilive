// scripts/upload-images-to-shopify.mjs
import fs from 'fs';
import path from 'path';

const domain = 'tvczdq-nu.myshopify.com';
const token = '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';

async function graphql(query, variables = {}) {
  const res = await fetch(`https://${domain}/admin/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({ query, variables })
  });
  return await res.json();
}

async function uploadFile(filePath, filename) {
  console.log(`\n📤 Uploading ${filename} to Shopify CDN...`);
  const fileBuffer = fs.readFileSync(filePath);
  const fileSize = fileBuffer.length.toString();

  // 1. stagedUploadsCreate
  const stagedMutation = `
    mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets {
          url
          resourceUrl
          parameters {
            name
            value
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const stagedRes = await graphql(stagedMutation, {
    input: [
      {
        filename: filename,
        mimeType: 'image/jpeg',
        resource: 'IMAGE',
        httpMethod: 'POST',
        fileSize: fileSize
      }
    ]
  });

  if (stagedRes.data?.stagedUploadsCreate?.userErrors?.length > 0) {
    throw new Error(JSON.stringify(stagedRes.data.stagedUploadsCreate.userErrors));
  }

  const target = stagedRes.data.stagedUploadsCreate.stagedTargets[0];
  console.log('Got staged target URL:', target.url);

  // 2. POST to S3 / GCP using native FormData
  const formData = new FormData();
  for (const param of target.parameters) {
    formData.append(param.name, param.value);
  }
  const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
  formData.append('file', blob, filename);

  const postRes = await fetch(target.url, {
    method: 'POST',
    body: formData
  });

  if (!postRes.ok) {
    const errText = await postRes.text();
    throw new Error(`S3/Storage upload failed: ${postRes.status} ${errText}`);
  }
  console.log('✅ File uploaded to staged storage.');

  // 3. productCreateMedia on Shopify Product (requires only write_products scope)
  const productCreateMediaMutation = `
    mutation productCreateMedia($media: [CreateMediaInput!]!, $productId: ID!) {
      productCreateMedia(media: $media, productId: $productId) {
        media {
          id
          status
          ... on MediaImage {
            image {
              url
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const mediaRes = await graphql(productCreateMediaMutation, {
    productId: "gid://shopify/Product/10473731162244",
    media: [
      {
        originalSource: target.resourceUrl,
        mediaContentType: 'IMAGE',
        alt: filename.replace('.jpg', '')
      }
    ]
  });

  console.log('productCreateMedia response:', JSON.stringify(mediaRes, null, 2));
  const createdMedia = mediaRes.data?.productCreateMedia?.media?.[0];
  const mediaId = createdMedia?.id;
  console.log('Created media ID:', mediaId, 'Status:', createdMedia?.status);

  // 4. Poll until media status is READY or url is available
  let cdnUrl = createdMedia?.image?.url;
  let attempts = 0;
  while (!cdnUrl && attempts < 15) {
    attempts++;
    console.log(`Waiting for CDN URL... (attempt ${attempts})`);
    await new Promise(r => setTimeout(r, 2000));
    
    const queryMedia = `
      query getMedia($id: ID!) {
        node(id: $id) {
          ... on MediaImage {
            status
            image {
              url
            }
          }
        }
      }
    `;
    const checkRes = await graphql(queryMedia, { id: mediaId });
    cdnUrl = checkRes.data?.node?.image?.url;
    if (cdnUrl) break;
  }

  console.log(`🎉 Final CDN URL for ${filename}:`, cdnUrl);
  return cdnUrl;
}

async function run() {
  const url2M = await uploadFile(
    'public/products/sujata-combo-capsules-2month-4bottles-pro3d.jpg',
    'sujata-combo-capsules-2month-4bottles-pro3d.jpg'
  );

  const url3M = await uploadFile(
    'public/products/sujata-combo-capsules-3month-6bottles-pro3d.jpg',
    'sujata-combo-capsules-3month-6bottles-pro3d.jpg'
  );

  const results = {
    twoMonth: url2M,
    threeMonth: url3M
  };

  fs.writeFileSync('scripts/uploaded-combo-urls.json', JSON.stringify(results, null, 2));
  console.log('\nSaved URLs to scripts/uploaded-combo-urls.json');
}

run().catch(console.error);
