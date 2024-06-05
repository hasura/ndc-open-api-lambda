import * as apiTsGenerator from "./api-ts-generator";
import * as functionsTsGenerator from "./functions-ts-generator";
import * as headersParser from "../parser/open-api/header-parser";
import * as context from "../context";
import * as types from "../types";
import * as logger from "../../util/logger";
import * as schemaParser from "../parser/open-api/schema-parser";
import * as cleanup from "./cleanup";

export async function generateCode(
  args: types.GenerateCodeInput,
): Promise<types.GeneratedCode[]> {
  const generatedCode: types.GeneratedCode[] = [];

  logger.trace("starting api.ts code generation");
  const apiTsCode = await apiTsGenerator.generateApiTsCode(args.openApiUri);
  logger.trace("finished api.ts code generation");
  logger.trace("starting function.ts code generation");

  const parsedSchemaStore = schemaParser.getParsedSchemaStore(
    apiTsCode.typeNames,
    apiTsCode.schemaComponents,
  );
  apiTsCode.schemaStore = parsedSchemaStore;

  const functionsTsCode = await functionsTsGenerator.generateFunctionsTsCode(
    apiTsCode.legacyTypedApiComponents,
    apiTsCode,
    args.baseUrl,
  );
  logger.trace("finished function.ts code generation");

  generatedCode.push({
    filePath: context.getInstance().getApiFilePath(),
    fileContent: apiTsCode.files.files[0]!.fileContent,
    fileType: "api-ts",
  });

  generatedCode.push({
    filePath: context.getInstance().getFunctionsFilePath(),
    fileContent: functionsTsCode.fileContent,
    fileType: functionsTsCode.fileType,
  });

  cleanup.fixImports(generatedCode);

  return generatedCode;
}
