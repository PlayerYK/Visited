const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

// 读取 manifest.json
const manifest = JSON.parse(fs.readFileSync('./dist/manifest.json', 'utf8'));
const name = manifest.name.replace(/\s+/g, '_').toLowerCase();
const version = manifest.version;
const outputFile = `${name}-${version}.zip`;

// 创建一个新的 ZIP 文件
const zip = new AdmZip();

// 添加 dist 目录下的所有文件
const distPath = path.resolve('dist');
function addFilesToZip(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
            addFilesToZip(filePath);
        } else {
            const zipPath = path.relative(distPath, filePath);
            zip.addLocalFile(filePath, path.dirname(zipPath));
        }
    }
}

addFilesToZip(distPath);

// 将 ZIP 文件写入磁盘
zip.writeZip(outputFile);

console.log(`扩展已打包: ${outputFile}`);
