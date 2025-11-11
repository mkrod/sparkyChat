import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import socket from '../socket.io/socket_conn';
import type { CallIceCandidatePayload, CallLog, CallState, Response, StartCallPayload, Streams, UpdateCallStatePayload } from '../types';
import { fetchUserCallLogs, fetchUserCallState } from '../calls/controller';
import { useConnProvider } from './conn_provider';
import { useChatProvider } from './chatProvider';

interface CallContextType {
    callState: CallState | undefined;
    callLogs: CallLog[];
    updateCallState: (payload: UpdateCallStatePayload) => void;
    startCall: (payload: StartCallPayload) => void;
    acceptCall: () => void;
    localStream: MediaStream | undefined;
    remoteStream: MediaStream | undefined;
}

const callContext = createContext<CallContextType | null>(null);


export const CallProvider = ({ children }: { children: ReactNode }) => {

    const { user } = useConnProvider();
    const { setPrompt } = useChatProvider();
    const [callState, setCallState] = useState<CallState | undefined>(undefined);
    const [callLogs, setCallLogs] = useState<CallLog[]>([]);
    const [fetchCallState, setFetchCallState] = useState<boolean>(true);
    const [fetchCallLogs, setFetchCallLogs] = useState<boolean>(true);
    const [localStream, setLocalStream] = useState<MediaStream | undefined>(undefined);
    const [remoteStream, setRemoteStream] = useState<MediaStream | undefined>(undefined);
    const pcRef = useRef<RTCPeerConnection | null>(null);

    ///fetchs
    useEffect(() => {
        if (!fetchCallState) return;

        fetchUserCallState()
            .then((res: Response) => {
                //console.log("fetchCallState res.data: ", res.data)
                if (res.status !== 200) return setCallState(undefined);
                setCallState(res.data as CallState);
            })
            .catch((err) => {
                console.log("Cannot fetch call state: ", err);
            })
            .finally(() => {
                setFetchCallState(false);
            })

    }, [fetchCallState]);

    useEffect(() => {
        if (!fetchCallLogs) return;
        fetchUserCallLogs()
            .then((res: Response) => {
                //console.log(res)
                if (res.status !== 200) return setCallLogs([]);
                setCallLogs(res.data as CallLog[]);
            })
            .catch((err) => {
                console.log("Cannot fetch call log: ", err);
            })
            .finally(() => {
                setFetchCallLogs(false);
            })

    }, [fetchCallLogs]);

    useEffect(() => {
        if (!socket) return;
        const handleChange = () => setFetchCallState(true);
        socket.on("call_state_changed", handleChange);
        return () => {
            socket.off("call_state_changed", handleChange);
        };
    }, [socket]);

    useEffect(() => {
        if (!socket) return;
        const handleChange = () => setFetchCallLogs(true);
        socket.on("call_logs_changed", handleChange);
        return () => {
            socket.off("call_logs_changed", handleChange);
        };
    }, [socket]);




    //1a, caller start call set the peerConnection to ref. new pc from caller (caller app)
    const startCall = useCallback(async (payload: StartCallPayload) => {
        try {
            // 1️⃣ Get local media
            const permission: { audio: boolean; video?: boolean } = { audio: true };
            if (payload.type === "video") permission.video = true;
            const stream = await navigator.mediaDevices.getUserMedia(permission);
    
            setLocalStream(stream);
    
            // 2️⃣ Create new RTCPeerConnection
            const pc = new RTCPeerConnection();
    
            // 3️⃣ Set ontrack immediately
            pc.ontrack = (event) => {
                event.streams[0].getTracks().forEach((track) => {
                    setRemoteStream((prev) => {
                        prev?.addTrack(track);
                        return prev;
                    })
                })
            };
    
            // 4️⃣ Add local tracks
            stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    
            // 5️⃣ Handle ICE candidates
            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    const icePayload: CallIceCandidatePayload = {
                        remoteUserId: payload.receiverId,
                        candidate: event.candidate,
                    };
                    socket.emit("call_ice_candidate", icePayload);
                }
            };
    
            // 6️⃣ Create offer and set local description
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
    
            // 7️⃣ Save pc reference
            pcRef.current = pc;
    
            // 8️⃣ Send offer to callee
            socket.emit("start_call", { ...payload, offer });
    
            console.log("✅ Call started (caller)");
        } catch (error) {
            console.error("❌ Error starting call:", error);
            setPrompt({
                type: "error",
                title: "Failed to start " + payload.type + " call",
            });
        }
    }, [socket, user]);
    



    const updateCallState = useCallback((payload: UpdateCallStatePayload) => {

        socket.emit("update_call_state", payload);
    }, [socket]);




    //2, callee receive the initiate call and ring itself
    useEffect(() => {//(callee code)
        //console.log("attempt to log callState:", callState);
        if (!callState) return;

        const { receiverId, status } = callState;
        const { user_id } = user;
        if (user_id === "Loading...") return; //not yet loaded.

        if (receiverId === user.user_id && status === "initiated") { // you've gotten the call, so update to ringing so ui can ring
            const payload: UpdateCallStatePayload = {
                status: "ringing",
                _id: callState._id
            }
            updateCallState(payload);
        }
    }, [callState, user])


    //3a, if callee rejected the call, the caller should cleanup the state
    useEffect(() => {//(caller code)

        if (!callState) return;

        const { initiatorId, status } = callState;
        const { user_id } = user;
        if (user_id === "Loading...") return; //not yet loaded.

        if (initiatorId === user.user_id && (status === "ended" || status === "rejected")) { //call ended, either it wasnt picked or, it was ended //so delete the callState
            const payload: UpdateCallStatePayload = {
                status: "close", //custom event on server, check if status === "close", then delete the callState and notify the parties, then return before the actual update code
                _id: callState._id
            }
            setTimeout(() => updateCallState(payload), 2000); // ino want make e disappear foe now make i run the ui, i go uncomment this
        }
    }, [callState, user])





    //1b, if caller or callee refresh the browser while calling, re offer or re answer! new pc from callee or caller app accordingly
    useEffect(() => { //(caller code) this useEffect is only intended to handle the caller refreshing before the callee pick up or during the call
        if (!callState) return;
        if (user.user_id === "Loading...") return; // user not ready

        // If the call is ongoing and streams are missing, recreate
        //console.log("Local stream: ", localStream);
        const callerReconnect = async () => { // reconnect logic
            try {
                const permission: { audio: boolean; video?: boolean } = {
                    audio: true
                };
                if (callState.type === "video") permission.video = true;
                const stream = await navigator.mediaDevices.getUserMedia(permission);
                setLocalStream(stream);

                const pc = pcRef.current || new RTCPeerConnection();
                pcRef.current = pc;

                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                socket.emit("start_call", { callId: callState._id, offer });
            } catch (err) {
                console.error("Failed to recreate local stream:", err);
            }
        };

        const calleeReconnect = async () => {
            try {
                if (!callState?.offer) return console.warn("No offer found — cannot recreate answer yet");

                const permission: { audio: boolean; video?: boolean } = {
                    audio: true
                };
                if (callState.type === "video") permission.video = true;
                const stream = await navigator.mediaDevices.getUserMedia(permission);
                setLocalStream(stream);

                const pc = pcRef.current || new RTCPeerConnection();
                pcRef.current = pc;

                stream.getTracks().forEach(track => pc.addTrack(track, stream));

                pc.ontrack = (event) => {
                    event.streams[0].getTracks().forEach((track) => {
                        setRemoteStream((prev) => {
                            prev?.addTrack(track);
                            return prev;
                        })
                    })
                };

                await pc.setRemoteDescription(callState.offer);

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                // send new answer to server
                socket.emit("update_call_state", {
                    initiatorId: callState.initiatorId,
                    receiverId: callState.receiverId,
                    status: callState.status,
                    answer,
                });

                console.log("🔄 Callee reconnected and resent answer:", answer);
            } catch (err) {
                console.error("Failed to recreate callee stream:", err);
            }
        };


        //conditions for calling reconnect();
        const isUserCaller = callState.initiatorId === user.user_id;
        const isUserCallee = callState.receiverId === user.user_id;
        //1st
        if (!(["ended", "rejected"]).includes(callState.status) && isUserCaller && !localStream) callerReconnect();
        //if (!(["ended", "rejected"]).includes(callState.status) && isUserCallee && !localStream) calleeReconnect();

    }, [callState, localStream, remoteStream, user]);



    //3b, if callee accept the call, new pc from callee (callee app), set offer as remote
    /// answering logic (callee)
    const acceptCall = useCallback(async () => {
        if (!callState) {
            setPrompt({
                type: "error",
                title: "Incoming call failed",
            });
            return;
        }
    
        try {
            const pc = pcRef.current || new RTCPeerConnection();
            pcRef.current = pc;
    
            // 1️⃣ Handle incoming tracks BEFORE setRemoteDescription
            pc.ontrack = (event) => {
                event.streams[0].getTracks().forEach((track) => {
                    setRemoteStream((prev) => {
                        prev?.addTrack(track);
                        return prev;
                    })
                })
            };
    
            // 2️⃣ Get local media
            const permission: { audio: boolean; video?: boolean } = { audio: true };
            if (callState.type === "video") permission.video = true;
            const stream = await navigator.mediaDevices.getUserMedia(permission);
    
            setLocalStream(stream);
    
            // 3️⃣ Add local tracks
            stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    
            // 4️⃣ Set remote description (caller’s offer)
            await pc.setRemoteDescription(new RTCSessionDescription(callState.offer));
    
            // 5️⃣ Create answer and set local description
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            const payload = { _id: callState._id, status: "connecting" } as UpdateCallStatePayload
            // 6️⃣ Send answer to caller
            payload.answer = answer;
            socket.emit("update_call_state", payload);
    
            console.log("✅ Call answered and answer sent:", answer);
        } catch (err) {
            console.error("❌ Failed to accept call:", err);
            setPrompt({
                type: "error",
                title: "Failed to accept call",
            });
        }
    }, [callState, socket, user]);
    


    //(caller code) useEffect dep callState check if callState.answer exist and there is no remote stream yet update the remote stream
    useEffect(() => {
        if (!callState || !pcRef.current || remoteStream) return;
        const { status, answer } = callState;
        const pc = pcRef.current;

        if (status !== "accepted" || !answer) return;

        const attachRemoteStream = async () => {
            if (pc.signalingState !== "have-local-offer") return; // <--- prevent InvalidStateError
            console.log("Caller setting remote stream");

            const stream = new MediaStream();

            pc.ontrack = (event) => {
                event.streams[0]?.getTracks().forEach((t) => stream.addTrack(t));
                setRemoteStream(stream);
            };

            await pc.setRemoteDescription(answer);

            updateCallState({
                _id: callState._id,
                status: "connecting",
            });
        };

        attachRemoteStream();
    }, [callState, remoteStream]);




    useEffect(() => {
        if (!socket) return;
        if (!pcRef.current || !callState || user.user_id === "Loading...") return;
        const pc = pcRef.current;
        const remoteUserId = callState.initiatorId === user.user_id ? callState.receiverId : callState.initiatorId;

        // send ICE candidate
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                const payload: CallIceCandidatePayload = {
                    remoteUserId, candidate: event.candidate
                }
                socket.emit("call_ice_candidate", payload);
            }
        };

        // receive ICE candidate
        const handleCandidate = (payload: CallIceCandidatePayload) => {
            pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        };
        socket.on("call_ice_candidate", handleCandidate);

        return () => {
            socket.off("call_ice_candidate", handleCandidate);
        };
    }, [pcRef, callState, user, socket]);




    return (
        <callContext.Provider value={{
            callState, callLogs,
            startCall, updateCallState,
            localStream, remoteStream,
            acceptCall
        }}>
            {children}
        </callContext.Provider>
    )
}



export const useCallProvider = () => {
    const context = useContext(callContext);
    if (!context) throw Error("useCallProvider Must be used within callProvider");
    return context;
}