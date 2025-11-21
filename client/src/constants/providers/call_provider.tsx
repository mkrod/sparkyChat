import { createContext, useCallback, useContext, useEffect, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import socket from '../socket.io/socket_conn.js';
import type { AllCallLogsType, CallListTab, CallLog, CallState, CustomEvent, Response, StartCallPayload, Streams, UpdateCallStatePayload } from '../types.js';
import { fetchUserCallLogs, fetchUserCallState, fetchUserParallelCallLogs } from '../calls/controller.js';
import { useConnProvider } from './conn_provider.js';
import { useChatProvider } from './chatProvider.js';
import { createPeer } from '../peerjs/peer.conn.js';
import { Peer } from 'peerjs';
import { type MediaConnection } from 'peerjs';
import { callTabs } from '../var_2.js';

interface CallContextType {
    callState: CallState | undefined;
    callLogs: AllCallLogsType | undefined;
    callLogsParal: CallLog[];
    callLogFilter: CallListTab["code"];
    setCallLogFilter: Dispatch<SetStateAction<CallListTab["code"]>>;
    callLogPage: number;
    setCallLogPage: Dispatch<SetStateAction<number>>;
    fetchCallLogs: boolean;
    setFetchCallLogs: Dispatch<SetStateAction<boolean>>;
    updateCallState: (payload: UpdateCallStatePayload) => void;
    startCall: (payload: StartCallPayload) => void;
    acceptCall: () => void;
    screenStream: Streams | undefined;
    localStream: Streams | undefined;
    remoteStream: Streams | undefined;
    toggleVideo: () => void;
    toggleMic: () => void;
    isLocalVideoPaused: boolean;
    isLocalAudioPaused: boolean;
    isRemoteVideoPaused: boolean;
    isRemoteAudioPaused: boolean;
    toggleShareScreen: () => void;
    isSharingScreen: boolean;
    switchCamera: () => void;
    //setIsSharingScreen: Dispatch<SetStateAction<boolean>>;
}

const CallContext = createContext<CallContextType | null>(null);

export const CallProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useConnProvider();
    const { setPrompt, setHasCallState, isMobile } = useChatProvider();

    const [callState, setCallState] = useState<CallState | undefined>();
    const [callLogs, setCallLogs] = useState<AllCallLogsType | undefined>(undefined);

    const [callLogsParal, setCallLogsParal] = useState<CallLog[]>([]);


    const [fetchCallState, setFetchCallState] = useState<boolean>(true);
    const [fetchCallLogs, setFetchCallLogs] = useState<boolean>(true);

    const [callLogFilter, setCallLogFilter] = useState<CallListTab["code"]>(callTabs[0].code);
    const [callLogPage, setCallLogPage] = useState<number>(1);

    const peerRef = useRef<Peer | null>(null);
    const callRef = useRef<MediaConnection | null>(null);

    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const shouldRetryRef = useRef(true);


    const [screenStream, setScreenStream] = useState<Streams | undefined>(undefined);
    const [localStream, setLocalStream] = useState<Streams | undefined>(undefined);
    const [remoteStream, setRemoteStream] = useState<Streams | undefined>(undefined);

    const [isLocalVideoPaused, setIsLocalVideoPaused] = useState<boolean>(false);
    const [isLocalAudioPaused, setIsLocalAudioPaused] = useState<boolean>(false);
    const [isRemoteVideoPaused, setIsRemoteVideoPaused] = useState<boolean>(false);
    const [isRemoteAudioPaused, setIsRemoteAudioPaused] = useState<boolean>(false);

    const [isSharingScreen, setIsSharingScreen] = useState<boolean>(false);


    ///?


    // -------------------- Fetch Call State & Logs --------------------
    useEffect(() => {
        if (!fetchCallState) return;
        fetchUserCallState()
            .then((res: Response<CallState>) => {
                if (res.status === 200) {
                    setCallState(res.data);
                    setHasCallState(res.data && res.data.status !== "ringing")
                };
            })
            .catch(err => console.error("Cannot fetch call state:", err))
            .finally(() => setFetchCallState(false));
    }, [fetchCallState]);

    useEffect(() => {
        if (!fetchCallLogs) return;
        fetchUserCallLogs(callLogPage, callLogFilter)
            .then((res: Response) => {
                if (res.status === 200) setCallLogs(res.data as AllCallLogsType);
            })
            .catch(err => console.error("Cannot fetch call logs:", err))
            .finally(() => setFetchCallLogs(false));

        fetchUserParallelCallLogs()
            .then((res) => {
                if (res.status === 200) {
                    setCallLogsParal(res.data as CallLog[])
                }
            })
            .catch(err => console.error("Cannot fetch call logs paral:", err))
            .finally(() => setFetchCallLogs(false));
    }, [fetchCallLogs, callLogFilter, callLogPage]);

    useEffect(() => {
        const handleCallStateChange = () => setFetchCallState(true);
        const handleCallLogsChange = () => setFetchCallLogs(true);
        socket.on("call_state_changed", handleCallStateChange);
        socket.on("call_logs_changed", handleCallLogsChange);
        return () => {
            socket.off("call_state_changed", handleCallStateChange);
            socket.off("call_logs_changed", handleCallLogsChange);
        };
    }, [socket]);

    // -------------------- Update Call State --------------------
    const updateCallState = useCallback((payload: UpdateCallStatePayload) => {
        socket.emit("update_call_state", payload);
    }, [socket]);

    //init peer
    useEffect(() => {
        if (user.user_id === "Loading...") return;

        // Create peer
        const peer = createPeer(user.user_id);
        peerRef.current = peer;

        // ------------------- Peer Events -------------------
        peer.on("open", (id) => {
            console.log("✅ Peer connection opened with ID:", id);
        });

        peer.on("connection", (conn) => {
            console.log("🔗 Incoming data connection:", conn);
            conn.on("data", (data) => console.log("📩 Received data:", data));
        });

        peer.on("call", (call) => {
            console.log("📞 Incoming call:", call);
            callRef.current = call;
        });

        peer.on("disconnected", () => {
            console.warn("⚠️ Peer temporarily disconnected from server");
            // Don't reconnect here! Let it stay disconnected.
            // Only handle UI or retries elsewhere if needed.
        });

        peer.on("close", () => {
            console.warn("❌ Peer connection closed");
        });

        peer.on("error", (err) => {
            console.error("❌ Peer error:", err);
        });

        // Cleanup on unmount / leave page
        return () => {
            peer.destroy();
            peerRef.current = null;
        };
    }, [user.user_id]);




    // ------------------------End call ------------------------------\\

    const endCall = useCallback(() => {
        if (localStream) {
            localStream.stream.getTracks().forEach(track => track.stop());
        }

        if (callRef.current) {
            callRef.current.close();
            callRef.current = null;
        }

        setLocalStream(undefined);
        setRemoteStream(undefined);

        setIsLocalAudioPaused(false)
        setIsRemoteVideoPaused(false)
        setIsLocalVideoPaused(false);
        setIsRemoteAudioPaused(false);

        console.log("✅ Call properly ended");
    }, [callState, localStream, socket, updateCallState, user.user_id]);




    const cancelRetry = () => {
        shouldRetryRef.current = false;
        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }
        console.log("⏹ Retry cancelled");
    };

    const startCall = useCallback(async (payload: StartCallPayload) => {
        try {
            const mediaConstraints: MediaStreamConstraints = {
                audio: true,
                video: payload.type === "video",
            };

            const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
            setLocalStream({ user_id: user.user_id, stream });

            const peer = peerRef.current;
            if (!peer) {
                setPrompt({ type: "error", title: "You are offline, Try again later!" });
                return;
            }

            let retries = 0;
            const MAX_RETRIES = 3;
            shouldRetryRef.current = true;

            const attemptCall = () => {
                if (!shouldRetryRef.current) return;
                if (!peer || peer.disconnected) {
                    console.warn("❌ Peer disconnected, cannot call");
                    return;
                }

                const call = peer.call(payload.receiverId, stream);
                callRef.current = call;

                call.on("stream", (remoteStream) => {
                    setRemoteStream({ user_id: payload.receiverId, stream: remoteStream });
                });


                call.on("close", () => {
                    console.log("📞 Call ended");
                    endCall();
                    cancelRetry(); // stop any pending retries
                });

                call.on("error", (err) => {
                    console.error("Call error:", err);
                });
            };

            // Remove old peer error handler to prevent multiple bindings
            peer.off("error");

            peer.on("error", (err: any) => {
                console.error("❌ PeerJS error:", err);

                if (!shouldRetryRef.current) return;

                if (err?.type === "peer-unavailable" || err?.message?.includes("Could not connect to peer")) {
                    if (retries < MAX_RETRIES) {
                        retries++;
                        console.warn(`🚫 Retry ${retries}/${MAX_RETRIES} — Target peer not connected`);
                        retryTimeoutRef.current = setTimeout(attemptCall, 2000);
                    } else {
                        console.warn("❌ Giving up after multiple retries");
                        endCall();
                    }
                } else {
                    console.error("⚠️ Unexpected peer error:", err.message);
                }
            });

            attemptCall(); // first attempt
            socket.emit("start_call", { ...payload });
            console.log("✅ Call started (caller)");
        } catch (err) {
            console.error("❌ Error starting call:", err);
            setPrompt({ type: "error", title: "Failed to start " + payload.type + " call" });
        }
    }, [socket, user, endCall, setPrompt]);





    //dont touch anything from here
    ////////////////////////
    /////////////////////
    // -------------------- Accept Call (Callee) --------------------
    const acceptCall = useCallback(async () => {
        if (!callState) return;
        const call = callRef.current as MediaConnection;

        const mediaConstraints: MediaStreamConstraints = { audio: true, video: callState.type === "video" };
        const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints)

        setLocalStream({ user_id: user.user_id, stream })
        call.answer(stream);

        call.on("stream", (remoteStream) => {
            setRemoteStream({ user_id: callState.initiatorId, stream: remoteStream });
            updateCallState({ _id: callState._id, status: "connected" });
        });

        call.on("close", () => {
            console.log("Call ended");
            endCall();
        });

        call.on("error", (err) => {
            console.error("Call error:", err);
        });

    }, [callState, socket, setPrompt, callRef.current]);



    // -------------------- Caller Cleanup if Call Ended --------------------
    useEffect(() => {
        if (!callState || user.user_id === "Loading...") return;

        const isCaller = callState.initiatorId === user.user_id;
        if (isCaller && ["ended", "rejected"].includes(callState.status)) {
            const payload: UpdateCallStatePayload = { _id: callState._id, status: "close" };
            setTimeout(() => {
                updateCallState(payload);
                endCall();
                cancelRetry();
            }, 2000);
        }
    }, [callState, user.user_id]);

    // -------------------- Auto-Ringing for Callee --------------------
    useEffect(() => {
        if (!callState || user.user_id === "Loading...") return;

        const isCallee = callState.receiverId === user.user_id;
        if (isCallee && callState.status === "initiated") {
            updateCallState({ _id: callState._id, status: "ringing" });
        }
    }, [callState, user.user_id, updateCallState]);

    const toggleVideo = useCallback(() => {
        if (!localStream) return;

        const videoTrack = localStream.stream.getVideoTracks()[0];
        if (!videoTrack) return;

        videoTrack.enabled = !videoTrack.enabled;
        setIsLocalVideoPaused(!videoTrack.enabled);
        //tell the other user
        const payload: CustomEvent = {
            remoteUserId: remoteStream ? remoteStream.user_id : "",
            event: videoTrack.enabled ? "remote_video_stream_resumed" : "remote_video_stream_paused",
            senderId: localStream ? localStream.user_id : "",
        }
        socket.emit("custom_event", payload)
        console.log("Video is now", videoTrack.enabled ? "ON" : "OFF");
    }, [localStream, remoteStream]);


    const toggleMic = useCallback(() => {
        if (!localStream) return;
        const audioTrack = localStream.stream.getAudioTracks()[0];
        if (!audioTrack) return;
        audioTrack.enabled = !audioTrack.enabled;
        setIsLocalAudioPaused(!audioTrack.enabled);
        //tell the other user
        const payload: CustomEvent = {
            remoteUserId: remoteStream ? remoteStream.user_id : "",
            event: audioTrack.enabled ? "remote_audio_stream_resumed" : "remote_audio_stream_paused",
            senderId: localStream ? localStream.user_id : "",
        }
        socket.emit("custom_event", payload)

        console.log("Mic is now", audioTrack.enabled ? "ON" : "OFF");
    }, [localStream, remoteStream]);



    useEffect(() => {
        if (!callState) return;
        const callUsers = [callState.initiatorId, callState.receiverId];

        const pauseVideo = ({ senderId }: { senderId: string }) => {
            if (!callUsers.includes(senderId)) return;
            setIsRemoteVideoPaused(true);
        };

        const resumeVideo = ({ senderId }: { senderId: string }) => {
            if (!callUsers.includes(senderId)) return;
            setIsRemoteVideoPaused(false);
        };

        const pauseAudio = ({ senderId }: { senderId: string }) => {
            if (!callUsers.includes(senderId)) return;
            setIsRemoteAudioPaused(true);
        };

        const resumeAudio = ({ senderId }: { senderId: string }) => {
            if (!callUsers.includes(senderId)) return;
            setIsRemoteAudioPaused(false);
        };

        socket.on("remote_video_stream_paused", pauseVideo);
        socket.on("remote_video_stream_resumed", resumeVideo);
        socket.on("remote_audio_stream_paused", pauseAudio);
        socket.on("remote_audio_stream_resumed", resumeAudio);

        return () => {
            socket.off("remote_video_stream_paused", pauseVideo);
            socket.off("remote_video_stream_resumed", resumeVideo);
            socket.off("remote_audio_stream_paused", pauseAudio);
            socket.off("remote_audio_stream_resumed", resumeAudio);
        };
    }, [socket, callState]);


    const toggleShareScreen = useCallback(async () => {
        if (!localStream || !callRef.current || user.user_id === "Loading...") return;

        const call = callRef.current;
        const videoTrack = localStream.stream.getVideoTracks()[0];
        const sender = call.peerConnection.getSenders().find(s => s.track === videoTrack);

        if (!isSharingScreen) {
            // start screen share
            try {
                const newStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                const screenTrack = newStream.getVideoTracks()[0];

                // Replace the camera track with screen track
                if (sender) sender.replaceTrack(screenTrack);

                // Update local state
                setScreenStream({ user_id: user.user_id, stream: newStream });
                setIsSharingScreen(true);

                // When user stops sharing via browser button
                screenTrack.onended = () => {
                    if (sender) sender.replaceTrack(videoTrack);
                    setScreenStream(undefined);
                    setIsSharingScreen(false);
                };
            } catch (err) {
                console.error("Screen share failed:", err);
                setPrompt({
                    type: "error",
                    title: "Screen Share failed",
                    body: isMobile ? "Screen Sahre only available for Desktop web" : (err as any).toString(),
                })
            }
        } else {
            // stop screen share manually
            if (screenStream) {
                const screenTrack = screenStream.stream.getVideoTracks()[0];
                screenTrack.stop();
            }
            if (sender) sender.replaceTrack(videoTrack);
            setScreenStream(undefined);
            setIsSharingScreen(false);
        }
    }, [localStream, callRef, isSharingScreen, screenStream, user.user_id]);


    const switchCamera = useCallback(async () => {
        if (!localStream) return;
        const call = callRef.current;  // NOT peerRef
        if (!call) return;

        // current track
        const oldTrack = localStream.stream.getVideoTracks()[0];
        if (!oldTrack) return;

        // get available cameras
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cams = devices.filter(d => d.kind === "videoinput");

        if (cams.length < 2) {
            setPrompt({ type: "error", title: "No second camera available" });
            return;
        }

        // pick the opposite camera
        const currentId = oldTrack.getSettings().deviceId;
        const nextCam = cams.find(c => c.deviceId !== currentId) || cams[0];

        // get new stream
        const newStream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: nextCam.deviceId } }
        });

        const newTrack = newStream.getVideoTracks()[0];

        // replace video track on the RTCPeerConnection inside PeerJS call
        const sender = call.peerConnection
            .getSenders()
            .find(s => s.track?.kind === "video");

        if (sender) sender.replaceTrack(newTrack);

        // update your local stream for UI
        localStream.stream.removeTrack(oldTrack);
        localStream.stream.addTrack(newTrack);

        setLocalStream({
            user_id: localStream.user_id,
            stream: localStream.stream
        });

        oldTrack.stop();

        console.log("Camera switched");
    }, [localStream]);



    return (
        <CallContext.Provider value={{
            callState, callLogs, callLogsParal,
            callLogPage, setCallLogPage,
            fetchCallLogs, setFetchCallLogs,
            callLogFilter, setCallLogFilter,
            startCall, acceptCall, updateCallState,
            localStream, remoteStream, screenStream,
            toggleVideo, toggleMic, toggleShareScreen, switchCamera,
            isLocalVideoPaused, isLocalAudioPaused, isRemoteAudioPaused, isRemoteVideoPaused,
            isSharingScreen,
        }}>
            {children}
        </CallContext.Provider>
    );
};

export const useCallProvider = () => {
    const context = useContext(CallContext);
    if (!context) throw new Error("useCallProvider must be used within CallProvider");
    return context;
};
