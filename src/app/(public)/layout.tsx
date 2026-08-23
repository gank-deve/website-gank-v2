import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark flex min-h-full min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
