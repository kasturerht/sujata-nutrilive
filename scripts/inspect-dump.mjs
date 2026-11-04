import fs from 'fs';

const html = fs.readFileSync('scripts/judgeme-widget-dump.html', 'utf8');
console.log('HTML length:', html.length);
console.log('Contains jdgm-rev:', html.includes('jdgm-rev '));
console.log('Reviews count in widget:');
const matches = html.match(/class=['"][^'"]*jdgm-rev\s/g) || [];
console.log('Total reviews found:', matches.length);

const summaryIdx = html.indexOf('jdgm-rev-widg__summary');
if (summaryIdx !== -1) {
  console.log('--- SUMMARY SECTION ---');
  console.log(html.slice(summaryIdx, summaryIdx + 500));
}

const reviewsIdx = html.indexOf('jdgm-rev-widg__reviews');
if (reviewsIdx !== -1) {
  console.log('--- REVIEWS LIST SECTION ---');
  console.log(html.slice(reviewsIdx, reviewsIdx + 1500));
}
