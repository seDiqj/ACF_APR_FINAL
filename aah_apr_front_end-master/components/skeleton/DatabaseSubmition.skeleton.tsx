import { Skeleton } from "@/components/ui/skeleton";

const SubmitNewDBSkeleton = () => {
  return (
    <div className="grid grid-cols-2 gap-6 mt-4">
      {/* Project */}
      <Skeleton className="h-14 w-full rounded-md" />

      {/* Database */}
      <Skeleton className="h-14 w-full rounded-md" />

      {/* Province */}
      <Skeleton className="h-14 w-full rounded-md" />

      {/* Manager */}
      <Skeleton className="h-14 w-full rounded-md" />

      {/* From Date */}
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-14 w-full rounded-md" />
      </div>

      {/* To Date */}
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-14 w-full rounded-md" />
      </div>

      {/* Submit Button */}
      <div className="col-span-2 flex justify-end pt-4">
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
    </div>
  );
};

export default SubmitNewDBSkeleton;
