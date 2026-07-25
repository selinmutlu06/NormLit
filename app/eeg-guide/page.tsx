import { redirect } from "next/navigation"

/** The guide is now the site itself; keep the old path working for existing links. */
export default function EEGGuideRedirect() {
  redirect("/")
}
