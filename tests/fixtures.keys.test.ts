import { it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { ALL_ITEMS } from '../src/data/bank';
it.runIf(process.env.AUDIT_FIXTURES)('keys', () => { writeFileSync('audit/items.json', JSON.stringify(ALL_ITEMS)); });
