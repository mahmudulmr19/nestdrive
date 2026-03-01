"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CreateUserSchema } from "@nestdrive/schemas/user";
import { Button, Field, FieldError, FieldLabel, Input } from "@nestdrive/ui";
import { Controller, useForm } from "react-hook-form";
import { AuthWrapper } from "~/components/auth";
import { api } from "~/lib/api";
import { toast } from "sonner";

export default function SignupPage() {
  const { mutate, isPending } = api.useMutation("post", "/v1/auth/register", {
    onError(error) {
      toast.error(error.error.message);
    },
    onSuccess(data) {
      localStorage.setItem("token", data.accessToken);
      toast.success("Account created successfully");
      window.location.href = "/";
    },
  });

  const form = useForm({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  return (
    <AuthWrapper
      title="Create account"
      description="Fill out the form below to get started."
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/login"
    >
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((value) => mutate({ body: value }))}
      >
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Full name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Jane Cooper"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
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
                type="password"
                aria-invalid={fieldState.invalid}
                placeholder="Enter your password"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button type="submit" className="h-10 w-full" isLoading={isPending}>
          Create account
        </Button>
      </form>
    </AuthWrapper>
  );
}
