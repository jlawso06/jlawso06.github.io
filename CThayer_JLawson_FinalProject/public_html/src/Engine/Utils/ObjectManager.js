/* 
 * file: ObjectManager.js
 * 
 * Implements bruteforce collision checking and Quadtree Collision checking with
 * the ability to switch between them. Also allows for two visualization options
 */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function ObjectManager(objectArray, texture) {
    this.objectArray = objectArray;
    this.texture = texture;
    this.quadMode = false;
    this.quadTree = new Quadtree([-100, 100, -75, 75], 4, 6);
    this.visualization = false;
    this.borderLinesActive = false;
    this.borderLines = null;
    
    this.numCollisionTests = 0;
};

ObjectManager.prototype.addObject = function (object) {
    this.objectArray.push(object);
};

ObjectManager.prototype.removeObject = function (object) {
    var i = this.objectArray.indexOf(object);
    this.objectArray.splice(i, 1);
};

ObjectManager.prototype.draw = function (camera) {
    for (var i = 0; i < this.objectArray.length; i++) {
        this.objectArray[i].draw(camera);
    }
    
    if (this.borderLinesActive && this.quadMode) {
        for (var j = 0; j < this.borderLines.length; j++) {
            this.borderLines[j].draw(camera);
        }
    }
};

ObjectManager.prototype.updateTree = function () {
    // Wipe the Tree
    this.quadTree.clear();

    // Insert Tree Stuff
    for (var i = 0; i < this.objectArray.length; i++) {
        this.quadTree.insert(this.objectArray[i]);
    }
};

ObjectManager.prototype.collisionCheck = function () {
    for (var i = 0; i < this.objectArray.length; i++) {
        for (var j = i + 1; j < this.objectArray.length; j++) {
            var h = [];
            if (this.objectArray[i].pixelTouches(this.objectArray[j], h)) {
                this.objectArray[i].setColor([1, 0, 0, 1]);
                this.objectArray[j].setColor([1, 0, 0, 1]);
            }
            this.numCollisionTests++;
        }
    }
};

ObjectManager.prototype.quadCollisionCheck = function () {
    for (var i = 0; i < this.objectArray.length; i++) {
        var collisionArray = Array.from(this.quadTree.getObjectsNear(this.objectArray[i]));
        for (var j = 0; j < collisionArray.length; j++) {
            var h = [];
            if (this.objectArray[i] !== collisionArray[j] && this.objectArray[i].pixelTouches(collisionArray[j], h)) {
                collisionArray[j].setColor([1, 0, 0, 1]);
            }
            this.numCollisionTests++;
        }
    }
};

ObjectManager.prototype.update = function () {

    // Create more DyePacks
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Space)) {
        for (var i = 0; i < 10; i++) {
            var dyePack = new DyePack(this.texture);
            this.objectArray.push(dyePack);
        }
    }

    // Change to QuadTree Mode
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Q)) {
        this.quadMode = !this.quadMode;
    }

    // Turn On QuadTree Visualization
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Z)) {
        this.visualization = !this.visualization;
    }
    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.L)) {
        this.borderLinesActive = !this.borderLinesActive;
    }

    // Reset color on all objects and update their positions
    for (var i = 0; i < this.objectArray.length; i++) {
        this.objectArray[i].setColor([0, 0, 0, 0]);
        this.objectArray[i].update();
    }

    // If we are NOT in quadMode run regular brute force collision
    // If we ARE in quadMode: update tree, run quadtree collision, and run visualization if active
    if (!this.quadMode)
        this.collisionCheck();
    else {
        this.updateTree();
        this.quadCollisionCheck();
        if (this.visualization) {
            this.runVisualization();
        }
    }
    
    // Output collision test quantities
    gUpdateCollisionCounter(this.numCollisionTests);
    this.numCollisionTests = 0;
};

ObjectManager.prototype.runVisualization = function () {
    var quadrant = Array.from(this.quadTree.getObjectsNear(this.objectArray[0]));
    for (var i = 0; i < quadrant.length; i++) {
        quadrant[i].setColor([0, 1, 0, 1]);
    }
    this.objectArray[0].setColor([0, 0, 1, 1]);

    if (this.borderLinesActive) {
        this.borderLines = this.quadTree.getQuadLines();
    }
};