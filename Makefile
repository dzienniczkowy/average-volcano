build:src/manifest.json
	rm -f medium-volcano.zip
	zip -jr medium-volcano.zip src/

PHONY: build
