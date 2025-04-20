import { SchemaKeys } from "../data/schemas";
import repository from "../repository";

const getAllDataService = async (table: SchemaKeys) => {
  const data = await repository.getAllDataRepository(table);
  
  return data;
};

const getDataByIdService = async (id: number, table: SchemaKeys) => {
  const data = repository.getDataByIdRepository(id, table);
  return data;
};

const services = { getAllDataService, getDataByIdService };

export default services;
