import { Card, type CardProps } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function CustomCard({ className, ...props }: CardProps) {
  return <Card className={cn("border-ecg-blue shadow-lg", className)} {...props} />
}
