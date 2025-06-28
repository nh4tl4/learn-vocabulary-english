const fs = require('fs');
const path = require('path');

try {
  // Read all migration files
  const migrationDir = './src/database/migrations';
  console.log('Looking for migration files in:', migrationDir);

  if (!fs.existsSync(migrationDir)) {
    console.log('Migration directory does not exist:', migrationDir);
    process.exit(1);
  }

  const files = fs.readdirSync(migrationDir).filter(file => file.endsWith('.ts'));
  console.log('Found migration files:', files);

  const vocabularyEntries = new Map();
  const duplicates = [];

  files.forEach(file => {
    console.log(`Processing file: ${file}`);
    const filePath = path.join(migrationDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract vocabulary entries using regex - looking for INSERT statements
    const regex = /\('([^']+)',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'[^']*',\s*'[^']*'/g;
    let match;
    let foundInFile = 0;

    while ((match = regex.exec(content)) !== null) {
      const word = match[1];
      foundInFile++;

      if (vocabularyEntries.has(word)) {
        duplicates.push({
          word: word,
          files: [vocabularyEntries.get(word), file]
        });
        console.log(`Found duplicate: "${word}" in ${vocabularyEntries.get(word)} and ${file}`);
      } else {
        vocabularyEntries.set(word, file);
      }
    }

    console.log(`  Found ${foundInFile} vocabulary entries in ${file}`);
  });

  console.log('\n=== DUPLICATE VOCABULARY ENTRIES ===');
  if (duplicates.length === 0) {
    console.log('No duplicate vocabulary entries found.');
  } else {
    duplicates.forEach(dup => {
      console.log(`Duplicate word: "${dup.word}"`);
      console.log(`  Found in: ${dup.files.join(', ')}`);
      console.log('');
    });
  }

  console.log(`\nTotal vocabulary entries: ${vocabularyEntries.size}`);
  console.log(`Total duplicates found: ${duplicates.length}`);

} catch (error) {
  console.error('Error:', error.message);
}
