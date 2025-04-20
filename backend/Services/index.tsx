import getDataService from "./getData.service";
import postOrUpdateDataService from "./postData.service"

const services = {
  ...getDataService,
  ...postOrUpdateDataService,
}

export default services;
