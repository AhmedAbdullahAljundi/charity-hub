"use client";

import { useMedicalModalStore } from "../../../lib/stores/medicalModalStore";
import { AgeCircle } from "../shared/age-circle";
import { Badge } from "../shared/badge";
import { useState, useEffect } from "react";
import client from "../../../lib/api/client";

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
    client.get('/households?limit=100')
      .then(r => setHouseholds(r.data.data.households ?? r.data.data))
      .catch(() => {})
  }, []);

  const handleNextStep = () => {
    if (selectedHousehold && selectedPerson) {
      nextStep();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">اختر الأسرة</h3>
          <input
            type="text"
            placeholder="ابحث برقم الملف أو اسم رب الأسرة..."
            className="w-1/2 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-right"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
          {households
            .filter((h) => 
              h.name?.includes(searchQuery) || 
              h.householdHead?.includes(searchQuery) ||
              h.code?.includes(searchQuery)
            )
            .map((household) => (
            <button
              key={household.id}
              onClick={() => {
                setSelectedHousehold(household);
                setSelectedPerson(null);
              }}
              className={`w-full p-4 text-right rounded-lg border-2 transition-all ${
                selectedHousehold?.id === household.id
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{household.name} {household.code ? `(${household.code})` : ''}</p>
                  <p className="text-sm text-gray-600">رب الأسرة: {household.householdHead}</p>
                  <p className="text-xs text-gray-500 mt-1">عدد الأفراد: {household.size}</p>
                </div>
              </div>
            </button>
          ))}
          {households.length > 0 && households.filter((h) => h.name?.includes(searchQuery) || h.householdHead?.includes(searchQuery) || h.code?.includes(searchQuery)).length === 0 && (
             <p className="text-center text-gray-500 py-4 text-sm">لا توجد أسر مطابقة للبحث</p>
          )}
        </div>
      </div>

      {selectedHousehold && (
        <div>
          <h3 className="font-semibold mb-3">اختر الشخص</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {(selectedHousehold.persons || selectedHousehold.members || []).map((person: any) => (
              <button
                key={person.id}
                onClick={() => setSelectedPerson(person)}
                className={`w-full p-4 text-right rounded-lg border-2 transition-all ${
                  selectedPerson?.id === person.id
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex gap-3 items-start">
                  <AgeCircle age={person.age} size="md" />
                  <div className="flex-1">
                    <p className="font-medium">{person.name}</p>
                    <p className="text-sm text-gray-600">{person.relationship}</p>
                    {person.medicalCondition && (
                      <Badge
                        label={person.medicalCondition}
                        color="bg-blue-100 text-blue-800 border-blue-300"
                        size="sm"
                      />
                    )}
                    {person.disability && (
                      <Badge
                        label="معاق"
                        color="bg-red-100 text-red-800 border-red-300"
                        size="sm"
                      />
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
        className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 transition-colors"
      >
        التالي
      </button>
    </div>
  );
}
