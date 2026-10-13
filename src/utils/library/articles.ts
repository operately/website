interface OrderedArticle {
  id: string;
  data: {
    published: boolean;
    order: number;
  };
}

export function visibleArticles<T extends OrderedArticle>(
  articles: readonly T[],
  { includeDrafts = false }: { includeDrafts?: boolean } = {},
): T[] {
  return articles
    .filter((article) => article.data.published || includeDrafts)
    .sort((a, b) => a.data.order - b.data.order || a.id.localeCompare(b.id));
}
