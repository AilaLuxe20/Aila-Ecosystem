import { redirect } from "next/navigation";

export default function GuestPage() {
  redirect("/sign-in");
}
