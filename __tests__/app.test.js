const request = require("supertest");
const app = require("../app.js");
const connection = require("../db/connection.js");

afterAll(() => connection.end());

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
