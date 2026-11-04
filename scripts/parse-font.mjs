import zlib from 'zlib';

const base64 = 'd09GRgABAAAAAAScAA0AAAAABrAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABGRlRNAAAEgAAAABoAAAAcbyQ+3kdERUYAAARgAAAAHgAAACAAMwAGT1MvMgAAAZgAAABGAAAAVi+vS9xjbWFwAAAB8AAAAEAAAAFKwBMjvmdhc3AAAARYAAAACAAAAAj//wADZ2x5ZgAAAkAAAAEJAAABdH33LXtoZWFkAAABMAAAAC0AAAA2BroQKWhoZWEAAAFgAAAAHAAAACQD5QHQaG10eAAAAeAAAAAPAAAAFAYAAABsb2NhAAACMAAAAA4AAAAOAO4AeG1heHAAAAF8AAAAHAAAACAASgAvbmFtZQAAA0wAAADeAAABkorWfVZwb3N0AAAELAAAACkAAABEp3ubLXgBY2BkYADhPPP4OfH8Nl8ZuJkYQODS2fRrCPr/aSYGxq1ALgcDWBoAO60LkwAAAHgBY2BkYGDc+v80gx4TAwgASaAICmABAFB+Arl4AWNgZGBgYGPQYWBiAAIwyQgWc2AAAwAHVQB6eAFjYGRiYJzAwMrAwejDmMbAwOAOpb8ySDK0MDAwMbByMsCBAAMCBKS5pjA4PGB4wMR44P8BBj3GrQymQGFGkBwAjtgK/gAAeAFjYoAAEA1jAwAAZAAHAHgB3crBCcAwDEPRZydkih567CDdf4ZskmLwFBV8xBfCaC4BXkOUmx4sU0h2ngNb9V0vQCxaRKIAevT7fGWuBrEAAAAAAAAAAAA0AHgAugAAeAF9z79Kw1AUx/FzTm7un6QmJtwmQ5Bg1abgEGr/BAqlU6Gju+Cgg1MkQ/sA7Vj7BOnmO/gUvo2Lo14NqIO6/IazfD8HEODtmQCfoANwNsyp2/GJt3WKQrd1NLiYYWx2PBqOsmJMEOznPOTzfSCrhAtbbLdmeFLJV9eKd63WLrZcIcuaEVdssWCKM6pLCfTVOYbz/0pNSMSZKLIZpvh78sAUH6PlMrreTCabP9r+Z/puPZ2ur/RqpQHgh+MIegCnXeM4MRAPjYN//5tj4ZtTjkFqEdmeMShlEJ7tVAly2TAkx6R68Fl4E/aVvn8JqHFQ4JS1434gXKcuL31dDhzs3YbsEOAd/IU88gAAAHgBfY4xTgMxEEVfkk0AgRCioKFxQYd2ZRtpixxgRU2RfhU5q5VWseQ4JdfgAJyBlmNwAM7ABRhZQ0ORwp7nr+eZAa54YwYg9zm3ynPOeFRe8MCrciXOh/KSS76UV5L/iDmrLiS5AeU519wrL3jmSbkS5115yR2fyivJv9kx0ZMZ2RLZw27q87iNQi8EBo5FSPIMw3HqBboi5lKTGAGDp8FKXWP+t9TU01Lj5His1Ba6uM9dTEMwvrFmbf5GC/q2drW3ruXUhhsCiQOjznFlCzYhHUZp4xp76vsvQh89CQAAeAFjYGJABowM6IANLMrEyMTIzMjCXpyRWJBqZshWXJJYBKOMAFHFBucAAAAAAAAB//8AAngBY2BkYGDgA2IJBhBgAvKZGViBJAuYxwAABJsAOgAAeAFjYGBgZACCk535hiD60tn0azAaAEqpB6wAAA==';
const buf = Buffer.from(base64, 'base64');

const numTables = buf.readUInt16BE(12);
let offset = 44;
for (let i = 0; i < numTables; i++) {
  const tag = buf.toString('utf8', offset, offset + 4);
  const tblOffset = buf.readUInt32BE(offset + 4);
  const compLen = buf.readUInt32BE(offset + 8);
  const origLen = buf.readUInt32BE(offset + 12);
  offset += 20;
  
  if (tag === 'cmap') {
    const compData = buf.subarray(tblOffset, tblOffset + compLen);
    const cmap = compLen < origLen ? zlib.inflateSync(compData) : compData;
    const numSubtables = cmap.readUInt16BE(2);
    for (let s = 0; s < numSubtables; s++) {
      const subOffset = cmap.readUInt32BE(4 + s * 8 + 4);
      const format = cmap.readUInt16BE(subOffset);
      if (format === 4) {
        const segCountX2 = cmap.readUInt16BE(subOffset + 6);
        const segCount = segCountX2 / 2;
        const endCodes = [];
        for (let c = 0; c < segCount; c++) endCodes.push(cmap.readUInt16BE(subOffset + 14 + c * 2));
        const startCodes = [];
        const startOffset = subOffset + 16 + segCountX2;
        for (let c = 0; c < segCount; c++) startCodes.push(cmap.readUInt16BE(startOffset + c * 2));
        for (let c = 0; c < segCount; c++) {
          console.log(`Segment ${c}: 0x${startCodes[c].toString(16)} to 0x${endCodes[c].toString(16)}`);
        }
      }
    }
  }
}
