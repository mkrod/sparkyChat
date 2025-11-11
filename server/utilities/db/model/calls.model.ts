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
        "rejected",
      ], 
      default: "initiated" 
    },
    offer: { type: Schema.Types.Mixed },
    answer: { type: Schema.Types.Mixed },
    initiatorSocketId: { type: String },
    receiverSocketId: { type: String },
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
    startedAt: { type: Date, required: true },
    acceptedAt: { type: Date },
    endedAt: { type: Date, required: true },
    durationSeconds: { type: Number },
    endReason: { 
      type: String, 
      enum: ["hangup", "rejected", "missed", "failed"], 
      default: "hangup" 
    },
    status: { 
      type: String, 
      enum: ["completed", "rejected", "missed"], 
      default: "completed" 
    },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const CallLogModel = model("CallLog", callLogSchema);

/* =========================
   ✅ Exports
   ========================= */
export { CallStateModel, CallLogModel };
