const fs = require('fs');
const path = require('path');



const androidManifestPath = path.join("android", "app", "src", "main", "AndroidManifest.xml");

// Find the vite config file
const possibleConfigFiles = ['vite.config.mjs', 'vite.config.js'];
let viteConfigPath;

for (const configFile of possibleConfigFiles) {
    const fullPath = path.resolve(configFile);
    if (fs.existsSync(fullPath)) {
        viteConfigPath = fullPath;
        break;
    }
}

if (!viteConfigPath) {
    console.error('Error: No vite.config.mjs or vite.config.js file found.');
    process.exit(1);
}

try {
    // Read vite config file
    const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf-8');

    // Extract @common alias path
    const aliasPattern = /'@common':\s*path\.resolve\(__dirname,\s*'(.+?)'\)/;
    const match = viteConfigContent.match(aliasPattern);

    if (!match) {
        console.error(`Error: @common alias not found in ${viteConfigPath}`);
        process.exit(1);
    }

    const commonFilePath = match[1];
    const resolvedCommonPath = path.resolve(__dirname, commonFilePath);

    // Read the common file content
    if (!fs.existsSync(resolvedCommonPath)) {
        console.error(`Error: Resolved common file does not exist: ${resolvedCommonPath}`);
        process.exit(1);
    }

    const commonFileContent = fs.readFileSync(resolvedCommonPath, 'utf-8');

    // Extract _storeid value
    const storeIdPattern = /export\s+let\s+_storeid\s*=\s*import\.meta\.env\.VITE_STORE_ID\s*\|\|\s*(\d+)\s*;/;

    const storeMatch = commonFileContent.match(storeIdPattern);
    

    if (!storeMatch) {
        console.error(`Error: _storeid not found in ${resolvedCommonPath}`);
        process.exit(1);
    }
    
    const _storeid = parseInt(storeMatch[1], 10);
    
    // Determine the store name based on _storeid
    let storeName = "";
    if (_storeid === 1) {
        storeName = "PlayStore";
    } else if (_storeid === 2) {
        storeName = "SamsungStore";
    } else if (_storeid === 7) {
        storeName = "AmazonStore";
    } else {
        console.error(`Error: Unsupported _storeid value: ${_storeid}`);
        process.exit(1);
    }
    

    // Call managePackages with the determined store name
    managePackages(storeName);

    console.log(commonFilePath, `Success - _storeid found: ${_storeid}, Store: ${storeName}`);
} catch (error) {
    console.error('Error:', error);
    process.exit(1);
}

function managePackages(store) {
    console.log(`Managing packages for store: ${store}`);

    let install = "";
    let uninstall = "";

    //let androidManifestPath = "path/to/AndroidManifest.xml"; // Update this path

    
    let manifestContent = fs.readFileSync(androidManifestPath, 'utf-8');

    const permissionsToRemove = [
        'com.android.vending.BILLING',
        'com.samsung.android.iap.permission.BILLING'
    ];

    permissionsToRemove.forEach(permission => {
        const permissionRegex = new RegExp(`^\\s*<uses-permission\\s+android:name="${permission}"\\s*/?>\\s*[\r\n]?`, 'm');
        if (permissionRegex.test(manifestContent)) {
            manifestContent = manifestContent.replace(permissionRegex, '');
            console.log(`Removed <uses-permission android:name="${permission}" /> from AndroidManifest.xml`);
        }
    });

    // Write the updated content back to the file
    fs.writeFileSync(androidManifestPath, manifestContent, 'utf-8');

    if (store === "PlayStore") {
        install = '@revenuecat/purchases-capacitor';
        uninstall = 'cordova-plugin-samsungiap';
    } else if (store === "AmazonStore") {
        install = '@revenuecat/purchases-capacitor';
        uninstall = 'cordova-plugin-samsungiap';
    } else if (store === "SamsungStore") {
        install = 'cordova-plugin-samsungiap';
        uninstall = '@revenuecat/purchases-capacitor';
    } else {
        console.log("No valid store specified. Uninstalling both plugins.");
        try {
            require('child_process').execSync(`npm uninstall cordova-plugin-samsungiap`, { stdio: 'inherit' });
            require('child_process').execSync(`npm uninstall @revenuecat/purchases-capacitor`, { stdio: 'inherit' });
            console.log("Both plugins uninstalled successfully.");
        } catch (err) {
            console.error("Error uninstalling plugins:", err);
        }
        return;
    }

    console.log(`Installing ${install} and uninstalling ${uninstall} for ${store}...`);
    try {
        if (install) {
            require('child_process').execSync(`npm install ${install}`, { stdio: 'inherit' });
        }
        if (uninstall) {
            require('child_process').execSync(`npm uninstall ${uninstall}`, { stdio: 'inherit' });
        }
        console.log(`${install} installed and ${uninstall} uninstalled successfully.`);
    } catch (err) {
        console.error(`Error managing packages for ${store}:`, err);
    }
}
