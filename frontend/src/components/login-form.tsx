import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "./ui/badge";
import GoogleLogo from "./icons/google";
import AppleLogo from "./icons/apple";
import { Link, useNavigate } from "react-router";

const formSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

type FormValues = z.infer<typeof formSchema>;

function MailSignUp({
	form,
}: { form: ReturnType<typeof useForm<FormValues>> }) {
	const navigate = useNavigate();

	const onSubmit = (values: FormValues) => {
		console.log(values);
		navigate("/game");
	};

	return (
		<Form {...form}>
			<form className="grid gap-6" onSubmit={form.handleSubmit(onSubmit)}>
				<FormField
					name="email"
					control={form.control}
					render={({ field }) => (
						<FormItem>
							<FormLabel htmlFor="email">Email</FormLabel>
							<FormControl>
								<Input
									id="email"
									type="email"
									placeholder="m@example.com"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<div className="flex items-center justify-between">
								<FormLabel htmlFor="password">Password</FormLabel>
								<Link
									to="#"
									className="text-sm underline-offset-4 hover:underline"
								>
									Forgot your password?
								</Link>
							</div>
							<FormControl>
								<Input id="password" type="password" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit" className="w-full bg-red-400">
					Login
				</Button>
			</form>
		</Form>
	);
}
export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card className="bg-blue-400">
				<CardHeader className="text-center">
					<CardTitle className="text-xl">Welcome!</CardTitle>
					<CardDescription>
						Login with your Apple or Google account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-6">
						<OAuthOptions />
						<Separator />
						<MailSignUp form={form} />
						<div className="text-center text-sm">
							Don&apos;t have an account?{" "}
							<Link to="#" className="underline underline-offset-4">
								Sign up
							</Link>
						</div>
					</div>
				</CardContent>
			</Card>
			<Footer />
		</div>
	);
}

function OAuthOptions() {
	return (
		<div className="flex flex-col gap-4">
			<Button variant={"neutral"} className="w-full">
				<AppleLogo />
				Login with Apple
			</Button>
			<Button variant={"neutral"} className="w-full">
				<GoogleLogo />
				Login with Google
			</Button>
		</div>
	);
}

function Footer() {
	return (
		<footer className="text-center text-xs text-balance text-muted-foreground *:[a]:underline-offset-4 *:[a]:underline">
			By clicking continue, you agree to our{" "}
			<Link to="#">Terms of Service</Link> and{" "}
			<Link to="#">Privacy Policy</Link>.
		</footer>
	);
}

export function Separator() {
	return (
		<div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
			<Badge variant={"bare"} className="relative z-10 background-black">
				Or continue with
			</Badge>
		</div>
	);
}
