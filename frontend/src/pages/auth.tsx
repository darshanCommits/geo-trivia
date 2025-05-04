import { GalleryVerticalEnd } from "lucide-react";

import { LoginForm } from "@/components/login-form";
import TitleHeader from "@/components/ui/title-header";
import Star9 from "@/components/stars/s9";

export default function LoginPage() {
	return (
		<div className="bg-emerald-300 pattern-background flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10 ">
			<Star9
				size={250}
				className="text-black  absolute top-20 right-20"
				pathClassName="stroke-black dark:stroke-white"
				strokeWidth={2}
			/>
			<Star9
				size={250}
				className="text-black absolute bottom-10 left-10"
				pathClassName="stroke-black dark:stroke-white"
				strokeWidth={2}
			/>

			<div className="flex w-full max-w-sm flex-col gap-6">
				<TitleHeader
					variant={"bare"}
					className="absolute top-10 left-10 w-80"
				/>
				<LoginForm />
			</div>
		</div>
	);
}

// <div className="grid gap-6">
// 								<div className="grid gap-3">
// 									<Label htmlFor="email">Email</Label>
// 									<Input
// 										id="email"
// 										type="email"
// 										placeholder="m@example.com"
// 										required
// 									/>
// 								</div>
// 								<div className="grid gap-3">
// 									<div className="flex items-center">
// 										<Label htmlFor="password">Password</Label>
// 										<Link
// 											to="#"
// 											className="ml-auto text-sm underline-offset-4 hover:underline"
// 										>
// 											Forgot your password?
// 										</Link>
// 									</div>
// 									<Input id="password" type="password" required />
// 								</div>
// 								<Link to="/game">
// 									<Button type="submit" className="w-full bg-red-400">
// 										Login
// 									</Button>
// 								</Link>
// 							</div>
