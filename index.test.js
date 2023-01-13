const app = require("./index");
const { sequelize, Joke } = require("./db");
const request = require("supertest");
const seed = require("./db/seedFn");
const seedData = require("./db/seedData");

describe("GET /jokes", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // recreate db
    await seed();
  });

  it("should return a list of all jokes", async () => {
    const response = await request(app).get("/jokes");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(seedData.length);
    expect(response.body[0]).toEqual(expect.objectContaining(seedData[0]));
  });

  it("should return a list of jokes, filtered by tag", async () => {
    const response = await request(app).get("/jokes?tags=anatomy");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(3);
    expect(response.body[0]).toEqual(expect.objectContaining(seedData[3]));
  });

  it("should return a list of jokes, filtered by content", async () => {
    const response = await request(app).get("/jokes?content=flamingo");
    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0]).toEqual(expect.objectContaining(seedData[2]));
  });
});

describe("POST /jokes", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // recreate db
    await seed();
  });

  it("should add a joke to the database", async () => {
    const response = await request(app).post("/jokes").send({
      joke: "What's the best thing about Switzerland? I don't know, but the flag is a big plus.",
      tags: "countries,switzerland",
    });
    expect(response.status).toBe(201);
  });
});

describe("DELETE /jokes/:id", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // recreate db
    await seed();
  });

  it("should delete a joke from the database", async () => {
    const response = await request(app).delete("/jokes/1");
    expect(response.status).toBe(200);
  });
});

describe("PUT /jokes/:id", () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true }); // recreate db
    await seed();
  });

  it("should edit a joke from the database", async () => {
    const response = await request(app).put("/jokes/2").send({
      joke: "Test",
      tags: "test",
    });
    const newJoke = await request(app).get("/jokes/2");
    expect(newJoke.body.joke).toEqual("Test");
  });
});
