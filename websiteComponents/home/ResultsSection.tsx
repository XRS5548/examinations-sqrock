// components/home/ResultsSection.tsx
import { getResultExams } from "@/actions/home";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Users, Eye } from "lucide-react";
import { format } from "date-fns";

export async function ResultsSection() {
  const exams = await getResultExams();

  if (exams.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-950 rounded-full px-4 py-2 mb-4">
            <Trophy className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Results Declared</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Recent Exam Results
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Check out the latest results announced
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                    Results Declared
                  </Badge>
                </div>
                <CardTitle className="text-xl mt-3">{exam.name}</CardTitle>
                <CardDescription>{exam.description || "No description provided"}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="h-4 w-4" />
                    <span>{exam.examDate ? format(new Date(exam.examDate), "PPP") : "Date TBA"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Trophy className="h-4 w-4" />
                    <span>Total Marks: {exam.totalMarks}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full gap-2 group-hover:gap-3 transition-all">
                  View Results
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