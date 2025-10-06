import * as React from "react";
import * as API from "@/lib/api";
import { headers } from "next/headers";
import CategoryUpdateScreen from "@/components/configurations/category/screen";

type PageProps = {
  params: { id: string };
};

export default async function CategoryUpdatePage({ params }: PageProps) {
  const cookieHeader = (await headers()).get("cookie") ?? "";
  const category = await API.getCategory(params.id, cookieHeader);

  return (
    <main>
      <CategoryUpdateScreen category={category.category} />
    </main>
  );
}
