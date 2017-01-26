build:src/manifest.json
	rm -f medium-volcano.zip
	cd src/; zip -r ../medium-volcano.zip .

PHONY: build
