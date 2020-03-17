/* File: Head.js 
 *
 * Creates and initializes a simple Head object
 */

/*jslint node: true, vars: true */
/*global gEngine: false, GameObject: false, SpriteRenderable: false, vec2: false */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function Head(spriteTexture, initPos) {
    this.kDelta;
    this.kDirection;
    this.vX;
    this.vY;
    this.changeMovement();
    this.mHead = new SpriteRenderable(spriteTexture);
    this.mHead.setColor([1, 1, 1, 0]);
    this.mHead.getXform().setPosition(initPos[0], initPos[1]);
    this.mHead.getXform().setSize(7.5, 7.5);
    
    GameObject.call(this, this.mHead);
}
gEngine.Core.inheritPrototype(Head, GameObject);

Head.prototype.changeMovement = function () {
    this.kDelta = (Math.random() * (10 - 5) + 5) / 60;
    this.kDirection = Math.random() * (6.28319 - 0) + 0;
    this.vX = this.kDelta * Math.cos(this.kDirection);
    this.vY = this.kDelta * Math.sin(this.kDirection);
};

Head.prototype.returnXform = function () {
    return this.mHead.getXform();
};

// Collide function
Head.prototype.collide = function () {
    this.mHead.getXform().incXPosBy(5);
};

// Change direction
Head.prototype.reflect = function (direction) {
    console.log("before reflect: " + this.vX + ", " + this.vY);
    
    // if true, switch x
    // 0 is left
    // 1 is right
    // 2 is top
    // 3 is bottom
    if(direction === 0){
        if(this.vX < 0){
            this.vX *= -1;
        };
    } else if(direction === 1) {
        if(this.vX > 0){
            this.vX *= -1;
        }
    } else if(direction === 2) {
        if(this.vY > 0){
            this.vY *= -1;
        }
    } else if(direction === 3) {
        if(this.vY < 0){
            this.vY *= -1;
        }
    }
    
    console.log("after reflect: " + this.vX + ", " + this.vY);
};

Head.prototype.update = function () {
    
    if (gEngine.Input.isKeyClicked(gEngine.Input.keys.J)) {
        this.collide();
    }
    
    this.mHead.getXform().incXPosBy(this.vX);
    this.mHead.getXform().incYPosBy(this.vY);
};