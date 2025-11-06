import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-md)] font-medium transition-[background,box-shadow,color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-60 disabled:shadow-none whitespace-nowrap select-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--primary-color)] text-[var(--primary-foreground)] shadow-[0_8px_20px_color-mix(in_srgb,var(--primary-color)_18%,transparent)] hover:bg-[color-mix(in_srgb,var(--primary-color)_92%,white_8%)] hover:shadow-[0_12px_30px_color-mix(in_srgb,var(--primary-color)_24%,transparent)]",
        secondary:
          "bg-[var(--secondary-color-alpha)] text-[var(--secondary-color)] shadow-[0_4px_16px_color-mix(in_srgb,var(--secondary-color)_12%,transparent)] hover:bg-[color-mix(in_srgb,var(--secondary-color-alpha)_85%,white_15%)]",
        outline:
          "border border-[color:var(--border)] bg-[var(--surface)] text-[var(--text-primary)] shadow-[0_1px_0_color-mix(in_srgb,var(--border)_60%,transparent)] hover:bg-[color-mix(in_srgb,var(--surface)_90%,var(--primary-color-alpha)_10%)]",
        ghost:
          "text-[var(--text-secondary)] hover:bg-[color-mix(in_srgb,var(--primary-color-alpha)_60%,transparent)] hover:text-[var(--text-primary)]",
        destructive:
          "bg-[var(--destructive)] text-[var(--primary-foreground)] shadow-[0_6px_18px_color-mix(in_srgb,var(--destructive)_24%,transparent)] hover:bg-[color-mix(in_srgb,var(--destructive)_92%,white_8%)] focus-visible:ring-[color:var(--destructive)]",
        link: "text-[var(--primary-color)] underline-offset-4 hover:underline focus-visible:ring-0 focus-visible:ring-offset-0",
        subtle:
          "bg-[var(--surface)] text-[var(--text-primary)] shadow-[0_1px_0_color-mix(in_srgb,var(--border)_65%,transparent)] hover:bg-[color-mix(in_srgb,var(--surface)_92%,var(--primary-color-alpha)_8%)]",
        default:
          "bg-[var(--primary-color)] text-[var(--primary-foreground)] shadow-[0_8px_20px_color-mix(in_srgb,var(--primary-color)_18%,transparent)] hover:bg-[color-mix(in_srgb,var(--primary-color)_92%,white_8%)] hover:shadow-[0_12px_30px_color-mix(in_srgb,var(--primary-color)_24%,transparent)]",
      },
      size: {
        xs: "h-8 px-3 text-xs",
        sm: "h-9 px-3 text-sm",
        default: "h-10 px-4 text-sm",
        lg: "h-11 px-6 text-base",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

const buttonPresets = {
  primary: { variant: "primary", size: "default" },
  secondary: { variant: "secondary", size: "default" },
  destructive: { variant: "destructive", size: "default" },
  outline: { variant: "outline", size: "default" },
  ghost: { variant: "ghost", size: "default" },
  subtle: { variant: "subtle", size: "default" },
  icon: { variant: "ghost", size: "icon" },
} satisfies Record<
  string,
  {
    variant: VariantProps<typeof buttonVariants>["variant"];
    size: VariantProps<typeof buttonVariants>["size"];
  }
>;

type ButtonPresetKey = keyof typeof buttonPresets;

type ButtonProps = React.ComponentPropsWithoutRef<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    preset?: ButtonPresetKey;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    paddingInline?: string;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      preset,
      asChild = false,
      startIcon,
      endIcon,
      paddingInline,
      disabled,
      children,
      style: inlineStyle,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const presetValues = preset ? buttonPresets[preset] : undefined;
    const resolvedVariant = variant ?? presetValues?.variant ?? "primary";
    const resolvedSize = size ?? presetValues?.size ?? "default";
    const resolvedPadding =
      paddingInline ??
      (resolvedSize === "icon" || resolvedVariant === "link"
        ? undefined
        : {
            xs: "1rem",
            sm: "1.25rem",
            default: "1.5rem",
            lg: "1.75rem",
            icon: undefined,
          }[resolvedSize ?? "default"]);

    const iconBase =
      "inline-flex items-center justify-center text-current [&>svg]:size-4 [&>svg]:shrink-0";
    const hasChildren = React.Children.count(children) > 0;
    const buttonStyle: React.CSSProperties = {
      ...(inlineStyle as React.CSSProperties | undefined),
      ...(resolvedPadding ? { paddingInline: resolvedPadding } : {}),
    };

    if (asChild) {
      if (startIcon || endIcon) {
        console.warn(
          "[Button] startIcon/endIcon sont ignorés lorsque asChild=true (Slot requiert un seul enfant)."
        );
      }
      if (process.env.NODE_ENV !== "production") {
        const count = React.Children.count(children);
        if (count !== 1) {
          throw new Error(
            `Button(asChild): attendu exactement 1 enfant, reçu ${count}. Ex: <Button asChild><Link>Label</Link></Button>`
          );
        }
      }

      return (
        <Comp
          ref={ref}
          data-slot="button"
          className={cn(
            buttonVariants({ variant: resolvedVariant, size: resolvedSize }),
            className
          )}
          style={buttonStyle}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <button
        ref={ref}
        data-slot="button"
        className={cn(
          buttonVariants({ variant: resolvedVariant, size: resolvedSize }),
          className
        )}
        disabled={disabled}
        style={buttonStyle}
        {...props}
      >
        {startIcon ? (
          <span className={cn(iconBase, hasChildren ? "-ml-0.5" : "")}>
            {startIcon}
          </span>
        ) : null}
        {hasChildren ? (
          <span className="inline-flex items-center">{children}</span>
        ) : (
          children
        )}
        {endIcon ? (
          <span className={cn(iconBase, hasChildren ? "-mr-0.5" : "")}>
            {endIcon}
          </span>
        ) : null}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants, buttonPresets };
