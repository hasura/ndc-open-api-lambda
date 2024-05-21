import * as apiTsGenerator from "./api-ts-generator";
import * as functionsTsGenerator from "./functions-ts-generator";
import * as headersParser from "../open-api-generator/parser/header-parser";
import * as context from "../context";
import * as types from "../types";

export type GenerateCodeInput = {
  openApiUri: string, headers?: string, baseUrl?: string,
}

export async function generateCode(args: GenerateCodeInput): Promise<types.GeneratedCode[]> {
  const generatedCode: types.GeneratedCode[] = []

  const apiTsCode = await apiTsGenerator.generateApiTsCode(args.openApiUri);
  const headersMap = headersParser.parseHeaders(args.headers);
  const functionsTsCode = await functionsTsGenerator.generateFunctionsTsCode(apiTsCode.legacyTypedApiComponents, headersMap, args.baseUrl);

  generatedCode.push({
    filePath: context.getInstance().getApiFilePath(),
    fileContent: apiTsCode.files.files[0]!.fileContent,
    fileType: "api-ts"
  });

  generatedCode.push({
    filePath: context.getInstance().getFunctionsFilePath(),
    fileContent: functionsTsCode.fileContent,
    fileType: functionsTsCode.fileType,
  });

  return generatedCode;
}