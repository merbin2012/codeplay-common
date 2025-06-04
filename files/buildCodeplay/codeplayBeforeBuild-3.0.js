const fs = require('fs');
const path = require('path');
const plist = require('plist');


// Expected plugin list with minimum versions
const requiredPlugins = [
  { pattern: /backbutton-(\d+\.\d+)\.js$/, minVersion: '1.1', required: true },
  { pattern: /common-(\d+\.\d+)\.js$/, minVersion: '3.4', required: true },
  { pattern: /localization_settings-(\d+\.\d+)\.js$/, minVersion: '1.1', required: true },
  { pattern: /localization-(\d+\.\d+)\.js$/, minVersion: '1.2', required: true },
  { pattern: /localNotification-(\d+\.\d+)\.js$/, minVersion: '2.2', required: true },
  { pattern: /localNotification_AppSettings-(\d+\.\d+)\.js$/, minVersion: '1.0', required: true },
  { pattern: /onesignal-(\d+\.\d+)\.js$/, minVersion: '2.1', required: true },
  { pattern: /saveToGalleryAndSaveAnyFile-(\d+\.\d+)(-ios)?\.js$/, minVersion: '2.4', required: true },
  { pattern: /Ads[\/\\]IAP-(\d+\.\d+)$/, minVersion: '2.1', isFolder: true },
  { pattern: /Ads[\/\\]admob-emi-(\d+\.\d+)\.js$/, minVersion: '2.6', required: true }
];






//Check codeplay-common latest version installed or not Start
const { execSync } = require('child_process');

function getInstalledVersion(packageName) {
  try {
    const packageJsonPath = path.join(process.cwd(), 'node_modules', packageName, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      return packageJson.version;
    }
  } catch (error) {
    return null;
  }
  return null;
}

function getLatestVersion(packageName) {
  try {
    return execSync(`npm view ${packageName} version`).toString().trim();
  } catch (error) {
    console.error(`Failed to fetch latest version for ${packageName}`);
    return null;
  }
}

function checkPackageVersion() {
  const packageName = 'codeplay-common';
  const installedVersion = getInstalledVersion(packageName);
  const latestVersion = getLatestVersion(packageName);

  if (!installedVersion) {
    console.error(`${packageName} is not installed. Please install it using "npm install ${packageName}".`);
    process.exit(1);
  }

  if (installedVersion !== latestVersion) {
    console.error(`\x1b[31m${packageName} is outdated (installed: ${installedVersion}, latest: ${latestVersion}). Please update it.\x1b[0m\n\x1b[33mUse 'npm uninstall codeplay-common ; npm i codeplay-common'\x1b[0m`);
    process.exit(1);
  }

  console.log(`${packageName} is up to date (version ${installedVersion}).`);
}

