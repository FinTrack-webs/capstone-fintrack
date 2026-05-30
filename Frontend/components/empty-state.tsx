import { Sparkles } from "lucide-react";
import { Card, CardText, CardTitle } from "@/components/ui/card";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card className="grid place-items-center py-12 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-secondary-soft text-secondary">
        <Sparkles className="h-6 w-6" />
      </div>
      <CardTitle>{title}</CardTitle>
      <CardText className="mt-2 max-w-sm">{description}</CardText>
    </Card>
  );
}
