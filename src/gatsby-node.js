const { convertArrayToCSV } = require('convert-array-to-csv');
const fs = require('fs');
const cheerio = require('cheerio');
const rimraf = require('rimraf');

const templateMap = new Map();

function onPostBuild(postBuild) {
    console.log("Generating SEO Export");
    const nodes = postBuild.getNodesByType("SitePage");
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (!fs.existsSync(`public${node.path}/index.html`)) {
            continue; // Skip virtual page
        }
        const fileContents = fs.readFileSync(`public${node.path}/index.html`)
        const $ = cheerio.load(fileContents);

        const pageList = templateMap.get(node.componentChunkName) || [];
        pageList.push({
            path: node.path,
            title: $("title").contents().text(),
            description: $("meta[name='description']").attr("content")
        });
        templateMap.set(node.componentChunkName, pageList);
    }
    if (fs.existsSync('seo-export/')) { 
        rimraf.sync('seo-export');    
    }
    fs.mkdirSync('seo-export');
    for (const [component, list] of templateMap.entries()) {
        list.sort((a, b) => a.path.localeCompare(b.path));
        const csv = convertArrayToCSV(list);
        fs.writeFileSync(`seo-export/${component}.csv`, csv);
    }
}

exports.onPostBuild = onPostBuild;
