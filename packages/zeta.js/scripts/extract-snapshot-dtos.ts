import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const base = fileURLToPath(new URL('../../../../', import.meta.url)).replace(/\/$/, '');
const androidDir = `${base}/analysis/android/v3.51.94/extracted`;
const webDir = `${base}/analysis/web/mirror/zeta-ai.io/_external/web-cdn.zeta-ai.io/_next/static/chunks`;
const androidPath = 'analysis/android/v3.51.94/extracted/module_1670.js';
const webPath = 'analysis/web/mirror/zeta-ai.io/_external/web-cdn.zeta-ai.io/_next/static/chunks/1cg9jkxvwrhay.js';
const androidText = readFileSync(`${base}/${androidPath}`, 'utf8');
const webRaw = readFileSync(`${base}/${webPath}`, 'utf8');
const webBuild = await Bun.build({ entrypoints: [`${base}/${webPath}`], target: 'browser', minify: false, write: false });
if (!webBuild.success)
    throw new Error(`Cannot format saved Web DTO: ${webBuild.logs.join('\n')}`);
const webText = await webBuild.outputs[0].text();
const lineAt = (text: string, pos: number) => text.slice(0, pos).split('\n').length;
const androidNames = [...androidText.matchAll(/\b(?:class|export function)\s+(\w+)/g)].map(m => m[1]);
const androidMeta: any[] = [];
const androidCode = androidText.replace(/^import .*;$/gm, '').replace(/^export \{[^\n]*\};$/gm, '').replace(/^export /gm, '').replace(/^PaymentInfoApiDtoTossPayments = \w+;$/gm, '').replace(/(\w+): (items\d*|obj\d*)\b/g, 'get $1() { return $2 }');
const enumNames = [...androidText.matchAll(/^export const (\w+) = /gm)].map(m => m[1]);
let androidClasses: any, enums: any;
try {
    androidClasses = vm.runInNewContext(`${androidCode}\n;({${[...androidNames, ...enumNames].join(',')}})`, { ClassTransformer: { Type: (typeFunction: any, options: any) => (target: any, propertyName: any) => androidMeta.push({ target: target.constructor, propertyName, typeFunction, options }) }, _module: {} }, { timeout: 10000 });
}
catch (e) {
    console.error('Android eval:', e);
    process.exit(1);
}
enums = Object.fromEntries(enumNames.map(name => [name, androidClasses[name]]));
for (const name of enumNames)
    delete androidClasses[name];
