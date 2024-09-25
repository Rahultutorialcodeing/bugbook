import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import prisma from "./lib/prisma";
import { Lucia, Session, User } from "lucia";
import { cache } from "react";
import { cookies } from "next/headers";

const adapter = new PrismaAdapter(prisma.session, prisma.user); //PrismaAdapter: Yeh Prisma ke user aur session models ko authenticate karta hai using Lucia.
export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false, //expires: false ka matlab cookie expire nahi hogi jab tak tum manually expire na karo.

    attributes: {
      secure: process.env.NODE_ENV === "production", // Agar tum production environment me ho, to cookie secure ho.
    },
  },

  getUserAttributes(databaseUserAttributes) {
    return {
      id: databaseUserAttributes.id,
      username: databaseUserAttributes.username,
      displayname: databaseUserAttributes.displayname,
      avatarUrl: databaseUserAttributes.avatarUrl,
      googleId: databaseUserAttributes.googleId,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributesInterface;
  }
}

interface DatabaseUserAttributesInterface {
  id: string;
  username: string;
  displayname: string;
  avatarUrl: string | null;
  googleId: string | null;
}

//validateRequest: Yeh function ek user ke session ko validate karta hai. Agar session valid hai, to user ka data return karta hai. Nahi to null return karta hai.
//cache: Yeh function ko cache karta hai taaki baar-baar same request pe calculation na karna pade. Isse performance improve hoti hai.
export const validateRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null; //Cookie se session ID fetch karta hai. Agar session ID nahi milti, to user: null aur session: null return karta hai.

    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }

    const result = await lucia.validateSession(sessionId); //Yeh Lucia ka method hai jo session ko check karta hai ki wo valid hai ya nahi.

    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id); //createSessionCookie: Agar session fresh hai (naya login ya activity), to ek naya session cookie create karta hai.

        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }

      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie(); //createBlankSessionCookie: Agar session invalid hai, to blank cookie set karta hai, jo basically logout ke liye use hoti hai.
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
    } catch (error) {}

    return result;
  },
);
