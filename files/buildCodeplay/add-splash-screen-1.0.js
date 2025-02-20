const fs = require("fs");
const path = require("path");

// Define file paths
const projectFolder = path.resolve(".");
const sourceSplashIcon = path.join(projectFolder, "resources", "splash_icon.png");
const destinationSplashIcon = path.join(
  projectFolder,
  "android",
  "app",
  "src",
  "main",
  "res",
  "drawable-nodpi",
  "splash_icon.png"
);
const sourceSplashXML = path.join(projectFolder, "splashxml", "codeplay_splashScreen.xml");
const destinationSplashXML = path.join(
  projectFolder,
  "android",
  "app",
  "src",
  "main",
  "res",
  "values",
  "codeplay_splashScreen.xml"
);
const androidManifestPath = path.join(
  projectFolder,
  "android",
  "app",
  "src",
  "main",
  "AndroidManifest.xml"
);

// Helper function to copy files
function copyFile(source, destination) {
  if (!fs.existsSync(source)) {
    throw new Error(`Source file not found: ${source}`);
  }
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
  console.log(`Copied: ${source} -> ${destination}`);
}

// Helper function to update AndroidManifest.xml
function updateAndroidManifest() {
  if (!fs.existsSync(androidManifestPath)) {
    throw new Error(`AndroidManifest.xml not found: ${androidManifestPath}`);
  }

  let manifestContent = fs.readFileSync(androidManifestPath, "utf-8");

  // Replace the android:theme attribute in the <activity> tag
  manifestContent = manifestContent.replace(
    /<activity[^>]*android:theme="[^"]*"/,
    (match) => {
      return match.replace(/android:theme="[^"]*"/, 'android:theme="@style/Theme.Codeplay.SplashScreen"');
    }
  );

  fs.writeFileSync(androidManifestPath, manifestContent, "utf-8");
  console.log(`Updated AndroidManifest.xml with new theme.`);
}

// Perform the tasks
try {
  console.log("Starting splash screen setup...");
  copyFile(sourceSplashIcon, destinationSplashIcon);
  copyFile(sourceSplashXML, destinationSplashXML);
  updateAndroidManifest();
  console.log("Splash screen setup completed.");
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
