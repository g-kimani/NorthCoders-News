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
          // test data has 12
          expect(articles).toHaveLength(12);
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
            expect(article).toHaveProperty("comment_count", expect.any(Number));
            // article shouldn't have body
            expect(typeof article.body).toBe("undefined");
          });
          expect(articles).toBeSortedBy("created_at", {
            // check sorting descending
            compare: (a, b) => new Date(b).getTime() - new Date(a).getTime(),
          });
        });
    });
    test("GET - status: 404 - returns 404 for topic that doesnt exist", () => {
      return request(app)
        .get("/api/articles?topic=nonsense")
        .expect(404)
        .then((response) => {
          const { message } = response.body;
          expect(message).toBe("404 Topic not found");
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
    test("GET - status: 200 - returns empty array if topic has no articles", () => {
      return request(app)
        .get("/api/articles?topic=test-topic")
        .expect(200)
        .then((response) => {
          const { articles } = response.body;
          expect(articles).toHaveLength(0);
          expect(articles).toEqual([]);
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
          expect(article).toHaveProperty("author", "butter_bridge");
          expect(article).toHaveProperty(
            "title",
            "Living in the shadow of a great man"
          );
          expect(article).toHaveProperty(
            "body",
            "I find this existence challenging"
          );
          expect(article).toHaveProperty("topic", "mitch");
          expect(article).toHaveProperty("created_at", expect.any(String));
          expect(article).toHaveProperty("votes", 100);
          expect(article).toHaveProperty(
            "article_img_url",
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
          );
          expect(article).toHaveProperty("comment_count", 11);
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
    test("GET - status: 200 - responds with empty array for article without comments", () => {
      return request(app)
        .get("/api/articles/4/comments")
        .expect(200)
        .then((response) => {
          const { comments } = response.body;
          expect(comments).toHaveLength(0);
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
        expect(comment).toHaveProperty("comment_id", 19);
        expect(comment).toHaveProperty("votes", 0);
        expect(comment).toHaveProperty("created_at", expect.any(String));
        expect(comment).toHaveProperty("body", "I am a test comment");
        expect(comment).toHaveProperty("author", "butter_bridge");
      });
  });
  test("POST - status: 400 - error if no username or body provided", () => {
    const sendComment = {
      username: "butter_bridge",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(sendComment)
      .expect(400)
      .then((response) => {
        const { message } = response.body;
        expect(message).toBe("Bad Request: Invalid input");
      });
  });
  test("POST - status: 404 - error if username does not exist", () => {
    const sendComment = {
      username: 13123,
      body: "I am a body",
    };
    return request(app)
      .post("/api/articles/10/comments")
      .send(sendComment)
      .expect(404)
      .then((response) => {
        const { message } = response.body;
        expect(message).toBe("404 Not Found");
      });
  });
  test("POST - status: 404 - error if article does not exist", () => {
    const sendComment = {
      username: "butter_bridge",
      body: "I am a body",
    };
    return request(app)
      .post("/api/articles/10001332/comments")
      .send(sendComment)
      .expect(404)
      .then((response) => {
        const { message } = response.body;
        expect(message).toBe("404 Not Found");
      });
  });
  test("POST - status: 400 - error if article_id is not a valid number", () => {
    const sendComment = {
      username: "butter_bridge",
      body: "I am a body",
    };
    return request(app)
      .post("/api/articles/nonsense/comments")
      .send(sendComment)
      .expect(400)
      .then((response) => {
        const { message } = response.body;
        expect(message).toBe("Bad Request: Invalid input");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("DELETE - status: 204 - responds with 204 when succesful and no content", () => {
    return request(app).delete("/api/comments/2").expect(204);
  });
  test("DELETE - status: 404 - comment_id cannot be found", () => {
    return request(app)
      .delete("/api/comments/123043290")
      .expect(404)
      .then((response) => {
        const { message } = response.body;
        expect(message).toBe("404: Not Found");
      });
  });
  test("DELETE - status: 400 - comment_id provided is not correct type number", () => {
    return request(app)
      .delete("/api/comments/nonsense")
      .expect(400)
      .then((response) => {
        const { message } = response.body;
        expect(message).toBe("Bad Request: Invalid input");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("PATCH - status: 200 - responds with updated article", () => {
    const patchRequest = {
      incVotes: 1,
    };
    return request(app)
      .patch("/api/articles/1")
      .send(patchRequest)
      .expect(200)
      .then((response) => {
        const { article } = response.body;
        expect(article).toHaveProperty("article_id", 1);
        expect(article).toHaveProperty("author", "butter_bridge");
        expect(article).toHaveProperty(
          "title",
          "Living in the shadow of a great man"
        );
        expect(article).toHaveProperty(
          "body",
          "I find this existence challenging"
        );
        expect(article).toHaveProperty("topic", "mitch");
        expect(article).toHaveProperty("created_at", expect.any(String));
        expect(article).toHaveProperty("votes", 101);
        expect(article).toHaveProperty(
          "article_img_url",
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        );
      });
  });
  test("PATCH - status: 200 - is able to decrement vote count", () => {
    const patchRequest = {
      incVotes: -5,
    };
    return request(app)
      .patch("/api/articles/1")
      .send(patchRequest)
      .expect(200)
      .then((response) => {
        const { article } = response.body;
        expect(article.votes).toBe(96);
      });
  });
  test("PATCH - status: 404 - article id does not exist", () => {
    const patchRequest = {
      incVotes: 1,
    };
    return request(app)
      .patch("/api/articles/101321312")
      .send(patchRequest)
      .expect(404)
      .then((response) => {
        const { message } = response.body;
        expect(message).toBe("Not Found: Article 101321312 does not exist");
      });
  });
  test("PATCH - status: 400 - article id is not a number", () => {
    const patchRequest = {
      incVotes: 1,
    };
    return request(app)
      .patch("/api/articles/nonsense")
      .send(patchRequest)
      .expect(400)
      .then((response) => {
        const { message } = response.body;
        expect(message).toBe("Bad Request: Invalid input");
      });
  });
  test("PATCH - status: 400 - incVotes is not a number", () => {
    const patchRequest = {
      incVotes: "nonsense",
    };
    return request(app)
      .patch("/api/articles/1")
      .send(patchRequest)
      .expect(400)
      .then((response) => {
        const { message } = response.body;
        expect(message).toBe("Bad Request: Invalid input");
      });
  });
});

describe("GET /api/users", () => {
  test("GET - status: 200 - Responds with array of users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((response) => {
        const { users } = response.body;
        expect(users.length > 0).toBe(true);
        users.forEach((user) => {
          expect(user).toHaveProperty("username", expect.any(String));
          expect(user).toHaveProperty("name", expect.any(String));
          expect(user).toHaveProperty("avatar_url", expect.any(String));
        });
      });
  });
});

describe("/api/users/:username", () => {
  test("GET - status: 200 - responds with an object with users details", () => {
    return request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then((response) => {
        const { user } = response.body;
        expect(user).toHaveProperty("username", "butter_bridge");
        expect(user).toHaveProperty("name", "jonny");
        expect(user).toHaveProperty(
          "avatar_url",
          "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg"
        );
      });
  });
  test("GET - status: 404 - responds with error if username not found", () => {
    return request(app)
      .get("/api/users/not-in-data")
      .expect(404)
      .then((response) => {
        const { message } = response.body;
        expect(message).toBe("404 Not found");
      });
  });
});
