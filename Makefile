# -*- Mode: Makefile -*-
#
# Makefile for Toggle Website Colors
#

FILES = manifest.json \
        background.js \
        options.html \
        options.js \
        nocolors.css \
        $(wildcard _locales/*/message.json) \
        $(wildcard icons/*.svg)

togglewebsitecolors-trunk.xpi: $(FILES)
	@zip -9 - $^ > $@

clean:
	rm -f togglewebsitecolors-trunk.xpi
