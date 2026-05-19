const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.js')) results.push(file);
        }
    });
    return results;
}

const files = walk('./src');
files.forEach(file => {
    try {
        require(path.resolve(file));
        console.log(`OK: ${file}`);
    } catch (err) {
        console.error(`FAIL: ${file}`);
        console.error(err);
        process.exit(1);
    }
});
