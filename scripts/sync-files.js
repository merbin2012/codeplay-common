const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "../../../"); // Your project's root
const commonBuildPath = path.join(__dirname, "../files"); // Path to common files
const buildCodeplayPath = path.join(commonBuildPath, "buildCodeplay"); // Correct path
const packageJsonPath = path.join(projectRoot, "package.json");

// Ensure package.json exists
if (!fs.existsSync(packageJsonPath)) {
    process.stderr.write("❌ package.json not found!\n");
    process.exit(1);
}

function copyFolderSync(source, destination) {
    try {
        fs.cpSync(source, destination, { recursive: true });
        process.stdout.write(`✅ Copied folder: ${source} -> ${destination}\n`);
    } catch (error) {
        process.stderr.write(`⚠️ Failed to copy folder: ${source} - ${error.message}\n`);
    }
}

// Copy all files from `common-build-files/files/` to the project root
fs.readdirSync(commonBuildPath).forEach(file => {
    const sourcePath = path.join(commonBuildPath, file);
    const destPath = path.join(projectRoot, file);

    if (fs.statSync(sourcePath).isDirectory()) {
        copyFolderSync(sourcePath, destPath);
    } else {
        try {
            fs.copyFileSync(sourcePath, destPath);
            process.stdout.write(`✅ Copied file: ${file}\n`);
        } catch (error) {
            process.stderr.write(`⚠️ Failed to copy file: ${file} - ${error.message}\n`);
        }
    }
});

// Function to get the latest versioned file from files/buildCodeplay
function getLatestFile(prefix) {
    if (!fs.existsSync(buildCodeplayPath)) return null; // Ensure directory exists

    const files = fs.readdirSync(buildCodeplayPath).filter(file => file.startsWith(prefix));
    if (files.length === 0) return null;
    files.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
    return files[0];
}

// Detect latest script versions
const latestSplashScreen = getLatestFile("add-splash-screen-");
const latestSplashAnimation = getLatestFile("setSplashAnimation-");
const latestCodeplayBuild = getLatestFile("codeplayBeforeBuild-");

// Update package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

// Ensure scripts object exists
packageJson.scripts = packageJson.scripts || {};

// Update or add necessary scripts
if (latestCodeplayBuild) {
    packageJson.scripts["build"] = `node buildCodeplay/${latestCodeplayBuild} && cross-env NODE_ENV=production vite build`;
}
if (latestSplashScreen && latestSplashAnimation) {
    packageJson.scripts["capacitor:sync:after"] = `node buildCodeplay/${latestSplashScreen} && node buildCodeplay/${latestSplashAnimation}`;
}

packageJson.scripts["ionic:build"] = "npm run build";
packageJson.scripts["ionic:serve"] = "npm run start";
packageJson.scripts["build:storeid1"] = "vite build --mode storeid1";
packageJson.scripts["build:storeid2"] = "vite build --mode storeid2";
packageJson.scripts["build:storeid7"] = "vite build --mode storeid7";

// Save changes
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), "utf8");
process.stdout.write("✅ package.json updated!\n");
