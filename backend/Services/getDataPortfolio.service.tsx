import getDataPortfolioRepository from "../repository";


const getAllDataPortfolioService = async () => {
  const data = await getDataPortfolioRepository.getAllDataPortfolioRepository()
  return data;
};

const getDataPortfolioServiceById = async (id: number) => {
  const data = getDataPortfolioRepository.getDataPortfolioRepositoryById(id)
  return data;
};

const services = { getAllDataPortfolioService, getDataPortfolioServiceById };

export default services;
