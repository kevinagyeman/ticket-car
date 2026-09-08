import { Skeleton } from "@/components/ui/skeleton";

export function TicketDetailSkeleton() {
	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center justify-between gap-3 border-border border-b px-4 py-3">
				<Skeleton className="h-6 w-28" />
				<div className="flex gap-2">
					<Skeleton className="h-7 w-16" />
					<Skeleton className="h-7 w-28" />
				</div>
			</div>
			<div className="flex-1 space-y-5 p-4">
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-4 w-24" />
					<Skeleton className="h-4 w-28" />
				</div>
				<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
					<Skeleton className="h-8" />
					<Skeleton className="h-8" />
					<Skeleton className="h-8" />
					<Skeleton className="h-8" />
				</div>
				<Skeleton className="h-36" />
				<Skeleton className="h-36" />
				<Skeleton className="h-24" />
			</div>
		</div>
	);
}
