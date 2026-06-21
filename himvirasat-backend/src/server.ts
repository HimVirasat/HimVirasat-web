import { app } from "./app.js";
import { env } from "./config/env.js";

app.listen(env.PORT, () => {
  console.log("PORT =", process.env.PORT);
  console.log("JWT_SECRET exists =", !!process.env.JWT_SECRET);
  console.log("SUPABASE_URL exists =", !!process.env.SUPABASE_URL);
  console.log(`Server running on port ${env.PORT}`);
});
