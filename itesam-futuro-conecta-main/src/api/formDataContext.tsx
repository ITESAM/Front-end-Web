import { createContext, useContext } from "react";
import { api } from "./api";

interface FormDataApiContextType {
  postFormData: (endpoint: string, data: Record<string, any>) => Promise<any>;
}

const FormDataApiContext = createContext<FormDataApiContextType | undefined>(undefined);

export const FormDataApiProvider = ({ children }: { children: React.ReactNode }) => {
  const postFormData = async (endpoint: string, data: Record<string, any>) => {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }

    const response = await api.post(endpoint, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  };

  return (
    <FormDataApiContext.Provider value={{ postFormData }}>
      {children}
    </FormDataApiContext.Provider>
  );
};

export const useFormDataApi = () => {
  const context = useContext(FormDataApiContext);
  if (!context) {
    throw new Error("useFormDataApi deve ser usado dentro de um FormDataApiProvider");
  }
  return context;
};
