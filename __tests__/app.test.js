const request = require("supertest");
const app = require("../app.js");
const connection = require("../db/connection.js");
const apiEndpoints = require("../endpoints.json");

afterAll(() => connection.end());

describe("/api", () => {
  test("GET - status: 200 - responds with object detailing every api endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        const { endpoints } = response.body;
        expect(endpoints).toEqual(apiEndpoints);
      });
  });
});

describe("/api/topics", () => {
  test("GET - status: 200 - responds with array of topic objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        const { topics } = response.body;
        topics.forEach((topic) => {
          expect(topic).toHaveProperty("slug", expect.any(String));
          expect(topic).toHaveProperty("description", expect.any(String));
        });
      });
  });
});

describe("ARTICLES", () => {
  describe("/api/articles", () => {
    test("GET - status 200 - responds list of articles sorted date descending", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then((response) => {
          const { articles } = response.body;
          // assert that we actually got articles
          expect(articles.length > 0).toBe(true);
          articles.forEach((article) => {
            expect(article).toHaveProperty("article_id", expect.any(Number));
            expect(article).toHaveProperty("author", expect.any(String));
            expect(article).toHaveProperty("title", expect.any(String));
            expect(article).toHaveProperty("topic", expect.any(String));
            expect(article).toHaveProperty("created_at", expect.any(String));
            expect(article).toHaveProperty("votes", expect.any(Number));
            expect(article).toHaveProperty(
              "article_img_url",
              expect.any(String)
            );
            expect(article).toHaveProperty("comment_count", expect.any(String));
            // article shouldn't have body
            expect(typeof article.body).toBe("undefined");
          });
          expect(articles).toBeSortedBy("created_at", {
            // check sorting descending
            compare: (a, b) => new Date(b).getTime() - new Date(a).getTime(),
          });
        });
    });
    test("GET - status: 200 - returns empty array for topic that doesnt exist", () => {
      return request(app)
        .get("/api/articles?topic=nonsense")
        .expect(200)
        .then((response) => {
          const { articles } = response.body;
          expect(articles).toHaveLength(0);
        });
    });
    test("GET - status: 200 - returns items sorted by query", () => {
      return request(app)
        .get("/api/articles?sort_by=votes")
        .expect(200)
        .then((response) => {
          const { articles } = response.body;
          expect(articles).toBeSortedBy("votes", {
            descending: true,
          });
        });
    });
    test("GET - status: 200 - filters out results on topic", () => {
      return request(app)
        .get("/api/articles?topic=mitch")
        .expect(200)
        .then((response) => {
          const { articles } = response.body;
          // 11 mitch articles
          expect(articles).toHaveLength(11);
          articles.forEach((article) => {
            expect(article).toHaveProperty("topic", "mitch");
          });
        });
    });
    test("GET - status: 200 - order query works", () => {
      return request(app)
        .get("/api/articles?order=asc")
        .then((response) => {
          const { articles } = response.body;
          expect(articles).toBeSortedBy("created_at", {
            descending: false,
            compare: (a, b) => new Date(a).getTime() - new Date(b).getTime(),
          });
        });
    });
    test("GET - status: 200 - multiple queries work together", () => {
      return request(app)
        .get("/api/articles?topic=mitch&sort_by=votes&order=asc")
        .expect(200)
        .then((response) => {
          const { articles } = response.body;
          expect(articles).toHaveLength(11);
          expect(articles).toBeSortedBy("votes", { descending: false });
        });
    });
    test("GET - status: 400 - order query is not a valid input(asc/desc)", () => {
      return request(app)
        .get("/api/articles?order=back")
        .expect(400)
        .then((response) => {
          const { message } = response.body;
          expect(message).toBe("Bad Request: Invalid input");
        });
    });
    test("GET - status: 400 - sort_by query is not a valid column", () => {
      return request(app)
        .get("/api/articles?sort_by=nonsense")
        .expect(400)
        .then((response) => {
          const { message } = response.body;
          expect(message).toBe("Bad Request: Invalid input");
        });
    });
  });
  describe("/api/articles/:article_id", () => {
    test("GET - status: 200 - responds with article object with correct keys", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then((response) => {
          const { article } = response.body;
          // article id from get request
          expect(article).toHaveProperty("article_id", 1);
          expect(article).toHaveProperty("author", expect.any(String));
          expect(article).toHaveProperty("title", expect.any(String));
          expect(article).toHaveProperty("body", expect.any(String));
          expect(article).toHaveProperty("topic", expect.any(String));
          expect(article).toHaveProperty("created_at", expect.any(String));
          expect(article).toHaveProperty("votes", expect.any(Number));
          expect(article).toHaveProperty("article_img_url", expect.any(String));
        });
    });
    test("GET - status: 400 - responds with error if user provides invalid id type", () => {
      return request(app)
        .get("/api/articles/nonsense")
        .expect(400)
        .then((response) => {
          const { message } = response.body;
          expect(message).toBe("Bad Request: Invalid input");
        });
    });
    test("GET - status: 404 - responds with 404 if article_id does not exist", () => {
      return request(app)
        .get("/api/articles/150123")
        .expect(404)
        .then((response) => {
          const { message } = response.body;
          expect(message).toBe("Not Found: Article 150123 does not exist");
        });
    });
  });

  describe("/api/articles/:article_id/comments", () => {
    test("GET - status: 200 - responds with list of comments for article, ordered date descending", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then((response) => {
          const { comments } = response.body;
          comments.forEach((comment) => {
            expect(comment).toHaveProperty("comment_id", expect.any(Number));
            expect(comment).toHaveProperty("votes", expect.any(Number));
            expect(comment).toHaveProperty("created_at", expect.any(String));
            expect(comment).toHaveProperty("body", expect.any(String));
            // we are checking article 1
            expect(comment).toHaveProperty("article_id", 1);
          });
          expect(comments).toBeSortedBy("created_at", {
            descending: true,
            compare: (a, b) => new Date(a).getTime() - new Date(b).getTime(),
          });
        });
    });
    test("GET - status: 400 - invalid article id (anything NAN) given", () => {
      return request(app)
        .get("/api/articles/invalidId/comments")
        .expect(400)
        .then((response) => {
          const { message } = response.body;
          expect(message).toBe("Bad Request: Invalid input");
        });
    });
    test("GET - status: 404 - article_id is not found", () => {
      return request(app)
        .get("/api/articles/1011290/comments")
        .expect(404)
        .then((response) => {
          const { message } = response.body;
          expect(message).toBe("Not Found: Article 1011290 does not exist");
        });
    });
  });
});