const modules = new Map<number, any>();
const webMeta: any[] = [];
let webExports: any = {};
const capture: any = {};
const webIds = [...webText.matchAll(/(?:\blet|\bvar|,)\s*([\w$]+)\s*=\s*(?:class\b|\(\(\)\s*=>)/g)].map(m => m[1]);
let webCode = webText.replace('  e.s(["MH"', `  globalThis.__capture({${[...new Set(webIds)].join(',')}});\n  e.s(["MH"`);
const global: any = { __capture: (o: any) => Object.assign(capture, o), Reflect: { getMetadata: () => undefined }, TURBOPACK: { push: (arr: any[]) => { for (let i = 1; i < arr.length; i++) {
            if (typeof arr[i] === 'number' && typeof arr[i + 1] === 'function')
                modules.set(arr[i], arr[i + 1]);
        } } } };
vm.runInNewContext(webCode, global, { timeout: 10000 });
modules.get(993397)({ g: global, i: (id: number) => id === 606482 ? { f: { addTypeMetadata: (m: any) => webMeta.push(m) } } : {}, s: (arr: any[]) => { for (let i = 0; i < arr.length;) {
        let k = arr[i++], v = arr[i++];
        if (v === 0)
            v = arr[i++];
        else
            v = v();
        webExports[k] = v;
    } } });
const webClasses: any = { ...capture };
for (const [key, value] of Object.entries(webExports))
    if (typeof value === 'function' && !Object.values(webClasses).includes(value))
        webClasses[`export:${key}`] = value;
function graph(classes: any, meta: any[], source: string, sourceText: string, kind: string) {
    const names = new Map(Object.entries(classes).map(([k, v]) => [v, k]));
    const out: any = {};
    for (const [id, cls] of Object.entries(classes) as any) {
        if (typeof cls !== 'function')
            continue;
        const declaration = cls.toString();
        const body = declaration.slice(declaration.indexOf('{') + 1, declaration.lastIndexOf('}'));
        const fields = [...body.matchAll(/^\s*([\w$]+);\s*$/gm)].map(m => m[1]);
        const parent = Object.getPrototypeOf(cls);
        const parentName = names.get(parent);
        const rawPos = kind === 'android' ? sourceText.search(new RegExp(`\\b(?:class|export function) ${id}\\b`)) : sourceText.search(new RegExp(`\\b${id.replace('$', '\\$')}\\s*=\\s*(?:class|\\(\\(\\))`));
        const evidence = { path: source, line: kind === 'android' ? lineAt(sourceText, rawPos) : 2, ...(kind === 'web' ? { formattedLine: rawPos >= 0 ? lineAt(sourceText, rawPos) : undefined } : {}) };
        const f: any = {};
        for (const key of fields)
            f[key] = { type: 'unknown', evidence: 'class field declaration' };
        for (const m of meta.filter(m => m.target === cls)) {
            let type: any;
            try {
                type = m.typeFunction();
            }
            catch { }
            const nested = names.get(type) ?? (type?.name === 'Date' ? 'Date' : type?.name ?? 'unknown');
            const opts = m.options;
            f[m.propertyName] = { ...(f[m.propertyName] ?? {}), type: nested, evidence: 'ClassTransformer.Type decorator', ...(opts?.discriminator ? { discriminator: { property: opts.discriminator.property, subTypes: opts.discriminator.subTypes.map((s: any) => ({ name: s.name, type: names.get(s.value) ?? s.value?.name ?? 'unknown' })) }, keepDiscriminatorProperty: opts.keepDiscriminatorProperty } : {}) };
        }
        out[id] = { fields: f, ...(parentName ? { extends: parentName } : {}), source: evidence, fieldsComplete: kind === 'web', requiredness: 'unknown', ...(kind === 'web' ? { exportKeys: Object.entries(webExports).filter(([, v]) => v === cls).map(([k]) => k) } : {}) };
    }
    return out;
}
const aGraph = graph(androidClasses, androidMeta, androidPath, androidText, 'android');
const wGraph = graph(webClasses, webMeta, webPath, webText, 'web');
const norm = (p: string) => p.replace(/:[\w]+/g, ':param').replace(/\/$/, '');
const aDescriptors: any[] = [];
for (const file of readdirSync(androidDir).filter(n => n.endsWith('.js'))) {
    const text = readFileSync(`${androidDir}/${file}`, 'utf8');
    for (const m of text.matchAll(/\{\s*method:\s*"(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)",\s*url:\s*"([^"\n]*)"([^{}]*?)(?:\}|$)/g)) {
        const response = m[3].match(/responseClass:\s*require\("module_1670"\)\.([\w$]+)/)?.[1];
        aDescriptors.push({ method: m[1], path: m[2], response, source: { path: `analysis/android/v3.51.94/extracted/${file}`, line: lineAt(text, m.index!) }, key: `${m[1]} ${norm(m[2])}` });
    }
}
const wDescriptors: any[] = [];
function webDescriptorsFromAST(file: string, text: string) {
    const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    const result: any[] = [];
    const get = (obj: any, key: string) => obj.properties.find((p: any) => p.name?.getText(sf) === key)?.initializer;
    function visit(node: any) {
        if (ts.isObjectLiteralExpression(node)) {
            const m = get(node, 'method'), p = get(node, 'url'), r = get(node, 'responseClass');
            if (m && p && ts.isStringLiteral(m) && ts.isStringLiteral(p) && /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$/.test(m.text)) {
                let responseExport: any, responseId: any;
                if (r && ts.isPropertyAccessExpression(r) && ts.isIdentifier(r.expression)) {
                    let fn = node.parent;
                    while (fn && !ts.isFunctionLike(fn))
                        fn = fn.parent;
                    let found = false;
                    const findAlias = (n: any) => { if (ts.isVariableDeclaration(n) && n.name.getText(sf) === r.expression.text && n.initializer && ts.isCallExpression(n.initializer) && n.initializer.arguments[0]?.getText(sf) === '993397')
                        found = true; if (n === fn || !ts.isFunctionLike(n))
                        ts.forEachChild(n, findAlias); };
                    if (fn)
                        findAlias(fn);
                    if (found) {
                        responseExport = r.name.text;
                        responseId = Object.keys(wGraph).find(id => wGraph[id].exportKeys.includes(responseExport));
                    }
                }
                result.push({ method: m.text, path: p.text, responseExport, responseId, source: { path: `analysis/web/mirror/zeta-ai.io/_external/web-cdn.zeta-ai.io/_next/static/chunks/${file}`, line: sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1 }, key: `${m.text} ${norm(p.text)}` });
            }
        }
        ts.forEachChild(node, visit);
    }
    visit(sf);
    return result;
}
for (const file of readdirSync(webDir).filter(n => n.endsWith('.js'))) {
    const text = readFileSync(`${webDir}/${file}`, 'utf8');
    wDescriptors.push(...webDescriptorsFromAST(file, text));
}
const matches: any[] = [];
const a2w = new Map<string, string>();
const w2a = new Map<string, string>();
const conflicts: any[] = [];
function match(a: string, w: string, reason: any) { if (a2w.has(a) && a2w.get(a) !== w) {
    conflicts.push({ android: a, web: w, existing: a2w.get(a), reason });
    return;
} if (w2a.has(w) && w2a.get(w) !== a) {
    conflicts.push({ android: a, web: w, existing: w2a.get(w), reason });
    return;
} if (a2w.has(a))
    return; a2w.set(a, w); w2a.set(w, a); matches.push({ android: a, web: w, reason }); }
for (const wd of wDescriptors)
    if (wd.responseId)
        for (const ad of aDescriptors.filter(d => d.key === wd.key && d.response))
            match(ad.response, wd.responseId, { kind: 'matching-api-responseClass', key: wd.key, android: ad.source, web: wd.source });
let advanced = true;
while (advanced) {
    const before = matches.length;
    for (const { android: a, web: w } of [...matches]) {
        const ag = aGraph[a], wg = wGraph[w];
        if (!ag || !wg)
            continue;
        if (ag.extends && wg.extends)
            match(ag.extends, wg.extends, { kind: 'matching-parent', android: a, web: w });
        for (const [field, af] of Object.entries(ag.fields) as any) {
            const wf = wg.fields[field];
            if (!wf)
                continue;
            if (aGraph[af.type] && wGraph[wf.type])
                match(af.type, wf.type, { kind: 'matching-decorator-field', android: a, web: w, field });
            if (af.discriminator && wf.discriminator && af.discriminator.property === wf.discriminator.property)
                for (const s of af.discriminator.subTypes) {
                    const ws = wf.discriminator.subTypes.find((t: any) => t.name === s.name);
                    if (ws)
                        match(s.type, ws.type, { kind: 'matching-discriminator', android: a, web: w, field, name: s.name });
                }
        }
    }
    advanced = matches.length > before;
}
// Pair uniquely identifying decorator graphs; all primitive fields remain untyped.
function compatible(ag: any, wg: any, depth = 0) {
    const af = Object.entries(ag.fields) as any;
    const wf = Object.entries(wg.fields).filter(([, v]: any) => v.evidence === 'ClassTransformer.Type decorator') as any;
    if (!af.length || af.length !== wf.length)
        return false;
    if (!!ag.extends !== !!wg.extends)
        return false;
    if (ag.extends && a2w.has(ag.extends) && a2w.get(ag.extends) !== wg.extends)
        return false;
    for (const [key, v] of af) {
        const w = wg.fields[key];
        if (!w || w.evidence !== 'ClassTransformer.Type decorator')
            return false;
        if (v.type === 'Date' && w.type !== 'Date' || w.type === 'Date' && v.type !== 'Date')
            return false;
        if (a2w.has(v.type) && a2w.get(v.type) !== w.type)
            return false;
        if (aGraph[v.type] && wGraph[w.type]) {
            if (!!aGraph[v.type].extends !== !!wGraph[w.type].extends)
                return false;
            const nested = Object.keys(aGraph[v.type].fields).length;
            if (nested && depth < 3 && !compatible(aGraph[v.type], wGraph[w.type], depth + 1))
                return false;
        }
        if (!!v.discriminator !== !!w.discriminator)
            return false;
        if (v.discriminator && JSON.stringify([v.discriminator.property, v.discriminator.subTypes.map((t: any) => t.name)]) !== JSON.stringify([w.discriminator.property, w.discriminator.subTypes.map((t: any) => t.name)]))
            return false;
    }
    return true;
}
match('ChatStreamApiDtoAutoPaymentChargedApiDto', 'export:Jt', { kind: 'event-consumer-member-and-unique-web-subclass', event: 'AUTO_PAYMENT_CHARGED', field: 'chargedAmount', source: { path: 'analysis/android/v3.51.94/extracted/5022_useChatStream.js', line: 160 } });
match('ChatStreamApiDtoAutoPaymentRequestedApiDto', 'export:wh', { kind: 'event-consumer-member-and-unique-web-subclass', event: 'AUTO_PAYMENT_REQUESTED', field: 'orderId', source: { path: 'analysis/android/v3.51.94/extracted/5022_useChatStream.js', line: 182 } });
let extra = true;
while (extra) {
    const before = matches.length;
    const candidates = new Map<string, string[]>();
    for (const [a, ag] of Object.entries(aGraph)) {
        if (a2w.has(a))
            continue;
        const ws = Object.entries(wGraph).filter(([w, wg]) => !w2a.has(w) && compatible(ag, wg)).map(([w]) => w);
        if (ws.length)
            candidates.set(a, ws);
    }
    for (const [a, ws] of candidates)
        if (ws.length === 1 && [...candidates.values()].filter(xs => xs.includes(ws[0])).length === 1)
            match(a, ws[0], { kind: 'unique-decorator-graph', fields: Object.keys(aGraph[a].fields) });
    let more = true;
    while (more) {
        const start = matches.length;
        for (const { android: a, web: w } of [...matches]) {
            const ag = aGraph[a], wg = wGraph[w];
            if (!ag || !wg)
                continue;
            if (ag.extends && wg.extends)
                match(ag.extends, wg.extends, { kind: 'matching-parent', android: a, web: w });
            for (const [field, af] of Object.entries(ag.fields) as any) {
                const wf = wg.fields[field];
                if (!wf)
                    continue;
                if (aGraph[af.type] && wGraph[wf.type])
                    match(af.type, wf.type, { kind: 'matching-decorator-field', android: a, web: w, field });
                if (af.discriminator && wf.discriminator && af.discriminator.property === wf.discriminator.property)
                    for (const st of af.discriminator.subTypes) {
                        const wt = wf.discriminator.subTypes.find((t: any) => t.name === st.name);
                        if (wt)
                            match(st.type, wt.type, { kind: 'matching-discriminator', android: a, web: w, field, name: st.name });
                    }
            }
        }
        more = matches.length > start;
    }
    extra = matches.length > before;
}
const named: any = {};
for (const [name, a] of Object.entries(aGraph) as any) {
    const wid = a2w.get(name), w = wid ? wGraph[wid] : undefined;
    const fields: any = {};
    for (const [key, v] of Object.entries(w?.fields ?? {}) as any) {
        fields[key] = { ...v, type: w2a.get(v.type) ?? v.type, ...(v.discriminator ? { discriminator: { ...v.discriminator, subTypes: v.discriminator.subTypes.map((t: any) => ({ ...t, type: w2a.get(t.type) ?? t.type })) } } : {}) };
    }
    for (const [key, v] of Object.entries(a.fields) as any) {
        fields[key] = { ...(fields[key] ?? {}), ...v, ...(fields[key]?.evidence ? { evidence: ['android ClassTransformer.Type decorator', 'web class field/decorator'] } : {}) };
    }
    named[name] = { ...a, fields, ...(w ? { webId: wid, webSource: w.source, fieldsComplete: true, matching: matches.find(m => m.android === name)?.reason } : {}) };
}
for (const [owner, shape] of Object.entries(named) as any)
    for (const [field, v] of Object.entries(shape.fields) as any)
        if (v.discriminator)
            for (const sub of v.discriminator.subTypes) {
                const target = named[sub.type];
                if (target) {
                    const key = v.discriminator.property;
                    const existing = target.fields[key];
                    const values = [...new Set([...(existing?.literalValues ?? []), sub.name])];
                    target.fields[key] = { ...(existing ?? {}), type: 'literal', literalValues: values, evidence: 'Android discriminator registration', discriminatorOwner: owner, discriminatorField: field };
                }
            }
const sourceRef = (file: string, line: number) => ({ path: `analysis/android/v3.51.94/extracted/${file}`, line });
named.RequestAdditionalAuthResponse.fields.authUrl = { type: 'unknown', evidence: 'response.data.authUrl member access', source: sourceRef('3641_useNiceAuth.js', 102) };
const requestObservations = [
    { method: 'POST', path: '/v1/users/check', bodyFields: { externalToken: { type: 'unknown' } }, source: sourceRef('module_4231.js', 237), complete: false },
    { method: 'POST', path: '/v2/additional-auth/nice', bodyFields: {}, source: sourceRef('3641_useNiceAuth.js', 78), complete: false, note: 'Observed request options are {}, no body field is supplied by this caller' },
    { method: 'GET', path: '/v2/additional-auth/nice/validate', queryFields: { request_id: { type: 'unknown' }, web_transaction_id: { type: 'unknown' } }, source: sourceRef('module_6522.js', 90), complete: false },
    { method: 'GET', path: '/v2/plots/search', queryFields: { keyword: { type: 'unknown' }, order: { type: 'unknown', enum: 'PlotSearchOrder' }, source: { type: 'unknown' }, cursor: { type: 'unknown', evidence: 'pageKey cursor' } }, source: sourceRef('6371_useSearchPlots.js', 190), additionalSources: [sourceRef('6371_useSearchPlots.js', 101)], complete: false },
    { method: 'GET', path: '/v2/plots/search/plot-count', queryFields: { keyword: { type: 'unknown' } }, source: sourceRef('6371_useSearchPlots.js', 119), complete: false, note: 'Observed query field; requiredness is unknown' },
    { method: 'POST', path: '/v1/frame-4cuts', bodyFields: { purchaseRequestId: { type: 'unknown' }, source: { type: 'unknown' }, plotId: { type: 'unknown' }, characterId: { type: 'unknown' }, partner: { fields: { type: { type: 'unknown' }, id: { type: 'unknown' } } }, expectedPrice: { type: 'unknown' } }, source: sourceRef('6375_Frame4cutCreateScreen.js', 1000), complete: false, note: 'Additional options are spread from another object; decompiled spread target is unreliable' },
    { method: 'POST', path: '/v1/creator-feed/posts', multipartFields: { blocks: { type: 'string', encoding: 'JSON.stringify(blocks)' }, commentEnabled: { type: 'string', encoding: 'String(commentEnabled)' }, '[fileKey]': { type: 'unknown', evidence: 'dynamic fileKey/file multipart entries' } }, source: sourceRef('6216_useFeedPostSubmit.js', 156), complete: false },
    { method: 'PUT', path: '/v1/creator-feed/posts/:postId', multipartFields: { blocks: { type: 'string', encoding: 'JSON.stringify(blocks)' }, commentEnabled: { type: 'string', encoding: 'String(commentEnabled)' }, '[fileKey]': { type: 'unknown', evidence: 'dynamic fileKey/file multipart entries' } }, source: sourceRef('6216_useFeedPostSubmit.js', 156), complete: false },
];
const observedFeedPostBlockVariants = [
    { type: 'TEXT', fields: ['text'], source: sourceRef('6217_buildFeedPostBlocks.js', 24) },
    { type: 'PLOT', fields: ['plotId'], source: sourceRef('6217_buildFeedPostBlocks.js', 29) },
    { type: 'POLL', fields: ['pollId'], source: sourceRef('6217_buildFeedPostBlocks.js', 35) },
    { type: 'POLL', fields: ['question', 'options', 'durationMinutes'], optionFields: ['text', 'imageFileKey'], source: sourceRef('6217_buildFeedPostBlocks.js', 40) },
    { type: 'IMAGE', fields: ['imageId'], source: sourceRef('6217_buildFeedPostBlocks.js', 68) },
    { type: 'IMAGE', fields: ['fileKey'], source: sourceRef('6217_buildFeedPostBlocks.js', 76) },
];
const result = { requestObservations, observedFeedPostBlockVariants, sources: { android: { path: androidPath, sha256: createHash('sha256').update(androidText).digest('hex') }, web: { path: webPath, sha256: createHash('sha256').update(webRaw).digest('hex') } }, extractionNotes: ['Android module evaluation is isolated without filesystem or network APIs. Decompiler forward object references are resolved lazily to extract decorators. Spurious PaymentInfoApiDtoTossPayments assignments are ignored; declared classes are preserved.', 'Web module evaluation is isolated with ClassTransformer metadata capture only. API imports are resolved within their TypeScript AST function scope.', 'A unique-decorator-graph correspondence is structural evidence across snapshots, not original TypeScript source or server validation. Unmapped DTOs remain explicit incomplete shapes.'], enums, snapshotVersion: '3.51.94', generatedAt: '2026-11-14', policy: { primitiveLeaves: 'unknown unless source explicitly provides a type', collections: 'ClassTransformer.Type alone does not distinguish scalar and array', requiredness: 'Class fields and Type decorators do not prove requiredness or nullability', wireDates: 'Date decorators describe client conversion; SDK JSON wire values remain strings', androidFieldCompleteness: 'Hermes decompilation removes ordinary class fields; decorator-only classes are incomplete', webScope: 'Saved Web snapshot only, no backend requests' }, stats: { androidClasses: Object.keys(aGraph).length, webClasses: Object.keys(wGraph).length, mapped: matches.length, androidDescriptors: aDescriptors.length, webDescriptors: wDescriptors.length, androidEndpointPairs: new Set(aDescriptors.filter(d => /^\/v\d+\//.test(d.path)).map(d => d.key)).size, webEndpointPairs: new Set(wDescriptors.filter(d => /^\/v\d+\//.test(d.path)).map(d => d.key)).size, conflicts: conflicts.length }, named, android: aGraph, web: wGraph, matches, conflicts, androidDescriptors: aDescriptors, webDescriptors: wDescriptors };
mkdirSync(`${base}/api/packages/zeta.js/scripts/fixtures`, { recursive: true });
writeFileSync(`${base}/api/packages/zeta.js/scripts/fixtures/snapshot-3.51.94-dtos.json`, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result.stats));
