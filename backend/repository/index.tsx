import getDataRepository from "./getData.repository";
import postDataRepository from "./postData.repository";
import updateDataRepository from "./updateData.repository";
import deleteDataRepository from "./deleteData.repository";

const repository = {
    ...getDataRepository,
    ...postDataRepository,
    ...updateDataRepository,
    ...deleteDataRepository,
};

export default repository;
