"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
    ArrowRight,
    Chrome,
    KeyRound,
    UserRound,
    AlertCircle,
} from "lucide-react";

export default function LoginPage() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier.trim() || !password.trim()) {
            setError("Username/email and password are required.");
            return;
        }
        // Mock validation
        if (identifier === "admin" && password === "admin") {
            setError(null);
            // Redirect or handle login
            console.log("Login success");
        } else {
            setError("Kredensial yang Anda masukkan salah.");
        }
    };

    return (
        <main className="min-h-screen bg-base-100 flex items-center justify-center p-6 md:p-12">
            <div className="flex flex-col lg:flex-row w-full max-w-5xl gap-10 lg:gap-20 items-center justify-center">
                {/* Brand / Logo Section */}
                <section className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
                    <div className="relative w-16 h-16 md:w-20 md:h-20 mb-2">
                        <Image
                            src="/logo/Lambang_Badan_Pusat_Statistik_(BPS)_Indonesia.svg.png"
                            alt="BPS Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            Sandika <span className="text-primary">BPS</span>
                        </h1>
                        <p className="max-w-sm text-base-content/60 text-base leading-relaxed">
                            Sistem Manajemen Data Industri Kabupaten
                            Karanganyar. Silakan masuk untuk akses aplikasi.
                        </p>
                    </div>
                </section>

                {/* Form Section */}
                <section className="w-full max-w-95">
                    <div className="rounded-2xl border border-base-300 bg-base-200/30 p-6 md:p-8 shadow-sm backdrop-blur-sm">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="flex flex-col gap-4">
                                <label className="form-control w-full space-y-1.5">
                                    <span className="label-text font-medium text-sm px-0.5">
                                        Username atau email
                                    </span>
                                    <label
                                        className={`input input-bordered h-11 flex items-center gap-3 bg-base-100 px-3 transition-all focus-within:ring-2 focus-within:ring-primary/20 ${error && !identifier ? "input-error" : ""}`}
                                    >
                                        <UserRound className="h-4 w-4 opacity-40 shrink-0" />
                                        <input
                                            type="text"
                                            className="grow text-sm"
                                            placeholder="Username/Email"
                                            value={identifier}
                                            onChange={(e) => {
                                                setIdentifier(e.target.value);
                                                if (error) setError(null);
                                            }}
                                        />
                                    </label>
                                    {error && !identifier && (
                                        <p className="flex items-center gap-1.5 px-0.5 mt-1 text-[11px] font-medium text-error animate-in fade-in slide-in-from-top-1">
                                            <AlertCircle className="size-3" />
                                            Username atau email wajib diisi
                                        </p>
                                    )}
                                </label>

                                <label className="form-control w-full space-y-1.5">
                                    <div className="flex justify-between items-center px-0.5">
                                        <span className="label-text font-medium text-sm">
                                            Password
                                        </span>
                                        <a
                                            href="#"
                                            className="link link-hover text-xs text-primary font-medium"
                                        >
                                            Lupa password?
                                        </a>
                                    </div>
                                    <label
                                        className={`input input-bordered h-11 flex items-center gap-3 bg-base-100 px-3 transition-all focus-within:ring-2 focus-within:ring-primary/20 ${error && !password ? "input-error" : ""}`}
                                    >
                                        <KeyRound className="h-4 w-4 opacity-40 shrink-0" />
                                        <input
                                            type="password"
                                            className="grow text-sm"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                if (error) setError(null);
                                            }}
                                        />
                                    </label>
                                    {error && !password && (
                                        <p className="flex items-center gap-1.5 px-0.5 mt-1 text-[11px] font-medium text-error animate-in fade-in slide-in-from-top-1">
                                            <AlertCircle className="size-3" />
                                            Password wajib diisi
                                        </p>
                                    )}
                                </label>
                            </div>

                            {error && identifier && password && (
                                <p className="text-center text-xs font-semibold text-error/90 bg-error/5 py-2 rounded-lg border border-error/10 animate-in zoom-in-95 duration-200">
                                    {error}
                                </p>
                            )}

                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    className="btn btn-neutral btn-sm h-11 w-full rounded-xl gap-2 shadow-sm font-semibold"
                                >
                                    Masuk
                                    <ArrowRight className="h-4 w-4" />
                                </button>

                                <div className="divider text-[10px] uppercase tracking-widest text-base-content/30 py-1">
                                    Akses Cepat
                                </div>

                                <Link href="/" className="block">
                                    <button
                                        type="button"
                                        className="btn btn-outline btn-sm h-11 w-full rounded-xl gap-2 border-base-300 hover:bg-base-300 transition-all font-semibold text-sm"
                                    >
                                        <Chrome className="h-4 w-4" />
                                        Google Account
                                    </button>
                                </Link>
                            </div>

                            <p className="text-center text-[10px] font-medium tracking-wide text-base-content/30 mt-2">
                                SANDIKA - BPS INDONESIA v1.0.0
                            </p>
                        </form>
                    </div>
                </section>
            </div>
        </main>
    );
}
