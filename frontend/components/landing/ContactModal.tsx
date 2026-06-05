"use client";

import { useState } from "react";
import { X, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useLocale } from "next-intl";
import { api } from "@/lib/api/client";

export function ContactModal({ onClose }: { onClose: () => void }) {
  const locale = useLocale();
  const isRtl = locale === "ar";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    
    setLoading(true);
    setError("");
    
    try {
      const res = await api.post("/public/contact", { name, email, message });
      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => onClose(), 3000);
      } else {
        throw new Error("Failed to send");
      }
    } catch (err: any) {
      setError(err.message || (isRtl ? "حدث خطأ أثناء الإرسال" : "An error occurred while sending"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isRtl ? "تواصل معنا" : "Contact Us"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                {isRtl ? "تم الإرسال بنجاح" : "Sent Successfully"}
              </h3>
              <p className="text-slate-500 text-sm">
                {isRtl ? "سيتواصل معك فريق الإدارة قريباً." : "The administration team will contact you shortly."}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isRtl ? "الاسم" : "Name"}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                  placeholder={isRtl ? "الاسم الكريم" : "Your name"}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isRtl ? "البريد الإلكتروني" : "Email"}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition-all"
                  placeholder="email@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isRtl ? "الرسالة" : "Message"}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 transition-all resize-none"
                  placeholder={isRtl ? "اكتب رسالتك هنا..." : "Type your message here..."}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !name || !email || !message}
                className="w-full py-3 mt-4 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> {isRtl ? "جاري الإرسال..." : "Sending..."}</>
                ) : (
                  <><Send className="w-4 h-4" /> {isRtl ? "إرسال الرسالة" : "Send Message"}</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
