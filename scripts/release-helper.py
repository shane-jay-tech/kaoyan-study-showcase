#!/usr/bin/env python3
"""
Release helper: PDF inspection/rendering (PyMuPDF) and ZIP
creation/inspection (stdlib zipfile). Invoked by the Node release
scripts; stdlib only for ZIP operations, PyMuPDF (fitz) required for
PDF operations and reported as an explicit error when missing.

Subcommands:
  pdf-info   <pdf>            -> JSON: {pages, textChars, links[], sizeBytes}
  pdf-text   <pdf> <out.txt>  -> extract selectable text to a file
  pdf-render <pdf> <outdir>   -> render every page to PNG (evidence for review)
  zip-create <srcdir> <out.zip> -> create a zip of the directory tree
  zip-test   <zip>            -> verify archive integrity (exit 0 when OK)
  zip-list   <zip>            -> JSON lines: {"name","size"}
  zip-extract <zip> <outdir>  -> extract all entries
"""
import json
import os
import sys
import zipfile

PDF_NEEDED = 'PyMuPDF (fitz) is required for this PDF operation. Install it with: python -m pip install pymupdf'


def pdf_document(path):
    try:
        import fitz  # PyMuPDF
    except ImportError as exc:
        print(f"ERROR: {PDF_NEEDED} (import failed: {exc})", file=sys.stderr)
        sys.exit(2)
    return fitz.open(path)


def cmd_pdf_info(args):
    if len(args) != 1:
        sys.exit('usage: release-helper.py pdf-info <pdf>')
    path = args[0]
    doc = pdf_document(path)
    links = []
    text_chars = 0
    for page in doc:
        text_chars += len(page.get_text())
        for link in page.get_links():
            uri = link.get('uri')
            if uri:
                links.append(uri)
    result = {
        'pages': doc.page_count,
        'textChars': text_chars,
        'links': links,
        'sizeBytes': os.path.getsize(path),
    }
    doc.close()
    print(json.dumps(result, ensure_ascii=False))


def cmd_pdf_text(args):
    if len(args) != 2:
        sys.exit('usage: release-helper.py pdf-text <pdf> <out.txt>')
    doc = pdf_document(args[0])
    parts = [page.get_text() for page in doc]
    doc.close()
    with open(args[1], 'w', encoding='utf-8') as out:
        out.write('\n'.join(parts))
    print(f'extracted {sum(len(p) for p in parts)} chars to {args[1]}')


def cmd_pdf_render(args):
    if len(args) != 2:
        sys.exit('usage: release-helper.py pdf-render <pdf> <outdir>')
    doc = pdf_document(args[0])
    os.makedirs(args[1], exist_ok=True)
    paths = []
    for index, page in enumerate(doc):
        pix = page.get_pixmap(dpi=110)
        out_path = os.path.join(args[1], f'page-{index + 1:02d}.png')
        pix.save(out_path)
        paths.append(out_path)
    doc.close()
    print(f'rendered {len(paths)} pages to {args[1]}')


def cmd_zip_create(args):
    if len(args) != 2:
        sys.exit('usage: release-helper.py zip-create <srcdir> <out.zip>')
    src_dir, out_zip = args
    src_dir = os.path.abspath(src_dir)
    with zipfile.ZipFile(out_zip, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(src_dir):
            dirs.sort()
            for name in sorted(files):
                full = os.path.join(root, name)
                rel = os.path.relpath(full, src_dir).replace(os.sep, '/')
                zf.write(full, rel)
    print(f'created {out_zip}')


def cmd_zip_test(args):
    if len(args) != 1:
        sys.exit('usage: release-helper.py zip-test <zip>')
    with zipfile.ZipFile(args[0]) as zf:
        bad = zf.testzip()
    if bad is not None:
        print(f'INTEGRITY FAIL: corrupted entry {bad}', file=sys.stderr)
        sys.exit(1)
    print('zip integrity OK')


def cmd_zip_list(args):
    if len(args) != 1:
        sys.exit('usage: release-helper.py zip-list <zip>')
    with zipfile.ZipFile(args[0]) as zf:
        for info in zf.infolist():
            # ensure_ascii=True keeps the stream encoding-independent so the
            # Node caller can decode it as UTF-8 on any platform console.
            print(json.dumps({'name': info.filename, 'size': info.file_size}, ensure_ascii=True))


def cmd_zip_extract(args):
    if len(args) != 2:
        sys.exit('usage: release-helper.py zip-extract <zip> <outdir>')
    with zipfile.ZipFile(args[0]) as zf:
        zf.extractall(args[1])
    print(f'extracted {args[0]} to {args[1]}')


COMMANDS = {
    'pdf-info': cmd_pdf_info,
    'pdf-text': cmd_pdf_text,
    'pdf-render': cmd_pdf_render,
    'zip-create': cmd_zip_create,
    'zip-test': cmd_zip_test,
    'zip-list': cmd_zip_list,
    'zip-extract': cmd_zip_extract,
}


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in COMMANDS:
        sys.exit('usage: release-helper.py <' + '|'.join(COMMANDS) + '> ...')
    COMMANDS[sys.argv[1]](sys.argv[2:])


if __name__ == '__main__':
    main()
