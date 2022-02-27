const {BadRequestError} = require("@miqro/core");
module.exports = {
  handler: async (ctx) => {
    ctx.logger.info("feeds.get called");
    ctx.logger.info(" query %o", ctx.query);
    throw new BadRequestError("bad request!!!!");
    /*await ctx.json({
      status: "OK"
    });*/
  }
}
