import styles from "../page.module.css";
import * as API from "@/lib/api";
import { headers } from "next/headers";

export default async function Home() {
  try {
    const cookieHeader = (await headers()).get("cookie") ?? "";
    const me = await API.apiMe(cookieHeader);
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <div>
            {me.user.email} - {me.user.auth_user_id}
          </div>
        </main>
        <footer className={styles.footer}>TODO footer</footer>
      </div>
    );
  } catch (e) {
    console.error("Error in Home page:", e);
    return <div>Error: {String(e)}</div>;
  }
}
