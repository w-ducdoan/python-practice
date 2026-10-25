"""MkDocs hook: find every ```exercise block and write them all to catalog.json.

The home page reads catalog.json to show progress per module and to build
the review queue. You never edit catalog.json by hand; it is rebuilt each time
the site is built.
"""

import json
import os
import re

EXERCISE_BLOCK = re.compile(r"^```exercise\n(.*?)^```", re.MULTILINE | re.DOTALL)

catalog = []


def on_pre_build(config):
    catalog.clear()


def on_page_markdown(markdown, page, config, files):
    folder = page.file.src_uri.split("/")[0]
    for block in EXERCISE_BLOCK.findall(markdown):
        header = block.split("\n--- ")[0]
        fields = {}
        for line in header.splitlines():
            if ":" in line:
                key, value = line.split(":", 1)
                fields[key.strip()] = value.strip()
        if fields.get("kind") == "example":
            continue  # ungraded "try it" blocks are not tracked
        catalog.append({
            "id": fields["id"],
            "title": fields.get("title", fields["id"]),
            "checkpoint": fields.get("checkpoint", "no") == "yes",
            "module": folder,
            "page": page.url,
            "page_title": page.title,
        })
    return markdown


def on_post_build(config):
    ids = [item["id"] for item in catalog]
    duplicates = {i for i in ids if ids.count(i) > 1}
    if duplicates:
        raise ValueError(f"Duplicate exercise ids: {sorted(duplicates)}")
    path = os.path.join(config["site_dir"], "catalog.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=2)
