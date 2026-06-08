"use client";

import { useEffect, useMemo, useState } from "react";
import client from "../../../lib/api/client";
import { useMedicalModalStore } from "../../../lib/stores/medicalModalStore";
import { AgeCircle } from "../shared/age-circle";
import { Badge } from "../shared/badge";

function normalize(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

function getPersons(household: any) {
  return household?.persons || household?.members || [];
}

function getAge(person: any) {
  if (typeof person?.age === "number") return person.age;
  if (!person?.birthDate) return 0;

  const birthDate = new Date(person.birthDate);
  if (Number.isNaN(birthDate.getTime())) return 0;

  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const beforeBirthday =
    now.getMonth() < birthDate.getMonth() ||
    (now.getMonth() === birthDate.getMonth() && now.getDate() < birthDate.getDate());

  if (beforeBirthday) age -= 1;
  return Math.max(0, age);
}

function getHouseholdTitle(household: any) {
  return household?.familyName || household?.name || household?.headName || household?.householdHead || "أسرة بدون اسم";
}

function getHeadName(household: any) {
  return household?.headName || household?.householdHead || getPersons(household).find((p: any) => p.role === "HEAD")?.name || "غير محدد";
}

function getPhoneText(household: any) {
  return [
    household?.primaryPhone,
    household?.secondaryPhone,
    household?.backupPhone,
    household?.whatsappPhone,
  ].filter(Boolean).join(" / ");
}

function householdMatches(household: any, rawQuery: string) {
  const query = normalize(rawQuery);
  if (!query) return true;

  const fields = [
    household?.code,
    household?.familyName,
    household?.name,
    household?.headName,
    household?.householdHead,
    household?.spouseName,
    household?.primaryPhone,
    household?.secondaryPhone,
    household?.backupPhone,
    household?.whatsappPhone,
    household?.address,
    household?.village,
    household?.district,
    ...getPersons(household).flatMap((person: any) => [
      person?.name,
      person?.nationalId,
      person?.relationship,
    ]),
  ];

  return fields.some((field) => normalize(field).includes(query));
}

export function Step1HouseholdPerson() {
  const {
    selectedHousehold,
    setSelectedHousehold,
    selectedPerson,
    setSelectedPerson,
    nextStep,
  } = useMedicalModalStore();

  const [households, setHouseholds] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = searchQuery.trim()
        ? { limit: 100, search: searchQuery.trim() }
        : { limit: 100 };

      client.get("/households", { params })
        .then((res) => setHouseholds(res.data.data.households ?? res.data.data ?? []))
        .catch(() => setHouseholds([]));
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [searchQuery]);

  const filteredHouseholds = useMemo(
    () => households.filter((household) => householdMatches(household, searchQuery)),
    [households, searchQuery],
  );

  const handleNextStep = () => {
    if (selectedHousehold && selectedPerson) nextStep();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">ابحث عن الأسرة</h3>
          <div className="relative w-1/2">
            <input
              type="text"
              placeholder="ابحث برقم القيد أو الهاتف..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-500/30 text-sm text-right text-slate-800 dark:text-slate-100 transition-all placeholder:text-slate-400"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          {filteredHouseholds.map((household) => (
            <button
              key={household.id}
              onClick={() => {
                setSelectedHousehold(household);
                setSelectedPerson(null);
              }}
              className={`w-full p-4 text-right rounded-xl border-2 transition-all duration-200 group ${
                selectedHousehold?.id === household.id
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500"
                  : "border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-200 dark:hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              }`}
            >
              <div className="space-y-1.5">
                <p className={`font-bold text-base ${selectedHousehold?.id === household.id ? "text-emerald-800 dark:text-emerald-300" : "text-slate-800 dark:text-slate-100"}`}>
                  {getHouseholdTitle(household)} {household.code ? <span className="text-slate-400 dark:text-slate-500 font-medium">#{household.code}</span> : ""}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-400 dark:text-slate-500">رب الأسرة:</span> {getHeadName(household)}
                  </p>
                  {household.spouseName && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-400 dark:text-slate-500">الزوجة:</span> {household.spouseName}
                    </p>
                  )}
                </div>
                {getPhoneText(household) && (
                  <p className="text-xs text-slate-500 dark:text-slate-500 font-mono">الهاتف: {getPhoneText(household)}</p>
                )}
                <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 mt-2">
                  الأفراد: {household.size ?? household.totalPersons ?? household.totalMembersCount ?? getPersons(household).length}
                </div>
              </div>
            </button>
          ))}

          {households.length > 0 && filteredHouseholds.length === 0 && (
            <div className="text-center text-slate-500 dark:text-slate-400 py-8 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-sm font-medium">لا توجد أسر مطابقة للبحث</p>
            </div>
          )}
        </div>
      </div>

      {selectedHousehold && (
        <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">اختر الشخص المريض</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {getPersons(selectedHousehold).map((person: any) => (
              <button
                key={person.id}
                onClick={() => setSelectedPerson(person)}
                className={`w-full p-4 text-right rounded-xl border-2 transition-all duration-200 ${
                  selectedPerson?.id === person.id
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-500"
                    : "border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:border-emerald-200 dark:hover:border-emerald-500/50 hover:bg-white dark:hover:bg-slate-800"
                }`}
              >
                <div className="flex gap-4 items-center">
                  <AgeCircle age={getAge(person)} size="md" />
                  <div className="flex-1">
                    <p className={`font-bold text-base ${selectedPerson?.id === person.id ? "text-emerald-800 dark:text-emerald-300" : "text-slate-800 dark:text-slate-100"}`}>
                      {person.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{person.relationship || person.role || "فرد من الأسرة"}</p>
                    
                    {(person.medicalCondition || person.disability) && (
                      <div className="flex gap-2 mt-2">
                        {person.medicalCondition && (
                          <Badge
                            label={person.medicalCondition}
                            color="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                            size="sm"
                          />
                        )}
                        {person.disability && (
                          <Badge
                            label="معاق"
                            color="bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800"
                            size="sm"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleNextStep}
        disabled={!selectedHousehold || !selectedPerson}
        className="w-full bg-gradient-to-l from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-800 dark:disabled:to-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-md disabled:shadow-none disabled:text-slate-500 dark:disabled:text-slate-600 disabled:cursor-not-allowed"
      >
        التالي للبيانات الطبية
      </button>
    </div>
  );
}