// Run package version check before executing the main script
try {
  checkPackageVersion();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

//Check codeplay-common latest version installed or not END






// saveToGalleryAndSaveAnyFile-x.x-ios.js file check for android and return error if exists  START

const os = require('os');

const saveToGalleryAndSaveFileCheck_iOS = () => {
  const ROOT_DIR = path.resolve(__dirname, '../src');

  const IOS_FILE_REGEX = /(?:import|require)?\s*\(?['"].*saveToGalleryAndSaveAnyFile-\d+(\.\d+)?-ios\.js['"]\)?/;
  const ALLOWED_EXTENSIONS = ['.js', '.f7'];
  const isMac = os.platform() === 'darwin';

  let iosImportFound = false;

  function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (let entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (entry.name === 'node_modules') continue;
        scanDirectory(fullPath);
      } else if (
        entry.isFile() &&
        ALLOWED_EXTENSIONS.some(ext => fullPath.endsWith(ext))
      ) {
        const content = fs.readFileSync(fullPath, 'utf8');
        const matches = content.match(IOS_FILE_REGEX);
        if (matches) {
          iosImportFound = true;
          //console.error(`\n❌❌❌ BIG ERROR: iOS-specific import detected in: ${fullPath}`);
          //console.error(`🔍 Matched: ${matches[0]}\n`);
          if (!isMac) {
            console.error(`\n❌❌❌ BIG ERROR: iOS-specific import detected in: ${fullPath}`);
            console.error(`🚫 STOPPED: This file should not be imported in Android/Windows/Linux builds.\n`);
            process.exit(1);
          }
        }
      }
    }
  }

  // Check if src folder exists first
  if (!fs.existsSync(ROOT_DIR)) {
    console.warn(`⚠️ Warning: 'src' directory not found at: ${ROOT_DIR}`);
    return;
  }

  scanDirectory(ROOT_DIR);

  if (isMac && !iosImportFound) {
    console.warn(`\x1b[31m\n⚠️⚠️⚠️ WARNING: You're on macOS but no iOS-specific file (saveToGalleryAndSaveAnyFile-x.x-ios.js) was found.\x1b[0m`);
    console.warn(`👉 You may want to double-check your imports for the iOS platform.\n`);
    process.exit(1);
  } else if (isMac && iosImportFound) {
    console.log('✅ iOS file detected as expected for macOS.');
  } else if (!iosImportFound) {
    console.log('✅ No iOS-specific file imports detected for non-macOS.');
  }
};

saveToGalleryAndSaveFileCheck_iOS();
// saveToGalleryAndSaveAnyFile-x.x-ios.js file check for android and return error if exists  END













/*
// Clean up AppleDouble files (._*) created by macOS START
if (process.platform === 'darwin') {
  try {
    console.log('🧹 Cleaning up AppleDouble files (._*)...');
    execSync(`find . -name '._*' -delete`);
    console.log('✅  AppleDouble files removed.');
  } catch (err) {
    console.warn('⚠️  Failed to remove AppleDouble files:', err.message);
  }
} else {
  console.log('ℹ️  Skipping AppleDouble cleanup — not a macOS machine.');
}

// Clean up AppleDouble files (._*) created by macOS END
*/






//In routes.js file check static import START

const routesPath = path.join(process.cwd(), 'src', 'js', 'routes.js');
const routesContent = fs.readFileSync(routesPath, 'utf-8');

let inBlockComment = false;
const lines = routesContent.split('\n');

const allowedImport = `import HomePage from '../pages/home.f7';`;
const badImportRegex = /^[ \t]*import\s+[\w{}*,\s]*\s+from\s+['"].+\.f7['"]\s*;/;
const badImports = [];

lines.forEach((line, index) => {
  const trimmed = line.trim();

  // Handle block comment start and end
  if (trimmed.startsWith('/*')) inBlockComment = true;
  if (inBlockComment && trimmed.endsWith('*/')) {
    inBlockComment = false;
    return;
  }

  // Skip if inside block comment or line comment
  if (inBlockComment || trimmed.startsWith('//')) return;

  // Match static .f7 import
  if (badImportRegex.test(trimmed) && trimmed !== allowedImport) {
    badImports.push({ line: trimmed, number: index + 1 });
  }
});

if (badImports.length > 0) {
  console.error('\n❌ ERROR: Detected disallowed static imports of .f7 files in routes.js\n');
  console.error(`⚠️  Only this static import is allowed:\n    ${allowedImport}\n`);
  console.error(`🔧 Please convert other imports to async dynamic imports like this:\n`);
  console.error(`

import HomePage from '../pages/home.f7';

const routes = [
  {
    path: '/',
    component:HomePage,
  },
  {
    path: '/ProfilePage/',
    async async({ resolve }) {
      const page = await import('../pages/profile.f7');
      resolve({ component: page.default });
    },
  }]
`);
  
  badImports.forEach(({ line, number }) => {
    console.error(`${number}: ${line}`);
  });

  process.exit(1);
} else {
  console.log('✅ routes.js passed the .f7 import check.');
}

//In routes.js file check static import END













// Check and change the "BridgeWebViewClient.java" file START
/*
For crash issue due to low memory problem, we need to modify the onRenderProcessGone method in BridgeWebViewClient.java.
*/


const bridgeWebViewClientFilePath = path.join(process.cwd(), 'node_modules', '@capacitor/android/capacitor/src/main/java/com/getcapacitor', 'BridgeWebViewClient.java');

// Read the file
if (!fs.existsSync(bridgeWebViewClientFilePath)) {
  console.error('❌ Error: BridgeWebViewClient.java not found.');
  process.exit(1);
}

let fileContent = fs.readFileSync(bridgeWebViewClientFilePath, 'utf8');

// Define old and new code
const oldCodeStart = `@Override
    public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
        super.onRenderProcessGone(view, detail);
        boolean result = false;

        List<WebViewListener> webViewListeners = bridge.getWebViewListeners();
        if (webViewListeners != null) {
            for (WebViewListener listener : bridge.getWebViewListeners()) {
                result = listener.onRenderProcessGone(view, detail) || result;
            }
        }

        return result;
    }`;

const newCode = `@Override
    public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
        super.onRenderProcessGone(view, detail);

        boolean result = false;

        List<WebViewListener> webViewListeners = bridge.getWebViewListeners();
        if (webViewListeners != null) {
            for (WebViewListener listener : bridge.getWebViewListeners()) {
                result = listener.onRenderProcessGone(view, detail) || result;
            }
        }

        if (!result) {
            // If no one handled it, handle it ourselves!

            /*if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (detail.didCrash()) {
                    //Log.e("CapacitorWebView", "WebView crashed internally!");
                } else {
                    //Log.w("CapacitorWebView", "WebView was killed by system (low memory) internally!");
                }
            }*/

            view.post(() -> {
                Toast.makeText(view.getContext(), "Reloading due to low memory issue", Toast.LENGTH_SHORT).show();
            });

            view.reload(); // Safely reload WebView

            return true; // We handled it
        }

        return result;
    }`;

// Step 1: Update method if needed
let updated = false;

if (fileContent.includes(oldCodeStart)) {
  console.log('✅ Found old onRenderProcessGone method. Replacing it...');
  fileContent = fileContent.replace(oldCodeStart, newCode);
  updated = true;
} else if (fileContent.includes(newCode)) {
  console.log('ℹ️ Method already updated. No changes needed in "BridgeWebViewClient.java".');
} else {
  console.error('❌ Error: Neither old nor new code found. Unexpected content.');
  process.exit(1);
}

// Step 2: Check and add import if missing
const importToast = 'import android.widget.Toast;';
if (!fileContent.includes(importToast)) {
  console.log('✅ Adding missing import for Toast...');
  const importRegex = /import\s+[^;]+;/g;
  const matches = [...fileContent.matchAll(importRegex)];

  if (matches.length > 0) {
    const lastImport = matches[matches.length - 1];
    const insertPosition = lastImport.index + lastImport[0].length;
    fileContent = fileContent.slice(0, insertPosition) + `\n${importToast}` + fileContent.slice(insertPosition);
    updated = true;
  } else {
    console.error('❌ Error: No import section found in file.');
    process.exit(1);
  }
} else {
  console.log('ℹ️ Import for Toast already exists. No changes needed.');
}

// Step 3: Save if updated
if (updated) {
  fs.writeFileSync(bridgeWebViewClientFilePath, fileContent, 'utf8');
  console.log('✅ File updated successfully.');
} else {
  console.log('ℹ️ No changes needed.');
}




// Check and change the "BridgeWebViewClient.java" file END









// To resolve the kotlin version issue, we need to update the kotlin version in the build.gradle file START

// Build the path dynamically like you requested
const gradlePath = path.join(
  process.cwd(), 
  'android', 
  'build.gradle'
);

// Read the existing build.gradle
let gradleContent = fs.readFileSync(gradlePath, 'utf8');

// Add `ext.kotlin_version` if it's not already there
if (!gradleContent.includes('ext.kotlin_version')) {
  gradleContent = gradleContent.replace(
    /buildscript\s*{/,
    `buildscript {\n    ext.kotlin_version = '2.1.0'`
  );
}

// Add Kotlin classpath if it's not already there
if (!gradleContent.includes('org.jetbrains.kotlin:kotlin-gradle-plugin')) {
  gradleContent = gradleContent.replace(
    /dependencies\s*{([\s\S]*?)classpath 'com.android.tools.build:gradle:8.7.2'/,
    `dependencies {\n        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version")\n$1classpath 'com.android.tools.build:gradle:8.7.2'`
  );
}

// Write back the modified content
fs.writeFileSync(gradlePath, gradleContent, 'utf8');

console.log('✅ Kotlin version updated in build.gradle.');

// To resolve the kotlin version issue, we need to update the kotlin version in the build.gradle file END










const configPath = path.join(process.cwd(), 'capacitor.config.json');
const androidPlatformPath = path.join(process.cwd(), 'android');
const iosPlatformPath = path.join(process.cwd(), 'ios');
const pluginPath = path.join(process.cwd(), 'node_modules', 'emi-indo-cordova-plugin-admob', 'plugin.xml');
const infoPlistPath = path.join(process.cwd(), 'ios', 'App', 'App', 'Info.plist');
const resourcesPath = path.join(process.cwd(), 'resources', 'res');
const androidResPath = path.join(process.cwd(), 'android', 'app', 'src', 'main', 'res');
const localNotificationsPluginPath = path.join(process.cwd(), 'node_modules', '@capacitor', 'local-notifications');

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function copyFolderSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  fs.readdirSync(source).forEach(file => {
    const sourceFile = path.join(source, file);
    const targetFile = path.join(target, file);

    if (fs.lstatSync(sourceFile).isDirectory()) {
      copyFolderSync(sourceFile, targetFile);
    } else {
      fs.copyFileSync(sourceFile, targetFile);
    }
  });
}

function checkAndCopyResources() {
  if (fileExists(resourcesPath)) {
    copyFolderSync(resourcesPath, androidResPath);
    console.log('✅ Successfully copied resources/res to android/app/src/main/res.');
  } else {
    console.log('resources/res folder not found.');

    if (fileExists(localNotificationsPluginPath)) {
      throw new Error('❌ resources/res is required for @capacitor/local-notifications. Stopping execution.');
    }
  }
}



function getAdMobConfig() {
  if (!fileExists(configPath)) {
    throw new Error('❌ capacitor.config.json not found. Ensure this is a Capacitor project.');
  }

  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const admobConfig = config.plugins?.AdMob;

  if (!admobConfig) {
    throw new Error('❌ AdMob configuration is missing in capacitor.config.json.');
  }

  // Default to true if ADMOB_ENABLED is not specified
  const isEnabled = admobConfig.ADMOB_ENABLED !== false;

  if (!isEnabled) {
    return { ADMOB_ENABLED: false }; // Skip further validation
  }

  if (!admobConfig.APP_ID_ANDROID || !admobConfig.APP_ID_IOS) {
    throw new Error(' ❌ AdMob configuration is incomplete. Ensure APP_ID_ANDROID and APP_ID_IOS are defined.');
  }

  return {
    ADMOB_ENABLED: true,
    APP_ID_ANDROID: admobConfig.APP_ID_ANDROID,
    APP_ID_IOS: admobConfig.APP_ID_IOS,
    USE_LITE_ADS: admobConfig.USE_LITE_ADS === "lite",
  };
}

function updatePluginXml(admobConfig) {
  if (!fileExists(pluginPath)) {
    console.error(' ❌ plugin.xml not found. Ensure the plugin is installed.');
    return;
  }

  let pluginContent = fs.readFileSync(pluginPath, 'utf8');

  pluginContent = pluginContent
    .replace(/<preference name="APP_ID_ANDROID" default=".*?" \/>/, `<preference name="APP_ID_ANDROID" default="${admobConfig.APP_ID_ANDROID}" />`)
    .replace(/<preference name="APP_ID_IOS" default=".*?" \/>/, `<preference name="APP_ID_IOS" default="${admobConfig.APP_ID_IOS}" />`);

  fs.writeFileSync(pluginPath, pluginContent, 'utf8');
  console.log('✅ AdMob IDs successfully updated in plugin.xml');
}

function updateInfoPlist(admobConfig) {
  if (!fileExists(infoPlistPath)) {
    console.error(' ❌ Info.plist not found. Ensure you have built the iOS project.');
    return;
  }

  const plistContent = fs.readFileSync(infoPlistPath, 'utf8');
  const plistData = plist.parse(plistContent);

  plistData.GADApplicationIdentifier = admobConfig.APP_ID_IOS;
  plistData.NSUserTrackingUsageDescription = 'This identifier will be used to deliver personalized ads to you.';
  plistData.GADDelayAppMeasurementInit = true;

  const updatedPlistContent = plist.build(plistData);
  fs.writeFileSync(infoPlistPath, updatedPlistContent, 'utf8');
  console.log('AdMob IDs and additional configurations successfully updated in Info.plist');
}

try {
  if (!fileExists(configPath)) {
    throw new Error(' ❌ capacitor.config.json not found. Skipping setup.');
  }

  if (!fileExists(androidPlatformPath) && !fileExists(iosPlatformPath)) {
    throw new Error('Neither Android nor iOS platforms are found. Ensure platforms are added to your Capacitor project.');
  }

  checkAndCopyResources();

  const admobConfig = getAdMobConfig();
  

  // Proceed only if ADMOB_ENABLED is true
  if (admobConfig.ADMOB_ENABLED) {
    if (fileExists(androidPlatformPath)) {
      updatePluginXml(admobConfig);
    }

    if (fileExists(iosPlatformPath)) {
      updateInfoPlist(admobConfig);
    }
  }


} catch (error) {
  console.error(error.message);
  process.exit(1); // Stop execution if there's a critical error
}










// Check all the codeplays plugins version START


const readline = require('readline');


//const srcDir = path.join(__dirname, 'src');
const srcDir = path.join(process.cwd(), 'src');
let outdatedPlugins = [];

function parseVersion(ver) {
  return ver.split('.').map(n => parseInt(n, 10));
}

function compareVersions(v1, v2) {
  const [a1, b1] = parseVersion(v1);
  const [a2, b2] = parseVersion(v2);
  if (a1 !== a2) return a1 - a2;
  return b1 - b2;
}

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkSync(fullPath, filelist);
    } else {
      filelist.push(fullPath);
    }
  });
  return filelist;
}

