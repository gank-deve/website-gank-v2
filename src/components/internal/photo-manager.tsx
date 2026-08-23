"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  uploadListingPhotos,
  removeListingPhoto,
  setPrimaryPhoto,
} from "@/lib/actions/photos";
import { ImageIcon, Star, Trash2 } from "lucide-react";

export function PhotoManager({
  listingId,
  label,
  photos,
}: {
  listingId: string;
  label: string;
  photos: string[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<string[]>(photos);
  const [error, setError] = useState<string | undefined>();
  const [busy, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const sync = (next: string[]) => setList(next);

  const handleUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(undefined);
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    startTransition(async () => {
      const res = await uploadListingPhotos(listingId, fd);
      if (res.error) setError(res.error);
      else if (res.urls) sync([...list, ...res.urls]);
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    });
  };

  const handleRemove = (url: string) =>
    startTransition(async () => {
      const res = await removeListingPhoto(listingId, url);
      if (!res.error) sync(list.filter((p) => p !== url));
      else setError(res.error);
      router.refresh();
    });

  const handlePrimary = (url: string) =>
    startTransition(async () => {
      const res = await setPrimaryPhoto(listingId, url);
      if (!res.error) sync([url, ...list.filter((p) => p !== url)]);
      else setError(res.error);
      router.refresh();
    });

  return (
    <>
      <Button
        size="sm"
        variant="secondary"
        onClick={() => setOpen(true)}
        title="Kelola foto unit"
      >
        <ImageIcon className="h-3.5 w-3.5" />
        Foto{photos.length > 0 ? ` (${photos.length})` : ""}
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={`Foto Unit — ${label}`}
        description="Foto pertama menjadi cover di katalog. Maksimal 8 foto, JPG/PNG/WebP, ≤5 MB per foto."
        className="max-w-xl"
      >
        <div className="mb-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            disabled={busy || list.length >= 8}
            onChange={(e) => handleUpload(e.target.files)}
            className="block w-full cursor-pointer rounded-lg border border-border-subtle bg-background text-xs text-muted-foreground file:mr-3 file:cursor-pointer file:border-0 file:bg-accent file:px-3 file:py-2 file:text-xs file:font-medium file:text-accent-foreground hover:file:bg-accent-hover disabled:opacity-50"
          />
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Bisa pilih beberapa sekaligus.
          </p>
        </div>

        {error && (
          <p className="mb-3 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
            {error}
          </p>
        )}

        {list.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-subtle p-8 text-center text-sm text-muted-foreground">
            Belum ada foto. Unit tanpa foto tampil dengan placeholder di katalog.
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {list.map((url, i) => (
              <li
                key={url}
                className="group relative overflow-hidden rounded-xl border border-border-subtle bg-surface-muted"
              >
                <div className="relative aspect-square">
                  <Image
                    src={url}
                    alt={`Foto ${i + 1}`}
                    fill
                    sizes="(max-width:640px) 45vw, 180px"
                    className="object-cover"
                  />
                  {i === 0 && (
                    <span className="absolute top-1.5 left-1.5 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-accent-foreground">
                      Cover
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-1 p-1.5">
                  <button
                    type="button"
                    title="Jadikan cover"
                    disabled={busy || i === 0}
                    onClick={() => handlePrimary(url)}
                    className="cursor-pointer rounded-md p-1.5 text-warning transition-colors hover:bg-warning/10 disabled:opacity-30"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Hapus foto"
                    disabled={busy}
                    onClick={() => handleRemove(url)}
                    className="cursor-pointer rounded-md p-1.5 text-danger transition-colors hover:bg-danger/10 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-4 text-right">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Tutup
          </Button>
        </p>
      </Dialog>
    </>
  );
}
