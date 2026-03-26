import { defineConfig } from "astro/config";
import { visit } from "unist-util-visit";
import md5 from "md5";
import sitemap from "@astrojs/sitemap";

import { SITE_URL } from "./src/consts";

function createImageFigure(src, rawAlt) {
  let sign = md5(src);
  let data = (rawAlt || "").split("|");
  let alt = data[0];
  let size = "big";
  let isWebp = /\.webp($|\?)/i.test(src);

  if (data.length > 1 && data[1]) {
    size = data[1];
  }

  let classes = ["image component image-fullbleed body-copy-wide nr-scroll-animation nr-scroll-animation--on"];
  classes.push(`image-${size}`);
  if (isWebp) {
    classes.push("image-webp");
  }

  return {
    type: "element",
    tagName: "figure",
    properties: { className: classes },
    children: [
      {
        type: "element",
        tagName: "div",
        properties: { className: ["component-content"] },
        children: [
          {
            type: "element",
            tagName: "div",
            properties: { className: ["image-sharesheet"] },
            children: [
              {
                type: "element",
                tagName: "div",
                properties: { className: [`image image-load image-asset image-${sign}`], id: `lht${sign}` },
                children: [
                  {
                    type: "element",
                    tagName: "picture",
                    properties: { className: ["picture"] },
                    children: [
                      {
                        type: "element",
                        tagName: "img",
                        properties: {
                          "data-src": src,
                          alt,
                          className: ["picture-image"],
                          loading: "lazy",
                          decoding: "async",
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "element",
            tagName: "div",
            properties: { className: ["image-description"] },
            children: [
              {
                type: "element",
                tagName: "div",
                properties: { className: ["image-caption"] },
                children: [
                  {
                    type: "text",
                    value: alt,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
}

function pipeline() {
  return [
    () => (tree) => {
      visit(tree, "element", (node, index) => {
        if (node.tagName === "p" && node.children[0].tagName === "img") {
          let img = node.children[0];
          let figure = createImageFigure(img.properties.src, img.properties.alt);
          node.tagName = figure.tagName;
          node.properties = figure.properties;
          node.children = figure.children;
        }
      });
    },

    () => (tree) => {
      tree.children.forEach((node) => {
        if (node.type === "raw") {
          let match = node.value.match(/^\s*<img\s+[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>\s*$/i)
            || node.value.match(/^\s*<img\s+[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']+)["'][^>]*>\s*$/i);

          if (match) {
            const src = node.value.indexOf('src=') < node.value.indexOf('alt=') ? match[1] : match[2];
            const alt = node.value.indexOf('src=') < node.value.indexOf('alt=') ? match[2] : match[1];
            Object.assign(node, createImageFigure(src, alt));
            return;
          }

          node.value = `<div class="pagebody code component"><div class="component-content code"> ${node.value} </div></div>`;
          // node.value = node.value.replace(/astro-code/g, 'astro-code')
        }
      });
    },

    () => (tree) => {
      for (let i = 0; i < tree.children.length; i++) {
        let node = tree.children[i];
        if (node.type === "element" && ["p", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "blockquote"].includes(node.tagName)) {
          let next = tree.children[i + 1];
          let nodes = [node];
          while (next && !["figure"].includes(next.tagName) && next.type != "raw") {
            nodes.push(next);
            next = tree.children[tree.children.indexOf(next) + 1];
          }

          if (nodes.length > 1) {
            // rename label
            nodes.forEach((node) => {
              if (node.tagName === "p") {
                node.properties.className = ["pagebody-copy"];
                node.tagName = "div";
              }
              if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(node.tagName)) {
                node.properties.className = ["pagebody-header"];
              }
            });

            tree.children.splice(i, nodes.length, {
              type: "element",
              tagName: "div",
              properties: { className: ["pagebody  text component"] },
              children: [
                {
                  type: "element",
                  tagName: "div",
                  properties: { className: ["component-content"] },
                  children: nodes,
                },
              ],
            });
          }
        }
      }
    },
    () => (tree) => {
      let len = tree.children.length;
      for (let index = 0; index < len; index++) {
        let node = tree.children[index];
        if (node.type === "element" && node.tagName === "figure") {
          tree.children.splice(index, 0, {
            type: "element",
            tagName: "div",
            properties: { className: ["tertiarynav component"] },
            children: [
              {
                type: "element",
                tagName: "div",
                properties: { className: ["component-content"] },
              },
            ],
          });
          index++;
        }
      }
    },
  ];
}

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  markdown: {
    rehypePlugins: pipeline(),
    syntaxHighlight: "prism",
  },
  integrations: [sitemap()],
});
