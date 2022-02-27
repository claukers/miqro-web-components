const {App, checkEnvVariables, APIRouter, getLogger, Static} = require("@miqro/core");
const {resolve} = require("path");

const logger = getLogger("demo:api");

const app = new App();

const port = checkEnvVariables(["DEMO_API_PORT"], ["9999"])[0];

logger.info("===API (/api)===");
app.use(APIRouter({
  dirname: resolve(__dirname, "v1")
}, logger), "/api");

logger.info("===PUBLIC (/public)===");
app.use(Static({
  directory: resolve(__dirname, "..", "front"),
  index404: resolve(__dirname, "..", "front", "index.html")
}), "/public");
app.use((ctx) => {
  ctx.redirect("/public/not_found");
})

logger.info(`http://localhost:${port}/public`);

app.listen(port);
