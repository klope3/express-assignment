import express from "express";
import { prisma } from "../prisma/prisma-instance";
import { errorHandleMiddleware } from "./error-handler";
import "express-async-errors";

const app = express();
app.use(express.json());
// All code should go below this line

app.get("/", (req, res) => {
  res.send({ message: "Hello World!" });
});

app.get("/dogs", async (req, res) => {
  const dogs = await prisma.dog.findMany();
  res.send(dogs).status(200);
});

app.get("/dogs/:id", async (req, res) => {
  const id = +req.params.id;
  if (isNaN(id)) {
    res
      .status(400)
      .send({ message: "id should be a number" });
    return;
  }
  const dog = await prisma.dog.findUnique({
    where: {
      id: +req.params.id,
    },
  });
  if (!dog) {
    res.status(204).send();
    return;
  }
  res.status(200).send(dog);
});

app.delete("/dogs/:id", async (req, res) => {
  const id = +req.params.id;
  if (isNaN(id)) {
    res
      .status(400)
      .send({ message: "id should be a number" });
    return;
  }
  const deleted = await Promise.resolve()
    .then(() =>
      prisma.dog.delete({
        where: {
          id,
        },
      })
    )
    .catch(() => null);
  if (deleted === null) {
    res.status(204).send();
  } else {
    res.status(200).send(deleted);
  }
});

app.post("/dogs", async (req, res) => {
  const {
    body,
    body: { name, description, breed, age },
  } = req;

  const errors = getBodyErrors(body);
  if (errors.length > 0) {
    res.status(400).send({ errors });
    return;
  }

  const created = await Promise.resolve()
    .then(() => {
      return prisma.dog.create({
        data: {
          name,
          description,
          breed,
          age,
        },
      });
    })
    .catch((e) => {
      console.error(e);
    });

  res.status(201).send(created);
});

app.patch("/dogs/:id", async (req, res) => {
  const {
    body,
    body: { name, description, breed, age },
  } = req;

  const id = +req.params.id;
  if (isNaN(id)) {
    res
      .status(400)
      .send({ message: "id should be a number" });
    return;
  }

  const errors = getBodyErrors(body, false);
  if (errors.length > 0) {
    res.status(400).send({ errors });
    return;
  }

  const updated = await Promise.resolve()
    .then(() => {
      return prisma.dog.update({
        where: {
          id,
        },
        data: {
          name,
          description,
          breed,
          age,
        },
      });
    })
    .catch((e) => {
      console.log(e);
    });

  res.status(201).send(updated);
});

function getBodyErrors(
  body: any,
  requireAll: boolean = true
) {
  const validKeyTypes = [
    {
      name: "name",
      type: "string",
    },
    {
      name: "description",
      type: "string",
    },
    {
      name: "breed",
      type: "string",
    },
    {
      name: "age",
      type: "number",
    },
  ];
  const keySet = new Set([...Object.keys(body)]);
  if (requireAll) {
    const keyNames = validKeyTypes.map((key) => key.name);
    for (const k of keyNames) {
      keySet.add(k);
    }
  }
  const keysToCheck = Array.from(keySet);
  const errors = keysToCheck
    .map((key) => {
      const validKeyMatch = validKeyTypes.find(
        (valid) => valid.name === key
      );
      if (!validKeyMatch)
        return `'${key}' is not a valid key`;
      if (typeof body[key] !== validKeyMatch.type)
        return `${key} should be a ${validKeyMatch.type}`;
    })
    .filter((error) => error !== undefined);
  return errors;
}

// all your code should go above this line
app.use(errorHandleMiddleware);

const port = process.env.NODE_ENV === "test" ? 3001 : 3000;
app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}
`)
);
