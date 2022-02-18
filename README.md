# @miqro/core

## promise based router for native http module

```typescript
import {createServer} from "http";
import {Router, JSONParser} from "@miqro/core";

const router = new Router();

router.post("/echo", [JSONParser(), async (ctx) => {
  // the IncomingMessage is in ctx.req
  // the ServerResponse is in ctx.res
  ctx.logger.info("we got a echo request hit with query: %o params: %o body: %o", ctx.query, ctx.params, ctx.body);
  await ctx.json({
    body: ctx.body
  });
}]);
router.get("/user/:userId", async (ctx) => {
  await ctx.json({
    userId: ctx.params.userId
  });
});
router.use(async (ctx) => {
  await ctx.end({
    headers: {
      ["Content-Type"]: "plain/text; charset=utf-8"
    },
    status: 404,
    body: "NOT FOUND"
  });
});

const server = createServer(router.listener).listen(8080);
// or to handle 404 and default errors
// import { App } from "@miqro/core";
// const server = createServer(new App().use(router, "/api").listener).listen(8080);
// or
// const server = app.listen(8080);
```

## router.use extended options for request parsing

for more examples of parsing see [@miqro/parser](https://www.npmjs.com/package/@miqro/parser)

```typescript
router.get("/add/:a/:b", {
  request: {
    body: false, // do not allow body
    params: {
      options: {
        a: "number", // parse param :a to a number if posible if not throw 400
        b: "number", // parse param :b to a number if posible if not throw 400
      }
      //,mode: "no_extra" // defaults to no_extra
    },
    query: {
      options: {
        decimals: "boolean?|number?", // two optional posible parsing types
        format: {
          type: "enum?", // optional enum
          enumValues: ["number", "text"],
          defaultValue: "number"
        },
        mode: "add_extra"
      }
    }
  },
  response: {
    body: "number|string"
  },
  handler: async (ctx) => {
    // ctx.params.a and ctx.params.b are numbers and not strings
    const result = ctx.params.a + ctx.params.b;
    ctx.logger.info("adding %s + %s = %s", ctx.params.a, ctx.params.b, result);

    const decimals = ctx.query.decimals;

    ctx.info("decimals set on query %s", decimals);

    switch (ctx.query.format) {
      case "number":
        await ctx.text(result);
        break;
      case "text":
        await ctx.text("the result is " + result);
        break;
      default:
        throw new BadRequest("unsupported format");
    }
  }
});
```

using custom parser with custom types with router.use(...)

```typescript
import {Parser} from "@miqro/parser";

const parser = new Parser();
parser.registerType("AddParams", {
  a: "number", // parse param :a to a number if posible if not throw 400
  b: "number", // parse param :b to a number if posible if not throw 400
});
parser.registerType("AddQuery", {
  decimals: "boolean?|number?", // two optional posible parsing types
  format: {
    type: "enum?", // optional enum
    enumValues: ["number", "text"],
    defaultValue: "number"
  }
}, "add_extra");

router.get("/add/:a/:b", {
  parser,
  request: {
    body: false, // do not allow body
    params: "AddParams",
    query: "AddQuery"
  },
  response: {
    body: "number|string"
  },
  handler: async (ctx) => {
    // ...
  }
});
```

for more information on the parser see [@miqro/parser](https://www.npmjs.com/package/@miqro/parser)

## serving static files

```typescript
import {Static} from "@miqro/core";

router.use(Static({
  directory: resolve(__dirname, "test-data", "static1")
}), "/content/public");
```

## error handling

```typescript
router.catch(myFallBackerrorHandler1) // this will catch all throws
router.catch(myFallBackerrorHandler2) // if myFallBackerrorHandler1 didnt ended the request myFallBackerrorHandler2 will be called

router.use(async (ctx) => {
  throw new Error("");
});
```

