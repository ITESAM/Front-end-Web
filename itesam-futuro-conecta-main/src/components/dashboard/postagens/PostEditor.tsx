import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { X, Save, Trash2, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RichTextEditor } from "./RichTextEditor";
import { api } from "@/api/api";

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const formatPreviewDate = (value?: string) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
};

export interface PostEditorValue {
  id?: string;
  slug: string;
  titulo: string;
  descricaoCurta: string;
  conteudo: string;
  imagem?: string;
  categoria: string;
  subcategoria?: string;
  dataPublicacao: string;
  agendamentoPublicacao?: string;
  responsavel: string;
  status: "rascunho" | "em_revisao" | "publicado";
  tags: string[];
  altImagem: string;
  destaque: boolean;
  blocosEspeciais?: string;
  fonte?: string;
}

interface PostEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: PostEditorValue | null;
  onSave: (post: PostEditorValue, file?: File | null) => Promise<void> | void;
  categorias: string[];
  existingSlugs: string[];
  isSaving?: boolean;
}

export const PostEditor = ({
  open,
  onOpenChange,
  post,
  onSave,
  categorias,
  existingSlugs,
  isSaving = false,
}: PostEditorProps) => {
  const [titulo, setTitulo] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [descricaoCurta, setDescricaoCurta] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [dataPublicacao, setDataPublicacao] = useState("");
  const [agendamentoPublicacao, setAgendamentoPublicacao] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [altImagem, setAltImagem] = useState("");
  const [destaque, setDestaque] = useState(false);
  const [blocosEspeciais, setBlocosEspeciais] = useState("");
  const [fonte, setFonte] = useState("");
  const [imagemPreview, setImagemPreview] = useState("");
  const [previewIsObjectUrl, setPreviewIsObjectUrl] = useState(false);
  const [status, setStatus] = useState<PostEditorValue["status"]>("rascunho");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const currentPostSlug = post?.slug;
  const [referencia, setReferencia] = useState<number | null>(null);
  const [referenciasList, setReferenciasList] = useState<{ id: number; titulo: string }[]>([]);
  const [subcategoria, setSubcategoria] = useState("");
  const [subcategoriasList, setSubcategoriasList] = useState<
    { id: number; nome: string; categoria_id: number }[]
  >([]);
  const [subcategoriasDisponiveis, setSubcategoriasDisponiveis] = useState<
    { id: number; nome: string; categoria_id: number }[]
  >([]);


  // 🔹 Carrega todas as subcategorias (para filtrar depois)
  useEffect(() => {
    const fetchSubcategorias = async () => {
      try {
        const res = await api.get("subcategoria/get_categoria_subcategoria.php", {params: {tipo: 2}});
        if (res.data?.status && Array.isArray(res.data.data)) {
          setSubcategoriasList(res.data.data);
        } else {
          console.warn("Nenhuma subcategoria encontrada.");
        }
      } catch (err) {
        console.error("Erro ao buscar subcategorias:", err);
      }
    };

    fetchSubcategorias();
  }, []);

  // 🔹 Atualiza lista de subcategorias disponíveis conforme categoria escolhida
  useEffect(() => {
    if (!categoria) {
      setSubcategoriasDisponiveis([]);
      setSubcategoria("");
      return;
    }

    const filtradas = subcategoriasList.filter(
      (sub) => String(sub.categoria_id) === categoria
    );
    setSubcategoriasDisponiveis(filtradas);

    // Se a subcategoria atual não pertence à nova categoria, limpa
    const stillValid = filtradas.some((s) => String(s.id) === subcategoria);
    if (!stillValid) setSubcategoria("");
  }, [categoria, subcategoriasList]);

  useEffect(() => {
    if (post) {
      setTitulo(post.titulo);
      setSlug(post.url_personalizada ?? "");
      setDescricaoCurta(post.subtitulo);
      setConteudo(post.descricao);
      setCategoria(post.categoria_id?.toString() || "");
      setSubcategoria(post.subcategoria ?? "");
      setDataPublicacao(post.criado_em ? post.criado_em.slice(0, 16) : new Date().toISOString().slice(0, 16));
      setAgendamentoPublicacao(post.agendamentoPublicacao ? post.agendamentoPublicacao.slice(0, 16) : "");
      setResponsavel(post.criado_por);
      setTags(post.tags ?? []);
      setAltImagem(post.imagem_alt ?? "");
      setDestaque(Boolean(post.destaque));
      setBlocosEspeciais(post.bloco_especial ?? "");
      setFonte(post.fonte_referencia ?? "");
      setImagemPreview(`https://itesam.org.br/api/${post.imagem_url}` || "");
      setPreviewIsObjectUrl(false);
      setStatus(post.status?.toLowerCase() || "rascunho");
      setSelectedFile(null);
      setTagInput(post.tags);
      setSlugTouched(true);
      setSlugError(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      setTitulo("");
      setSlug("");
      setSlugTouched(false);
      setSlugError(null);
      setDescricaoCurta("");
      setConteudo("");
      setCategoria("");
      setSubcategoria("");
      setDataPublicacao(new Date().toISOString().slice(0, 16));
      setAgendamentoPublicacao("");
      setResponsavel("");
      setTags([]);
      setTagInput("");
      setAltImagem("");
      setDestaque(false);
      setBlocosEspeciais("");
      setFonte("");
      setImagemPreview("");
      setPreviewIsObjectUrl(false);
      setStatus("rascunho");
      setSelectedFile(null);
      setIsPreviewOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [post, open]);




  // 🔹 Buscar todas as postagens disponíveis para referência
  useEffect(() => {
    const fetchReferencias = async () => {
      try {
        const res = await api.get("postagens/get_all_post_titles.php");
        if (res.data?.status) {
          setReferenciasList(res.data.data);
        }
      } catch (err) {
        console.error("Erro ao buscar referências:", err);
      }
    };
    fetchReferencias();
  }, []);

  useEffect(() => {
    return () => {
      if (previewIsObjectUrl && imagemPreview) {
        URL.revokeObjectURL(imagemPreview);
      }
    };
  }, [imagemPreview, previewIsObjectUrl]);

  useEffect(() => {
    if (slugTouched) return;
    setSlug(slugify(titulo));
  }, [titulo, slugTouched]);

  useEffect(() => {
    if (!slug) {
      setSlugError(slugTouched ? "Slug é obrigatório" : null);
      return;
    }
    const duplicate = existingSlugs
      .filter((value) => value && (!currentPostSlug || value !== currentPostSlug))
      .some((value) => value === slug);
    setSlugError(duplicate ? "Já existe uma postagem com este slug" : null);
  }, [slug, existingSlugs, currentPostSlug, slugTouched]);

  const handleImageChange = (file: File | null) => {
    if (!file) {
      setImagemPreview("");
      setSelectedFile(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImagemPreview(objectUrl);
    setSelectedFile(file);
    setPreviewIsObjectUrl(true);


  };

  const handleRemoveImage = () => {
    if (previewIsObjectUrl && imagemPreview) {
      URL.revokeObjectURL(imagemPreview);
    }
    setImagemPreview("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (tags.includes(trimmed)) {
      setTagInput("");
      return;
    }
    setTags((current) => [...current, trimmed]);
    setTagInput("");
  };

  const handleTagKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (value: string) => {
    setTags((current) => current.filter((tag) => tag !== value));
  };

  const ensureValidSlug = () => {
    const normalized = slugify(slug || titulo);
    if (!normalized) {
      setSlugTouched(true);
      setSlugError("Slug é obrigatório");
      return null;
    }
    const duplicate = existingSlugs
      .filter((value) => value && (!currentPostSlug || value !== currentPostSlug))
      .some((value) => value === normalized);
    if (duplicate) {
      setSlugTouched(true);
      setSlugError("Já existe uma postagem com este slug");
      return null;
    }
    setSlug(normalized);
    return normalized;
  };

  const handleSave = async () => {
    const normalizedSlug = ensureValidSlug();
    if (!normalizedSlug) return;

    const normalizedTags = Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)));

    await onSave(
      {
        id: post?.id,
        slug: normalizedSlug,
        titulo,
        descricaoCurta,
        conteudo,
        categoria,
        subcategoria: subcategoria || undefined,
        dataPublicacao,
        agendamentoPublicacao: agendamentoPublicacao || undefined,
        responsavel,
        status,
        tags: normalizedTags,
        altImagem,
        destaque,
        blocosEspeciais: blocosEspeciais || undefined,
        fonte: fonte || undefined,
        imagem: previewIsObjectUrl ? undefined : imagemPreview || undefined
        //categoria_id
      },
      selectedFile
    );
  };

  const hasImage = Boolean(imagemPreview);
  const canPreview = Boolean(titulo && conteudo);
  const saveDisabled =
    !titulo ||
    !descricaoCurta ||
    !conteudo ||
    !categoria ||
    !dataPublicacao ||
    !responsavel ||
    !hasImage ||
    !altImagem ||
    !slug ||
    Boolean(slugError) ||
    isSaving;

  const urlPreview = slug ? `/${slug}` : titulo ? `/${slugify(titulo)}` : "/minha-url";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{post ? "Editar Postagem" : "Nova Postagem"}</span>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título da Postagem *</Label>
              <Input
                id="titulo"
                placeholder="Digite o título..."
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug / URL personalizada *</Label>
              <Input
                id="slug"
                placeholder="ex: semana-do-brincar"
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(slugify(event.target.value));
                }}
              />
              <p className="text-xs text-muted-foreground">URL final: {urlPreview}</p>
              {slugError && <p className="text-xs text-destructive">{slugError}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao-curta">Descrição curta *</Label>
              <Textarea
                id="descricao-curta"
                placeholder="Resumo que aparecerá na listagem de notícias"
                value={descricaoCurta}
                onChange={(event) => setDescricaoCurta(event.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Tags / Palavras-chave</Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  placeholder="Digite a tag e pressione Enter"
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={handleTagKeyDown}
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  Adicionar tag
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      <span>{tag}</span>
                      <button
                        type="button"
                        className="rounded-full focus:outline-none"
                        onClick={() => handleRemoveTag(tag)}
                        aria-label={`Remover tag ${tag}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Use vírgula ou Enter para adicionar múltiplas tags.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imagem">Imagem de capa *</Label>
              <div className="flex items-center gap-2">
                {/* Input invisível */}
                <Input
                  id="imagem"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => handleImageChange(event.target.files?.[0] ?? null)}
                />

                {/* Botão de upload estilizado */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedFile
                    ? `Selecionado: ${selectedFile.name}`
                    : imagemPreview
                      ? "Trocar imagem"
                      : "Escolher imagem"}
                </Button>

                {imagemPreview && (
                  <Button type="button" variant="outline" size="icon" onClick={handleRemoveImage}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {imagemPreview && (
                <div className="mt-2 rounded-lg overflow-hidden border border-border">
                  <img
                    src={imagemPreview}
                    alt={altImagem || "Pré-visualização"}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}

              <div className="space-y-2 pt-2">
                <Label htmlFor="alt-imagem">Alt text da imagem *</Label>
                <Input
                  id="alt-imagem"
                  placeholder="Descreva a imagem para acessibilidade"
                  value={altImagem}
                  onChange={(event) => setAltImagem(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conteudo">Conteúdo *</Label>
              <RichTextEditor content={conteudo} onChange={setConteudo} />
            </div>

            {/* Categoria */}
            <div className="grid grid-cols-2 gap-4">
              {/* Categoria */}
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                  value={categoria}
                  onValueChange={(value) => setCategoria(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat: any) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subcategoria */}
              <div>
                <Label htmlFor="subcategoria">Subcategoria</Label>
                <Select
                  value={subcategoria}
                  onValueChange={(value) => setSubcategoria(value)}
                  disabled={subcategoriasDisponiveis.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma subcategoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategoriasDisponiveis.map((sub) => (
                      <SelectItem key={sub.id} value={String(sub.id)}>
                        {sub.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data-publicacao">Data de publicação *</Label>
                <Input
                  id="data-publicacao"
                  type="datetime-local"
                  value={dataPublicacao}
                  onChange={(event) => setDataPublicacao(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agendamento">Agendar publicação</Label>
                <Input
                  id="agendamento"
                  type="datetime-local"
                  value={agendamentoPublicacao}
                  onChange={(event) => setAgendamentoPublicacao(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">Defina uma data futura para publicação automática.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável *</Label>
              <Input
                id="responsavel"
                placeholder="Quem é responsável por esta notícia?"
                value={responsavel}
                onChange={(event) => setResponsavel(event.target.value)}
              />
            </div>

            <div className="flex items-start justify-between gap-4 rounded-lg border border-border px-4 py-3">
              <div>
                <p className="font-medium">Campo de destaque</p>
                <p className="text-sm text-muted-foreground">
                  Marque para exibir esta postagem na área de destaques da home automaticamente.
                </p>
              </div>
              <Switch checked={destaque} onCheckedChange={setDestaque} aria-label="Marcar como destaque" />
            </div>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rascunho">Rascunho</SelectItem>
                <SelectItem value="em_revisao">Em revisão</SelectItem>
                <SelectItem value="publicado">Publicado</SelectItem>
              </SelectContent>
            </Select>

            <div className="space-y-2">
              <Label htmlFor="blocos-especiais">Blocos especiais</Label>
              <Textarea
                id="blocos-especiais"
                placeholder="Adicione destaques rápidos ou uma citação lateral"
                value={blocosEspeciais}
                onChange={(event) => setBlocosEspeciais(event.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referencia">Referência</Label>
              <Select
                value={referencia ? String(referencia) : ""}
                onValueChange={(value) => setFonte((value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma postagem de referência" />
                </SelectTrigger>
                <SelectContent>
                  {referenciasList.map((post) => (
                    <SelectItem key={post.id} value={String(post.id)}>
                      {post.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:items-center pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsPreviewOpen(true)}
                disabled={!canPreview}
                className="gap-2"
              >
                <Eye className="h-4 w-4" /> Pré-visualizar
              </Button>
              <Button onClick={handleSave} disabled={saveDisabled} className="gap-2">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Pré-visualização da postagem</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-4 py-2">
              {imagemPreview && (
                <div className="overflow-hidden rounded-lg border border-border">
                  <img src={imagemPreview} alt={altImagem || "Imagem de capa"} className="w-full object-cover" />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                {destaque && <Badge variant="secondary">Postagem em destaque</Badge>}
                <Badge variant="outline">Status: {status === "em_revisao" ? "Em revisão" : status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
                <Badge variant="outline">Slug: {urlPreview}</Badge>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">{titulo}</h2>
                <p className="text-muted-foreground">{descricaoCurta}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-6">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: conteudo }} />
                <div className="space-y-4 text-sm">
                  {blocosEspeciais && (
                    <div className="rounded-lg border border-border p-3 bg-muted/30">
                      <p className="font-semibold">Blocos especiais</p>
                      <p className="text-muted-foreground whitespace-pre-line">{blocosEspeciais}</p>
                    </div>
                  )}
                  <div className="rounded-lg border border-border p-3 bg-muted/10 space-y-2">
                    <p className="font-semibold">Detalhes editoriais</p>
                    <p>
                      <span className="font-medium">Categoria:</span> {categoria || "--"}
                    </p>
                    {subcategoria && (
                      <p>
                        <span className="font-medium">Subcategoria:</span> {subcategoria}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Publicação:</span> {formatPreviewDate(dataPublicacao)}
                    </p>
                    {agendamentoPublicacao && (
                      <p>
                        <span className="font-medium">Agendado para:</span> {formatPreviewDate(agendamentoPublicacao)}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Responsável:</span> {responsavel || "--"}
                    </p>
                  </div>
                  {tags.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-semibold">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {fonte && (
                    <p className="text-muted-foreground">
                      <span className="font-semibold">Fonte:</span> {fonte}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setIsPreviewOpen(false)}>
              Fechar pré-visualização
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
