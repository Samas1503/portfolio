import { SchemaKeys } from "../data/schemas";
import repository from "../repository";

const deleteDataByIdService = async (id: number, table: SchemaKeys) => {
  const data = repository.deleteDataByIdRepository(id, table);
  return data;
};

const services = { deleteDataByIdService };

export default services;
