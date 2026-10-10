// Chequeo mínimo: `node --experimental-strip-types resources/js/lib/fechas.test.mjs`
import assert from 'node:assert/strict';
import {
    displayToIso,
    formatDate,
    inicioDeMes,
    isoToDisplay,
    maskDate,
} from './fechas.ts';

assert.equal(formatDate('2026-08-05 13:00:00'), '05-08-2026');
assert.equal(formatDate(null), '');
assert.equal(isoToDisplay('2026-08-21'), '21-08-2026');
assert.equal(displayToIso('21-08-2026'), '2026-08-21');
assert.equal(displayToIso('31-02-2026'), null);
assert.equal(displayToIso('12-0'), null);
assert.equal(maskDate('21082026'), '21-08-2026');
assert.equal(maskDate('2a1'), '21');
assert.equal(inicioDeMes('2026-09-15'), '2026-09-01');
console.log('fechas ok');
