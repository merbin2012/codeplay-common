const fs = require('fs');
const path = require('path');

// Path to the plugin.xml file
const pluginXmlPath = path.join('node_modules', 'emi-indo-cordova-plugin-admob', 'plugin.xml');

// Get the store ID from the environment variable
const storeId = process.env.VITE_STORE_ID || '1';

// Determine the framework to use based on storeId
const framework = storeId === '7'
  ? '<framework src="com.google.android.gms:play-services-ads:$PLAY_SERVICES_VERSION" />'
  : '<framework src="com.google.android.gms:play-services-ads-lite:$PLAY_SERVICES_VERSION" />';

// Read and modify the plugin.xml file
fs.readFile(pluginXmlPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading plugin.xml:', err);
    process.exit(1);
  }

  // Replace the existing framework line with the selected one
  const modifiedData = data.replace(
    /<framework src="com.google.android.gms:play-services-ads.*" \/>\n/,
    `${framework}\n`
  );

  // Write the modified content back to plugin.xml
  fs.writeFile(pluginXmlPath, modifiedData, 'utf8', (err) => {
    if (err) {
      console.error('Error writing plugin.xml:', err);
      process.exit(1);
    }
    console.log('plugin.xml updated successfully.');
  });
});
