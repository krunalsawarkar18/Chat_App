import React, { useEffect, useRef, useState } from "react";
import {
  HiOutlineCheck,
  HiOutlinePaperAirplane,
  HiOutlinePaperClip,
  HiOutlinePencilSquare,
  HiOutlineSparkles,
  HiOutlineTrash,
  HiOutlineXCircle,
  HiOutlineXMark,
} from "react-icons/hi2";
import { FaFacebookMessenger } from "react-icons/fa";
import axios from "axios";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Loader from "../common/Loader";
import moment from "moment";

const MAX_ATTACHMENTS = 5;
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024; // 4MB

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("File read failed"));
    reader.readAsDataURL(file);
  });

const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
};

const MessagesContainer = ({ theme, chatUserId, chatUser, onExitChat }) => {
  const { token } = useSelector((state) => state.auth);
  const { userData } = useSelector((state) => state.user);
  const { socket, allOnlineUsers } = useSelector((state) => state.socketIo);
  const [loading, setLoading] = useState(false);
  const [allMessages, setAllMessages] = useState([]);
  const messagesContainerRef = useRef(null);
  const [message, setMessage] = useState("");
  const [msgLoading, setMsgLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [editingMessageId, setEditingMessageId] = useState(null);

  const classes =
    theme === "dark"
      ? {
          emptyIcon: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200 shadow-[0_20px_60px_rgba(34,211,238,0.12)]",
          emptySparkle: "text-amber-300",
          title: "text-white",
          text: "text-slate-400",
          wrapper: "bg-[linear-gradient(180deg,#0f172a_0%,#020617_100%)]",
          header: "border-white/10",
          subLabel: "text-slate-500",
          presenceOnline: "text-emerald-300",
          presenceOffline: "text-slate-400",
          dateCard: "border-white/10 bg-white/[0.04]",
          exitButton: "border-white/10 bg-slate-900 text-slate-200 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-100",
          noConversation: "border-white/10 bg-white/[0.03]",
          noConversationIcon: "bg-slate-900 text-cyan-300",
          incomingBubble: "border-white/10 bg-white/[0.06] text-slate-100",
          outgoingBubble: "bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950",
          time: "text-slate-500",
          footer: "border-white/10 bg-slate-950/60",
          input:
            "border-white/10 bg-slate-900 text-white placeholder:text-slate-500 focus:border-cyan-400/50 focus:bg-slate-950",
          sendButton:
            "bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 hover:shadow-[0_16px_35px_rgba(56,189,248,0.28)]",
        }
      : {
          emptyIcon: "border-indigo-200 bg-indigo-50 text-indigo-600 shadow-[0_20px_60px_rgba(129,140,248,0.14)]",
          emptySparkle: "text-amber-500",
          title: "text-slate-800",
          text: "text-slate-500",
          wrapper: "bg-[linear-gradient(180deg,#eef2ff_0%,#ecfeff_45%,#fefce8_100%)]",
          header: "border-indigo-100",
          subLabel: "text-slate-400",
          presenceOnline: "text-emerald-600",
          presenceOffline: "text-slate-500",
          dateCard: "border-emerald-100 bg-emerald-50/75",
          exitButton: "border-rose-100 bg-rose-50/80 text-rose-600 hover:border-rose-200 hover:bg-rose-100 hover:text-rose-700",
          noConversation: "border-indigo-100 bg-indigo-50/50",
          noConversationIcon: "bg-indigo-100 text-indigo-600",
          incomingBubble: "border-emerald-100 bg-emerald-50/80 text-slate-700",
          outgoingBubble: "bg-gradient-to-r from-amber-300 via-rose-300 to-indigo-300 text-slate-900",
          time: "text-slate-400",
          footer: "border-indigo-100 bg-[#fff8ef]/70",
          input:
            "border-amber-100 bg-amber-50/70 text-slate-700 placeholder:text-slate-400 focus:border-indigo-300 focus:bg-indigo-50/70",
          sendButton:
            "bg-gradient-to-r from-amber-300 via-rose-300 to-indigo-300 text-slate-950 hover:shadow-[0_16px_35px_rgba(129,140,248,0.2)]",
        };

  const resetComposer = () => {
    setMessage("");
    setAttachments([]);
    setEditingMessageId(null);
  };

  const onPickFiles = () => {
    if (editingMessageId) return;
    fileInputRef.current?.click();
  };

  const onFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";

    if (files.length < 1) return;

    const remaining = Math.max(0, MAX_ATTACHMENTS - attachments.length);
    const filesToAdd = files.slice(0, remaining);

    const next = [];

    for (const file of filesToAdd) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`${file.name} is too large (max ${formatBytes(MAX_FILE_SIZE_BYTES)})`);
        continue;
      }

      try {
        const dataUrl = await fileToDataUrl(file);
        next.push({
          name: file.name,
          mime: file.type || "application/octet-stream",
          size: file.size,
          kind: file.type?.startsWith("image/") ? "image" : "file",
          dataUrl,
        });
      } catch {
        toast.error(`Failed to read ${file.name}`);
      }
    }

    if (next.length) {
      setAttachments((prev) => [...prev, ...next]);
    }

    if (files.length > remaining) {
      toast.error(`Only ${MAX_ATTACHMENTS} attachments allowed`);
    }
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!chatUserId) return;

    const trimmed = message.trim();

    try {
      setMsgLoading(true);

      if (editingMessageId) {
        if (!trimmed) return;

        const response = await axios.patch(
          `${import.meta.env.VITE_BACKEND_URL}/edit-message/${editingMessageId}`,
          { message: trimmed },
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        if (!response?.data?.success) {
          throw new Error("Error occur during updating message");
        }

        const updated = response.data.updatedMessage;
        setAllMessages((prev) => prev.map((m) => (m?._id === updated?._id ? updated : m)));
        resetComposer();
        return;
      }

      if (!trimmed && attachments.length < 1) return;

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/send-message`,
        {
          receiverId: chatUserId,
          message: trimmed,
          attachments,
        },
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      if (!response?.data?.success) {
        throw new Error("Error occur during sending message");
      }

      setAllMessages((prev) => [...prev, response.data.newMessage]);
      resetComposer();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setMsgLoading(false);
    }
  };

  const startEditing = (messageItem) => {
    if (!messageItem?._id || messageItem?.isDeleted) return;
    setEditingMessageId(messageItem._id);
    setMessage(messageItem?.message || "");
    setAttachments([]);
  };

  const cancelEditing = () => {
    resetComposer();
  };

  const deleteMessageById = async (messageId) => {
    if (!messageId) return;

    const confirm = window.confirm("Delete this message?");
    if (!confirm) return;

    try {
      setMsgLoading(true);
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/delete-message/${messageId}`,
        {
          headers: {
            Authorization: "Bearer " + token,
          },
        }
      );

      if (!response?.data?.success) {
        throw new Error("Error occur during deleting message");
      }

      const deleted = response.data.deletedMessage;
      setAllMessages((prev) => prev.map((m) => (m?._id === deleted?._id ? deleted : m)));

      if (editingMessageId === messageId) {
        resetComposer();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setMsgLoading(false);
    }
  };

  useEffect(() => {
    if (!chatUserId || !token) {
      setAllMessages([]);
      return;
    }

    const getAllMessages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/get-all-messages/${chatUserId}`,
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );

        if (!response?.data?.success) {
          throw new Error("Error occur during fetching all messages");
        }

        setAllMessages(response?.data?.allMessages ?? []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    getAllMessages();
  }, [chatUserId, token]);

  useEffect(() => {
    if (!messagesContainerRef.current) {
      return;
    }

    messagesContainerRef.current.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [allMessages]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const isActiveConversation = (data) => {
      const currentUserId = userData?._id;
      if (!currentUserId || !chatUserId) return false;

      const senderId = String(data?.senderId || "");
      const receiverId = String(data?.receiverId || "");

      return (
        (senderId === String(chatUserId) && receiverId === String(currentUserId)) ||
        (senderId === String(currentUserId) && receiverId === String(chatUserId))
      );
    };

    const handleMessage = (data) => {
      if (!isActiveConversation(data)) return;

      setAllMessages((prev) => {
        const exists = prev.some((m) => m?._id && data?._id && m._id === data._id);
        if (exists) return prev;
        return [...prev, data];
      });
    };

    const handleMessageUpdated = (data) => {
      if (!isActiveConversation(data)) return;
      setAllMessages((prev) => prev.map((m) => (m?._id === data?._id ? data : m)));
    };

    const handleMessageDeleted = (data) => {
      if (!isActiveConversation(data)) return;
      setAllMessages((prev) => prev.map((m) => (m?._id === data?._id ? data : m)));
    };

    socket.on("new-message", handleMessage);
    socket.on("message-updated", handleMessageUpdated);
    socket.on("message-deleted", handleMessageDeleted);

    return () => {
      socket.off("new-message", handleMessage);
      socket.off("message-updated", handleMessageUpdated);
      socket.off("message-deleted", handleMessageDeleted);
    };
  }, [chatUserId, socket, userData?._id]);

  if (!chatUserId) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
        <div className={`relative flex h-24 w-24 items-center justify-center rounded-[2rem] border ${classes.emptyIcon}`}>
          <FaFacebookMessenger size={38} />
          <HiOutlineSparkles className={`absolute -right-3 -top-3 text-3xl ${classes.emptySparkle}`} />
        </div>
        <h2 className={`mt-8 text-3xl font-bold ${classes.title}`}>Your conversations live here</h2>
        <p className={`mt-3 max-w-md text-base leading-7 ${classes.text}`}>
          Select a person from the sidebar to start chatting in a cleaner, real-time workspace.
        </p>
      </div>
    );
  }

  const isChatOnline = allOnlineUsers.includes(chatUserId);

  return (
    <div className={`flex h-full min-w-0 flex-col ${classes.wrapper}`}>
      <div className={`border-b px-6 py-5 ${classes.header}`}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-[0.35em] ${classes.subLabel}`}>
              Active conversation
            </p>
            <h2 className={`mt-2 text-2xl font-bold ${classes.title}`}>
              {chatUser
                ? `${chatUser.firstName} ${chatUser.lastName}`
                : "Selected chat"}
            </h2>
            <p className={`mt-2 text-sm ${isChatOnline ? classes.presenceOnline : classes.presenceOffline}`}>
              {isChatOnline ? "Online now" : "Offline"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`hidden rounded-2xl border px-4 py-3 shadow-sm md:block ${classes.dateCard}`}>
              <p className={`text-xs uppercase tracking-[0.25em] ${classes.subLabel}`}>Today</p>
              <p className={`mt-1 text-sm font-semibold ${theme === "dark" ? "text-slate-200" : "text-slate-700"}`}>{moment().format("ddd, MMM D")}</p>
            </div>

            <button
              type="button"
              onClick={onExitChat}
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-sm transition duration-300 ${classes.exitButton}`}
            >
              <HiOutlineXMark className="text-lg" />
              Exit chat
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader />
        </div>
      ) : (
        <div
          ref={messagesContainerRef}
          className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6"
        >
          {allMessages.length < 1 ? (
            <div className={`flex h-full flex-col items-center justify-center rounded-[1.75rem] border border-dashed px-6 text-center ${classes.noConversation}`}>
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${classes.noConversationIcon}`}>
                <FaFacebookMessenger size={28} />
              </div>
              <h3 className={`mt-5 text-2xl font-bold ${classes.title}`}>No conversation yet</h3>
              <p className={`mt-2 max-w-sm text-sm leading-7 ${classes.text}`}>
                Send the first message to get this thread started.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {allMessages.map((messageItem, index) => {
                const isCurrentUser = String(messageItem?.senderId) === String(userData?._id);
                const isDeleted = Boolean(messageItem?.isDeleted);
                const messageAttachments = Array.isArray(messageItem?.attachments) ? messageItem.attachments : [];

                return (
                  <div
                    key={messageItem?._id || index}
                    className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[82%] sm:max-w-[70%] ${isCurrentUser ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      <div
                        className={`rounded-[1.5rem] px-4 py-3 text-sm font-medium leading-7 shadow-[0_12px_24px_rgba(148,163,184,0.18)] ${
                          isCurrentUser
                            ? `rounded-br-md ${classes.outgoingBubble}`
                            : `rounded-bl-md border ${classes.incomingBubble}`
                        }`}
                      >
                        {isDeleted ? (
                          <span className="opacity-80 italic">Message deleted</span>
                        ) : (
                          <>
                            {messageItem?.message ? <p>{messageItem.message}</p> : null}

                            {messageAttachments.length ? (
                              <div className="mt-3 flex flex-col gap-3">
                                {messageAttachments.map((att, attIndex) => {
                                  const key = `${att?.name || "attachment"}-${attIndex}`;
                                  const isImage = att?.kind === "image";

                                  return (
                                    <div key={key} className="w-full">
                                      {isImage ? (
                                        <a
                                          href={att?.dataUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="block"
                                        >
                                          <img
                                            src={att?.dataUrl}
                                            alt={att?.name || "image"}
                                            className="max-h-64 w-full rounded-2xl border border-white/10 object-cover"
                                            loading="lazy"
                                          />
                                        </a>
                                      ) : (
                                        <a
                                          href={att?.dataUrl}
                                          download={att?.name || "file"}
                                          className="block rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm"
                                        >
                                          <p className="truncate font-semibold">{att?.name || "File"}</p>
                                          <p className="mt-1 text-xs opacity-80">{formatBytes(att?.size)}</p>
                                        </a>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : null}
                          </>
                        )}
                      </div>

                      <div className={`flex items-center gap-2 px-1 text-xs ${classes.time}`}>
                        <span>{moment(messageItem?.createdAt).format("h:mm A")}</span>
                        {!isDeleted && messageItem?.isEdited ? <span className="opacity-80">Edited</span> : null}

                        {isCurrentUser && !isDeleted ? (
                          <>
                            <button
                              type="button"
                              className="ml-2 inline-flex items-center gap-1 opacity-80 hover:opacity-100"
                              onClick={() => startEditing(messageItem)}
                              title="Edit"
                            >
                              <HiOutlinePencilSquare className="text-base" />
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 opacity-80 hover:opacity-100"
                              onClick={() => deleteMessageById(messageItem?._id)}
                              title="Delete"
                            >
                              <HiOutlineTrash className="text-base" />
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className={`border-t px-4 py-4 sm:px-6 ${classes.footer}`}>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          onChange={onFilesSelected}
        />

        {editingMessageId ? (
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className={`text-xs font-semibold uppercase tracking-[0.25em] ${classes.subLabel}`}>
              Editing message
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold"
              onClick={cancelEditing}
            >
              <HiOutlineXCircle className="text-base" />
              Cancel
            </button>
          </div>
        ) : null}

        {attachments.length ? (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((att, index) => (
              <div
                key={`${att?.name || "attachment"}-${index}`}
                className="flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs"
              >
                <span className="truncate font-semibold">{att?.name || "Attachment"}</span>
                <span className="opacity-80">{formatBytes(att?.size)}</span>
                <button
                  type="button"
                  className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/10"
                  onClick={() => removeAttachment(index)}
                  title="Remove"
                >
                  <HiOutlineXMark className="text-sm" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <form onSubmit={sendMessage} className="flex items-center gap-3">
          <button
            type="button"
            onClick={onPickFiles}
            disabled={msgLoading || Boolean(editingMessageId) || attachments.length >= MAX_ATTACHMENTS}
            className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.35rem] border transition duration-300 disabled:opacity-60 ${
              theme === "dark"
                ? "border-white/10 bg-slate-900 text-slate-200 hover:bg-slate-950"
                : "border-amber-100 bg-amber-50/70 text-slate-700 hover:bg-amber-50"
            }`}
            title="Attach"
          >
            <HiOutlinePaperClip className="text-2xl" />
          </button>

          <input
            type="text"
            className={`flex-1 rounded-[1.35rem] border px-5 py-3.5 text-sm outline-none transition duration-300 ${classes.input}`}
            placeholder={editingMessageId ? "Update your message..." : "Write a message..."}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            value={message}
          />

          <button
            className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.35rem] transition duration-300 hover:translate-y-[-1px] disabled:opacity-70 ${classes.sendButton}`}
            disabled={msgLoading}
            type="submit"
          >
            {msgLoading ? (
              <Loader />
            ) : (
              <>
                {editingMessageId ? (
                  <HiOutlineCheck className="text-2xl" />
                ) : (
                  <HiOutlinePaperAirplane className="text-2xl" />
                )}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessagesContainer;
