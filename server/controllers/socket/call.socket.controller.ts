import type { SessionData } from "express-session";
import type { CustomEvent, StartCallPayload, UpdateCallStatePayload } from "../../utilities/types/others.js";
import { CallLogModel, CallStateModel } from "../../utilities/db/model/calls.model.js";
import { sendSocketEvent } from "../../utilities/websocket/helper.js";

// 🧩 Store all active call timeouts
const callTimeouts = new Map<string, NodeJS.Timeout>();

// 🧹 Helper to clear timeout when answered/rejected
const clearCallTimeout = (callId: string) => {
    const timeout = callTimeouts.get(callId);
    if (timeout) {
        clearTimeout(timeout);
        callTimeouts.delete(callId);
    }
};

export const startCall = async (payload: StartCallPayload, sess: SessionData) => {
    const { user_id } = sess;
    const { type, receiverId, offer, callId } = payload;

    let call;

    if (callId) {
        // Recreate offer for ongoing call
        call = await CallStateModel.findByIdAndUpdate(
            callId,
            { offer, lastActivityAt: new Date() },
            { new: true }
        );

        if (!call) {
            console.warn(`Call with id ${callId} not found. Cannot recreate offer.`);
            return null; // exit early if no call found
        }
    } else {
        // New call
        call = await CallStateModel.create({
            initiatorId: user_id,
            receiverId,
            type,
            offer,
            status: "initiated",
            lastActivityAt: new Date(),
        });
    }

    // Notify both participants
    await Promise.all([
        user_id && sendSocketEvent(user_id, "call_state_changed"),
        sendSocketEvent(receiverId, "call_state_changed"),
    ]);

    // If this was a reconnection with a new offer, emit offer_changed
    if (callId) {
        await sendSocketEvent(receiverId, "offer_changed", { callId: call._id, offer });
    }

    // ⏳ Timeout for unanswered call (only for new calls)
    if (!callId) {
        const TIMEOUT_MS = 30_000;
        const timeout = setTimeout(async () => {
            const current = await CallStateModel.findById(call._id);
            if (!current) return;


            if (["initiated", "ringing"].includes(current.status)) {
                await CallStateModel.updateOne(
                    { _id: call._id },
                    { status: "ended", endReason: "timeout", lastActivityAt: new Date() }
                );

                await CallLogModel.create({
                    callId: call._id,
                    initiatorId: current.initiatorId,
                    receiverId: current.receiverId,
                    type: current.type,
                    createdAt: current.createdAt ?? new Date(),
                    endedAt: new Date(),
                    endReason: "missed",
                    status: "missed",
                });

                await Promise.all([
                    sendSocketEvent(current.initiatorId, "call_logs_changed"),
                    sendSocketEvent(current.receiverId, "call_logs_changed"),
                ]);
                await Promise.all([
                    sendSocketEvent(current.initiatorId, "call_state_changed"),
                    sendSocketEvent(current.receiverId, "call_state_changed"),
                ]);
            }

            callTimeouts.delete(call._id.toString());
        }, TIMEOUT_MS);

        callTimeouts.set(call._id.toString(), timeout);
    }

    return call;
};











export const updateCallState = async (payload: UpdateCallStatePayload) => {
    const { _id, status, answer } = payload;
    const lastActivityAt = new Date();

    // skip if no status
    if (!status) return;

    const update: any = { status, lastActivityAt };
    if (answer !== undefined) update.answer = answer;

    const call = await CallStateModel.findOneAndUpdate(
        { _id },
        update,
        { new: true }
    );

    if (!call) return;

    // 🚫 Clear timeout if answered or rejected
    if (["accepted", "rejected"].includes(call.status)) {
        clearCallTimeout(call._id.toString());
    }

    //when status === "connected" update startedAt for the callState so callLog can use it when ended
    if (call.status === "connected") {
        await CallStateModel.updateOne({ _id }, { startedAt: new Date() })
    }

    //calLogs
    /////////////////////////////
    ///////////////////////
    //console.log(call.status)
    if (call.status === "rejected") {
        //console.log("creating log for rejection");
        CallLogModel.create({
            callId: call._id,
            initiatorId: call.initiatorId,
            receiverId: call.receiverId,
            type: call.type,
            createdAt: call.createdAt ?? new Date(),
            endedAt: new Date(),
            endReason: "rejected",
            status: "rejected",
        }).catch((err) => console.log("Error creating rejection log: ", err));

        await Promise.all([
            sendSocketEvent(call.initiatorId, "call_logs_changed"),
            sendSocketEvent(call.receiverId, "call_logs_changed"),
        ]);
    }



    // 🧹 Delete ended/closed call completely
    if (status === "close") {
        //if it has not been created from either rejection, timeout, etc
        //check
        const isExisted = await CallLogModel.findOne({ callId: _id });
        if (!isExisted) {
            await CallLogModel.create({
                callId: _id,
                initiatorId: call.initiatorId,
                receiverId: call.receiverId,
                type: call.type,
                createdAt: call.createdAt,
                startedAt: call.startedAt ?? undefined, //if this is not present means call didnt start
                endedAt: new Date(),
                endReason: call.startedAt ? "completed" : "cancelled",
                status: "ended",
            })

            await Promise.all([
                sendSocketEvent(call.initiatorId, "call_logs_changed"),
                sendSocketEvent(call.receiverId, "call_logs_changed"),
            ]);
        }

        await CallStateModel.deleteOne({ _id });
    }

    await Promise.all([
        sendSocketEvent(call.initiatorId, "call_state_changed"),
        sendSocketEvent(call.receiverId, "call_state_changed"),
    ]);
};


export const sendCustomEvent = async (payload: CustomEvent<any>) => {
    //console.log(payload)
    const { remoteUserId, event, senderId } = payload as CustomEvent<any>;
    await sendSocketEvent(remoteUserId, event, { senderId });
}

export const markCallSeen = async (payload: { _id: string, myId: string }) => {
    const { _id, myId } = payload;

    await CallLogModel.updateOne({ _id }, { read: true });

    await sendSocketEvent(myId, "call_logs_changed");
}