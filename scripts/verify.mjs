// SPDX-License-Identifier: MIT
import {root,verifyCatalog,walk,scanText} from './catalog.mjs';
const manifest=await verifyCatalog();await scanText(root,await walk(root));console.log(JSON.stringify({assets:manifest.assets.length,originals:'all SHA-256 hashes and PNG dimensions match',publicText:'scan passed',inventory:'no unlisted artwork'}));
