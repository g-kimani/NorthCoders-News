\c nc_news_test

SELECT articles.*, COUNT(comment_id) AS comment_count
FROM articles
JOIN comments ON comments.article_id = articles.article_id
GROUP BY articles.article_id
ORDER BY articles.created_at DESC;