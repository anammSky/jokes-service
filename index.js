const express = require("express");
const sequelize = require("sequelize");
const { Op, where } = require("sequelize");
const app = express();
const { Joke } = require("./db");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/jokes", async (req, res, next) => {
  try {
    const { tags, content } = req.query;
    const where = {};
    if (tags && !Array.isArray(tags)) {
      where.tags = {
        [Op.and]: tags
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .map((tag) => ({ [Op.like]: `%${tag}%` })),
      };
    }

    if (tags && Array.isArray(tags)) {
      where.tags = {
        [Op.or]: tags
          .map((tag) => tag.trim().toLowerCase())
          .map((tag) => ({ [Op.like]: `%${tag}%` })),
      };
    }

    if (content) {
      where.joke = sequelize.where(
        sequelize.fn("LOWER", sequelize.col("joke")),
        Op.like,
        `%${content}%`
      );
    }

    const jokes = await Joke.findAll({
      where: where,
      attributes: {
        exclude: ["updatedAt", "createdAt"],
      },
    });
    res.send(jokes);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

app.get("/jokes/:id", async (req, res, next) => {
  const joke = await Joke.findByPk(req.params.id);
  res.send(joke);
});

app.post("/jokes", async (req, res, next) => {
  const body = req.body;
  const newJoke = {
    joke: body.joke,
    tags: Array.isArray(body.tags) ? body.tags.join(",") : body.tags,
  };
  try {
    await Joke.create(newJoke);
    res.send(201);
  } catch (error) {
    res.status(400).send("Unable to save joke");
  }
});

app.delete("/jokes/:id", async (req, res, next) => {
  const id = req.params.id;
  // if (id < 1) {
  //   return next(`No joke with id ${id} exists`);
  // }
  try {
    await Joke.destroy({ where: { id } });
    res.send("Joke removed");
  } catch (error) {
    res.send(error);
  }
});

app.put("/jokes/:id", async (req, res, next) => {
  const id = req.params.id;
  const joke = await Joke.findByPk(id);

  if (!joke) {
    return next(`No joke with id ${id} exists`);
  }
  const body = req.body;
  const updatedJoke = {};
  if (body.joke) {
    updatedJoke.joke = body.joke;
  }

  if (body.tags) {
    updatedJoke.tags = Array.isArray(body.tags)
      ? body.tags.join(",")
      : body.tags;
  }

  try {
    await joke.update(updatedJoke);
    res.send("200");
  } catch (error) {
    res.status(400).send("Cannot update joke");
  }
});

// we export the app, not listening in here, so that we can run tests
module.exports = app;
