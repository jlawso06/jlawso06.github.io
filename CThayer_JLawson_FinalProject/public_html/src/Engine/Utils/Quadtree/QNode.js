/* 
 * File: QNode.js
 * 
 * The fundamental nodes that make up the Quadtree
 * 
 */

function QNode(bounds) {
    this.bounds = bounds;   // MinX, MaxX, MinY, MaxY
    this.nodes = [];
    this.objects = [];
};

QNode.prototype.split = function() {
    // Calculate bounds of new child nodes
    var w = this.bounds[1] - this.bounds[0];
    var h = this.bounds[3] - this.bounds[2];
    var midX = this.bounds[0] + w / 2;
    var midY = this.bounds[2] + h / 2;
    
    var topRight = [midX, this.bounds[1], midY, this.bounds[3]];
    var topLeft = [this.bounds[0], midX, midY, this.bounds[3]];
    var bottomLeft = [this.bounds[0], midX, this.bounds[2], midY];
    var bottomRight = [midX, this.bounds[1], this.bounds[2], midY];
    
    // Create new child nodes
    this.nodes[0] = new QNode(topRight);
    this.nodes[1] = new QNode(topLeft);
    this.nodes[2] = new QNode(bottomLeft);
    this.nodes[3] = new QNode(bottomRight);
    
    // Move objects from parent node into child nodes, then clear parent objects array
    var count = this.objects.length;
    for(var i = 0; i < count; i++) {
        var objBounds = this._getObjectBounds(this.objects[i]);
        var quads = this.getQuadrants(objBounds);
        for(var j = 0; j < quads.length; j++) {
            this.nodes[quads[j]].objects.push(this.objects[i]);
        }
    }
    this.objects = [];
};

QNode.prototype.unsplit = function() {
    var endObjs = new Set();
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < this.nodes[i].objects.length; j++) {
            endObjs.add(this.nodes[i].objects[j]);
        }
        this.nodes[i].objects = [];
        this.nodes[i] = null;
    }
    this.nodes = [];
    this.objects = Array.from(endObjs);
};

QNode.prototype.testBounds = function(otherBounds) {
    if( this.bounds[0] < otherBounds[1] &&   // nodeMinX < otherMaxX
        this.bounds[1] > otherBounds[0] &&   // nodeMaxX > otherMinX
        this.bounds[2] < otherBounds[3] &&   // nodeMinY < otherMaxY
        this.bounds[3] > otherBounds[2] ) {  // nodeMaxY > otherMinY
            return true;
    } else {return false;}
};

QNode.prototype.getQuadrants = function(bounds) {
    if (this.nodes.length !== 4)
        return [-1];
    else {
        var quadrants = [];
        for(var i = 0; i < 4; i++) {
            if(this.nodes[i].testBounds(bounds)) {
                quadrants.push(i);
            }
        }
        return quadrants;
    }
};

QNode.prototype.clear = function() {
    for(var i = 0; i < this.nodes.length; i++){
        //tempNodes.push(this.nodes[i]);
        this.nodes[i].clear();
        this.nodes[i] = null;
    }
};

QNode.prototype._getObjectBounds = function(object) {
    var minX = object.getXform().getXPos() - (object.getXform().getWidth() / 2);
    var maxX = object.getXform().getXPos() + (object.getXform().getWidth() / 2);
    var minY = object.getXform().getYPos() - (object.getXform().getHeight() / 2);
    var maxY = object.getXform().getYPos() + (object.getXform().getHeight() / 2);
    var bounds = [minX, maxX, minY, maxY];
    return bounds;
};