const {BadRequestError} = require("@miqro/core");

let count = 0;

module.exports = {
  handler: async (ctx) => {
    ctx.logger.info("feeds.get called");
    ctx.logger.info(" query %o", ctx.query);
    //throw new BadRequestError("bad request!!!!");
    count++;
    await ctx.json({
      status: "OK",
      count,
      query: ctx.query
    });
  }
}
