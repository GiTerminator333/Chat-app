import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";
import { ENV } from "./env.js";

export const aj = arcjet({
    key : ENV.ARCJET_KEY,
    rules : [
        shield({mode : "LIVE"}),
        detectBot({
            mode : "LIVE",
            allow : [
                'CATEGORY:SEARCH_ENGINE'
            ]
        }),
        slidingWindow({
            mode : "LIVE",
            interval : "60s",
            max : 100,
        })
    ]
})