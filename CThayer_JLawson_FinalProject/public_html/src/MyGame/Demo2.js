/*
 * File: MyGame.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global gEngine, Scene, GameObjectset, TextureObject, Camera, vec2,
 FontRenderable, SpriteRenderable, LineRenderable,
 GameObject */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function Demo2() {
    this.kMinionSprite = "assets/minion_sprite.png";
    this.kPlatformSprite = "assets/platform.png";
    //this.kBoundTexture = "assets/boundingBox.png";
    this.WCBounds = [-100, 100, -75, 75]; // [minX, maxX, minY, maxY]

    // The camera to view the scene
    this.mCamera = null;
    this.mObjectArray = [];
    this.mQuadtree = null;
    
    this.kDelta = 0.25;
    this.mCursor = null;
    //this.mCursor = new TextureRenderable(this.kBoundTexture);
    
    this.objsNearby = [];
    this.originalColors = [];
    
    this.borderLines = [];
    this.borderLinesActive = false;
}
gEngine.Core.inheritPrototype(Demo2, Scene);


Demo2.prototype.loadScene = function () {
    gEngine.Textures.loadTexture(this.kMinionSprite);
    gEngine.Textures.loadTexture(this.kPlatformSprite);
};

Demo2.prototype.unloadScene = function () {
    gEngine.Textures.unloadTexture(this.kMinionSprite);
    gEngine.Textures.unloadTexture(this.kPlatformSprite);
    
    var nextLevel = new MyGame();  // next level to be loaded
    gEngine.Core.startScene(nextLevel);
};

Demo2.prototype.initialize = function () {
    // Step A: set up the cameras
    this.mCamera = new Camera(
            vec2.fromValues(0, 0), // position of the camera
            200, // width of camera
            [0, 0, 800, 600]           // viewport (orgX, orgY, width, height)
            );
    this.mCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]);
    // sets the background to gray


    // Setup test objects
    for (var i = 0; i < 9; i++) {
        var obj = new SpriteRenderable(this.kMinionSprite);
        obj.setElementPixelPositions(510, 595, 23, 153);
        obj.getXform().setSize(4, 4);
        this.mObjectArray.push(obj);
    }
    
    this.mObjectArray[0].getXform().setPosition(0, 0);
    this.mObjectArray[0].setColor([1, 1, 1, 1]);
    
    this.mObjectArray[1].getXform().setPosition(50, 37.5);
    this.mObjectArray[1].setColor([1, 0, 0, 1]);
    
    this.mObjectArray[2].getXform().setPosition(-50, 37.5);
    this.mObjectArray[2].setColor([0, 1, 0, 1]);
    
    this.mObjectArray[3].getXform().setPosition(-50, -37.5);
    this.mObjectArray[3].setColor([0, 0, 1, 1]);
    
    this.mObjectArray[4].getXform().setPosition(50, -37.5);
    this.mObjectArray[4].setColor([1, 0, 1, 1]);
    
    this.mObjectArray[5].getXform().setPosition(0, 37.5);
    this.mObjectArray[5].setColor([1, 1, 0, 1]);
    
    this.mObjectArray[6].getXform().setPosition(-50, 0);
    this.mObjectArray[6].setColor([0, 1, 1, 1]);
    
    this.mObjectArray[7].getXform().setPosition(0, -37.5);
    this.mObjectArray[7].setColor([0.5, 0.5, 1, 1]);
    
    this.mObjectArray[8].getXform().setPosition(50, 0);
    this.mObjectArray[8].setColor([1, 0.5, 0.5, 1]);

    // Initialize quadtree
    this.mQuadtree = new Quadtree(this.WCBounds, 5, 5);
    for (var i = 0; i < this.mObjectArray.length; i++) {
        this.mQuadtree.insert(this.mObjectArray[i]);
    }
    
    // Initialize cursor object
    this.mCursor = new SpriteRenderable(this.kMinionSprite);
    this.mCursor.setElementPixelPositions(510, 595, 23, 153);
    this.mCursor.getXform().setSize(8, 8);
    this.mCursor.getXform().setPosition(0,0);
    this.mCursor.setColor([0.2, 0.4, 0.8, 0.5]);
    
    // Set up spacebar highlight nearby objects functionality
    // Assign callback function for spacebar
    gEngine.Input.setKeyReleaseCallback(gEngine.Input.keys.Space, this._SpacebarCallback, this);
    
};


// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
Demo2.prototype.draw = function () {
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray
    this.mCamera.setupViewProjection();
    
    // draw objects
    for (var i = 0; i < this.mObjectArray.length; i++) {
        this.mObjectArray[i].draw(this.mCamera);
    }
    
    // draw cursor
    this.mCursor.draw(this.mCamera);
    
    // If borderlines are activated, draw them
    if(this.borderLinesActive === true) {
        for (var i = 0; i < this.borderLines.length; i++) {
            this.borderLines[i].draw(this.mCamera);
        };
    }

};

// The Update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
Demo2.prototype.update = function () {
    
    // Handle Cursor Movement
    var pos = this.mCursor.getXform().getPosition();
    var halfH = this.mCursor.getXform().getHeight() / 2;
    var halfW = this.mCursor.getXform().getWidth() / 2;
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.W)) {
        if (pos[1] + halfH + this.kDelta < this.WCBounds[3]) {
            var newY = pos[1] + this.kDelta;
        } else {
            var newY = this.WCBounds[2] + halfH + this.kDelta;
        }
        this.mCursor.getXform().setPosition(pos[0], newY);
    }
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.S)) {
        if (pos[1] - halfH - this.kDelta > this.WCBounds[2]) {
            var newY = pos[1] - this.kDelta;
        } else {
            var newY = this.WCBounds[3] - halfH - this.kDelta;
        }
        this.mCursor.getXform().setPosition(pos[0], newY);
    }
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.A)) {
        if (pos[0] - halfW - this.kDelta > this.WCBounds[0]) {
            var newX = pos[0] - this.kDelta;
        } else {
            var newX = this.WCBounds[0] - halfW;
        }
        this.mCursor.getXform().setPosition(newX, pos[1]);
    }
    if (gEngine.Input.isKeyPressed(gEngine.Input.keys.D)) {
        if (pos[0] + halfW + this.kDelta < this.WCBounds[1]) {
            var newX = pos[0] + this.kDelta;
        } else {
            var newX = this.WCBounds[0] + halfW;
        }
        this.mCursor.getXform().setPosition(newX, pos[1]);
    }
    
    
    // Add new object at cursor if E is clicked
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.E)) {
        var obj = new SpriteRenderable(this.kMinionSprite);
        obj.setElementPixelPositions(510, 595, 23, 153);
        obj.getXform().setSize(4, 4);
        var currentPos = this.mCursor.getXform().getPosition();
        obj.getXform().setPosition(currentPos[0], currentPos[1]);
        obj.setColor([0, 0, 0, 1]);
        this.mObjectArray.push(obj);
        this.mQuadtree.insert(obj);
        
        if (this.borderLinesActive) {
            this.borderLines = this.mQuadtree.getQuadLines();
        }
    }
    

    // On spacebar click:
    //      - Get nearby objects from Quadtree 
    //      - Set color of objects
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.Space)) {
        var objs = this.mQuadtree.getObjectsNear(this.mCursor);
        this.objsNearby = Array.from(objs);
        for (var i = 0; i < this.objsNearby.length; i++) {
            this.originalColors[i] = this.objsNearby[i].getColor();
            this.objsNearby[i].setColor([1, 1, 1, 0.1]);
        }
    }
    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.L)) {
        this.borderLinesActive = !this.borderLinesActive;
        if (this.borderLinesActive) {
            this.borderLines = this.mQuadtree.getQuadLines();
        }
    }
    
    // Transition to next level if N is pressed
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.N)) {
        gEngine.GameLoop.stop();
    }
    
};

Demo2.prototype.updateQuadtree = function () {
    this.mQuadtree.clear();
    
    for (var i = 0; i < this.mObjectArray.length; i++) {
        this.mQuadtree.insert(this.mObjectArray[i]);
    }
    
};

Demo2.prototype._SpacebarCallback = function() {
    if (this.objsNearby.length === this.originalColors.length) {
        for (var i = 0; i < this.objsNearby.length; i++) {
            this.objsNearby[i].setColor(this.originalColors[i]);
        }
    }
    this.objsNearby = [];
    this.originalColors = [];
};