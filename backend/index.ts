import { Hono } from "hono";

import type { AppEnv } from "./lib/types";
import { registerRoute } from "./routes/auth/signup";
import { loginRoute } from "./routes/auth/login";
import { refreshRoute } from "./routes/auth/refresh";
import { logoutRoute } from "./routes/auth/logout";
import { dbMiddleware } from "./middlewares/db";
import { requirauthMiddleware } from "./middlewares/requireAuth";
import { addhabbitRoute } from "./routes/habits(ADD,DEL,EDIT,GET)/addHabit";
import { edithabbitRoute } from "./routes/habits(ADD,DEL,EDIT,GET)/editHabit";
import { deletehabbitRoute } from "./routes/habits(ADD,DEL,EDIT,GET)/deleteHabit";
import { getHabbit } from "./routes/habits(ADD,DEL,EDIT,GET)/getHabits";
const app = new Hono<AppEnv>();

//db middleware runs before every request to establish a connection with the db
app.use("*", dbMiddleware);
app.use("/addHabit", requirauthMiddleware);
app.use("/deleteHabit", requirauthMiddleware);
app.use("/editHabit", requirauthMiddleware);
app.use("/getHabits", requirauthMiddleware);
app.get("/", (c) => c.text("Hello!"));

// Mount your routes
app.route("/auth", registerRoute);
app.route("/auth", loginRoute);
app.route("/auth", refreshRoute);
app.route("/auth", logoutRoute);
app.route("/", addhabbitRoute);
app.route("/", deletehabbitRoute);
app.route("/", edithabbitRoute);
app.route("/", getHabbit);

export default app;
