"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { CreateSubscriptionPackageSchema } from "@nestdrive/schemas/subscription-package";
import type {
  CreateSubscriptionPackageInput,
  SubscriptionPackage,
} from "@nestdrive/schemas/subscription-package";
import {
  Button,
  Field,
  FieldError,
  FieldLabel,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@nestdrive/ui";
import { api } from "~/lib/api";

const FILE_TYPES = ["IMAGE", "VIDEO", "PDF", "AUDIO"] as const;

interface PackageFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editPackage?: SubscriptionPackage;
}

export function PackageForm({
  open,
  onOpenChange,
  editPackage,
}: PackageFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!editPackage;

  const form = useForm<CreateSubscriptionPackageInput>({
    resolver: zodResolver(CreateSubscriptionPackageSchema),
    defaultValues: {
      name: "",
      maxFolders: 10,
      maxNestingLevel: 3,
      allowedFileTypes: ["IMAGE"],
      maxFileSizeMb: 10,
      totalFileLimit: 100,
      filesPerFolder: 20,
    },
  });

  useEffect(() => {
    if (editPackage) {
      form.reset({
        name: editPackage.name,
        maxFolders: editPackage.maxFolders,
        maxNestingLevel: editPackage.maxNestingLevel,
        allowedFileTypes: editPackage.allowedFileTypes,
        maxFileSizeMb: editPackage.maxFileSizeMb,
        totalFileLimit: editPackage.totalFileLimit,
        filesPerFolder: editPackage.filesPerFolder,
      });
    } else {
      form.reset({
        name: "",
        maxFolders: 10,
        maxNestingLevel: 3,
        allowedFileTypes: ["IMAGE"],
        maxFileSizeMb: 10,
        totalFileLimit: 100,
        filesPerFolder: 20,
      });
    }
  }, [editPackage, form]);

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["get", "/v1/admin/packages"] });
    toast.success(
      isEditing
        ? "Package updated successfully"
        : "Package created successfully",
    );
    onOpenChange(false);
  };

  const { mutate: createPackage, isPending: isCreating } = api.useMutation(
    "post",
    "/v1/admin/packages",
    {
      onSuccess,
      onError(error) {
        toast.error(error.error.message);
      },
    },
  );

  const { mutate: updatePackage, isPending: isUpdating } = api.useMutation(
    "put",
    "/v1/admin/packages/{id}",
    {
      onSuccess,
      onError(error) {
        toast.error(error.error.message);
      },
    },
  );

  const isPending = isCreating || isUpdating;

  const onSubmit = (data: CreateSubscriptionPackageInput) => {
    if (isEditing) {
      updatePackage({ params: { path: { id: editPackage.id } }, body: data });
    } else {
      createPackage({ body: data });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Package" : "New Package"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update the subscription package limits."
              : "Define the limits for a new subscription package."}
          </SheetDescription>
        </SheetHeader>

        <form
          className="flex flex-col gap-4 px-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Package Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="e.g. Free, Silver, Gold"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="maxFolders"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Max Folders</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="number"
                    min={1}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="maxNestingLevel"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Max Nesting Level
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="number"
                    min={1}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="maxFileSizeMb"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Max File Size (MB)
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="number"
                    min={1}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="totalFileLimit"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Total File Limit</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="number"
                    min={1}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="filesPerFolder"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Files Per Folder</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="number"
                    min={1}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <Controller
            name="allowedFileTypes"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Allowed File Types</FieldLabel>
                <div className="flex flex-wrap gap-3 pt-1">
                  {FILE_TYPES.map((type) => (
                    <label
                      key={type}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="accent-primary"
                        checked={field.value.includes(type)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...field.value, type]
                            : field.value.filter((t) => t !== type);
                          field.onChange(next);
                        }}
                      />
                      {type.charAt(0) + type.slice(1).toLowerCase()}
                    </label>
                  ))}
                </div>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </form>

        <SheetFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            isLoading={isPending}
            onClick={form.handleSubmit(onSubmit)}
          >
            {isEditing ? "Save Changes" : "Create Package"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
