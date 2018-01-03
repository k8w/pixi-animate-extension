"use strict";

const fs = require('fs');
const path = require('path');
const Spritesheet = require('./Spritesheet');
const ipc = require('electron').ipcRenderer;

async function waitImgLoad(img) {
    return new Promise(rs => {
        img.onload = () => {
            rs();
        }
    })
}

ipc.on('settings', async (ev, data) => {

    const images = [];
    const results = {};
    const response = JSON.parse(data);
    const assets = response.assets;
    const size = response.size;
    const debug = response.debug;
    const scale = response.scale;
    
    for(let id in assets) {

        let src = assets[id];

        // Ignore non png files
        if (!/\.(png)$/i.test(src)) {
            results[id] = src;
            continue;
        }

        const img = new Image();
        const pad = Spritesheet.PADDING * 2;
        img.src = "data:image/png;base64," + fs.readFileSync(path.resolve(response.dataFilePath, src), 'base64');
        await waitImgLoad(img);
        const dWidth = Math.ceil(img.width * scale);
        const dHeight = Math.ceil(img.height * scale);

        // Ignore oversized images
        if (dWidth + pad > size || dHeight + pad > size) {
            results[id] = src;
            continue;
        }

        const canvas = document.createElement('canvas');
        canvas.width = dWidth + pad;
        canvas.height = dHeight + pad;
        canvas.id = id;
        canvas.dataset.src = src;
        canvas.dataset.width = img.width;
        canvas.dataset.height = img.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(
            img, // source image
            0, // source x
            0, // source y
            img.width, // source width
            img.height, // source height
            Spritesheet.PADDING, // dest x
            Spritesheet.PADDING, // dest y
            dWidth, // dest x
            dHeight // dest y
        );
        images.push(canvas);
    }

    images.reverse();

    let current = 0;
    while(images.length) {

        let output = response.output + (++current);
        let atlas = new Spritesheet(size, scale, debug, response.dataFilePath);
        atlas.addImages(images);
        atlas.save(output);
        atlas.destroy();
        let json = output + '.json';
        results[path.parse(json).name] = json;
    }
    
    ipc.sendSync('done', JSON.stringify(results));
});