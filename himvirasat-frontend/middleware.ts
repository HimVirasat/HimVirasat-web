import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public auth pages (Catch-all Clerk routes) must never be protected, otherwise
// the <SignIn/>/<SignUp/> components cannot be mounted in development.
const isAuthRoute = createRouteMatcher(["/login(.*)", "/signup(.*)"]);

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/user(.*)",
  "/post-login(.*)",
  "/user-profile(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Never run role/protection logic on the Clerk catch-all auth pages so we
  // don't trap the SignIn/SignUp flows in a redirect loop.
  if (isAuthRoute(req)) {
    // If the user is already authenticated, bounce them off the auth pages.
    // This also stops the sign-up card from flashing on `/signup` right after a
    // successful sign-up (the session exists by then, so we go straight to the
    // dashboard instead of re-rendering the card).
    const sessionId = (auth as unknown as { sessionId: string | null }).sessionId;
    if (sessionId) {
      return NextResponse.redirect(new URL("/post-login", req.url));
    }
    return;
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});
