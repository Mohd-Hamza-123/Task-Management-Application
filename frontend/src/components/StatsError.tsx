import { AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

export default function StatsError({
    onRetry,
    isRetrying,
}: {
    onRetry: () => void;
    isRetrying: boolean;
}) {
    return (
        <Card>
            <CardContent className="flex items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-destructive/10 p-3 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                    </div>

                    <div>
                        <p className="text-sm font-medium">
                            Couldn&apos;t load task stats
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Something went wrong while fetching your tasks.
                            Please try again.
                        </p>
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    disabled={isRetrying}
                >
                    <RefreshCw
                        className={`mr-2 h-4 w-4 ${isRetrying ? "animate-spin" : ""}`}
                    />
                    {isRetrying ? "Retrying..." : "Retry"}
                </Button>
            </CardContent>
        </Card>
    );
}