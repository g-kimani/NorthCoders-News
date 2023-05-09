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
          const { slug, description } = topic;
          expect(typeof slug).toBe("string");
          expect(typeof description).toBe("string");
        });
      });
  });
});
