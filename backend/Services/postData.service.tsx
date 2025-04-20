import { schemas, SchemaKeys } from "../data/schemas";
import repository from "../repository";

const postDataService = async (
  data: object,
  table: SchemaKeys
) => {
  try {
    console.log(data);
    const parsed = schemas[table].create.parse(data);
    const result = await repository.postDataRepository(parsed, table);
    return result;
  } catch (error) {
    console.log("Error in post data service:", error);
  }
};

const services = { postDataService };

export default services;
