import express, { Request, Response } from "express";
import routes from "./api/routes";
import compression from "compression";
import helmet from "helmet";
import bodyParser from "body-parser";
import cors from "cors";
import logger from "./api/middlewares/logger.middelware";
import errorHandler from "./api/middlewares/error-handler.middleware";

const app = express();
const port = 3000;

// compresses all the responses
app.use(compression());

// adding set of security middlewares
app.use(helmet());

// parse incoming request body and append data to `req.body`
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// enable all CORS request
app.use(cors());

// add logger middleware
app.use(logger);

app.use("/api", routes);

app.use(errorHandler);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
