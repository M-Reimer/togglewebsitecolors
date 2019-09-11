# -*- Mode: Makefile -*-
#
# Makefile for Toggle Website Colors
#

FILES = manifest.json \
        background.js \
        options.html \
        options.js \
        resetshortcuts.js \
        nocolors.css \
        $(wildcard _locales/*/messages.json) \
        $(wildcard icons/*.svg)

ADDON = togglewebsitecolors

VERSION = $(shell sed -n  's/^  "version": "\([^"]\+\).*/\1/p' manifest.json)

ANDROIDDEVICE = $(shell adb devices | cut -s -d$$'\t' -f1 | head -n1)

trunk: $(ADDON)-trunk.xpi

release: $(ADDON)-$(VERSION).xpi

%.xpi: $(FILES)
	@zip -9 - $^ > $@

clean:
	rm -f $(ADDON)-*.xpi

# Starts local debug session
run:
	web-ext run --pref=devtools.browserconsole.contentMessages=true --bc

# Starts debug session on connected Android device
arun:
	@if [ -z "$(ANDROIDDEVICE)" ]; then \
	  echo "No android devices found!"; \
	else \
	  web-ext run --target=firefox-android --android-device="$(ANDROIDDEVICE)"; \
	fi
