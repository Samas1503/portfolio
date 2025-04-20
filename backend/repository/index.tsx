import getDataRepository from "./getData.repository";
import postDataRepository from "./postData.repository";
import updateDataRepository from "./updateData.repository";

const repository = {
    ...getDataRepository,
    ...postDataRepository,
    ...updateDataRepository
};

export default repository;
