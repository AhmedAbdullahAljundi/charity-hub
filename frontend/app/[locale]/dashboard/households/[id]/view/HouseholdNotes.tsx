"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "next-intl";
import { UserDto, listUsersApi } from "@/lib/api/users-api";

export function HouseholdNotes({ householdId }: { householdId: string }) {
  const locale = useLocale();
  const isRtl = locale === "ar";
  
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const [users, setUsers] = useState<UserDto[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  useEffect(() => {
    fetchNotes();
    fetchUsers();
  }, [householdId]);

  const fetchNotes = async () => {
    try {
      const res = await api.get(`/households/${householdId}/notes`);
      if (res.data?.success) setNotes(res.data.data);
    } catch (e) {
      console.error("Failed to fetch notes", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await listUsersApi({ limit: 100 });
      setUsers(res.users);
    } catch (e) {
      console.error("Failed to fetch users", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      await api.post(`/households/${householdId}/notes`, {
        content,
        notifyUserIds: selectedUserIds,
      });
      toast.success(isRtl ? "تمت الإضافة بنجاح" : "Note added successfully");
      setContent("");
      setSelectedUserIds([]);
      fetchNotes();
    } catch (e) {
      toast.error(isRtl ? "حدث خطأ" : "Error adding note");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUser = (id: string) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter(u => u !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  return (
    <Card className="bg-white border border-slate-100 shadow-sm mt-6">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
        <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-slate-500" /> 
          {isRtl ? "ملاحظات فريق العمل" : "Team Notes"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Note Form */}
        <form onSubmit={handleSubmit} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 resize-none"
            placeholder={isRtl ? "اكتب ملاحظة للأسرة..." : "Write a note..."}
            rows={2}
          />
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div className="flex-1">
              <label className="text-xs font-medium text-slate-500 mb-1 block">
                {isRtl ? "إرسال إشعار إلى:" : "Notify users:"}
              </label>
              <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                {users.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleUser(u.id)}
                    className={`text-[10px] px-2 py-1 rounded-full transition-colors border ${
                      selectedUserIds.includes(u.id)
                        ? "bg-green-100 border-green-300 text-green-700"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {u.name}
                  </button>
                ))}
              </div>
            </div>
            <Button
              type="submit"
              disabled={submitting || !content.trim()}
              className="bg-green-500 hover:bg-green-600 text-white gap-2 mt-2 sm:mt-0"
              size="sm"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isRtl ? "إضافة ملاحظة" : "Add Note"}
            </Button>
          </div>
        </form>

        {/* Notes List */}
        <div className="space-y-3 mt-4">
          {loading ? (
            <div className="py-4 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-slate-400" /></div>
          ) : notes.length === 0 ? (
            <div className="text-center py-6 text-sm text-slate-500">
              {isRtl ? "لا توجد ملاحظات مسجلة." : "No notes yet."}
            </div>
          ) : (
            notes.map(note => (
              <div key={note.id} className="bg-slate-50/50 p-3 rounded-lg border border-slate-100 flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {note.user.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="font-semibold text-slate-800 text-sm">{note.user.name}</span>
                    <span className="text-[10px] text-slate-400" dir="ltr">
                      {new Date(note.createdAt).toLocaleString(isRtl ? 'ar-EG' : 'en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{note.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
