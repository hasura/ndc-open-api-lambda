import * as fs from "fs";
import * as path from "path";
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
import { SemVer } from "semver";
