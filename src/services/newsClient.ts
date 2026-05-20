import { NewsArticle } from "../type/article";

export type NewsResponse ={
    articles: NewsArticle[];
    page:number;
    limit: number;
    hasMore: boolean;
};

// INPUT YOUR OWN IP ADDRESS HERE
const API_BASE_URL = "XXXXXXXXXXXX";

export async function getNewsArticles(
    page: number = 1, 
    limit: number = 8
): Promise<NewsResponse> {
    const response = await fetch(
        `${API_BASE_URL}/api/news?page=${page}&limit=${limit}`
    );

    if(!response.ok){
        throw new Error("Kunne ikke hente nyheder");
    }
    return response.json();
}