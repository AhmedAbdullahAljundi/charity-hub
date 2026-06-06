"use client";

import { useState } from "react";
import { X, Send, Loader2 } from "lucide-react";
import { api } from "@/lib/api/client";
import { toast } from "sonner";

interface SendMessageModalProps {
  user: { id: string; name: string };
  onClose: () => void;
  isRtl: boolean;
}

export function SendMessageModal({ user, onClose, isRtl }: SendMessageModalProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError("");

    try {
      await api.post("/notifications/send", { targetUserId: user.id, message });
      toast.success(isRtl ? "تم إرسال الرسالة بنجاح" : "Message sent successfully");
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || (isRtl ? "حدث خطأ أثناء الإرسال" : "Error sending message"));
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-slate-900 dark:text-white resize-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 ring-1 ring-slate-200 dark:ring-slate-700 animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute top-4 end-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
          <X className="w-5 h-5" />
        </button>
        
        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
          {isRtl ? `إرسال رسالة إلى ${user.name}` : `Send message to ${user.name}`}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {isRtl ? "ستظهر هذه الرسالة كإشعار فوري لدى المستخدم." : "This message will appear as an instant notification for the user."}
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              placeholder={isRtl ? "اكتب رسالتك هنا..." : "Type your message here..."}
              className={inputCls}
            />
          </div>

          {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
            {isRtl ? "إرسال الرسالة" : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}
