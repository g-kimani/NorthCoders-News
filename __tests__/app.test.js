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
          expect(message).toBe("Bad Request: Article ID must be a number!");
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
});

describe("POST /api/articles/:article_id/comments", () => {
  test("POST - status: 201 - responds with posted comment", () => {
    const sendComment = {
      username: "butter_bridge",
      body: "I am a test comment",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(sendComment)
      .expect(201)
      .then((response) => {
        const { comment } = response.body;
        console.log(comment);
        expect(comment).toHaveProperty("comment_id", 19);
        expect(comment).toHaveProperty("votes", 0);
        expect(comment).toHaveProperty("created_at", expect.any(String));
        expect(comment).toHaveProperty("body", "I am a test comment");
        expect(comment).toHaveProperty("author", "butter_bridge");
      });
  });
  test("POST - status: 400 - error if username does not exist", () => {
    const sendComment = {
      username: 13123,
      body: "I am a body",
    };
    return request(app)
      .post("/api/articles/adasds/comments")
      .send(sendComment)
      .expect(400)
      .then((response) => {
        const { message } = response.body;
        expect(message).toBe("Bad Request: User does not exist");
      });
  });
});
