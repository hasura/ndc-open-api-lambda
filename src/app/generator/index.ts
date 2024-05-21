import * as apiTsGenerator from "./api-ts-generator";
import * as functionsTsGenerator from "./functions-ts-generator";
import * as headersParser from "../open-api-generator/parser/header-parser";
import * as context from "../context";
import * as types from "../types";
import * as logger from "../../util/logger";

export async function generateCode(args: types.GenerateCodeInput): Promise<types.GeneratedCode[]> {
  const generatedCode: types.GeneratedCode[] = []

  logger.trace('starting api.ts code generation');
  const apiTsCode = await apiTsGenerator.generateApiTsCode(args.openApiUri);
  logger.trace('finished api.ts code generation');
  const headersMap = headersParser.parseHeaders(args.headers);
  logger.trace('starting function.ts code generation');
  const functionsTsCode = await functionsTsGenerator.generateFunctionsTsCode(apiTsCode.legacyTypedApiComponents, headersMap, args.baseUrl);
  logger.trace('finished function.ts code generation');

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