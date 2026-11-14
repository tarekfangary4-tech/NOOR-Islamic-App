
const fs = require("fs");

const files = [
    "index.html",
    "manifest.json",
    "service-worker.js"
];

fs.mkdirSync("www", { recursive: true });

for (const file of files) {
    if (!fs.existsSync(file)) {
        throw new Error(`Missing file: ${file}`);
    }

    fs.copyFileSync(file, `www/${file}`);
}

for (const folder of ["css", "js", "assets"]) {
    if (fs.existsSync(folder)) {
        fs.cpSync(folder, `www/${folder}`, {
            recursive: true
        });
    }
}

console.log("NOOR application prepared successfully!");
