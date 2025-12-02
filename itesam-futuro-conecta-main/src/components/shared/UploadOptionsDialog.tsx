import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link as LinkIcon, ImageIcon, FileText, Trash2 } from "lucide-react";
import type { UploadSource } from "@/lib/uploads";

interface UploadOptionsDialogProps {
  title: string;
  description?: string;
  accept?: string;
  value: UploadSource | null;
  onChange: (value: UploadSource | null) => void;
  children: React.ReactNode;
  previewType?: "image" | "file";
  linkPlaceholder?: string;
  allowClear?: boolean;
}

const UploadOptionsDialog = ({
  title,
  description,
  accept,
  value,
  onChange,
  children,
  previewType = "file",
  linkPlaceholder,
  allowClear = true,
}: UploadOptionsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"file" | "link">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [linkValue, setLinkValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (value?.kind === "url") {
      setTab("link");
      setLinkValue(value.url);
      setSelectedFile(null);
    } else if (value?.kind === "file") {
      setTab("file");
      setSelectedFile(value.file);
      setLinkValue("");
    } else {
      setTab("file");
      setSelectedFile(null);
      setLinkValue("");
    }
  }, [open, value]);

  const imagePreviewUrl = useMemo(() => {
    if (previewType !== "image" || !selectedFile) {
      return null;
    }

    return URL.createObjectURL(selectedFile);
  }, [previewType, selectedFile]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleConfirm = () => {
    if (tab === "file") {
      onChange(selectedFile ? { kind: "file", file: selectedFile } : null);
    } else {
      const trimmed = linkValue.trim();
      onChange(trimmed ? { kind: "url", url: trimmed } : null);
    }
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedFile(null);
    setLinkValue("");
    onChange(null);
    setOpen(false);
  };

  const confirmDisabled =
    tab === "file" ? !selectedFile : linkValue.trim().length === 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="file" className="flex items-center gap-2">
              <Upload className="h-4 w-4" /> Arquivo
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" /> Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4 pt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                setSelectedFile(file);
                if (file) {
                  setLinkValue("");
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full justify-center"
              onClick={() => fileInputRef.current?.click()}
            >
              Selecionar arquivo do dispositivo
            </Button>
            {selectedFile ? (
              <div className="rounded-md border border-dashed border-primary/30 bg-primary/5 p-3 text-sm">
                <div className="flex items-center gap-2">
                  {previewType === "image" ? (
                    <ImageIcon className="h-4 w-4 text-primary" />
                  ) : (
                    <FileText className="h-4 w-4 text-primary" />
                  )}
                  <span className="font-medium text-foreground">
                    {selectedFile.name}
                  </span>
                </div>
                {previewType === "image" && imagePreviewUrl && (
                  <div className="mt-3 overflow-hidden rounded-md border bg-background">
                    <img
                      src={imagePreviewUrl}
                      alt="Pré-visualização"
                      className="h-40 w-full object-cover"
                    />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum arquivo selecionado.
              </p>
            )}
          </TabsContent>

          <TabsContent value="link" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Input
                value={linkValue}
                onChange={(event) => setLinkValue(event.target.value)}
                placeholder={linkPlaceholder ?? "https://exemplo.com/arquivo"}
                inputMode="url"
                type="url"
              />
              <p className="text-sm text-muted-foreground">
                Informe um link público para o arquivo.
              </p>
            </div>
            {previewType === "image" && linkValue.trim() && (
              <div className="overflow-hidden rounded-md border bg-background">
                <img
                  src={linkValue.trim()}
                  alt="Pré-visualização do link informado"
                  className="h-40 w-full object-cover"
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          {allowClear && value && (
            <Button
              type="button"
              variant="ghost"
              className="justify-start text-destructive hover:text-destructive"
              onClick={handleClear}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Remover seleção
            </Button>
          )}
          <div className="flex w-full justify-end gap-2 sm:w-auto">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleConfirm} disabled={confirmDisabled}>
              Confirmar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadOptionsDialog;
