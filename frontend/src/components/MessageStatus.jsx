import { CheckIcon } from "lucide-react";

/**
 * MessageStatus — Renders checkmark ticks based on message delivery status.
 * 
 * - "sent"      → Single grey tick  ✓
 * - "delivered"  → Double grey ticks ✓✓
 * - "read"       → Double cyan ticks ✓✓
 * 
 * Only rendered for messages sent by the current user (not received messages).
 */
function MessageStatus({ status }) {
  if (!status) return null;

  if (status === "sent") {
    // Single grey tick
    return (
      <span className="inline-flex items-center ml-1" title="Sent">
        <CheckIcon className="w-3.5 h-3.5 text-slate-400" />
      </span>
    );
  }

  if (status === "delivered") {
    // Double grey ticks
    return (
      <span className="inline-flex items-center ml-1 -space-x-1.5" title="Delivered">
        <CheckIcon className="w-3.5 h-3.5 text-slate-400" />
        <CheckIcon className="w-3.5 h-3.5 text-slate-400" />
      </span>
    );
  }

  if (status === "read") {
    // Double cyan ticks
    return (
      <span className="inline-flex items-center ml-1 -space-x-1.5" title="Read">
        <CheckIcon className="w-3.5 h-3.5 text-cyan-400" />
        <CheckIcon className="w-3.5 h-3.5 text-cyan-400" />
      </span>
    );
  }

  return null;
}

export default MessageStatus;
