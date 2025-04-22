import { SchemaKeys } from "../data/schemas";
import repository from "../repository";
import { v2 as cloudinary } from "cloudinary";

async function getFileData(data: unknown) {
  if (typeof data === "object" && data !== null && "image" in data && typeof data.image === "string") {
    if (data.image.split("/")[1] !== "uploads") {
      const url = cloudinary.url(data.image);
      data.image = url;
    }
  }
  return await data;
}

const getAllDataService = async (table: SchemaKeys) => {
  const data = await repository.getAllDataRepository(table);
  if (data && data.length > 0)
    if (Object.keys(data[0]).some((d) => ["image", "file"].includes(d))) {
      const dataUpdated: unknown[] = [];
      await Promise.all(
        data.map(async (elemento) => {
          const response = await getFileData(elemento);
          dataUpdated?.push(response);
        })
      );      
      return dataUpdated;
    }
  return data;
};

const getDataByIdService = async (id: number, table: SchemaKeys) => {
  const data = await repository.getDataByIdRepository(id, table);
  if (Object.keys(data).some((d) => ["image", "file"].includes(d))) {
    const response = await getFileData(data);
    return response;
  }
  return data;
};

const services = { getAllDataService, getDataByIdService };

export default services;
