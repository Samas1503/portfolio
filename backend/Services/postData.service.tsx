import { schemas, SchemaKeys } from "../data/schemas";
import repository from "../repository";

const postDataService = async (
  data: object,
  table: SchemaKeys
) => {
  try {
    const parsed = schemas[table].create.parse(data);
    const insertedId = await repository.postDataRepository(parsed, table);
    const result = await repository.getDataByIdRepository(Number(insertedId), table);
    return result;
  } catch (error) {
    console.log("Error in post data service:", error);
  }
};

const services = { postDataService };

export default services;
