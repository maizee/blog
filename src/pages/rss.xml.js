import rss from "@astrojs/rss";
import { SITE_TITLE, SITE_DESCRIPTION, SITE_URL } from "../consts.js";

export async function GET(context) {
  const postModules = import.meta.glob("./posts/*.md");
  const items = await Promise.all(
    Object.values(postModules).map(async (loadPost) => {
      const post = await loadPost();
      const { frontmatter, url, compiledContent } = post;
      const coverUrl = frontmatter.cover?.url?.trim();
      const content = await compiledContent();
      const coverHtml = coverUrl
        ? `<p><img src="${coverUrl}" alt="${frontmatter.title}" /></p>`
        : "";

      return {
        title: frontmatter.title,
        description: frontmatter.description,
        pubDate: frontmatter.pubDate,
        link: url,
        author: frontmatter.author,
        categories: frontmatter.tags,
        content: `${coverHtml}${content}`,
      };
    }),
  );

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site ?? SITE_URL,
    items: items.sort((a, b) => Date.parse(b.pubDate) - Date.parse(a.pubDate)),
    customData: `<language>zh-cn</language>`,
  });
}
