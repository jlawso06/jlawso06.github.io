/* File: DyePack.js 
 *
 * Creates and initializes a simple DyePack
 */

/*jslint node: true, vars: true */
/*global gEngine: false, GameObject: false, SpriteRenderable: false */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function DyePack(spriteTexture) {
    this.kRefWidth = 80;
    this.kRefHeight = 130;
    this.kDelta;
    this.kDirection;
    this.vX;
    this.vY;

    this.mDyePack = new SpriteRenderable(spriteTexture);
    this.mDyePack.setColor([1, 1, 1, 0.1]);
    this.mDyePack.getXform().setSize(4, 4);
    this.mDyePack.setElementPixelPositions(510, 595, 23, 153);
    this.changeMovement();
    GameObject.call(this, this.mDyePack);
}
gEngine.Core.inheritPrototype(DyePack, GameObject);

DyePack.prototype.changeMovement = function () {
    this.kDelta = (Math.random() * (50 - 20) + 20) / 60;
    this.kDirection = Math.random() * (6.28319 - 0) + 0;
    this.vX = this.kDelta * Math.cos(this.kDirection);
    this.vY = this.kDelta * Math.sin(this.kDirection);
};

DyePack.prototype.setColor = function (color){
    this.mDyePack.setColor(color);
};

DyePack.prototype.update = function () {
    var xform = this.getXform();
    
    // Check for wall collisions
    if(xform.getXPos() > 98 || xform.getXPos() < -98){
        this.vX *= -1;
    }
    
    if(xform.getYPos() > 73 || xform.getYPos() < -73){
        this.vY *= -1;
    }
    
    xform.incXPosBy(this.vX);
    xform.incYPosBy(this.vY);
};

