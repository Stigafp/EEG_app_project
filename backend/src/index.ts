import express from "express";
import cors from "cors";
import { getNewsArticles } from "../src/services/newsService";

const app = express();
app.use(cors());

const PORT = 3000;

app.get("/api/news", async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 8);

    const articles = await getNewsArticles();

    const start = (page - 1) * limit;
    const end = start + limit;

    res.json({
      articles: articles.slice(start, end),
      page,
      hasMore: end < articles.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});