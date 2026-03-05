import type { Metadata } from "next";

import HelpTicketingPage from "@/components/help/HelpTicketingPage";

export const metadata: Metadata = {
  title: "Bantuan | Digital Industry Tools",
  description: "Halaman bantuan untuk membuat tiket laporan masalah dan memantau status penanganan.",
};

export default function HelpPage() {
  return <HelpTicketingPage />;
}
