"""Validate registry, articles, figures, manifests and service worker before publish."""
import json,re,pathlib,datetime,collections
ROOT=pathlib.Path(__file__).resolve().parents[1]
def audit():
 entries=json.loads((ROOT/'articles.json').read_text());files={p.relative_to(ROOT).as_posix() for p in ROOT.rglob('*') if p.is_file()};sw=(ROOT/'sw.js').read_text();errors=[];figures=[]
 ids=[a['id'] for a in entries]
 if len(ids)!=len(set(ids)):errors.append('duplicate article IDs')
 for a in entries:
  if a['file'] not in files:errors.append('missing article '+a['file']);continue
  html=(ROOT/a['file']).read_text()
  refs=set(re.findall(r'assets/briefs/[^\"\s<>]+',html))
  for p in refs:
   if p not in files:errors.append('missing asset '+p)
   elif (ROOT/p).stat().st_size<100:errors.append('implausible asset '+p)
   if './'+p not in sw:errors.append('uncached asset '+p)
   if not re.search(r'<img\b[^>]*src=[\"\']'+re.escape(p),html):errors.append('asset not embedded '+p)
   if not re.search(r'<a\b[^>]*href=[\"\']'+re.escape(p),html):errors.append('asset not linked '+p)
  if './'+a['file'] not in sw:errors.append('uncached article '+a['file'])
  figures.append({'id':a['id'],'count':len(re.findall(r'<figure class="brief-figure"',html)),'assets':sorted(refs)})
 orphan=sorted(p for p in files if p.startswith('articles/') and p.endswith('.html') and p not in {a['file'] for a in entries})
 manifest=json.loads((ROOT/'manifest.webmanifest').read_text())
 for i in manifest['icons']:
  if i['src'] not in files:errors.append('missing icon '+i['src'])
 core=re.findall(r'"(\./[^\"]*)"',sw.split('];')[0])
 for p in core:
  if p!='./' and p[2:] not in files:errors.append('missing cache path '+p)
 return {'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'articles':len(entries),'figures':figures,'orphanArticles':orphan,'duplicateDates':dict((k,v) for k,v in collections.Counter(a['date'] for a in entries).items() if v>1),'cacheVersion':re.search(r'clinical-reasoning-v\d+',sw).group(),'errors':errors}
if __name__=='__main__':
 d=audit();print(json.dumps(d,ensure_ascii=False,indent=2));raise SystemExit(bool(d['errors'] or d['orphanArticles']))
