import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const FeeCalculator = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Fee Calculator</h1>
        <p className="text-muted-foreground">Estimate your annual cost across colleges and categories.</p>
      </div>

      <Card className="rounded-none border-2 shadow-[6px_6px_0_0_rgba(0,0,0,0.35)] dark:shadow-[6px_6px_0_0_rgba(255,255,255,0.12)]">
        <CardHeader>
          <CardTitle>Inputs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-12 bg-muted" />
            <div className="h-12 bg-muted" />
            <div className="h-12 bg-muted" />
          </div>
          <Separator className="my-6" />
          <div className="h-40 bg-muted" />
        </CardContent>
      </Card>
    </div>
  )
}

export default FeeCalculator


