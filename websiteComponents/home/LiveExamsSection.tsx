// components/home/LiveExamsSection.tsx
import { getLiveExams } from "@/actions/home";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Clock, Eye } from "lucide-react";
import { format } from "date-fns";

type Exam = {
  id: number;
  name: string | null;
  description: string | null;
  examDate: Date | null;
  durationMinutes: number;
  isLive: boolean;
  companyName: string | null;
};

export async function LiveExamsSection() {
  const exams = await getLiveExams();

  if (exams.length === 0) {
    return null;
  }

  return (
    <section id="exams" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-950 rounded-full px-4 py-2 mb-4">
            <Eye className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">Live Now</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Live & Upcoming Exams
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Explore exams that are currently live and accepting participants
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Card key={exam.id} className="group hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge className="bg-green-600">Live Now</Badge>
                </div>
                <CardTitle className="text-xl mt-3">{exam.name || "Untitled Exam"}</CardTitle>
                <CardDescription>
                  {exam.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {exam.examDate 
                        ? format(new Date(exam.examDate), "PPP") 
                        : "Date TBA"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span>{exam.durationMinutes} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Users className="h-4 w-4" />
                    <span>{exam.companyName || "Open for all"}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full gap-2 group-hover:gap-3 transition-all">
                  View Details
                  <Eye className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}