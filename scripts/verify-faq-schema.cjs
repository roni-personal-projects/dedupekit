const fs = require('fs');

function testFile(filePath) {
  console.log(`\n--- Testing ${filePath} ---`);
  const html = fs.readFileSync(filePath, 'utf8');
  
  // Find all ld+json blocks
  const matches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  console.log(`Found ${matches.length} JSON-LD script blocks.`);
  
  let foundFaq = false;
  matches.forEach((m, idx) => {
    try {
      const parsed = JSON.parse(m[1]);
      if (parsed['@type'] === 'FAQPage') {
        foundFaq = true;
        console.log(`Block ${idx + 1} is valid FAQPage JSON-LD.`);
        console.log(`Number of FAQ items: ${parsed.mainEntity.length}`);
        
        const requiredQuestions = [
          'How can I remove duplicates?',
          'How to get rid of duplicate lines?',
          'How to find duplicates online?',
          'Which tools remove duplicates?',
          'What is the best free duplicate finder?',
          'Which method removes duplicates automatically?',
          'How to remove duplicates but keep one?'
        ];
        
        requiredQuestions.forEach(q => {
          const item = parsed.mainEntity.find(e => e.name === q);
          if (item) {
            console.log(`✓ Found required question: "${q}"`);
            console.log(`  Answer length: ${item.acceptedAnswer.text.length} chars`);
          } else {
            console.error(`✗ MISSING required question: "${q}"`);
          }
        });
      }
    } catch (e) {
      console.error(`Error parsing JSON-LD block ${idx + 1}:`, e.message);
    }
  });

  if (!foundFaq) {
    console.error(`ERROR: No FAQPage schema found in ${filePath}`);
  }
}

testFile('dist/index.html');
testFile('dist/faq/index.html');
