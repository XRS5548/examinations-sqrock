// components/home/FeaturesSection.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, 
  Zap, 
  Hash, 
  BarChart3, 
  Brain, 
  Users,
  Monitor,
  Eye,
  Trophy,
  Clock,
  FileText,
  Award
} from "lucide-react";

const features = [
  {
    icon: Monitor,
    title: "Secure Fullscreen Exams",
    description: "Fullscreen mode with tab-switching prevention for maximum security.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Eye,
    title: "Anti-Cheat Detection",
    description: "Advanced monitoring and logging to detect suspicious activities.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Hash,
    title: "Auto Roll Numbers",
    description: "Automatic roll number generation with custom prefixes.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Trophy,
    title: "Real-time Results",
    description: "Instant result calculation and performance analytics.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Brain,
    title: "Manual + Auto Evaluation",
    description: "MCQ auto-grading with subjective answer manual evaluation.",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: Users,
    title: "Easy Student Management",
    description: "Bulk import, manage, and track student progress effortlessly.",
    color: "from-pink-500 to-rose-500",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-950 rounded-full px-4 py-2 mb-4">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Everything You Need to Conduct Exams
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Powerful features designed to make exam management simple, secure, and effective
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}