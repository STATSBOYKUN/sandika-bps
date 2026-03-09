"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Chrome, KeyRound, UserRound } from "lucide-react";

import { useTimedAlert } from "@/contexts/TimedAlertContext";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
	const router = useRouter();
	const { showAlert } = useTimedAlert();
	const { data: session, isPending } = authClient.useSession();
	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");
	const [fieldErrors, setFieldErrors] = useState({
		identifier: false,
		password: false,
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

	const mapAuthError = (message?: string) => {
		if (!message) return "Terjadi kesalahan saat login. Silakan coba lagi.";
		const normalized = message.toLowerCase();
		if (
			normalized.includes("invalid username or password") ||
			normalized.includes("invalid credentials") ||
			normalized.includes("wrong password")
		) {
			return "Username atau password yang Anda masukkan salah.";
		}
		if (normalized.includes("too many")) {
			return "Terlalu banyak percobaan login. Coba beberapa saat lagi.";
		}
		return message;
	};

	useEffect(() => {
		if (!isPending && session) {
			router.replace("/");
		}
	}, [isPending, router, session]);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		const hasIdentifier = Boolean(identifier.trim());
		const hasPassword = Boolean(password.trim());
		setFieldErrors({
			identifier: !hasIdentifier,
			password: !hasPassword,
		});

		if (!hasIdentifier || !hasPassword) {
			showAlert({
				variant: "error",
				title: "Validasi gagal",
				description: "Username dan password wajib diisi.",
			});
			return;
		}

		setIsSubmitting(true);
		const { error: signInError } = await authClient.signIn.username({
			username: identifier.trim(),
			password,
			callbackURL: "/profile",
		});

		if (signInError) {
			showAlert({
				variant: "error",
				title: "Login gagal",
				description: mapAuthError(signInError.message),
			});
			setIsSubmitting(false);
			return;
		}

		setIsSubmitting(false);
		if (!signInError) {
			router.push("/profile");
		}
	};

	const handleGoogleLogin = async () => {
		setFieldErrors({ identifier: false, password: false });
		setIsGoogleSubmitting(true);
		const { error: socialError } = await authClient.signIn.social({
			provider: "google",
			callbackURL: "/profile",
		});

		if (socialError) {
			showAlert({
				variant: "error",
				title: "Login Google gagal",
				description: mapAuthError(socialError.message),
			});
			setIsGoogleSubmitting(false);
		}
	};

	return (
		<main className="bg-base-100 flex min-h-screen items-center justify-center p-6 md:p-12">
			<div className="flex w-full max-w-5xl flex-col items-center justify-center gap-10 lg:flex-row lg:gap-20">
				{/* Brand / Logo Section */}
				<section className="flex flex-1 flex-col items-center space-y-4 text-center lg:items-start lg:text-left">
					<div className="relative mb-2 h-16 w-16 md:h-20 md:w-20">
						<Image
							src="/logo/Lambang_Badan_Pusat_Statistik_(BPS)_Indonesia.svg.png"
							alt="BPS Logo"
							fill
							className="object-contain"
						/>
					</div>
					<div className="space-y-2">
						<h1 className="text-3xl font-bold tracking-tight md:text-4xl">
							Sandika <span className="text-primary">BPS</span>
						</h1>
						<p className="text-base-content/60 max-w-sm text-base leading-relaxed">
							Sistem Manajemen Data Industri Kabupaten
							Karanganyar. Silakan masuk untuk akses aplikasi.
						</p>
					</div>
				</section>

				{/* Form Section */}
				<section className="w-full max-w-95">
					<div className="border-base-300 bg-base-200/30 rounded-2xl border p-6 shadow-sm backdrop-blur-sm md:p-8">
						<form onSubmit={handleLogin} className="space-y-6">
							<div className="flex flex-col gap-4">
								<label className="form-control w-full space-y-1.5">
									<span className="label-text px-0.5 text-sm font-medium">
										Username
									</span>
									<label
										className={`input input-bordered bg-base-100 focus-within:ring-primary/20 flex h-11 items-center gap-3 px-3 transition-all focus-within:ring-2 ${fieldErrors.identifier ? "input-error" : ""}`}
									>
										<UserRound className="h-4 w-4 shrink-0 opacity-40" />
										<input
											type="text"
											className="grow text-sm"
											placeholder="Username"
											value={identifier}
											onChange={(e) => {
												setIdentifier(e.target.value);
												if (fieldErrors.identifier) {
													setFieldErrors((prev) => ({
														...prev,
														identifier: false,
													}));
												}
											}}
										/>
									</label>
								</label>

								<label className="form-control w-full space-y-1.5">
									<div className="flex items-center justify-between px-0.5">
										<span className="label-text text-sm font-medium">
											Password
										</span>
										<a
											href="#"
											className="link link-hover text-primary text-xs font-medium"
										>
											Lupa password?
										</a>
									</div>
									<label
										className={`input input-bordered bg-base-100 focus-within:ring-primary/20 flex h-11 items-center gap-3 px-3 transition-all focus-within:ring-2 ${fieldErrors.password ? "input-error" : ""}`}
									>
										<KeyRound className="h-4 w-4 shrink-0 opacity-40" />
										<input
											type="password"
											className="grow text-sm"
											placeholder="••••••••"
											value={password}
											onChange={(e) => {
												setPassword(e.target.value);
												if (fieldErrors.password) {
													setFieldErrors((prev) => ({
														...prev,
														password: false,
													}));
												}
											}}
										/>
									</label>
								</label>
							</div>

							<div className="space-y-3">
								<button
									type="submit"
									disabled={
										isSubmitting || isGoogleSubmitting
									}
									className="btn btn-neutral btn-sm h-11 w-full gap-2 rounded-xl font-semibold shadow-sm"
								>
									{isSubmitting ? "Memproses..." : "Masuk"}
									<ArrowRight className="h-4 w-4" />
								</button>

								<div className="divider text-base-content/30 py-1 text-[10px] tracking-widest uppercase">
									Akses Cepat
								</div>

								<button
									type="button"
									disabled={
										isSubmitting || isGoogleSubmitting
									}
									onClick={handleGoogleLogin}
									className="btn btn-outline btn-sm border-base-300 hover:bg-base-300 h-11 w-full gap-2 rounded-xl text-sm font-semibold transition-all"
								>
									<Chrome className="h-4 w-4" />
									{isGoogleSubmitting
										? "Mengarahkan..."
										: "Google Account"}
								</button>
							</div>

							<p className="text-base-content/30 mt-2 text-center text-[10px] font-medium tracking-wide">
								SANDIKA - BPS INDONESIA v1.0.0
							</p>
						</form>
					</div>
				</section>
			</div>
		</main>
	);
}
