"use client";

import { useState, ChangeEvent, FocusEvent, FormEvent } from "react";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  contact: string;
  password: string;
  confirmPassword: string;
};

type Errors = Partial<Record<keyof FormState | "form", string>>;

const initialForm: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  contact: "",
  password: "",
  confirmPassword: "",
};

function validateField(name: keyof FormState, value: string, form: FormState): string {
  const v = value.trim();
  switch (name) {
    case "firstName":
      if (!v) return "First name is required.";
      if (v.length < 2) return "First name must be at least 2 characters.";
      return "";
    case "lastName":
      if (!v) return "Last name is required.";
      if (v.length < 2) return "Last name must be at least 2 characters.";
      return "";
    case "email":
      if (!v) return "Email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address.";
      return "";
    case "contact":
      if (!v) return "Contact is required.";
      if (!/^\+?[0-9\s-]{9,15}$/.test(v)) return "Enter a valid phone number (9-15 digits).";
      return "";
    case "password":
      if (!value) return "Password is required.";
      if (value.length < 8) return "Password must be at least 8 characters.";
      if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value))
        return "Password must contain at least one letter and one number.";
      return "";
    case "confirmPassword":
      if (!value) return "Please confirm your password.";
      if (value !== form.password) return "Passwords do not match.";
      return "";
  }
}

function validateAll(form: FormState): Errors {
  const errors: Errors = {};
  (Object.keys(form) as (keyof FormState)[]).forEach((key) => {
    const msg = validateField(key, form[key], form);
    if (msg) errors[key] = msg;
  });
  return errors;
}

const fields: {
  name: keyof FormState;
  label: string;
  type: string;
  placeholder: string;
  autoComplete: string;
}[] = [
  { name: "firstName", label: "First name", type: "text", placeholder: "Jane", autoComplete: "given-name" },
  { name: "lastName", label: "Last name", type: "text", placeholder: "Doe", autoComplete: "family-name" },
  { name: "email", label: "Email", type: "email", placeholder: "jane@example.com", autoComplete: "email" },
  { name: "contact", label: "Contact", type: "tel", placeholder: "+254 700 000000", autoComplete: "tel" },
  { name: "password", label: "Password", type: "password", placeholder: "At least 8 characters", autoComplete: "new-password" },
  { name: "confirmPassword", label: "Confirm password", type: "password", placeholder: "Repeat your password", autoComplete: "new-password" },
];

export default function RegisterForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof FormState;
    const value = e.target.value;
    const next = { ...form, [name]: value };
    setForm(next);

    // Re-validate live only for fields the user has already visited
    setErrors((prev) => {
      const updated: Errors = { ...prev, form: undefined };
      if (touched[name] || prev[name]) {
        updated[name] = validateField(name, value, next) || undefined;
      }
      // Changing the password affects the confirmation field
      if (name === "password" && (touched.confirmPassword || prev.confirmPassword)) {
        updated.confirmPassword = validateField("confirmPassword", next.confirmPassword, next) || undefined;
      }
      return updated;
    });
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof FormState;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, form[name], form) || undefined }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validateAll(form);
    setTouched({
      firstName: true, lastName: true, email: true,
      contact: true, password: true, confirmPassword: true,
    });
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      // Focus the first invalid field
      const first = Object.keys(validationErrors)[0];
      document.getElementById(first)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
          contact: form.contact.trim(),
          role: "USER",
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        if (response.status === 409) {
          setErrors({ email: data?.message || "An account with this email already exists." });
        } else if (response.status === 400 && data?.errors && typeof data.errors === "object") {
          setErrors(data.errors);
        } else if (response.status === 401 || response.status === 403) {
          setErrors({ form: "The server rejected this request. Please try again later." });
        } else {
          setErrors({ form: data?.message || "Something went wrong. Please try again." });
        }
        return;
      }

      setSuccess(true);
      setForm(initialForm);
      setTouched({});
      setErrors({});
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
        <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="text-2xl font-semibold text-gray-900">Create your account</h1>
          <p className="mt-1 text-sm text-gray-500">Fill in your details to get started.</p>

          {success && (
              <div role="status" className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                Account created successfully. You can now sign in.
              </div>
          )}

          {errors.form && (
              <div role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errors.form}
              </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fields.slice(0, 2).map((f) => (
                  <Field key={f.name} f={f} value={form[f.name]} error={errors[f.name]}
                         inputClass={inputClass(f.name)} onChange={handleChange} onBlur={handleBlur} />
              ))}
            </div>

            {fields.slice(2).map((f) => (
                <Field key={f.name} f={f} value={form[f.name]} error={errors[f.name]}
                       inputClass={inputClass(f.name)} onChange={handleChange} onBlur={handleBlur} />
            ))}

            <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>
      </div>
  );
}

function Field({
                 f, value, error, inputClass, onChange, onBlur,
               }: {
  f: (typeof fields)[number];
  value: string;
  error?: string;
  inputClass: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: FocusEvent<HTMLInputElement>) => void;
}) {
  return (
      <div>
        <label htmlFor={f.name} className="mb-1 block text-sm font-medium text-gray-700">
          {f.label}
        </label>
        <input
            id={f.name}
            name={f.name}
            type={f.type}
            value={value}
            placeholder={f.placeholder}
            autoComplete={f.autoComplete}
            onChange={onChange}
            onBlur={onBlur}
            aria-invalid={!!error}
            aria-describedby={error ? `${f.name}-error` : undefined}
            className={inputClass}
        />
        {error && (
            <p id={`${f.name}-error`} className="mt-1 text-xs text-red-600">
              {error}
            </p>
        )}
      </div>
  );
}