import { Card, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export default function() {
  return <div className="flex flex-col gap-4 w-4/12">
    <h3 className="h-10">Todos</h3>
    <Card draggable className="hover:shadow-lg hover:scale-[102%] transition-all hover:cursor-pointer">
      <CardHeader>
        <CardTitle className="font-sans text-sm mb-2">
          <Skeleton className="h-8" />
        </CardTitle>

        <Skeleton className="h-12" />

      </CardHeader>
    </Card>
    <Card draggable className="hover:shadow-lg hover:scale-[102%] transition-all hover:cursor-pointer">
      <CardHeader>
        <CardTitle className="font-sans text-sm mb-2">
          <Skeleton className="h-8" />
        </CardTitle>

        <Skeleton className="h-12" />

      </CardHeader>
    </Card>
    <Card draggable className="hover:shadow-lg hover:scale-[102%] transition-all hover:cursor-pointer">
      <CardHeader>
        <CardTitle className="font-sans text-sm mb-2">
          <Skeleton className="h-8" />
        </CardTitle>

        <Skeleton className="h-12" />

      </CardHeader>
    </Card>
    <Card draggable className="hover:shadow-lg hover:scale-[102%] transition-all hover:cursor-pointer">
      <CardHeader>
        <CardTitle className="font-sans text-sm mb-2">
          <Skeleton className="h-8" />
        </CardTitle>

        <Skeleton className="h-12" />

      </CardHeader>
    </Card>
  </div>
}
