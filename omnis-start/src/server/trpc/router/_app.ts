import { router } from "../utils";
import example from "./example";
import externalApis from "./externalApis";

export const appRouter = router({
  example,
  externalApis: externalApis
});

export type IAppRouter = typeof appRouter;
