import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma, redis } from "../../lib/db.js";
import dotenv from "dotenv";

dotenv.config();

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    secondaryStorage: {
        get: async (key) => await redis.get(key), // get: check the session token is valid or not
        set: async (key, value, ttl) => {
            if (ttl) {
                await redis.set(key, value, "EX", ttl); // if time to live is provided, set with token key, value and expiry time
            } else {
                await redis.set(key, value); // set: store the session token in redis when user logs in without expiry date
            }
        },
        delete: async (key) => {
            await redis.del(key); // delete: remove the session token from redis when user logs out
        },
    },
    emailAndPassword: {
        enabled: true
    }
});