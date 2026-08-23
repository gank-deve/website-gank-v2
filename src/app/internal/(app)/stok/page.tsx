import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { NewListingButton } from "@/components/internal/listing-dialog";
import { ListingRowActions } from "@/components/internal/listing-row-actions";
import { PhotoManager } from "@/components/internal/photo-manager";
import { formatRupiah, formatDate } from "@/lib/utils";

export const metadata = { title: "Stok HP" };

const STATUS_TONE = {
  available: "success",
  sold: "neutral",
  hidden: "warning",
} as const;

const STATUS_LABEL = {
  available: "Tersedia",
  sold: "Terjual",
  hidden: "Disembunyikan",
} as const;

export default async function StokPage() {
  await requireAdmin();
  const supabase = await createClient();

  const { data: listings } = await supabase
    .from("phone_listings")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Stok HP Bekas
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Unit yang tampil di katalog publik.
          </p>
        </div>
        <NewListingButton />
      </div>

      <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
        {(listings ?? []).length === 0 ? (
          <p className="p-12 text-center text-sm text-muted-foreground">
            Belum ada unit di stok. Klik “Tambah Unit” untuk memulai.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="px-5 py-3 font-medium">Perangkat</th>
                  <th className="px-5 py-3 font-medium">Spesifikasi</th>
                  <th className="px-5 py-3 font-medium">Grade</th>
                  <th className="px-5 py-3 text-right font-medium">Harga</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Foto</th>
                  <th className="px-5 py-3 font-medium">Ditambahkan</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {(listings ?? []).map((item) => (
                  <tr key={item.id} className="border-b border-border-subtle/60 last:border-0">
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-muted-foreground">{item.brand}</span>
                      <p className="font-medium">{item.model}</p>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">
                      {[item.storage, item.ram && `RAM ${item.ram}`, item.color]
                        .filter(Boolean)
                        .join(" · ") || "-"}
                    </td>
                    <td className="px-5 py-3.5 capitalize">{item.condition_grade}</td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      {formatRupiah(item.price)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge tone={STATUS_TONE[item.status as keyof typeof STATUS_TONE] ?? "neutral"}>
                        {STATUS_LABEL[item.status as keyof typeof STATUS_LABEL] ?? item.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <PhotoManager
                        listingId={item.id}
                        label={`${item.brand} ${item.model}`}
                        photos={(item.photos as string[] | null) ?? []}
                      />
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-xs text-muted-foreground">
                      {formatDate(item.created_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-2">
                        <ListingRowActions
                          id={item.id}
                          status={item.status as "available" | "sold" | "hidden"}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
