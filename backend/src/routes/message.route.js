import express from "express";
import { getChatPartners, getContacts, getMessagesByUserId, markMessagesAsRead, sendMessage } from "../controllers/message.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {arcjetProtection} from "../middlewares/arcjet.middleware.js"

const router = express.Router();
router.use(arcjetProtection , protectRoute);

router.get("/contacts", getContacts);

router.get("/chats", getChatPartners);

router.get("/:id", getMessagesByUserId);

router.post("/send/:id", sendMessage);

// Mark all messages from a specific sender as "read"
router.put("/read/:id", markMessagesAsRead);

export default router;