// components/exam/JoinForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyStudent } from "@/actions/examstart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  AlertTriangle, 
  Monitor, 
  Shield, 
  Clock, 
  Ban, 
  Languages,
  CheckCircle2 
} from "lucide-react";

interface GuidelinesContent {
  title: string;
  warning: string;
  rules: string[];
  technical: string[];
  consequences: string[];
  agreeText: string;
}

const guidelines: Record<string, GuidelinesContent> = {
  english: {
    title: "Exam Guidelines & Instructions",
    warning: "⚠️ Important: Strict Proctoring Rules Apply",
    rules: [
      "This exam is strictly for Laptop/Desktop only - Mobile devices are not allowed",
      "You must remain in full-screen mode throughout the exam",
      "Switching tabs or windows will be detected as cheating attempt",
      "Do not minimize the browser window at any time",
      "Keep your webcam on (if enabled by your institution)",
      "Do not use any external applications during the exam",
      "Copy-paste functionality is disabled",
      "Right-click and print screen are disabled"
    ],
    technical: [
      "Ensure stable internet connection before starting",
      "Close all other browser tabs and applications",
      "Do not refresh the page during the exam",
      "Exam will auto-submit if you leave full-screen mode",
      "Your answers are auto-saved every 30 seconds"
    ],
    consequences: [
      "First warning: Your exam will be flagged for review",
      "Second warning: Exam will be automatically submitted",
      "Cheating detected: Immediate disqualification",
      "Multiple violations: Permanent ban from future exams"
    ],
    agreeText: "I have read and agree to follow all the exam guidelines"
  },
  hindi: {
    title: "परीक्षा दिशानिर्देश और निर्देश",
    warning: "⚠️ महत्वपूर्ण: सख्त पर्यवेक्षण नियम लागू",
    rules: [
      "यह परीक्षा केवल लैपटॉप/डेस्कटॉप के लिए है - मोबाइल डिवाइस की अनुमति नहीं है",
      "आपको पूरी परीक्षा के दौरान फुल-स्क्रीन मोड में रहना होगा",
      "टैब या विंडो स्विच करना धोखाधड़ी का प्रयास माना जाएगा",
      "किसी भी समय ब्राउज़र विंडो को छोटा न करें",
      "अपना वेबकैम चालू रखें (यदि आपके संस्थान द्वारा सक्षम किया गया हो)",
      "परीक्षा के दौरान किसी भी बाहरी एप्लिकेशन का उपयोग न करें",
      "कॉपी-पेस्ट सुविधा अक्षम है",
      "राइट-क्लिक और प्रिंट स्क्रीन अक्षम है"
    ],
    technical: [
      "शुरू करने से पहले स्थिर इंटरनेट कनेक्शन सुनिश्चित करें",
      "अन्य सभी ब्राउज़र टैब और एप्लिकेशन बंद करें",
      "परीक्षा के दौरान पेज को रिफ्रेश न करें",
      "फुल-स्क्रीन मोड छोड़ने पर परीक्षा ऑटो-सबमिट हो जाएगी",
      "आपके उत्तर हर 30 सेकंड में ऑटो-सेव होते हैं"
    ],
    consequences: [
      "पहली चेतावनी: आपकी परीक्षा समीक्षा के लिए चिह्नित की जाएगी",
      "दूसरी चेतावनी: परीक्षा स्वचालित रूप से सबमिट हो जाएगी",
      "धोखाधड़ी पकड़ी गई: तत्काल अयोग्यता",
      "कई उल्लंघन: भविष्य की परीक्षाओं से स्थायी प्रतिबंध"
    ],
    agreeText: "मैंने सभी परीक्षा दिशानिर्देशों को पढ़ लिया है और उनका पालन करने के लिए सहमत हूं"
  }
};

export function JoinForm() {
  const router = useRouter();
  const [rollNumber, setRollNumber] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [language, setLanguage] = useState<"english" | "hindi">("english");
  const [examData, setExamData] = useState<{ examId: number; registrationId: number } | null>(null);

  const content = guidelines[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("rollNumber", rollNumber);
      formData.append("email", email);

      const result = await verifyStudent(formData);

      if (result.success) {
        // Store exam data and show guidelines instead of navigating directly
        setExamData({
          examId: result.examId!,
          registrationId: result.registrationId!
        });
        setShowGuidelines(true);
      } else {
        setError(result.error?.toString() || "Invalid credentials. Please check your Roll Number and Email.");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = () => {
    if (agreed && examData) {
      router.push(`/start?examId=${examData.examId}&registrationId=${examData.registrationId}`);
    }
  };

  return (
    <>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">EM</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Join Your Exam</h1>
          <p className="text-gray-500 mt-2">Enter your credentials to start the exam</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Roll Number
            </label>
            <input
              type="text"
              id="rollNumber"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
              placeholder="e.g., SQR001"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
              placeholder="student@example.com"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Continue to Guidelines"}
          </button>
        </form>
      </div>

      {/* Guidelines Dialog */}
      <Dialog open={showGuidelines} onOpenChange={setShowGuidelines}>
        <DialogContent className="min-w-[70vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center mb-4">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {content.title}
              </DialogTitle>
              
              {/* Language Switcher */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={language === "english" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLanguage("english")}
                  className={language === "english" ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  <Languages className="h-4 w-4 mr-1" />
                  English
                </Button>
                <Button
                  variant={language === "hindi" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setLanguage("hindi")}
                  className={language === "hindi" ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  <Languages className="h-4 w-4 mr-1" />
                  हिंदी
                </Button>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-semibold">{content.warning}</span>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Rules Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <Shield className="h-5 w-5 text-red-600" />
                Exam Rules & Regulations
              </h3>
              <div className="grid gap-2">
                {content.rules.map((rule, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Instructions */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <Monitor className="h-5 w-5 text-red-600" />
                Technical Instructions
              </h3>
              <div className="grid gap-2">
                {content.technical.map((instruction, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{instruction}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Consequences */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                <Ban className="h-5 w-5 text-red-600" />
                Violation Consequences
              </h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="space-y-2">
                  {content.consequences.map((consequence, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-yellow-800">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{consequence}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timer Warning */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Important Timer Information:</p>
                  <p>The exam timer will start immediately after you click &quot;Start Exam&quot;. Make sure you have everything ready before proceeding.</p>
                </div>
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div className="flex items-start space-x-3 pt-4 border-t border-gray-200">
              <Checkbox
                id="agree"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
                className="mt-1"
              />
              <Label
                htmlFor="agree"
                className="text-sm text-gray-700 cursor-pointer"
              >
                {content.agreeText}
              </Label>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowGuidelines(false);
                setAgreed(false);
                setExamData(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartExam}
              disabled={!agreed}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              I Understand - Start Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}