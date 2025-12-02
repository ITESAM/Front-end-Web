import type { AddressFormData, ContactFormData, PersonalInfoFormData } from "@/lib/validations";

export type RegistrationFormData = PersonalInfoFormData &
  AddressFormData &
  ContactFormData & {
    identityDocumentFront: File | null;
    identityDocumentBack: File | null;
    profilePhoto: File | null;
  };

export type RegistrationStepData = Partial<RegistrationFormData>;
