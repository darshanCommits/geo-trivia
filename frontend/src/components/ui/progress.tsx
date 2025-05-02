import * as ProgressPrimitive from "@radix-ui/react-progress";

import * as React from "react";

import { cn } from "@/lib/utils";

function Progress({
	className,
	value,
	total,
	...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & {
	value?: number;
	total?: number;
}) {
	return (
		<ProgressPrimitive.Root
			data-slot="progress"
			className={cn(
				"relative h-6 w-full overflow-hidden rounded-base border-2 border-border bg-secondary-background shadow-shadow",
				className,
			)}
			{...props}
		>
			<ProgressPrimitive.Indicator
				data-slot="progress-indicator"
				className="h-full w-full flex-1 border-r-2 border-border bg-main transition-all"
				style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
			/>

			<div className="absolute inset-0 flex w-full pointer-events-none overflow-hidden">
				{Array.from({ length: total }).map((_, i) => (
					<div key={i} className="relative flex-1">
						{i < total - 1 && (
							<div className="absolute top-0 right-0 h-6 w-1 bg-border -translate-y-1" />
						)}
					</div>
				))}
			</div>

		</ProgressPrimitive.Root>
	);
}

export { Progress };
