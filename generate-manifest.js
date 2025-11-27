import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory containing the JSON files
const dataDir = path.join(__dirname, 'data');

// Function to generate manifest from JSON files
function generateManifest() {
    const manifestEntries = [];
    const files = fs.readdirSync(dataDir);

    files.forEach(file => {
        if (file.endsWith('.json') && file !== 'manifest.json') {
            // Parse date from filename: DD-MM-YYYY
            const dateMatch = file.match(/^(\d{2}-\d{2}-\d{4})-(EN|TA)\.json$/);
            if (dateMatch) {
                const dateStr = dateMatch[1];
                const lang = dateMatch[2];

                // Convert DD-MM-YYYY to YYYY-MM-DD for manifest
                const [day, month, year] = dateStr.split('-');
                const isoDate = `${year}-${month}-${day}`;

                const filePath = path.join(dataDir, file);
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

                // Find meta block and extract title
                const metaBlock = data.find(block => block.type === 'meta');
                const title = metaBlock?.title || 'Untitled';

                // Find or create manifest entry for this date
                let entry = manifestEntries.find(e => e.date === isoDate);
                if (!entry) {
                    entry = { date: isoDate, EN: { title: '' }, TA: { title: '' } };
                    manifestEntries.push(entry);
                }

                entry[lang].title = title;
            }
        }
    });

    // Sort by date ascending
    manifestEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const manifestData = JSON.stringify(manifestEntries, null, 2);

    const manifestPath = path.join(dataDir, 'manifest.json');
    fs.writeFileSync(manifestPath, manifestData);

    console.log(`Generated manifest.json with ${manifestEntries.length} entries`);
}

// Run the generator
generateManifest();
