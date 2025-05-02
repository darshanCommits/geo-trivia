import { cva, type VariantProps } from "class-variance-authority";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

const variants = cva(
	"border-4 max-w-3xl w-full mx-auto h-16 px-12 text-4xl",
	{
		variants: {
			variant: {
				default: "bg-red text-white -rotate-1 ",
				bare: "bg-main",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export default function Title({
	variant,
	className,
}: { className?: string } & VariantProps<typeof variants>) {
	return (
		<Badge className={cn(variants({ variant }), className)}>
			GeoTrivia!
		</Badge>
	);
}
