import { createContext, useContext } from "react";
import { api } from "./api";

interface JsonApiContextType {
  postJson: (endpoint: string, data: any) => Promise<any>;
  getJson: (endpoint: string, params?: any) => Promise<any>;
}

const JsonApiContext = createContext<JsonApiContextType | undefined>(undefined);

export const JsonApiProvider = ({ children }: { children: React.ReactNode }) => {
  const postJson = async (endpoint: string, data: any) => {
    const response = await api.post(endpoint, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  };

  const getJson = async (endpoint: string, params?: any) => {
    const response = await api.get(endpoint, { params });
    return response.data;
  };

  return (
    <JsonApiContext.Provider value={{ postJson, getJson }}>
      {children}
    </JsonApiContext.Provider>
  );
};

export const useJsonApi = () => {
  const context = useContext(JsonApiContext);
  if (!context) {
    throw new Error("useJsonApi deve ser usado dentro de um JsonApiProvider");
  }
  return context;
};
