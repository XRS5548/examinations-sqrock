// components/dashboard/questions/AddQuestionDialog.tsx
"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Upload, Download, FileSpreadsheet, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createQuestion, bulkImportQuestions } from "@/actions/questions";
import { toast } from "sonner";

const questionSchema = z.discriminatedUnion("questionType", [
  z.object({
    questionType: z.literal("mcq"),
    question: z.string().min(1, "Question is required"),
    marks: z.string().min(1, "Marks is required"),
    options: z.array(z.object({
      text: z.string().min(1, "Option text is required"),
    })).min(2, "At least 2 options are required"),
    correctOption: z.string().min(1, "Please select the correct option"),
  }),
  z.object({
    questionType: z.literal("subjective"),
    question: z.string().min(1, "Question is required"),
    marks: z.string().min(1, "Marks is required"),
  }),
]);

type FormData = z.infer<typeof questionSchema>;

interface AddQuestionDialogProps {
  examId: number;
  onQuestionAdded?: () => void;
}

export function AddQuestionDialog({ examId, onQuestionAdded }: AddQuestionDialogProps) {
  const [open, setOpen] = useState(false);
  const [questionType, setQuestionType] = useState<"mcq" | "subjective">("mcq");
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionType: "mcq",
      question: "",
      marks: "",
      options: [{ text: "" }, { text: "" }],
      correctOption: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options" as never,
  });

  const watchedType = watch("questionType");

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("examId", examId.toString());
      formData.append("question", data.question);
      formData.append("questionType", data.questionType);
      formData.append("marks", data.marks);

      if (data.questionType === "mcq") {
        formData.append("options", JSON.stringify(data.options));
        formData.append("correctOption", data.correctOption);
      }

      const result = await createQuestion(formData);

      if (result.success) {
        toast.success("Question added successfully");
        setOpen(false);
        reset();
        setQuestionType("mcq");
        if (onQuestionAdded) {
          onQuestionAdded();
        } else {
          window.location.reload();
        }
      } else {
        toast.error(result.error?.toString() || "Failed to add question");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error("Please upload a CSV file");
      return;
    }

    setUploadedFile(file);
    setImportLoading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("examId", examId.toString());

      const result = await bulkImportQuestions(formData);
      
      clearInterval(interval);
      setUploadProgress(100);

      if (result.success) {
        toast.success(`Successfully imported ${result.count || 0} questions`);
        setOpen(false);
        setUploadedFile(null);
        setUploadProgress(0);
        if (onQuestionAdded) {
          onQuestionAdded();
        } else {
          window.location.reload();
        }
      } else {
        toast.error(result.error || "Failed to import questions");
        if (result.errors && result.errors.length > 0) {
          console.error("Import errors:", result.errors);
        }
      }
    } catch (error) {
      toast.error("Something went wrong during import");
    } finally {
      setImportLoading(false);
      setUploadProgress(0);
    }
  };

  const downloadSampleCSV = () => {
    const headers = [
      "Question Type (mcq/subjective)",
      "Question Text",
      "Marks",
      "Option 1",
      "Option 2",
      "Option 3",
      "Option 4",
      "Correct Option (1-4)",
      "Answer (for subjective)"
    ];
    
    const sampleData = [
      ["mcq", "What is the capital of France?", "2", "London", "Paris", "Berlin", "Madrid", "2", ""],
      ["mcq", "Which planet is known as the Red Planet?", "2", "Mars", "Jupiter", "Venus", "Saturn", "1", ""],
      ["subjective", "Explain the theory of relativity in your own words.", "5", "", "", "", "", "", "Einstein's theory of relativity..."],
    ];
    
    const csvContent = [
      headers.join(","),
      ...sampleData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "questions_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Sample CSV downloaded");
  };

  const getOptionsError = () => {
    if (watchedType === "mcq" && errors && 'options' in errors) {
      return errors.options as any;
    }
    return null;
  };

  const getCorrectOptionError = () => {
    if (watchedType === "mcq" && errors && 'correctOption' in errors) {
      return errors.correctOption;
    }
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Questions</DialogTitle>
          <DialogDescription>
            Add questions individually or bulk import via CSV file.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Question</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Import</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single" className="space-y-4 mt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select
                  value={questionType}
                  onValueChange={(value: "mcq" | "subjective") => {
                    setQuestionType(value);
                    setValue("questionType", value);
                    if (value === "subjective") {
                      setValue("options" as never, undefined as never);
                      setValue("correctOption" as never, undefined as never);
                    } else {
                      setValue("options" as never, [{ text: "" }, { text: "" }] as never);
                      setValue("correctOption" as never, "" as never);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
                    <SelectItem value="subjective">Subjective</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="question">Question Text</Label>
                <Textarea
                  id="question"
                  placeholder="Enter your question here..."
                  {...register("question")}
                  rows={3}
                />
                {errors.question && (
                  <p className="text-sm text-red-500">{errors.question.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="marks">Marks</Label>
                <Input
                  id="marks"
                  type="number"
                  placeholder="e.g., 5"
                  {...register("marks")}
                />
                {errors.marks && (
                  <p className="text-sm text-red-500">{errors.marks.message}</p>
                )}
              </div>

              {watchedType === "mcq" && (
                <div className="space-y-3">
                  <Label>Options</Label>
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        {...register(`options.${index}.text` as const)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 2}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ text: "" })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Option
                  </Button>
                  {getOptionsError() && (
                    <p className="text-sm text-red-500">{getOptionsError()?.message}</p>
                  )}

                  <div className="space-y-2 pt-2">
                    <Label>Correct Option</Label>
                    <RadioGroup
                      onValueChange={(value) => setValue("correctOption", value)}
                    >
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`}>
                            Option {index + 1}: {watch(`options.${index}.text`) || "Not set"}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {getCorrectOptionError() && (
                      <p className="text-sm text-red-500">{getCorrectOptionError()?.message}</p>
                    )}
                  </div>
                </div>
              )}

              {watchedType === "subjective" && (
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Subjective questions require manual evaluation. Students will provide text answers 
                    that you can review and grade later.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Adding..." : "Add Question"}
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="bulk" className="space-y-4 mt-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              {!uploadedFile ? (
                <>
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Upload CSV file with questions
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    File should contain: Question Type, Question Text, Marks, Options, Correct Option
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={downloadSampleCSV}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Sample CSV
                    </Button>
                    <Button
                      type="button"
                      variant="default"
                      onClick={() => document.getElementById("bulk-file-upload")?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Choose File
                    </Button>
                    <input
                      id="bulk-file-upload"
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-8 w-8 text-green-600" />
                      <div className="text-left">
                        <p className="text-sm font-medium">{uploadedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(uploadedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setUploadedFile(null);
                        setUploadProgress(0);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {importLoading && (
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-600 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Importing... {uploadProgress}%
                      </p>
                    </div>
                  )}
                  
                  {!importLoading && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("bulk-file-upload")?.click()}
                      className="mt-2"
                    >
                      Choose Different File
                    </Button>
                  )}
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">📋 CSV Format Instructions:</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• <strong>Question Type:</strong> "mcq" or "subjective"</li>
                <li>• <strong>Question Text:</strong> The actual question</li>
                <li>• <strong>Marks:</strong> Number of marks for the question</li>
                <li>• <strong>Options (1-4):</strong> For MCQ questions only</li>
                <li>• <strong>Correct Option:</strong> Number (1-4) indicating correct option</li>
                <li>• <strong>Answer:</strong> For subjective questions (optional)</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}