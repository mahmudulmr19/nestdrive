"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { Button, DataTable, type ColumnDef } from "@nestdrive/ui";
import type { SubscriptionPackage } from "@nestdrive/schemas/subscription-package";
import { api } from "~/lib/api";
import { DashboardBody } from "~/components/layout";
import { PackageForm } from "./package-form";

const columns = (
  onEdit: (pkg: SubscriptionPackage) => void,
  onDelete: (pkg: SubscriptionPackage) => void,
): ColumnDef<SubscriptionPackage>[] => [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "maxFolders",
    header: "Max Folders",
  },
  {
    accessorKey: "maxNestingLevel",
    header: "Nesting Level",
  },
  {
    accessorKey: "allowedFileTypes",
    header: "File Types",
    cell: ({ row }) =>
      row.original.allowedFileTypes
        .map((t) => t.charAt(0) + t.slice(1).toLowerCase())
        .join(", "),
  },
  {
    accessorKey: "maxFileSizeMb",
    header: "Max Size (MB)",
  },
  {
    accessorKey: "totalFileLimit",
    header: "Total Files",
  },
  {
    accessorKey: "filesPerFolder",
    header: "Files/Folder",
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit(row.original)}
          aria-label="Edit package"
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete(row.original)}
          aria-label="Delete package"
        >
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>
    ),
  },
];

export default function PackagesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editPackage, setEditPackage] = useState<
    SubscriptionPackage | undefined
  >();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = api.useQuery("get", "/v1/admin/packages");

  const { mutate: deletePackage } = api.useMutation(
    "delete",
    "/v1/admin/packages/{id}",
    {
      onSuccess() {
        queryClient.invalidateQueries({
          queryKey: ["get", "/v1/admin/packages"],
        });
        toast.success("Package deleted");
      },
      onError(err) {
        toast.error(err.error.message);
      },
    },
  );

  const handleEdit = (pkg: SubscriptionPackage) => {
    setEditPackage(pkg);
    setFormOpen(true);
  };

  const handleDelete = (pkg: SubscriptionPackage) => {
    if (!confirm(`Delete "${pkg.name}"? This action cannot be undone.`)) return;
    deletePackage({ params: { path: { id: pkg.id } } });
  };

  const handleOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditPackage(undefined);
  };

  return (
    <>
      <DashboardBody
        title="Subscription Packages"
        description="Manage the tiers available to users."
        header={
          <Button
            onClick={() => {
              setEditPackage(undefined);
              setFormOpen(true);
            }}
          >
            Add Package
          </Button>
        }
      >
        <DataTable
          columns={columns(handleEdit, handleDelete)}
          data={data ?? []}
          loading={isLoading}
          error={error ? String(error) : null}
        />
      </DashboardBody>

      <PackageForm
        open={formOpen}
        onOpenChange={handleOpenChange}
        editPackage={editPackage}
      />
    </>
  );
}
