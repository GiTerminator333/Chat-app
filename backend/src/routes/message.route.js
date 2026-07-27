import express from "express";
import { addReaction, getChatPartners, getContacts, getMessagesByUserId, markMessagesAsRead, removeReaction, sendMessage } from "../controllers/message.controller.js";
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

// Emoji reactions — add or remove a reaction on a message
router.post("/react/:id", addReaction);
router.delete("/react/:id", removeReaction);

export default router;