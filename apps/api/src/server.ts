import { buildApp } from "./app";

const port = Number(process.env.API_PORT ?? 4100);

const { app } = await buildApp();

app.listen({ port, host: "0.0.0.0" }).catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
