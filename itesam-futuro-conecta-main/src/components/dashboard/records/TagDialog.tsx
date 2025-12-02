import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TagDialogProps {
  open: boolean;
  title: string;
  description?: string;
  defaultTags?: string[];
  onOpenChange: (value: boolean) => void;
  onSubmit: (tags: string[]) => Promise<void> | void;
  isSubmitting?: boolean;
}

export const TagDialog = ({
  open,
  onOpenChange,
  onSubmit,
  title,
  description,
  defaultTags = [],
  isSubmitting = false,
}: TagDialogProps) => {
  const [tagsInput, setTagsInput] = useState("");
  const [tempTags, setTempTags] = useState<string[]>(defaultTags);

  useEffect(() => {
    if (open) {
      setTempTags(defaultTags);
    }
  }, [defaultTags, open]);

  const addTag = () => {
    if (!tagsInput.trim()) return;
    const parts = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    setTempTags((current) => Array.from(new Set([...current, ...parts])));
    setTagsInput("");
  };

  const removeTag = (tag: string) => {
    setTempTags((current) => current.filter((item) => item !== tag));
  };

  const handleSubmit = async () => {
    await onSubmit(tempTags);
    setTagsInput("");
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value) {
        setTagsInput("");
        setTempTags(defaultTags);
      }
      onOpenChange(value);
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Digite tags separadas por vírgula"
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addTag();
                }
              }}
            />
            <Button type="button" onClick={addTag} variant="secondary">
              Adicionar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tempTags.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhuma tag adicionada ainda.</p>
            ) : (
              tempTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeTag(tag)}
                >
                  {tag}
                </Badge>
              ))
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar tags"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
