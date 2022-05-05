// 11ty Plugins
const socialImages = require("@11tyrocks/eleventy-plugin-social-images");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginRss = require("@11ty/eleventy-plugin-rss");

// Helper packages
const slugify = require("slugify");
// Local utilities/data
const packageVersion = require("./package.json").version;

const defaults = {
  height: 500,
  theme: 'light',
  tabs: 'result',
  user: 'Soon',
  title: 'Unknown Pen',
  preview: false,
  editable: false
};

module.exports = function (eleventyConfig) {
  eleventyConfig.addPlugin(socialImages);
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(pluginRss);

  eleventyConfig.addWatchTarget("./src/sass/");

  eleventyConfig.addPassthroughCopy("./src/css");
  eleventyConfig.addPassthroughCopy("./src/fonts");
  eleventyConfig.addPassthroughCopy("./src/img");
  eleventyConfig.addPassthroughCopy("./src/favicon.png");

  eleventyConfig.addShortcode("year", () => `${new Date().getFullYear()}`);
  eleventyConfig.addShortcode("packageVersion", () => `v${packageVersion}`);

  eleventyConfig.addCollection("tagList", (collection) => {
    let tagSet = new Set();
    collection.getAll().forEach(function(item) {
      if( "tags" in item.data ) {
        let tags = item.data.tags;
        if( typeof tags === "string" ) {
          tags = [tags];
        }

        for (const tag of tags) {
          tagSet.add(tag);
        }
      }
    });
    return [...tagSet].sort();
  });

  eleventyConfig.addFilter("slug", (str) => {
    if (!str) {
      return;
    }

    return slugify(str, {
      lower: true,
      strict: true,
      remove: /["]/g,
    });
  
  });

  eleventyConfig.addShortcode("codepen_js", () => {
    return `<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>`;
  });

  eleventyConfig.addShortcode("codepen", (slug, config) => {
    let options = { ...defaults };

    // Log error if slug is missing. Returns an HTML command for debugging reasons.
    if (!slug) {
      console.error('ERROR: CodePen embed is missing required attribute "slug"');
      return `<!-- Error: CodePen embed is missing required attribute "slug" -->`;
    }

    // check if slug is a full URL
    if (slug.substr(0, 4) == 'http' || slug.substr(0, 7) == 'codepen') {
      let p = slug.split('/');
      slug = p[p.length - 1];
    }

    // parse the inline config options
    if (config) {
      config.split(';').map(opt => {
        let parts = opt.split(':');
        options[parts[0]] = parts[1];
      });
    }
    // Return the embed code
    return `<p data-height="${options.height}" data-theme-id="${options.theme}" data-slug-hash="${slug}" data-default-tab="${options.tabs}" data-user="${options.user}" data-embed-version="2" data-pen-title="${options.title}" data-preview="${options.preview}" data-editable="${options.editable}" data-active-tab-color="#7257FA" data-active-link-color="#FFFFFF" class="codepen" style="height: ${options.height}px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">See the Pen <a href="https://codepen.io/${options.user}/pen/${slug}/">${options.title}</a> on <a href="https://codepen.io">CodePen</a>.</p>`
  });


  return {
    passthroughFileCopy: true,
    dir: {
      input: "src",
      output: "public",
      layouts: "_layouts",
    },
  };
};
