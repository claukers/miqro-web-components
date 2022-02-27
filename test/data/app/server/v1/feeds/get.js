module.exports = {
  handler: async (ctx) => {
    ctx.logger.info("feeds.get called");
    ctx.logger.info(" headers %o", ctx.headers);
    await ctx.json({
      status: "OK"
    });
  }
}
