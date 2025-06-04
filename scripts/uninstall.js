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

process.stdout.write("🚀 Uninstalling: Removing old and copied files...\n");

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
removeDirectory(path.join(projectRoot, "splashxml")); // Remove old splashxml folder

// Step 1: Find all matching files in the project directory
const filePatternsToRemove = [
    /^add-splash-screen-.*$/, 
    /^setSplashAnimation-.*$/, 
    /^codeplayBeforeBuild-.*$/, 
    /^modify-plugin-xml\.xml$/, 
    /^finalrelease.*$/, 
    /^iap-install-\d+(\.\d+)?\.js$/,
    /^\.env\.storeid[1-7]$/, 
    /^modify-plugin-xml\.js$/
];

const filesInProject = fs.readdirSync(projectRoot);

filesInProject.forEach(file => {
    if (filePatternsToRemove.some(pattern => pattern.test(file))) {
        const filePath = path.join(projectRoot, file);
        try {
            fs.unlinkSync(filePath);
            process.stdout.write(`🗑️ Removed file: ${filePath}\n`);
        } catch (error) {
            process.stderr.write(`⚠️ Failed to remove ${filePath}: ${error.message}\n`);
        }
    }
});

// Remove files listed in commonBuildPath
if (fs.existsSync(commonBuildPath)) {
    fs.readdirSync(commonBuildPath).forEach(file => {
        const destPath = path.join(projectRoot, file);
        if (fs.existsSync(destPath)) {
            try {
                fs.unlinkSync(destPath);
                process.stdout.write(`🗑️ Removed file: ${destPath}\n`);
            } catch (error) {
                process.stderr.write(`⚠️ Failed to remove ${destPath}: ${error.message}\n`);
            }
        }
    });
}

process.stdout.write("✅ Uninstall cleanup complete!\n");
