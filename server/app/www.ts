import fs from "fs";
import { Container } from "inversify";
import "reflect-metadata";
import { containerBootstrapper } from "./inversify.config";
import { Server } from "./server";
import Types from "./types";

void (async () => {
  try {
    process.env.MONGODB_KEY = fs.readFileSync("mongo.env").toString();
    const jwtkeys = fs
      .readFileSync("jwtsecret.env")
      .toString()
      .split("\n");
    process.env.JWT_KEY = jwtkeys[0];
    process.env.JWT_REFRESH_KEY = jwtkeys[1];
  } catch (err) {
    console.log(
      "Could not load an API env file. Make sure env files are under server/ Exiting..."
    );
    process.exit(0);
  }

  const container: Container = await containerBootstrapper();
  const server: Server = container.get<Server>(Types.Server);

  server.init(Server.port);
})();
