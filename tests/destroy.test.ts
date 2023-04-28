import { beforeEach, describe, expect, it } from "vitest";
import { clearDb } from "../prisma/clearDb";
import { Dog } from "@prisma/client";
import { seedDogs } from "../prisma/seedDogs";
import { AxiosInstance } from "./helper";
import { prisma } from "../prisma/prisma-instance";

const { delete: deleteRequest } = AxiosInstance;

describe("DELETE /dogs/:id", () => {
  let doomslayer: Dog;
  beforeEach(async () => {
    await clearDb();
    const { doomslayer: doomslayerFromSeeds } = (
      await seedDogs()
    ).dogs;
    doomslayer = doomslayerFromSeeds;
  });

  it("delete endpoint should exist", async () => {
    const { status } = await deleteRequest(`/dogs/dummy`);
    expect(status).not.toEqual(404);
  });

  it("Delete endpoint should return a status of 400 and a error message if the id is not parse-able to number", async () => {
    const { status, data } = await deleteRequest(
      `/dogs/dummy`
    );
    expect(status).toEqual(400);
    expect(data.message).toEqual("id should be a number");
  });

  it("deleting doomslayer should delete him from the database and return a 200", async () => {
    const { data, status } = await deleteRequest(
      `/dogs/${doomslayer.id}`
    );
    expect(data).toEqual(doomslayer);
    expect(status).toEqual(200);
    const dogs = await prisma.dog.findMany({
      where: {
        id: doomslayer.id,
      },
    });
    expect(dogs.length).toBe(0);
  });

  it("deleting a dog that doesn't exist should give a 204", async () => {
    const { status } = await deleteRequest(
      `/dogs/9999999999`
    );
    expect(status).toEqual(204);
  });
});
