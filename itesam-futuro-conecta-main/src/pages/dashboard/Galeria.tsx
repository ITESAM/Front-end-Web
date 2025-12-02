import { useEffect, useMemo, useRef, useState } from "react";
import { Upload, Filter, MoreVertical, Star, Edit, Trash, ImagePlus, CheckCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { api } from "@/api/api";

interface GalleryImage {
  id: number;
  titulo: string;
  url: string;
  categoria_id: string; // ID da categoria
  categoria_nome: string; // Nome da categoria para exibição
  autor: string;
  status: string | "Inativo" | "Aprovado" | "Pendente";
  novaImagem?: File; // <- adiciona este campo opcional
  size: string | "Invativo", "Aprovado", "Pendente";
  usuario_id: string | "";
}

interface Categoria {
  id: number;
  nome: string;
}

type GallerySize = "small" | "medium" | "large";

const galleryGridColumns: Record<GallerySize, string> = {
  small: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-6",
  medium: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  large: "grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
};

interface GalleryImage {
  id: number;
  titulo: string;
  url: string;
  categoria: string;
  autor: string;
  status: string | "small" | "medium" | "large";
}

const initialImages: GalleryImage[] = [];

const statusConfig = {
  Inativo: { label: "Invativo", color: "bg-primary/10 text-primary border-primary/20" },
  Aprovado: { label: "Aprovado", color: "bg-success/10 text-success border-success/20" },
  Pendente: { label: "Pendente", color: "bg-warning/10 text-warning border-warning/20" },
};


const Galeria = () => {
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [galleryCategories, setGalleryCategories] = useState<Categoria[]>([]);
  const [gallerySize, setGallerySize] = useState<GallerySize>("medium");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formState, setFormState] = useState({
    titulo: "",
    categoria_id: "",
    autor: "",
    imagem: null as File | null,
    previewUrl: "",
    status: "",
    size: "small",
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const totalImages = images.length;

  // ----------------------
  // Busca categorias e galeria
  // ----------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🔹 Categorias
        const catRes = await api.get("categoria/get_list_categoria.php");
        if (catRes.data.status && Array.isArray(catRes.data.data)) {
          setGalleryCategories(
            catRes.data.data.map((cat: any) => ({
              id: String(cat.id),
              nome: cat.nome,
            }))
          );
        } else {
          console.error("Erro ao buscar categorias:", catRes.data.message);
        }

        // 🔹 Galeria
        const galRes = await api.get("galeria/get_list_post_galeria.php");
        if (galRes.data.status && Array.isArray(galRes.data.data)) {
          const galImages: GalleryImage[] = galRes.data.data.map((img: any) => ({
            id: Number(img.id),
            titulo: img.titulo,
            url: `https://itesam.org.br/api/${img.url_image}`,
            categoria_id: String(img.categoria_id),
            categoria_nome: img.categoria_nome || "",
            autor: img.autor,
            status: img.status || "Pendente",
          }));
          setImages(galImages);
        } else {
          console.error("Erro ao buscar galeria:", galRes.data.message);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchData();
  }, []);

  // ----------------------
  // Envio do formulário
  // ----------------------
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formState.imagem)
      return toast.error("Selecione uma imagem antes de enviar!");
    try {
      
      const usuario_id = localStorage.getItem("Id");
      const formData = new FormData();
      formData.append("titulo", formState.titulo);
      formData.append("autor", formState.autor);
      formData.append("categoria_id", formState.categoria_id);
      formData.append("size", formState.size);
      if (formState.imagem) formData.append("imagem", formState.imagem);

      const res = await api.post("galeria/post_galeria.php", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.status) {
        const newImage: GalleryImage = {
          id: totalImages > 0
            ? Math.max(...images.map((img) => img.id)) + 1
            : 1,
          titulo: formState.titulo,
          categoria_id: formState.categoria_id,
          autor: formState.autor,
          url: res.data.url_imagem,
          status: formState.status,
          categoria_nome: "",
          categoria: formState.categoria_id,
          size: formState.size,
          usuario_id: usuario_id,
          Aprovado: undefined,
          Pendente: undefined
        };
        setImages([newImage, ...images]);
        toast.success("Imagem enviada com sucesso!");
      } else {
        toast.error(res.data.message || "Erro ao enviar a imagem.");
      }
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      toast.error("Ocorreu um erro ao enviar a imagem.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFormState({
        titulo: "",
        categoria_id: "",
        autor: "",
        imagem: null,
        previewUrl: "",
        size: "small",
        status: "",
      });
    }
  };

  // ----------------------
  // Paginação
  // ----------------------
  function usePagination<T>(items: T[], itemsPerPage: number = 9) {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const paginatedItems = useMemo(() => {
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return items.slice(start, end);
    }, [items, currentPage, itemsPerPage]);

    return { currentPage, setCurrentPage, totalPages, paginatedItems };
  }

  const {
    paginatedItems: paginatedImages,
    currentPage,
    setCurrentPage,
    totalPages,
  } = usePagination(images, 9);

  // ----------------------
  // Atualizar status (com o backend)
  // ----------------------
  const handleUpdateStatus = async (id: number, novoStatus: string) => {
    try {
      const response = await api.post("galeria/update_status_galeria.php", {
        id,
        status: novoStatus,
      });

      if (response.data.status) {
        // Atualiza o estado local corretamente
        setImages((prevImages) =>
          prevImages.map((item) =>
            item.id === id ? { ...item, status: novoStatus } : item
          )
        );

        toast.success(`Status atualizado para "${novoStatus}"!`);
      } else {
        toast.error(response.data.message || "Erro ao atualizar status.");
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Não foi possível alterar o status.");
    }
  };

  // Abrir modal de edição
  const handleEditClick = (image: GalleryImage) => {
    setEditingImage(image);
    setIsEditing(true);
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingImage) return;

    try {
      const formData = new FormData();
      formData.append("id", editingImage.id.toString());
      formData.append("titulo", editingImage.titulo);
      formData.append("categoria_id", editingImage.categoria_id.toString());
      formData.append("autor", editingImage.autor);
      formData.append("status", editingImage.status);
      formData.append("size", editingImage.size);

      if (selectedFile) {
        formData.append("imagem", selectedFile);
      }

      const response = await api.post("galeria/update_galeria.php", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status) {
        toast.success("Imagem atualizada com sucesso!");

        // ✅ Cria manualmente o item atualizado
        const updatedImage = {
          ...editingImage,
          titulo: editingImage.titulo,
          categoria_id: editingImage.categoria_id,
          autor: editingImage.autor,
          status: editingImage.status,
          // se tiver preview (imagem nova), usa ela; senão mantém a antiga
          url_image: editingImage.url,
        };

        // ✅ Atualiza apenas o item da lista
        setImages((prevImages) =>
          prevImages.map((img) =>
            img.id === updatedImage.id ? updatedImage : img
          )
        );

        // ✅ Fecha o modal e limpa os estados
        setIsEditing(false);
        setEditingImage(null);
        setSelectedFile(null);
        setPreviewImage(null);
        // Recarrega página após 1s (pra mostrar o toast antes)
        setTimeout(() => {
          window.location.reload();
        }, 0);
      } else {
        toast.error(response.data.message || "Erro ao atualizar imagem.");
      }
    } catch (error) {
      console.error("Erro ao atualizar imagem:", error);
      toast.error("Ocorreu um erro ao atualizar.");
    }
  };


  // ----------------------
  // Alteração de arquivo
  // ----------------------
  const handleFileChange = (file: File | null) => {
    if (formState.previewUrl) URL.revokeObjectURL(formState.previewUrl);

    if (!file)
      return setFormState((prev) => ({
        ...prev,
        imagem: null,
        previewUrl: "",
      }));

    setFormState((prev) => ({
      ...prev,
      imagem: file,
      previewUrl: URL.createObjectURL(file),
    }));
  };

  const handleImageChange = (file: File | null) => {
    if (file) {
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreviewImage(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Galeria</h1>
          <p className="text-muted-foreground mt-1">Gerencie suas imagens e defina capas</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={gallerySize} onValueChange={(value) => setGallerySize(value as GallerySize)}>
            <SelectTrigger className="sm:w-[180px]">
              <SelectValue placeholder="Tamanho da galeria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Pequeno</SelectItem>
              <SelectItem value="medium">Médio</SelectItem>
              <SelectItem value="large">Grande</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filtrar
          </Button>
          <Button className="gap-2" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4" />
            Enviar Imagem
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <ImagePlus className="w-5 h-5" />
            Novo upload para a galeria
          </CardTitle>
          <CardDescription>Envie novas imagens e informe quem é o responsável pelo registro.</CardDescription>
        </CardHeader>

        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="galeria-titulo">Título *</Label>
              <Input
                id="galeria-titulo"
                placeholder="Como essa imagem deve aparecer na galeria?"
                value={formState.titulo}
                onChange={(event) => setFormState((prev) => ({ ...prev, titulo: event.target.value }))}
                required
              />
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="galeria-categoria">Categoria *</Label>
              <Select
                value={formState.categoria_id || undefined}
                onValueChange={(value) => setFormState((prev) => ({ ...prev, categoria_id: value }))}
                required
              >
                <SelectTrigger id="galeria-categoria">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {galleryCategories.map((category) => (
                    <SelectItem key={category.id} value={`${category.id}`}>
                      {category.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Responsável */}
            <div className="space-y-2">
              <Label htmlFor="galeria-autor">Responsável pelo envio *</Label>
              <Input
                id="galeria-autor"
                placeholder="Nome do colaborador ou voluntário"
                value={formState.autor}
                onChange={(event) => setFormState((prev) => ({ ...prev, autor: event.target.value }))}
                required
              />
            </div>

            {/* Arquivo */}
            <div className="space-y-2">
              <Label htmlFor="galeria-imagem">Arquivo da imagem *</Label>
              <Input
                id="galeria-imagem"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
                required
              />
              {formState.imagem && (
                <p className="text-xs text-muted-foreground">Arquivo selecionado: {formState.imagem.name}</p>
              )}
            </div>

            {/* 🔹 Novo campo: Tamanho da Imagem */}
            <div className="space-y-2">
              <Label htmlFor="galeria-tamanho">Tamanho da imagem *</Label>
              <Select
                value={formState.size || ""}
                onValueChange={(value) => setFormState((prev) => ({ ...prev, tamanho: value }))}
                required
              >
                <SelectTrigger id="galeria-tamanho">
                  <SelectValue placeholder="Selecione o tamanho" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Pequeno</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="large">Grande</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 🔹 Novo campo: Status */}
            <div className="space-y-2">
              <Label htmlFor="galeria-status">Status *</Label>
              <Select
                value={formState.status || ""}
                onValueChange={(value) => setFormState((prev) => ({ ...prev, status: value }))}
                required
              >
                <SelectTrigger id="galeria-status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Aprovado">Aprovado</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preview */}
            {formState.previewUrl && (
              <div className="md:col-span-2 space-y-2">
                <Label>Pré-visualização</Label>
                <div className="aspect-video w-full overflow-hidden rounded-lg border border-dashed border-border">
                  <img src={formState.previewUrl} alt="Pré-visualização" className="h-full w-full object-cover" />
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.value = "";
                  if (formState.previewUrl) URL.revokeObjectURL(formState.previewUrl);
                  setFormState({
                    titulo: "",
                    categoria_id: "",
                    autor: "",
                    imagem: null,
                    previewUrl: "",
                    size: "",
                    status: "",
                  });
                }}
              >
                Limpar
              </Button>
              <Button
                type="submit"
                className="gap-2"
                disabled={
                  !formState.titulo ||
                  !formState.categoria_id ||
                  !formState.autor ||
                  !formState.imagem ||
                  !formState.size ||
                  !formState.status
                }
              >
                <Upload className="w-4 h-4" />
                Enviar para revisão
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Listagem de Imagens */}
      {images.length === 0 ? (
        <Card className="p-12 col-span-full">
          <div className="flex flex-col items-center justify-center text-center">
            <Upload className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma imagem na galeria</h3>
            <p className="text-sm text-muted-foreground mb-6">Faça upload de imagens para começar</p>
            <Button className="gap-2">
              <Upload className="w-4 h-4" />
              Enviar Imagens
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <div className={`grid ${galleryGridColumns[gallerySize]} gap-4`}>
            {paginatedImages.map((image) => (
              <Card key={image.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => handleEditClick(image)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        {image.status === "Pendente" && (
                          <DropdownMenuItem onSelect={() => handleUpdateStatus(image.id, "Aprovado")}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Marcar como Aprovado
                          </DropdownMenuItem>
                        )}

                        {image.status === "Aprovado" && (
                          <DropdownMenuItem onSelect={() => handleUpdateStatus(image.id, "Inativo")}>
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Marcar como Inativo
                          </DropdownMenuItem>
                        )}

                        {image.status === "Inativo" && (
                          <>
                            <DropdownMenuItem onSelect={() => handleUpdateStatus(image.id, "Aprovado")}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Marcar como Aprovado
                            </DropdownMenuItem>
                          </>
                        )}

                        <DropdownMenuItem>
                          <Star className="w-4 h-4 mr-2" />
                          Definir como Capa
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="absolute top-2 left-2">
                    <Badge variant="outline" className={statusConfig[image.status as keyof typeof statusConfig].color}>
                      {statusConfig[image.status as keyof typeof statusConfig].label}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm mb-2 text-foreground">{image.titulo}</h3>
                  <p className="text-xs text-muted-foreground mb-2">Responsável: {image.autor}</p>
                  <Badge variant="secondary" className="text-xs">
                    {image.categoria_nome}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 🔹 Paginação */}
          <div className="flex justify-center items-center gap-4 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Próximo
            </Button>
          </div>
        </>
      )}

      {/* 🔹 Painel de Edição */}
      {isEditing && editingImage && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex justify-end items-stretch z-50">
          <div className="bg-white dark:bg-neutral-900 w-full sm:w-[400px] h-full p-6 overflow-y-auto shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Editar Imagem</h2>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={editingImage.titulo}
                  onChange={(e) =>
                    setEditingImage((prev) =>
                      prev ? { ...prev, titulo: e.target.value } : prev
                    )
                  }
                />
              </div>

              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select
                  value={editingImage.categoria_id}
                  onValueChange={(value) =>
                    setEditingImage((prev) =>
                      prev ? { ...prev, categoria_id: value } : prev
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {galleryCategories.map((cat) => (
                      <SelectItem key={cat.id} value={`${cat.id}`}>
                        {cat.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="autor">Responsável</Label>
                <Input
                  id="autor"
                  value={editingImage.autor}
                  onChange={(e) =>
                    setEditingImage((prev) =>
                      prev ? { ...prev, autor: e.target.value } : prev
                    )
                  }
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editingImage.status}
                  onValueChange={(value) =>
                    setEditingImage((prev) =>
                      prev ? { ...prev, status: value as GalleryImage["status"] } : prev
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aprovado">Aprovado</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* TAMANHO */}
              <div>
                <Label htmlFor="size">Tamanho da Imagem</Label>
                <Select
                  value={editingImage.size}
                  onValueChange={(value) =>
                    setEditingImage((prev) =>
                      prev ? { ...prev, size: value } : prev
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tamanho" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Small">Pequeno</SelectItem>
                    <SelectItem value="Medium">Médio</SelectItem>
                    <SelectItem value="Large">Grande</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingImage(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </div>

              {/* Upload de Imagem */}
              <div>
                <Label htmlFor="nova-imagem">Imagem</Label>
                <Input
                  id="nova-imagem"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
                />

                {/* Exibe pré-visualização */}
                {previewImage ? (
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground mb-1">Pré-visualização:</p>
                    <img
                      src={previewImage}
                      alt="Pré-visualização"
                      className="w-full h-auto rounded-lg shadow-md border border-border"
                    />
                  </div>
                ) : (
                  editingImage?.novaImagem && (
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground mb-1">Imagem atual:</p>
                      <img
                        src={editingImage.novaImagem.webkitRelativePath}
                        alt={editingImage.titulo}
                        className="w-full h-auto rounded-lg shadow-md border border-border"
                      />
                    </div>
                  )
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default Galeria;
