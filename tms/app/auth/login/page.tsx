"use client";

import { useState, ChangeEvent, FocusEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type FormState = {
    email: string;
    password: string;
};

type Errors = Partial<Record<keyof FormState | "form", string>>;

function validateField(name: keyof FormState, value: string): string {
    switch (name) {
        case "email":
            if (!value.trim()) return "Email is required.";
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Enter a valid email address.";
            return "";
        case "password":
            if (!value) return "Password is required.";
            return "";
    }
}

export default function LoginForm() {
    const router = useRouter();
    const [form, setForm] = useState<FormState>({ email: "", password: "" });
    const [errors, setErrors] = useState<Errors>({});
    const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name as keyof FormState;
        const value = e.target.value;
        setForm((prev) => ({ ...prev, [name]: value }));

        setErrors((prev) => {
            const updated: Errors = { ...prev, form: undefined };
            if (touched[name] || prev[name]) {
                updated[name] = validateField(name, value) || undefined;
            }
            return updated;
        });
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        const name = e.target.name as keyof FormState;
        setTouched((prev) => ({ ...prev, [name]: true }));
        setErrors((prev) => ({ ...prev, [name]: validateField(name, form[name]) || undefined }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const validationErrors: Errors = {};
        (Object.keys(form) as (keyof FormState)[]).forEach((key) => {
            const msg = validateField(key, form[key]);
            if (msg) validationErrors[key] = msg;
        });

        setTouched({ email: true, password: true });
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            document.getElementById(Object.keys(validationErrors)[0])?.focus();
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // uncomment only if your backend sets an auth cookie
                body: JSON.stringify({
                    email: form.email.trim(),
                    password: form.password,
                }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => null);

                if (response.status === 401 || response.status === 403) {
                    // Keep this generic so it doesn't reveal whether the email exists
                    setErrors({ form: "Invalid email or password." });
                } else if (response.status === 400 && data?.errors && typeof data.errors === "object") {
                    setErrors(data.errors);
                } else {
                    setErrors({ form: data?.message || "Something went wrong. Please try again." });
                }
                return;
            }

            const data = await response.json();

            // JWT in the response body: store it (see notes below)
            if (data?.token) {
                localStorage.setItem("token", data.token);
            }

            router.push("/dashboard");
        } catch {
            setErrors({ form: "Could not reach the server. Check your connection and try again." });
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass = (name: keyof FormState) =>
        [
            "w-full rounded-lg border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition",
            "focus:ring-2",
            errors[name]
                ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-200",
        ].join(" ");

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
                <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
                <p className="mt-1 text-sm text-gray-500">Sign in to your account to continue.</p>

                {errors.form && (
                    <div role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errors.form}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
                    <div>
                        <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            placeholder="jane@example.com"
                            autoComplete="email"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            aria-invalid={!!errors.email}
                            aria-describedby={errors.email ? "email-error" : undefined}
                            className={inputClass("email")}
                        />
                        {errors.email && (
                            <p id="email-error" className="mt-1 text-xs text-red-600">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div>
                        <div className="mb-1 flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <Link href="/forgot-password" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={form.password}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                aria-invalid={!!errors.password}
                                aria-describedby={errors.password ? "password-error" : undefined}
                                className={`${inputClass("password")} pr-16`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                className="absolute inset-y-0 right-0 px-3 text-xs font-medium text-gray-500 hover:text-gray-700"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                        {errors.password && (
                            <p id="password-error" className="mt-1 text-xs text-red-600">
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-700">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
}