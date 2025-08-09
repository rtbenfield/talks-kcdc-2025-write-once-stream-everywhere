import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { sql } from "../app/lib/db.server";

const schemaPath = join(import.meta.dirname, "..", "database", "schema.sql");
const schema = await readFile(schemaPath, "utf-8");
console.info(`Schema read successfully from ${schemaPath}`);

await sql.unsafe(schema);
console.info("Schema applied successfully");

process.exit(0);
