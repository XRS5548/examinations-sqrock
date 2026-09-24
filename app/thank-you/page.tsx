import Link from "next/link";

interface ThankYouPageProps {
  searchParams: Promise<{
    rollNumber?: string | string[];
    email?: string | string[];
  }>;
}

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ThankYouPage({
  searchParams,
}: ThankYouPageProps) {
  const params = await searchParams;
  const rollNumber = firstValue(params.rollNumber)?.trim() || "";
  const email = firstValue(params.email)?.trim() || "";
  const resultParams = new URLSearchParams();

  if (rollNumber) resultParams.set("rollNumber", rollNumber);
  if (email) resultParams.set("email", email);

  const resultHref = resultParams.size
    ? `/results?${resultParams.toString()}`
    : "/results";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Exam Submitted Successfully
        </h1>
        <p className="text-gray-600 mb-6">
          Your answers have been recorded. Open your result using the details
          saved from this exam.
        </p>
        <Link
          href={resultHref}
          className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
        >
          View My Result
        </Link>
      </div>
    </div>
  );
}
