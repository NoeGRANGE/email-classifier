"use client";

import * as React from "react";

import { useTranslations } from "@/i18n/use-translations";

import CategoriesSection from "./categories-section";
import CategoryCreateDrawer from "./category-create-drawer";
import ConfigurationHeader from "./configuration-header";
import layoutStyles from "./screen.module.css";
import * as API from "@/lib/api";

type Props = {
  data: ConfigurationDetail;
};

export default function ConfigurationUpdateScreen({ data }: Props) {
  const { t } = useTranslations("configurations");
  const [isCreateDrawerOpen, setCreateDrawerOpen] = React.useState(false);
  const [openedCategory, setOpenedCategory] = React.useState<
    CategoryDetail | undefined
  >(undefined);

  const categories = data.categories ?? [];

  const categoriesTitle = t("update.categories.title", "Categories");
  const categoriesSubtitle = t(
    "update.categories.subtitle",
    "Choose a category to review its configured actions."
  );
  const emptyLabel = t(
    "update.categories.empty",
    "This configuration does not have any categories yet."
  );
  const createLabel = t("update.categories.create", "Add category");
  const createAriaLabel = t(
    "update.categories.create.aria",
    "Create a new category"
  );
  const drawerCloseLabel = t("update.categories.createDrawer.cancel", "Close");
  const drawerPrimaryLabel = openedCategory
    ? t("update.categories.createDrawer.submitUpdate", "Update category")
    : t("update.categories.createDrawer.submitCreate", "Create category");
  const drawerTitle = openedCategory
    ? t("update.categories.createDrawer.editTitle", "Edit category")
    : t("update.categories.createDrawer.title", "Create category");
  const drawerDescription = openedCategory
    ? t(
        "update.categories.createDrawer.editDescription",
        "Update the category details."
      )
    : t(
        "update.categories.createDrawer.description",
        "Fill in the category details to get started."
      );

  const handleOpenDrawer = React.useCallback((category?: CategoryDetail) => {
    setOpenedCategory(category);
    setCreateDrawerOpen(true);
  }, []);

  const handleDrawerChange = React.useCallback((nextOpen: boolean) => {
    setCreateDrawerOpen(nextOpen);
    if (!nextOpen) {
      setOpenedCategory(undefined);
    }
  }, []);

  const handleSubmitCategory = React.useCallback(
    async (payload: {
      id?: number;
      name: string;
      description: string;
      isNew: boolean;
      actions: CategoryAction[];
    }) => {
      const apiActions = payload.actions.map((action) => {
        const props =
          action.props && typeof action.props === "object"
            ? action.props
            : {};
      return {
        type: action.type,
        props,
      };
    });

    try {
      if (payload.id) {
        await API.updateCategory(
          payload.id,
          payload.name,
          payload.description,
          data.id,
          apiActions
        );
      } else {
        await API.createCategory(
          payload.name,
          payload.description,
          data.id,
          apiActions
        );
      }
      handleDrawerChange(false);
    } catch (error) {
      console.error("Failed to submit category", error);
    }
    },
    [data.id, handleDrawerChange]
  );

  return (
    <div className={layoutStyles.wrapper}>
      <ConfigurationHeader name={data.name} />

      <CategoriesSection
        categories={categories}
        title={categoriesTitle}
        subtitle={categoriesSubtitle}
        emptyLabel={emptyLabel}
        createLabel={createLabel}
        createAriaLabel={createAriaLabel}
        onCreateCategory={handleOpenDrawer}
      />

      <CategoryCreateDrawer
        open={isCreateDrawerOpen}
        onOpenChange={handleDrawerChange}
        title={drawerTitle}
        description={drawerDescription}
        closeLabel={drawerCloseLabel}
        primaryLabel={drawerPrimaryLabel}
        onSubmit={handleSubmitCategory}
        category={openedCategory}
      />
    </div>
  );
}
