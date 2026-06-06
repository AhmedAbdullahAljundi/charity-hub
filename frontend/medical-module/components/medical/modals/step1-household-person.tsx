"use client";

import { useMedicalModalStore } from "@/lib/medical/store";
import { mockHouseholds } from "@/lib/medical/mock-data";
import { AgeCircle } from "../shared/age-circle";
import { Badge } from "../shared/badge";

export function Step1HouseholdPerson() {
  const {
    selectedHousehold,
    setSelectedHousehold,
    selectedPerson,
    setSelectedPerson,
    nextStep,
  } = useMedicalModalStore();

  const handleNextStep = () => {
    if (selectedHousehold && selectedPerson) {
      nextStep();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">اختر الأسرة</h3>
        <div className="space-y-2">
          {mockHouseholds.map((household) => (
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
                  <p className="font-medium">{household.name}</p>
                  <p className="text-sm text-gray-600">رب الأسرة: {household.householdHead}</p>
                  <p className="text-xs text-gray-500 mt-1">عدد الأفراد: {household.size}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedHousehold && (
        <div>
          <h3 className="font-semibold mb-3">اختر الشخص</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {selectedHousehold.members.map((person) => (
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
