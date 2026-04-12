// components/dashboard/questions/AddQuestionDialog.tsx
"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
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
import { createQuestion } from "@/actions/questions";
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
    name: "options" as never, // Type assertion to avoid discriminated union issues
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

  // Helper to check if error is for options field
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Question</DialogTitle>
          <DialogDescription>
            Create a new question for your exam
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Question Type</Label>
            <Select
              value={questionType}
              onValueChange={(value: "mcq" | "subjective") => {
                setQuestionType(value);
                setValue("questionType", value);
                // Reset form when switching types
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
      </DialogContent>
    </Dialog>
  );
}