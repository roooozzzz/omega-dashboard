import { redirect } from "next/navigation";

export default function MoatScannerPage() {
  redirect("/signals?strategy=long&tab=moat");
}
