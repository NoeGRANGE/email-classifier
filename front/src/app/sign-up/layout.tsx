import * as React from "react";

type Props = {
  children: React.ReactNode;
};

export const metadata = {
  title: "Connexion",
};

export default async function Layout({ children }: Props) {
  return <>{children}</>;
}
