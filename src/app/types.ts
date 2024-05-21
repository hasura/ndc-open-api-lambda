export type GeneratedCode = {
  filePath: string;
  fileContent: string;
  fileType: "api-ts" | "functions-ts";
};

export type GenerateCodeInput = {
  openApiUri: string;
  headers?: string;
  baseUrl?: string;
};
