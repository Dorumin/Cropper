Batch image cropping tool built using Node.js

To run, use
```bash
npm start -- [args]
```
for help
```bash
npm start -- --help
```

Current help text:
```bash
Options:
  --help        Show help                                                                            [boolean]
  --version     Show version number                                                                  [boolean]
  --concurrent  Images to process at any given time                                      [number] [default: 8]
  --input       The directory to fetch images from, relative or absolute           [string] [default: "files"]
  --output      The directory to spit cropped images to, relative or absolute     [string] [default: "output"]
  --left, -l    Pixels from the left                                                     [number] [default: 0]
  --top, -t     Pixels from the top                                                      [number] [default: 0]
  --right, -r   Pixels from the right, conflicts with `width`                                         [number]
  --bottom, -b  Pixels from the bottom, conflicts with `height`                                       [number]
  --height, -h  Cropped image height, starting from the provided `top`                                [number]
  --width, -w   Cropped image width, starting from the provided `left`                                [number]

Examples:
  cropper --concurrent 2 --height 50 --width 50      Crop a 50 pixel square from the top left of the image
  cropper --left 10 --top 10 --right 10 --bottom 10  Crop out a 10 pixel border from around the image
```