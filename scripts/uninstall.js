// Define file prefixes to delete
const filePrefixes = [
						"add-splash-screen",
						"setSplashAnimation",
						"codeplayBeforeBuild",
						"finalrelease"
					 ];







const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "../../../"); // Project root
const commonBuildPath = path.join(__dirname, "../files"); // Path where files were copied from




const splashXmlPath = path.join(projectRoot, "buildCodeplay"); // Path to splashxml folder



process.stdout.write("🚀 Uninstalling: Removing old and copied files...");



const removeDirectory = (dirPath) => {
    if (fs.existsSync(dirPath)) {
        fs.readdirSync(dirPath).forEach(file => {
            const currentPath = path.join(dirPath, file);
            if (fs.lstatSync(currentPath).isDirectory()) {
                removeDirectory(currentPath);
            } else {
                fs.unlinkSync(currentPath);
            }
        });
        fs.rmdirSync(dirPath);
        process.stdout.write(`🗑️ Removed folder: ${dirPath}\n`);
    }
};

removeDirectory(splashXmlPath);




// Helper function to extract version from filename
const extractVersion = (filename) => {
    const match = filename.match(/-(\d+\.\d+)\.js$/);
    return match ? parseFloat(match[1]) : null;
};

// Helper function to get base name without version
const getBaseName = (filename) => filename.replace(/-\d+\.\d+\.js$/, "");

// Step 1: Find all versioned files in the project directory
const filesInProject = fs.readdirSync(projectRoot)
    .filter(file => file.match(/(add-splash-screen-|setSplashAnimation-|codeplayBeforeBuild-)-\d+\.\d+\.js/));

const latestVersions = {};

// Step 2: Determine the latest version for each file type
filesInProject.forEach(file => {
    const baseName = getBaseName(file);
    const version = extractVersion(file);

    if (version !== null) {
        if (!latestVersions[baseName] || version > latestVersions[baseName].version) {
            latestVersions[baseName] = { file, version };
        }
    }
});




// Step 1: Find all matching files in the project directory
const filesInProject1 = fs.readdirSync(projectRoot)
    .filter(file => filePrefixes.some(prefix => file.startsWith(prefix)));

filesInProject1.forEach(file => {
    const filePath = path.join(projectRoot, file);
    try {
        fs.unlinkSync(filePath);
        process.stdout.write(`🗑️ Removed file: ${filePath}`);
    } catch (error) {
        process.stderr.write(`⚠️ Failed to remove ${filePath}: ${error.message}`);
    }
});





// Remove files listed in commonBuildPath
if (fs.existsSync(commonBuildPath)) {
    fs.readdirSync(commonBuildPath).forEach(file => {
        const destPath = path.join(projectRoot, file);
        if (fs.existsSync(destPath)) {
            try {
                fs.unlinkSync(destPath);
                process.stdout.write(`🗑️ Removed file: ${destPath}`);
            } catch (error) {
                process.stderr.write(`⚠️ Failed to remove ${destPath}: ${error.message}`);
            }
        }
    });
}

process.stdout.write("✅ Uninstall cleanup complete!");
