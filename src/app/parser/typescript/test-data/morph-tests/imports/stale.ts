import { helloWorld } from "./a";
import {
  SourceFile,
  SourceFileEmitOptions,
  NamespaceImport,
  NamedImports,
  NamedExports,
  ModuleDeclaration,
} from "ts-morph";
import * as process from "process";
import * as path from "path";
import * as fs from "fs";

export function hello() {}
