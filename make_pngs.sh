#!/bin/sh

ico() {
	inkscape -z -e data/icon-$1.png -w $1 -h $1 data/icon.svg
}

ico 16
ico 32
ico 64
ico 128
