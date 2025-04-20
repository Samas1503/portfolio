import getDataService from "./getData.service";
import postDataService from "./postData.service"
import updateDataService from "./updateData.service"
import deleteDataService from "./deleteData.service"

const services = {
  ...getDataService,
  ...postDataService,
  ...updateDataService,
  ...deleteDataService,
}

export default services;
