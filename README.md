# Listal Image Batch Downloader

Simple bot to download pictures from [Listal](http://www.listal.com)

## Setup

You will need to have [NodeJS](https://nodejs.org) installed to use or develop this.

To install as a command line tool, install it globally using NPM.

```
npm install listal -g
```

To use this directly from source:

```
node listal.js <arguments>
```

## Usage

(The usage guide assumes you have installed it globally)

For example, if you want to download all images in listal from inception just type:

```bash
listal -u http://www.listal.com/movie/inception
```

If you want all the pictures from the director:

```bash
listal -u http://www.listal.com/christopher-nolan
```

Or if you are on the naughty side and want the pictures of diCaprio or Ellen Page try:

```bash
listal -u http://www.listal.com/leonardo-dicaprio
listal -u http://www.listal.com/ellen-page
```

## Options

All pictures are downloaded by default to `target` but you can change this with the `-o` option.

If you want to skip any images you have already downloaded add the `-s` option.

You can specify the pages to download using the `-p` option.

This will download all of Leo's images on page 10:

```bash
listal -u http://www.listal.com/leonardo-dicaprio -p 10
```

This will download all of Leo's images from page 10 to 15:

```bash
listal -u http://www.listal.com/leonardo-dicaprio -p 10-15
```

You can set the number of concurrent pages to process using option `-c`.
The default is `5`. If you have problems downloading try lowering the value.

## To Do List

* Better handling of the `-u` option, for example accept bad urls
* Better code in some areas.
* Make the base url http://www.listal.com optional?

