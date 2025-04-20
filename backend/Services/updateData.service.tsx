import { schemas, SchemaKeys } from "../data/schemas";
import repository from "../repository";

const updateDataService = async (
  id: number,
  data: object,
  table: SchemaKeys
) => {
  try {
    const parsed = schemas[table].update.parse(data);
    const result = await repository.updateDataRepository(id, parsed, table);
    return result;
  } catch (error) {
    console.log("Error in update data service", error);
  }
};

const services = { updateDataService };

export default services;