function checkPlugins() {
  const files = walkSync(srcDir);

  for (const plugin of requiredPlugins) {
    if (plugin.isFolder) {
      const folderPath = path.join(srcDir, ...plugin.pattern.source.split(/[\/\\]/).slice(0, -1));
      if (fs.existsSync(folderPath)) {
        const versionMatch = plugin.pattern.exec(folderPath);
        if (versionMatch && compareVersions(versionMatch[1], plugin.minVersion) < 0) {
          outdatedPlugins.push({
            name: plugin.pattern,
            currentVersion: versionMatch[1],
            requiredVersion: plugin.minVersion
          });
        }
      }
      continue;
    }

    const matchedFile = files.find(file => plugin.pattern.test(file));
    if (matchedFile) {
      const match = plugin.pattern.exec(matchedFile);
      if (match) {
        const currentVersion = match[1];
        if (compareVersions(currentVersion, plugin.minVersion) < 0) {
          outdatedPlugins.push({
            name: path.relative(__dirname, matchedFile),
            currentVersion,
            requiredVersion: plugin.minVersion
          });
        }
      }
    }
  }

  if (outdatedPlugins.length > 0) {
    console.log('\n❗ The following plugins are outdated:');
    outdatedPlugins.forEach(p => {
      console.log(` ❌ - ${p.name} (Current: ${p.currentVersion}, Required: ${p.requiredVersion})`);
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('\nAre you sure you want to continue without updating these plugins? (y/n): ', answer => {
      if (answer.toLowerCase() !== 'y') {
        console.log('\n❌ Build cancelled due to outdated plugins.');
        process.exit(1);
      } else {
        console.log('\n✅ Continuing build...');
        rl.close();
      }
    });
  } else {
    console.log('✅ All plugin versions are up to date.');
  }
}

// Run the validation
checkPlugins();




// Check all the codeplays plugins version START