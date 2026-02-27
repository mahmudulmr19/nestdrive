"use client";
import { Button, Field, FieldError, Input, FieldLabel } from "@nestdrive/ui";
import { AuthWrapper } from "~/components/auth";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginUserSchema } from "@nestdrive/schemas/user";
import Link from "next/link";

export default function LoginPage() {
  const form = useForm({
    resolver: zodResolver(LoginUserSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <AuthWrapper
      title="Sign in"
      description="Enter your email and password to continue."
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkHref="/signup"
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((value) => console.log(value))}
      >
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="you@example.com"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Password</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Enter your password"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <div className="flex justify-end">
          <Link
            className="text-sm text-primary hover:underline"
            href="/forgot-password"
          >
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" className="h-10 w-full">
          Sign in
        </Button>
      </form>
    </AuthWrapper>
  );
}
