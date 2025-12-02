import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { addressSchema, AddressFormData } from "@/lib/validations";
import { formatCEP } from "@/lib/formatters";
import type { RegistrationStepData } from "../types";

interface StepAddressProps {
  onNext: (data: RegistrationStepData) => void;
  onBack: () => void;
  initialData: RegistrationStepData;
}

const StepAddress = ({ onNext, onBack, initialData }: StepAddressProps) => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: initialData as Partial<AddressFormData>,
  });

  const onSubmit = (data: AddressFormData) => {
    onNext(data);
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-primary">Endereço</h3>
        <p className="text-sm text-muted-foreground">
          Informe seu endereço completo
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="street">Rua *</Label>
          <Input
            id="street"
            placeholder="Nome da rua"
            {...register("street")}
          />
          {errors.street && <p className="text-sm text-destructive">{errors.street.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="number">Número *</Label>
          <Input
            id="number"
            placeholder="Nº"
            {...register("number")}
          />
          {errors.number && <p className="text-sm text-destructive">{errors.number.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="neighborhood">Bairro *</Label>
          <Input
            id="neighborhood"
            placeholder="Bairro"
            {...register("neighborhood")}
          />
          {errors.neighborhood && <p className="text-sm text-destructive">{errors.neighborhood.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="zipCode">CEP *</Label>
          <Input
            id="zipCode"
            placeholder="00000-000"
            maxLength={9}
            {...register("zipCode")}
            onChange={(e) => {
              const formatted = formatCEP(e.target.value);
              setValue("zipCode", formatted);
            }}
          />
          {errors.zipCode && <p className="text-sm text-destructive">{errors.zipCode.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Cidade *</Label>
          <Input
            id="city"
            placeholder="Cidade"
            {...register("city")}
          />
          {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">Estado *</Label>
          <Input
            id="state"
            placeholder="UF"
            maxLength={2}
            {...register("state")}
          />
          {errors.state && <p className="text-sm text-destructive">{errors.state.message}</p>}
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" size="lg" onClick={onBack} className="gap-2">
          <ChevronLeft className="h-5 w-5" />
          Voltar
        </Button>
        <Button type="submit" size="lg" className="gap-2">
          Próximo
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};

export default StepAddress;
