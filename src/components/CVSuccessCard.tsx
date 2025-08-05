// src/components/CVSuccessCard.tsx
import { CheckCircle } from "lucide-react";

export default function CVSuccessCard() {
  return (
    <div className="max-w-md mx-auto mt-8 bg-green-50 border border-green-300 rounded-xl p-6 shadow-md animate-fade-in">
      <div className="flex items-center gap-3 mb-3">
        <CheckCircle className="text-green-600 w-6 h-6" />
        <h2 className="text-lg font-semibold text-green-800">CV Uploaded Successfully</h2>
      </div>
      <p className="text-green-700">
        We’re now analyzing your CV and searching for the best matching jobs for you...
      </p>
      <div className="mt-4 animate-pulse text-sm text-green-600">
        🔍 Matching jobs in progress...
      </div>
    </div>
  );
}
