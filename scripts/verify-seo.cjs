const fs = require('fs');

const html = fs.readFileSync('dist/index.html', 'utf8');

const title = html.match(/<title>([\s\S]*?)<\/title>/);
console.log('Title:', title ? title[1] : 'NONE');

const desc = html.match(/<meta name="description" content="([^"]*)"/);
console.log('Description:', desc ? desc[1] : 'NONE');

const kw = html.match(/<meta name="keywords" content="([^"]*)"/);
console.log('Keywords:', kw ? kw[1] : 'NONE');

const ogs = [...html.matchAll(/<meta property="(og:[^"]+)" content="([^"]*)"/g)].map(m => m[1] + ' = ' + m[2]);
console.log('\nOpen Graph Tags:');
ogs.forEach(o => console.log(' ', o));

const tws = [...html.matchAll(/<meta name="(twitter:[^"]+)" content="([^"]*)"/g)].map(m => m[1] + ' = ' + m[2]);
console.log('\nTwitter Card Tags:');
tws.forEach(t => console.log(' ', t));

console.log('\nJSON-LD Schema Present:', html.includes('application/ld+json'));
console.log('SEO Guide Section Present:', html.includes('The Complete Guide to Remove Duplicates from Text Lists and Spreadsheets'));
