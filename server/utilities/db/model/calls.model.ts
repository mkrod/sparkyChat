import { Schema, model } from "mongoose";

/* =========================
   📞 Call State (live calls)
   ========================= */
const callStateSchema = new Schema({
    initiatorId: { type: String, required: true },
    receiverId: { type: String, required: true },
    type: { type: String, enum: ["voice", "video"], required: true },
    status: { 
      type: String, 
      enum: [
        "initiated",
        "ringing",
        "accepted",
        "connected",
        "reconnecting",
        "ended",
        "close", // to indicate deletion from cl to server
        "rejected",
      ], 
      default: "initiated" 
    },
    offer: { type: Schema.Types.Mixed },
    answer: { type: Schema.Types.Mixed },
    initiatorSocketId: { type: String },
    receiverSocketId: { type: String },
    startedAt: { type: Date },
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const CallStateModel = model("CallState", callStateSchema);

/* =========================
   🧾 Call Log (history)
   ========================= */
const callLogSchema = new Schema(
  {
    callId: { type: String },
    initiatorId: { type: String, required: true },
    receiverId: { type: String, required: true },
    type: { type: String, enum: ["voice", "video"], required: true },
    createdAt: { type: Date, required: true },
    startedAt: { type: Date },
    acceptedAt: { type: Date },
    endedAt: { type: Date, required: true },
    durationSeconds: { type: Number },
    endReason: { 
      type: String, 
      enum: ["completed", "rejected", "missed", "failed", "cancelled"], 
      default: "hangup" 
    },
    status: { 
      type: String, 
      enum: ["ended", "rejected", "missed"], 
      default: "ended" 
    },
    read: { type: Boolean, default: false },
  }
);

const CallLogModel = model("CallLog", callLogSchema);

/* =========================
   ✅ Exports
   ========================= */
export { CallStateModel, CallLogModel };
