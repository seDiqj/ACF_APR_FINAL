"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { MultiSelect } from "@/components/multi-select";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const FormSchema = z.object({
  frameworks: z
    .array(z.string())
    .min(1, { message: "Please select at least one framework." }),
});

const frameworksList = [
  { value: "next.js", label: "Next.js" },
  { value: "react", label: "React" },
  { value: "vue", label: "Vue.js" },
  { value: "angular", label: "Angular" },
];

export default function FormExample() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      frameworks: [],
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast.success(`Selected: ${data.frameworks.join(", ")}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="frameworks"
          render={({ field }: { field: any }) => (
            <FormItem>
              <FormLabel>Select Frameworks</FormLabel>
              <FormControl>
                <MultiSelect
                  options={frameworksList}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Choose frameworks..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" onClick={() => onSubmit}>
          Submit
        </Button>
      </form>
    </Form>
  );
}
