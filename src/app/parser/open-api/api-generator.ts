import { ParsedRoute, SchemaComponent } from "swagger-typescript-api";
import * as logger from "../../../util/logger";
import * as TypesParser from "./types-parser";
import * as context from "../../context";

const CircularJSON = require("circular-json");

export type ApiRoute = {
  route: ParsedRoute;
  paramSchema: TypesParser.ParsedTypes;
};

export class ApiComponents {
  routes: ApiRoute[];

  constructor() {
    this.routes = [];
  }

  public addRoute(route: ApiRoute) {
    this.routes.push(route);
  }

  public getRoutes(): ApiRoute[] {
    return this.routes;
  }
}
