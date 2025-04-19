import { db } from "@/db";
import { proyectos } from "@/db/schemas";
import { eq } from "drizzle-orm";

const getAllDataPortfolioRepository = async () => {
  const data = await db.select().from(proyectos);
  return data;
};

const getDataPortfolioRepositoryById = async (id: number) => {
  const data = await db.select().from(proyectos).where(eq(proyectos.id, id));
  return data;
};

const repository = {
  getAllDataPortfolioRepository,
  getDataPortfolioRepositoryById,
};

export default repository;
