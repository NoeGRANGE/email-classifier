"use client";

import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";

import { type NormalisedMember } from "./utils";

type TeamMembersTableProps = {
  data: NormalisedMember[];
  columns: ColumnDef<NormalisedMember>[];
  className?: string;
};

export default function TeamMembersTable({
  data,
  columns,
  className,
}: TeamMembersTableProps) {
  return (
    <DataTable
      data={data}
      columns={columns}
      className={cn("w-full", className)}
      initialSorting={[{ id: "email", desc: true }]}
    />
  );
}
