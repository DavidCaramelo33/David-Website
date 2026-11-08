#!/bin/sh
# Builds the public website into the "dist" folder (used by Cloudflare Pages and Netlify).
# Only website files are published: setup notes, database scripts and helpers stay private.
set -e
rm -rf dist && mkdir -p dist
cp *.html *.js *.css robots.txt sitemap.xml _headers dist/
cp -r images dist/
