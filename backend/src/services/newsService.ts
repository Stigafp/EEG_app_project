import Parser from "rss-parser";
import { NEWS_SOURCES } from "./newsSources";
import { NewsArticle } from "../types/article";

const parser = new Parser({
    customFields: {
        item:[
            ["media:content", "mediaContent"],
            ["media:thumbnail", "mediaThumbnail"],
        ],
    },
});

function cleanText(value?: string){
    return value
      ?.replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
}

function extractImage(item:any): string | undefined{
    return (
        item.enclosure?.url ||
        item.mediaContent?.$?.url ||
        item.mediaThumbnail?.$?.url
    );
}

async function fetchSourceArticles(
    source: (typeof NEWS_SOURCES)[number]
): Promise<NewsArticle[]> {
    const feed = await parser.parseURL(source.url);

    return feed.items.map(item => ({
        source: source.name,
        title: cleanText(item.title) || "Untitled",
        summary:
          cleanText(item.contentSnippet) ||
          cleanText(item.content) ||
          cleanText(item.content) ||
          "",
        image: extractImage(item),
        url: item.link || "",
        publishedDate: item.isoDate || item.pubDate || undefined,
    }));
}

export async function getNewsArticles(): Promise<NewsArticle[]> {
    const results = await Promise.allSettled(
        NEWS_SOURCES.map(source => fetchSourceArticles(source))
    );

    return results
        .flatMap(result => (result.status === "fulfilled" ? result.value: []))
        .filter(article => article.title && article.url)
        .sort((a,b) => {
            const dateA = a.publishedDate
              ? new Date(a.publishedDate).getTime()
              : 0;

            const dateB = b.publishedDate
              ? new Date(b.publishedDate).getTime()
              : 0;

            return dateB - dateA;
    });
}