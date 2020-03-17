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

function MyGame() {
    this.kMinionSprite = "assets/minion_sprite.png";
    this.kPlatformSprite = "assets/platform.png";
    this.WCBounds = [-100, 100, -75, 75]; // [minX, maxX, minY, maxY]

    // The camera to view the scene
    this.mCamera = null;
    this.mObjectManager = null;
    this.mObjectArray = [];
}
gEngine.Core.inheritPrototype(MyGame, Scene);

MyGame.prototype.initialize = function () {
    // Step A: set up the cameras
    this.mCamera = new Camera(
            vec2.fromValues(0, 0), // position of the camera
            200, // width of camera
            [0, 0, 800, 600]           // viewport (orgX, orgY, width, height)
            );
    this.mCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]);
    // sets the background to gray


    for (var i = 0; i < 20; i++) {
        var dyePack = new DyePack(this.kMinionSprite);
        this.mObjectArray.push(dyePack);
    }
    
    this.mObjectManager = new ObjectManager(this.mObjectArray, this.kMinionSprite);
};


MyGame.prototype.loadScene = function () {
    gEngine.Textures.loadTexture(this.kMinionSprite);
    gEngine.Textures.loadTexture(this.kPlatformSprite);
};

MyGame.prototype.unloadScene = function () {
    gEngine.Textures.unloadTexture(this.kMinionSprite);
    gEngine.Textures.unloadTexture(this.kPlatformSprite);
    
    var nextLevel = new Demo2();  // next level to be loaded
    gEngine.Core.startScene(nextLevel);
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
MyGame.prototype.draw = function () {
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1.0]); // clear to light gray
    this.mCamera.setupViewProjection();
    
    this.mObjectManager.draw(this.mCamera);
};

// The Update function, updates the application state. Make sure to _NOT_ draw
// anything from this function!
MyGame.prototype.update = function () {

    this.mObjectManager.update();
    gUpdateObjects(this.mObjectArray.length, this.mObjectManager.quadMode);
    
    // Transition to next level if N is pressed
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.N)) {
        gEngine.GameLoop.stop();
    }
};