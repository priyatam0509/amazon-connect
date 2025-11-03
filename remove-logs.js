const fs = require('fs');
const path = require('path');

// Files to clean (remove ALL console logs)
const filesToClean = [
  'src/App.jsx',
  'src/components/AgentPanel.jsx',
  'src/components/ContactPanel.jsx',
  'src/components/EmailPanel.jsx',
  'src/components/AdvancedContactPanel.jsx',
  'src/components/VoicePanel.jsx'
];

// Files to keep (DON'T touch these - we need their logs for debugging)
// - src/managers/ConnectSDKManager.js (contact event logs)
// - src/services/MetricsTracker.js (all metrics logs)
// - src/components/AnalyticsDashboard.jsx (dashboard logs)
// - src/components/AdvancedEmailPanel.jsx (email logs)
// - src/AppComprehensive.jsx (SDK init logs)

function removeConsoleLogs(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⏭️  Skipping ${filePath} (not found)`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalLength = content.length;
    
    // Remove console.log, console.error, console.warn, console.info, console.debug
    // This regex matches complete console statements including multiline
    content = content.replace(/\s*console\.(log|error|warn|info|debug)\([^;]*\);?\s*/g, '');
    
    // Clean up any double empty lines that might result
    content = content.replace(/\n\n\n+/g, '\n\n');
    
    if (content.length !== originalLength) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Cleaned ${filePath} (${originalLength - content.length} bytes removed)`);
    } else {
      console.log(`⏭️  No changes needed for ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log('🧹 Removing console logs from non-analytics files...\n');

filesToClean.forEach(file => {
  removeConsoleLogs(file);
});

console.log('\n✅ Done! Analytics debugging logs preserved in:');
console.log('   - ConnectSDKManager.js (contact events)');
console.log('   - MetricsTracker.js (metrics tracking)');
console.log('   - AnalyticsDashboard.jsx (dashboard updates)');
console.log('   - AdvancedEmailPanel.jsx (email operations)');
console.log('   - AppComprehensive.jsx (SDK initialization)');
