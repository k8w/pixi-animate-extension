"use strict";

// Node modules
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const Library = require('./Library');
const Renderer = require('./Renderer');
const DataUtils = require('./utils/DataUtils');
const SpritesheetBuilder = require('./SpritesheetBuilder');

/**
 * The application to publish the JSON data to JS output buffer
 * @class Publisher
 */
let Publisher = function(dataFile, compress, debug, assetsPath)
{
    // Change the current directory
    // process.chdir(path.dirname(dataFile));

    /**
     * The data file to delete
     * @property {string} _dataFile
     */
    this._dataFile = dataFile;

    /** 
     * The data published from Flash
     * @property {Object} _data
     * @private
     */
    this._data = JSON.parse(fs.readFileSync(dataFile, "utf8"));

    // override the compress
    if (compress)
    {
        this._data._meta.compressJS = true;
    }

    /**
     * The library of assets to publish
     * @property {Library} library
     */
    this.library = new Library(this._data);

    /**
     * The composer to render output
     * @property {Renderer} composer
     */
    this.renderer = new Renderer(this.library);

    /**
     * If we are running in debug mode
     * @property {Boolean} debug
     */
    this.debug = debug == undefined ? false : debug;

    /**
     * The path to the assets
     * @property {String} assetsPath
     */
    this.assetsPath = assetsPath;
};

// Reference to the prototype
let p = Publisher.prototype;

/**
 * Export the assets
 * @method exportAssets
 */
p.exportAssets = function(done)
{
    let assetsToLoad = this.library.stage.assets;

    // Get the images to export
    this.library.bitmaps.forEach(function(bitmap)
    {
        assetsToLoad[bitmap.src] = bitmap.src;
    });

    // Get the sounds to export
    this.library.sounds.forEach(function(sound)
    {
        assetsToLoad[sound.src] = sound.src;
    });

    const shapes = this.library.shapes;
    const meta = this._data._meta;

    // No shapes, nothing to do here
    if (meta.imagesPath == null) {
        return done();
    }

    if (shapes.length)
    {
        // The output map of graphics
        let buffer = "";
        let filename;

        if (!meta.compactShapes)
        {
            filename = meta.stageName + ".shapes.json";
            let results = [];
            shapes.forEach(function(shape)
            {
                results.push(shape.draw);
            });
            buffer = DataUtils.readableShapes(results);
        }
        else
        {
            filename = meta.stageName + ".shapes.txt";
            shapes.forEach(function(shape, i)
            {
                buffer += shape.toString();

                // Separate each shape with a new line
                if (i < shapes.length - 1)
                    buffer += "\n";
            });
        }

        // Create the directory if it doesn't exist
        const baseUrl = path.resolve(path.dirname(this._dataFile), meta.imagesPath);
        mkdirp.sync(baseUrl);

        // Save the file data
        fs.writeFileSync(path.join(baseUrl, filename), buffer);

        // Add to the assets
        assetsToLoad[meta.stageName] = meta.imagesPath + filename;
    }

    if (meta.spritesheets && this.library.bitmaps.length)
    {
        // Create the builder
        new SpritesheetBuilder({
                assets: assetsToLoad,
                output: meta.imagesPath + meta.stageName + '_atlas_',
                size: meta.spritesheetSize,
                scale: meta.spritesheetScale || 1,
                debug: this.debug,
                dataFilePath: path.dirname(this._dataFile)
            },
            this.assetsPath,
            (assets) => {
                this.library.stage.assets = assets;
                done();
            }
        );
    }
    else
    {
        done();
    }
};

/**
 * Clean the stage
 * @method destroy
 */
p.destroy = function()
{
    if (!this.debug)
    {
        fs.unlinkSync(this._dataFile);
    }
    this._data = null;

    this.library.destroy();
    this.library = null;

    this.renderer.destroy();
    this.renderer = null;
};

/**
 * The main entry point for the publisher
 * @method run
 */
p.run = function(done)
{
    try {
        this.exportAssets(() => {
            try {
                const buffer = this.publish();
                this.destroy();
                if (this.debug) {
                    buffer.split('\n').forEach((line) => {
                        console.log(line);
                    });
                }
                done();
            }
            catch(e) {
                done(e);
            }
        });
    }
    catch(e) {
        done(e);
    }
};

/**
 * Save the output stream
 * @method publish
 */
p.publish = function()
{
    const meta = this._data._meta;
    const env = require('babel-preset-es2015');
    // Get the javascript buffer
    let buffer = this.renderer.render();
    buffer = require('babel-core').transform(buffer, {
        minified: meta.compressJS,
        presets: [env]
    }).code;

    // Save the output file
    let outputFile = path.resolve(path.dirname(this._dataFile), meta.outputFile);
    fs.writeFileSync(outputFile, buffer);

    return buffer;
};

module.exports = Publisher;