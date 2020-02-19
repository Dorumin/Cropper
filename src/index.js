const fs = require('fs');
const path = require('path');
const util = require('util');
const jimp =  require('jimp');
const yargs = require('yargs');

const readdir = util.promisify(fs.readdir);
const makedir = util.promisify(fs.mkdir);

class Cropper {
    constructor() {
        this.args = yargs
            .wrap(yargs.terminalWidth())
            .scriptName('cropper')
            .example('$0 --concurrent 2 --height 50 --width 50', 'Crop a 50 pixel square from the top left of the image')
            .example('$0 --left 10 --top 10 --right 10 --bottom 10', 'Crop out a 10 pixel border from around the image')
            .option('concurrent', {
                alias: 'c',
                type: 'number',
                desc: 'Images to process at any given time',
                default: 8
            })
            .option('input', {
                type: 'string',
                desc: 'The directory to fetch images from, relative or absolute',
                default: 'files',
                coerce: name => {
                    if (path.isAbsolute(name)) return name;
                    return path.join(__dirname, '..', name);
                }
            })
            .option('output', {
                type: 'string',
                desc: 'The directory to spit cropped images to, relative or absolute',
                default: 'output',
                coerce: name => {
                    if (path.isAbsolute(name)) return name;
                    return path.join(__dirname, '..', name);
                }
            })
            .option('left', {
                alias: 'l',
                type: 'number',
                desc: 'Distance from the left of the image to crop',
                default: 0
            })
            .option('top', {
                alias: 't',
                type: 'number',
                desc: 'Distance from the top of the image to crop',
                default: 0
            })
            .option('right', {
                alias: 'r',
                type: 'number',
                desc: 'Distance from the right of the image to crop, can be negative, you may want to use `width`',
                conflicts: 'width'
            })
            .option('bottom', {
                alias: 'b',
                type: 'number',
                desc: 'Distance from the bottom of the image to crop, can be negative, you may want to use `height`',
                conflicts: 'height'
            })
            .option('height', {
                alias: 'h',
                type: 'number',
                desc: 'Cropped image height, starting from the provided `top`'
            })
            .option('width', {
                alias: 'w',
                type: 'number',
                desc: 'Cropped image width, starting from the provided `left`'
            })
            .argv;
    }

    async cropFiles() {
        const files = await readdir(this.args.dir);

        if (files.length) {
            await makedir(this.args.output, { recursive: true });
        }

        await this.parallelLimit(
            files,
            this.cropFile.bind(this),
            this.args.concurrent
        );
    }

    async cropFile(filename) {
        const filePath = path.join(this.args.dir, filename);
        const outPath = path.join(this.args.output, filename);
        const image = await jimp.read(filePath);
        const cropped = await this.performCrop(image);

        cropped.write(outPath);
    }

    async performCrop(image) {
        const imageWidth = image.getWidth();
        const imageHeight = image.getHeight();

        const top = this.args.top;
        const left = this.args.left;
        let width = 0;
        let height = 0;

        if (this.args.right) {
            width = imageWidth - left - this.args.right;
        } else if (this.args.width) {
            width = this.args.width;
        } else {
            width = imageWidth - left;
        }

        if (this.args.bottom) {
            height = imageHeight - top - this.args.bottom;
        } else if (this.args.height) {
            height = this.args.height;
        } else {
            height = imageHeight - top;
        }

        return image.crop(left, top, width, height);
    }

    parallelLimit(items, fn, count) {
        const executing = new Set();

        return items.map(async item => {
            while (executing.size >= count) {
                await Promise.race(executing);
            }

            const promise = fn(item);

            executing.add(promise);

            await promise;

            executing.delete(promise);
        });
    }
}

new Cropper().cropFiles();