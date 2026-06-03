"use client";

import { useFieldArray, useFormContext, useWatch, type FieldErrors } from "react-hook-form";
import { motion } from "framer-motion";
import { ImageUp, Plus, Trash2 } from "lucide-react";
import EditableField from "@components/ui/EditableField";
import { formatDateDisplay, type DailyQuestsFormValues, type QuestFormValues } from "../quest-form";

type QuestCardProps = {
  name: string;
  label: string;
  editing: boolean;
  onRemove?: () => void;
  errors?: FieldErrors<QuestFormValues>;
};

const inputClasses = "w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-white";
const viewClasses = "min-h-[38px] rounded-lg px-3 py-2 text-slate-200";

export default function QuestCard({ name, label, editing, onRemove, errors }: QuestCardProps) {
  const { control, register, setValue } = useFormContext<DailyQuestsFormValues>();
  const quest = useWatch({ control, name }) as QuestFormValues | undefined;
  const { fields, append, remove } = useFieldArray({
    control,
    name: `${name}.images` as const,
    keyName: "fieldId",
  });

  const addImage = () => append({ url: "", by: "", source: "" });

  const handleUpload = (index: number, file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setValue(`${name}.images.${index}.url` as const, String(reader.result ?? ""), {
        shouldDirty: true,
        shouldValidate: true,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = (id: string) => {
    const input = document.getElementById(id) as HTMLInputElement | null;
    input?.click();
  };
  const imagesError = (errors?.images as { message?: string } | undefined)?.message;

  return (
    <motion.div layout className="border border-slate-700/60 rounded-xl p-5 bg-slate-900/60 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">{label}</h3>
        {editing && onRemove && (
          <button type="button" onClick={onRemove} aria-label={`Remove ${label}`} className="text-red-400 hover:text-red-300">
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-wide text-slate-500">Title</span>
          <EditableField
            editing={editing}
            display={<div className={viewClasses}>{quest?.title?.trim() || "Untitled quest"}</div>}
          >
            <input
              {...register(`${name}.title` as const)}
              className={inputClasses}
              placeholder="Quest title"
              aria-label={`${label} title`}
            />
          </EditableField>
          {errors?.title?.message && <p className="text-xs text-red-400">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-wide text-slate-500">Date</span>
          <EditableField editing={editing} display={<div className={viewClasses}>{formatDateDisplay(quest?.date)}</div>}>
            <input
              type="date"
              {...register(`${name}.date` as const)}
              className={inputClasses}
              aria-label={`${label} date`}
            />
          </EditableField>
          {errors?.date?.message && <p className="text-xs text-red-400">{errors.date.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs uppercase tracking-wide text-slate-500">Description</span>
        <EditableField
          editing={editing}
          display={<div className="min-h-[70px] rounded-lg px-3 py-2 text-slate-300">{quest?.description || "No description."}</div>}
        >
          <textarea
            {...register(`${name}.description` as const)}
            className={`${inputClasses} min-h-[90px]`}
            placeholder="Optional description"
            aria-label={`${label} description`}
          />
        </EditableField>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-slate-500">Images</span>
          {editing && (
            <button type="button" onClick={addImage} aria-label={`Add image to ${label}`} className="text-white">
              <Plus size={16} />
            </button>
          )}
        </div>

        <EditableField
          editing={editing}
          display={
            <div className="space-y-3">
              {quest?.images?.length ? (
                quest.images.map((image, index) => (
                  <div key={`${image.url}-${index}`} className="flex flex-wrap items-center gap-3">
                    <img
                      src={image.url}
                      alt={image.by || `Quest image ${index + 1}`}
                      className="h-16 w-24 rounded-lg object-cover border border-slate-700/70"
                      loading="lazy"
                    />
                    <div className="text-sm text-slate-300">
                      <div>{image.by || "Unknown"}</div>
                      {image.source && <div className="text-xs text-slate-500">{image.source}</div>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500">No images yet.</div>
              )}
            </div>
          }
        >
          <div className="space-y-3">
            {fields.length === 0 && <div className="text-sm text-slate-500">No images added yet.</div>}
            {fields.map((field, index) => {
              const imageErrors = errors?.images?.[index] as FieldErrors<QuestFormValues["images"][number]> | undefined;
              const uploadId = `${name}-image-${field.fieldId}`;
              return (
                <div key={field.fieldId} className="border border-slate-700 rounded-lg p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm text-slate-300">Image {index + 1}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUploadClick(uploadId)}
                        aria-label={`Upload image ${index + 1}`}
                        className="text-slate-300 hover:text-white"
                      >
                        <ImageUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        aria-label={`Remove image ${index + 1}`}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <input
                    id={uploadId}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      handleUpload(index, event.target.files?.[0]);
                      event.currentTarget.value = "";
                    }}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <input
                        {...register(`${name}.images.${index}.url` as const)}
                        className={inputClasses}
                        placeholder="Image URL"
                        aria-label={`Image ${index + 1} URL`}
                      />
                      {imageErrors?.url?.message && <p className="text-xs text-red-400">{imageErrors.url.message}</p>}
                    </div>
                    <div>
                      <input
                        {...register(`${name}.images.${index}.by` as const)}
                        className={inputClasses}
                        placeholder="Credit"
                        aria-label={`Image ${index + 1} credit`}
                      />
                      {imageErrors?.by?.message && <p className="text-xs text-red-400">{imageErrors.by.message}</p>}
                    </div>
                  </div>
                  <div>
                    <input
                      {...register(`${name}.images.${index}.source` as const)}
                      className={inputClasses}
                      placeholder="Source link"
                      aria-label={`Image ${index + 1} source`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </EditableField>
        {imagesError && <p className="text-xs text-red-400">{imagesError}</p>}
      </div>
    </motion.div>
  );
}
