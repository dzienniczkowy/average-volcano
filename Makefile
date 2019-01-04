build:src/manifest.json
	rm -f average-volcano.zip
	cd src/; zip -r ../average-volcano.zip .

PHONY: build
