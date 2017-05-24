# -*- Mode: Makefile -*-
#
# Makefile for Toggle Website Colors
#

.PHONY: xpi

xpi: clean
	zip -r9 togglewebsitecolors-trunk.xpi manifest.json \
                               _locales \
                               background.js \
                               nocolors.css
clean:
	rm -f togglewebsitecolors-trunk.xpi
