"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSpreadsheet, CheckCircle, XCircle, Download } from "lucide-react";
import api from "@/lib/api/client";

interface ImportResult {
  success: number;
  failed: number;
  errors: { sheet: string; row: number; externalId: string; messages: string[] }[];
  created: { externalId: string; code: string; householdId: string }[];
}

export function ImportSection() {
  const [file, setFile]       = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.name.endsWith(".xlsx")) {
      alert("يُسمح فقط بملفات .xlsx");
      return;
    }
    setFile(f);
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post<{ success: boolean; data: ImportResult }>(
        "/analytics/import/households", form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setResult(res.data.data);
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "حدث خطأ أثناء الاستيراد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="flex gap-3 mb-4">
        <Button variant="outline" asChild>
          <a href="/CharityHub_Import_Template_v2.xlsx" download>
            <Download className="w-4 h-4 ml-2" />
            تحميل نموذج Excel للملء
          </a>
        </Button>
      </div>

      <Card
        className={`border-2 border-dashed cursor-pointer transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-muted-foreground/30"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
        onClick={() => inputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 gap-3">
          <FileSpreadsheet className="w-12 h-12 text-muted-foreground" />
          {file ? (
            <p className="font-medium text-green-600">{file.name}</p>
          ) : (
            <>
              <p className="font-medium">اسحب الملف هنا أو اضغط للاختيار</p>
              <p className="text-sm text-muted-foreground">ملفات .xlsx فقط — بحد أقصى 10 MB</p>
            </>
          )}
        </CardContent>
      </Card>

      <input
        ref={inputRef} type="file" accept=".xlsx" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      <Button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full"
        size="lg"
      >
        {loading ? "جاري المعالجة..." : "بدء الاستيراد"}
      </Button>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="flex items-center gap-3 pt-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-700">{result.success}</p>
                  <p className="text-sm text-green-600">أسرة تم استيرادها بنجاح</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-200 bg-red-50">
              <CardContent className="flex items-center gap-3 pt-6">
                <XCircle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-700">{result.failed}</p>
                  <p className="text-sm text-red-600">أسرة فشل استيرادها</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {result.created.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-700 text-base">الأسر المستوردة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y max-h-60 overflow-y-auto pr-2">
                  {result.created.map((c) => (
                    <div key={c.externalId} className="flex justify-between py-2 text-sm">
                      <span>رقم خارجي: {c.externalId}</span>
                      <Badge variant="secondary">رقم القيد: {c.code}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {result.errors.length > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-700 text-base">أخطاء الاستيراد</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {result.errors.map((err, i) => (
                    <div key={i} className="bg-red-50 rounded p-3 text-sm">
                      <p className="font-medium text-red-800">
                        رقم خارجي: {err.externalId} — سطر {err.row}
                      </p>
                      <ul className="list-disc list-inside mt-1 space-y-0.5">
                        {err.messages.map((m, j) => (
                          <li key={j} className="text-red-700">{m}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
