const { convertArrayToCSV } = require("convert-array-to-csv");
const fs = require("fs");
const cheerio = require("cheerio");
const rimraf = require("rimraf");

const templateMap = new Map();

function onPostBuild(postBuild) {
  if (process.env.SEO_EXPORT) {
    console.log("Generating SEO Export");
    Promise.all(
      postBuild
        .getNodesByType("SitePage")
        .filter(node => fs.existsSync(`public${node.path}/index.html`))
        .map(async node => {
          const fileContents = await new Promise((resolve, reject) => {
            fs.readFile(`public${node.path}/index.html`, (errors, data) => {
              if (errors) {
                reject(errors);
              }
              resolve(data);
            });
          });
          const $ = cheerio.load(fileContents);

          const pageList = templateMap.get(node.componentChunkName) || [];
          pageList.push({
            path: node.path,
            title: $("title")
              .contents()
              .text(),
            description: $("meta[name='description']").attr("content")
          });
          templateMap.set(node.componentChunkName, pageList);
        })
    ).then(() => {
      if (fs.existsSync("seo-export/")) {
        rimraf.sync("seo-export");
      }
      fs.mkdirSync("seo-export");
      for (const [component, list] of templateMap.entries()) {
        list.sort((a, b) => a.path.localeCompare(b.path));
        const csv = convertArrayToCSV(list);
        fs.writeFileSync(`seo-export/${component}.csv`, csv);
      }
    });
  }
}

exports.onPostBuild = onPostBuild;
