# -*- Mode: Makefile -*-
#
# Makefile for Toggle Website Colors
#

FILES = manifest.json \
        background.js \
        options.html \
        options.js \
        nocolors.css \
        $(wildcard _locales/*/messages.json) \
        $(wildcard icons/*.svg)

ADDON = togglewebsitecolors

VERSION = $(shell sed -n  's/^  "version": "\([^"]\+\).*/\1/p' manifest.json)

trunk: $(ADDON)-trunk.xpi

release: $(ADDON)-$(VERSION).xpi

%.xpi: $(FILES)
	@zip -9 - $^ > $@

clean:
	rm -f $(ADDON)-*.xpi

# Starts local debug session
run:
	web-ext run --bc
