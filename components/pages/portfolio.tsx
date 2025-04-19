// import { dataPortfolio } from "@/data";
import Title from "../shared/title";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import getDataPortfolioService from "@/backend/Services";

const Portfolio = async () => {
  const dataPortfolio = await getDataPortfolioService.getAllDataPortfolioService();
  return (
    <div className="p-4 max-w-4xl md:py-24 mx-auto" id="portfolio">
      <Title title="Portfolio" subtitle="Trabajos recientes" />
      <div className="grid md:grid-cols-3 gap-14 mt-4">
        {dataPortfolio.map((data) => (
          <div key={data.id}>
            <h3 className="text-xl mb-4">{data.titlo}</h3>
            <Image
              src={data.imagen || "/placeholder-image.png"}
              alt="Image"
              width={300}
              height={300}
              className="rounded-2xl w-full"
            />
            <div className="mt-5 flex gap-7">
              <Link
                className={buttonVariants({ variant: "outline" })}
                href={data.urlGithub || "#!"}
                target="_blank"
              >
                GitHub
              </Link>
              <Link
                className={buttonVariants()}
                href={data.urlDemo || "#!"}
                target="_blank"
              >
                Live demo
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Portfolio;
