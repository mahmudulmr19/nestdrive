"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ForgotPasswordSchema } from "@nestdrive/schemas/user";
import { Button, Field, FieldError, FieldLabel, Input } from "@nestdrive/ui";
import { Controller, useForm } from "react-hook-form";
import { AuthWrapper } from "~/components/auth";

export default function ForgotPasswordPage() {
  const form = useForm({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  return (
    <AuthWrapper
      title="Forgot password"
      description="Enter your email and we'll send you a reset link."
      footerText="Remembered your password?"
      footerLinkText="Back to sign in"
      footerLinkHref="/login"
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

        <Button type="submit" className="h-10 w-full">
          Send reset link
        </Button>
      </form>
    </AuthWrapper>
  );
}
