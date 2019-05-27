const { convertArrayToCSV } = require("convert-array-to-csv");
const fs = require("fs-extra");
const cheerio = require("cheerio");
const rimraf = require("rimraf");

const templateMap = new Map();

async function onPostBuild(postBuild) {
  if (process.env.SEO_EXPORT) {
    console.log("Generating SEO Export");
    const promises = postBuild
      .getNodesByType("SitePage")
      .filter(node =>
        fs.existsSync(`public${node.path}/index.html`.replace("//", "/"))
      )
      .map(node => async () => {
        const fileContents = await fs.readFile(
          `public${node.path}/index.html`.replace("//", "/")
        );
        const $ = cheerio.load(fileContents);

        const pageList = templateMap.get(node.componentChunkName) || [];
        pageList.push({
          path: node.path,
          title: $("head > title")
            .contents()
            .text(),
          description: $("meta[name='description']").attr("content"),
          keywords: $("meta[name='keywords']").attr("content")
        });
        templateMap.set(node.componentChunkName, pageList);
      });

    const worker = async () => {
      let a;
      do {
        a = promises.pop();
        if (a) {
          await a();
        }
      } while (a);
    };

    await Promise.all(Array.from({ length: 10 }).map(worker));

    if (fs.existsSync("seo-export/")) {
      rimraf.sync("seo-export");
    }
    fs.mkdirSync("seo-export");
    for (const [component, list] of templateMap.entries()) {
      list.sort((a, b) => a.path.localeCompare(b.path));
      const csv = convertArrayToCSV(list);
      fs.writeFileSync(`seo-export/${component.replace('component---', '')}.csv`, csv);
    }
  }
}

exports.onPostBuild = onPostBuild;
