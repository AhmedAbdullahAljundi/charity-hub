"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useEducationStore } from "@/lib/stores/educationStore";
import { EducationRecordDto, getStudentHistory } from "@/lib/api/education-api";

export default function EducationRecordViewPage() {
  const params = useParams();
  const id = params.id as string;
  const { current, fetchOne } = useEducationStore();
  const [history, setHistory] = useState<EducationRecordDto[]>([]);

  useEffect(() => {
    if (id) {
      fetchOne(id).then(r => {
        if (r?.person?.id) {
          getStudentHistory(r.person.id).then(setHistory);
        }
      });
    }
  }, [id, fetchOne]);

  if (!current) return <div className="p-8 text-center text-slate-500">جاري التحميل...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">تفاصيل السجل الدراسي</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold mb-2">{current.person.name}</h2>
        <p className="text-slate-600 mb-4">مرحلة: {current.studentLevel} | السنة الدراسية: {current.academicYear}</p>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="border p-4 rounded-lg">
            <h3 className="font-medium mb-2">التقييم الدراسي</h3>
            <p>المتوسط: {current.averageScore}%</p>
            <p>التقدير: {current.overallGrade}</p>
          </div>
          <div className="border p-4 rounded-lg">
            <h3 className="font-medium mb-2">القرآن الكريم</h3>
            <p>عدد الأجزاء: {current.quranJuzCount}</p>
            <p>نسبة الحفظ: {current.quranProgress}%</p>
            <p>الدرجة: {current.quranGrade}</p>
            <p>أيام الغياب: {current.quranAbsenceDays}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-lg font-bold mb-4">السجل التاريخي للطالب</h2>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <ul>
                {history.map(h => (
                    <li key={h.id} className="py-2 border-b last:border-b-0">
                        {h.academicYear} - {h.studentLevel} - التقييم الكلي: {h.totalScore}%
                    </li>
                ))}
            </ul>
        </div>
      </div>
    </div>
  );
}
