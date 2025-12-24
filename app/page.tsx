import { redirect } from "next/navigation";
import { getCurrentNFLWeek } from "@/lib/nflDates";

export default function Home() {
  const currentWeek = getCurrentNFLWeek();
  
  if (currentWeek === 'playoffs') {
    redirect("/dashboard/playoffs");
  } else {
    redirect(`/dashboard/${currentWeek}`);
  }
}
