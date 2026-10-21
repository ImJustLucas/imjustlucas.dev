import { FieldError, FieldLabel } from "@/app/admin/admin-form";
import { FileField } from "@/app/admin/file-field";

/**
 * A Project's gallery: each image in place with a box to keep it (unticked,
 * it leaves the gallery on save), then one new image to add after them.
 */
export const GalleryField: React.FC<{ current?: ReadonlyArray<string> }> = ({
  current = [],
}) => (
  <div className="flex min-w-0 flex-col gap-3">
    {current.length > 0 && (
      <fieldset className="flex min-w-0 flex-col gap-2">
        <legend className="mb-2">
          <FieldLabel label="Galerie" hint="décocher pour retirer" />
        </legend>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {current.map((path, i) => (
            <li key={path}>
              <label className="flex cursor-pointer flex-col gap-2 rounded-md border-2 border-seam bg-ground p-2 transition-colors duration-hover hover:border-ink-muted/40 has-[:checked]:border-action-ink/70 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action-ink">
                {/* A site path: no optimisation needed */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={path}
                  alt=""
                  className="aspect-video w-full rounded-sm object-cover object-top"
                />
                <span className="flex items-center gap-2 text-label text-ink">
                  <input
                    type="checkbox"
                    name="gallery"
                    value={path}
                    defaultChecked
                    className="size-4 accent-[rgb(var(--action-ink))]"
                  />
                  Garder l&apos;image {i + 1}
                </span>
              </label>
            </li>
          ))}
        </ul>
        <FieldError name="gallery" />
      </fieldset>
    )}
    <FileField
      name="galleryImage"
      kind="image"
      label={
        current.length > 0
          ? "Ajouter une image à la galerie"
          : "Galerie : première image"
      }
    />
  </div>
);
