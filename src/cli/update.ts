import { Command } from "commander";

export const cmd = new Command("update").description(
  "Refresh the files generated using the `init` command. You should use this if your OpenAPI Document has changed"
);
