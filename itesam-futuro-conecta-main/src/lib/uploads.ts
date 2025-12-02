export type UploadSource =
  | { kind: "file"; file: File }
  | { kind: "url"; url: string };

export const isFileSource = (
  value: UploadSource | null | undefined,
): value is { kind: "file"; file: File } => {
  return Boolean(value && value.kind === "file");
};

export const isUrlSource = (
  value: UploadSource | null | undefined,
): value is { kind: "url"; url: string } => {
  return Boolean(value && value.kind === "url");
};

export const getUploadLabel = (value: UploadSource): string => {
  return value.kind === "file" ? value.file.name : value.url;
};
