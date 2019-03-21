# gatsby-plugin-seo-export

Extracts common SEO tags from pages, and creates csv files for each template containing the path alongside the SEO tags.

## Usage

Install the plugin:
```bash
npm i gatsby-plugin-seo-export
```

Add it to your `gatsby-config.js`
```js
plugins: [
  {
      resolve: `@clipchamp/gatsby-plugin-seo-export`,
  },
]
```

Create a script in your `package.json` that sets the `SEO_EXPORT` environment variable to true
```js
"scripts": {
    "seo": "SEO_EXPORT=true npm run build"
}
```
