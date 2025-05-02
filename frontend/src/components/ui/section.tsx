import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const sectionVariants = cva(
  "w-full max-w-3xl border-4 border-black text-left px-6 py-10 flex flex-col items-start gap-10 shadow-[6px_6px_0_0_rgba(0,0,0,1)]",
  {
    variants: {
      variant: {
        default: "bg-muted text-main-foreground",
        bare: "bg-white text-main-foreground",
        neutral: "bg-secondary-background text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface SectionCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sectionVariants> {
  asChild?: boolean;
}

const Section = React.forwardRef<HTMLDivElement, SectionCardProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";

    return (
      <Comp
        ref={ref}
        data-slot="brutalist-card"
        className={cn(sectionVariants({ variant }), className)}
        {...props}
      />
    );
  }
);

Section.displayName = "Section";

export { Section , sectionVariants};
