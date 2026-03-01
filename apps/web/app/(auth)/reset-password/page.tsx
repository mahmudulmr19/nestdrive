"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetPasswordSchema } from "@nestdrive/schemas/user";
import { Button, Field, FieldError, FieldLabel, Input } from "@nestdrive/ui";
import { Controller, useForm } from "react-hook-form";
import { AuthWrapper } from "~/components/auth";
import { api } from "~/lib/api";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [done, setDone] = useState(false);

  const { mutate, isPending } = api.useMutation(
    "post",
    "/v1/auth/reset-password",
    {
      onSuccess() {
        setDone(true);
      },
      onError(error) {
        toast.error(error.error.message);
      },
    },
  );

  const form = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { token: "", password: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    const token =
      values.token ||
      new URLSearchParams(window.location.search).get("token") ||
      "";
    mutate({ body: { token, password: values.password } });
  });

  if (done) {
    return (
      <AuthWrapper
        title="Password updated"
        description="Your password has been reset successfully."
        footerText=""
        footerLinkText=""
        footerLinkHref="/login"
      >
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
            <ShieldCheck className="text-primary size-6" />
          </div>
          <p className="text-muted-foreground text-sm">
            You can now sign in with your new password.
          </p>
          <Button asChild className="h-10 w-full">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      </AuthWrapper>
    );
  }

  return (
    <AuthWrapper
      title="Reset your password"
      description="Enter a new password for your account."
      footerText="Remembered your password?"
      footerLinkText="Back to sign in"
      footerLinkHref="/login"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>New password</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="password"
                aria-invalid={fieldState.invalid}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button type="submit" className="h-10 w-full" isLoading={isPending}>
          Set new password
        </Button>
      </form>
    </AuthWrapper>
  );
}
