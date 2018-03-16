
module.exports =  function (graph) {
    /** variable defs **/
    var Range_dragger={};
    Range_dragger.nodeId = 10002;
    Range_dragger.parent = undefined;
    Range_dragger.x = 0;
    Range_dragger.y = 0;
    Range_dragger.rootElement = undefined;
    Range_dragger.rootNodeLayer = undefined;
    Range_dragger.pathLayer=undefined;
    Range_dragger.mouseEnteredVar = false;
    Range_dragger.mouseButtonPressed = false;
    Range_dragger.nodeElement = undefined;
    Range_dragger.draggerObject= undefined;

    Range_dragger.pathElement = undefined;
    Range_dragger.typus = "Range_dragger";

    Range_dragger.type = function () {
            return Range_dragger.typus;
    };

    // TODO: We need the endPoint of the Link here!
    Range_dragger.parentNode = function () {
            return Range_dragger.parent;
    };

    Range_dragger.hide_dragger=function(val){
        Range_dragger.pathElement.classed("hidden",val);
        Range_dragger.nodeElement.classed("hidden",val);
        Range_dragger.draggerObject.classed("hidden",val);
    };

    Range_dragger.reDrawEverthing=function(){
        Range_dragger.setParentProperty(Range_dragger.parent);
    };
    Range_dragger.updateRange=function(newRange){
        Range_dragger.parent.range(newRange);
        // update the position of the new range
        var rX=newRange.x;
        var rY=newRange.y;

        var dX= Range_dragger.parent.domain().x;
        var dY= Range_dragger.parent.domain() .y;


        // center
        var cX=0.49 * (dX+rX);
        var cY=0.49 * (dY+rY);
        // put position there;
        Range_dragger.parent.labelObject().x   = cX;
        Range_dragger.parent.labelObject().px  = cX;
        Range_dragger.parent.labelObject().y   = cY;
        Range_dragger.parent.labelObject().py  = cY;


    };

    Range_dragger.setParentProperty = function (parentProperty) {
        Range_dragger.parent = parentProperty;
        var iP=parentProperty.labelObject().linkRangeIntersection;

        Range_dragger.x = iP.x;
        Range_dragger.y = iP.y;

        Range_dragger.updateElement();
    };

    Range_dragger.hideDragger=function(val){
        Range_dragger.pathElement.classed("hidden",val);
        Range_dragger.nodeElement.classed("hidden",val);
        Range_dragger.draggerObject.classed("hidden",val);


    };
    /** BASE HANDLING FUNCTIONS ------------------------------------------------- **/
    Range_dragger.id = function (index) {
        if (!arguments.length) {
            return Range_dragger.nodeId;
        }
        Range_dragger.nodeId = index;
    };

    Range_dragger.svgPathLayer=function(layer){
        Range_dragger.pathLayer= layer.append('g');
    };

    Range_dragger.svgRoot = function (root) {
        if (!arguments.length)
            return Range_dragger.rootElement;
        Range_dragger.rootElement = root;
        Range_dragger.rootNodeLayer = Range_dragger.rootElement.append('g');
        Range_dragger.addMouseEvents();
    };

    /** DRAWING FUNCTIONS ------------------------------------------------- **/
    Range_dragger.drawNode = function () {
            Range_dragger.pathElement = Range_dragger.pathLayer.append('line')
                .classed("classNodeDragPath", true);
            Range_dragger.pathElement.attr("x1", 0)
                .attr("y1", 0)
                .attr("x2", 0)
                .attr("y2", 0);

            // var lineData = [
            //     {"x": 0, "y": 0},
            //     {"x": 0, "y": 40},
            //     {"x": -40, "y": 0},
            //     {"x": 0, "y": -40},
            //     {"x": 0, "y": 0}
            // ];

        var lineData = [
            {"x": -40, "y": 0}, // start
            {"x": -20, "y": -10},
            {"x": 20, "y": -50},
            {"x": -10, "y": 0}, // center
            {"x": 20, "y": 50},
            {"x": -20, "y": 10},
            {"x": -40, "y": 0}
        ];



        var lineFunction = d3.svg.line()
                .x(function (d) {
                    return d.x;
                })
                .y(function (d) {
                    return d.y;
                })
                .interpolate("basis-closed");
        var pathData="M 61,40 C 41,15 41,-15 61,-40 L 1,0 Z";

        Range_dragger.nodeElement =Range_dragger.rootNodeLayer.append('path').attr("d", pathData);
        Range_dragger.nodeElement.classed("classDraggerNode",true);
        Range_dragger.draggerObject=Range_dragger.rootNodeLayer.append("circle");
        Range_dragger.draggerObject.attr("r", 40)
            .attr("cx", 0)
            .attr("cy", 0)
            .classed("superHiddenElement",true)
            .append("title").text("Add Touch Object Property");



    };

    Range_dragger.updateElementViaDomainDragger=function(x,y){

        var range_x=x;
        var range_y=y;

        var dex=Range_dragger.parent.range().x;
        var dey=Range_dragger.parent.range().y;

        var dir_X= x-dex;
        var dir_Y= y-dey;

        var len=Math.sqrt(dir_X*dir_X+dir_Y*dir_Y);

        var nX=dir_X/len;
        var nY=dir_Y/len;


        var ep_range_x=dex+nX*Range_dragger.parent.range().actualRadius();
        var ep_range_y=dey+nY*Range_dragger.parent.range().actualRadius();

        var angle = Math.atan2(ep_range_y-range_y  , ep_range_x-range_x ) * 180 / Math.PI +180;
        Range_dragger.nodeElement.attr("transform","translate(" + ep_range_x  + "," + ep_range_y  + ")"+"rotate(" + angle + ")");
    };


    Range_dragger.updateElement = function () {
        if (Range_dragger.mouseButtonPressed===true || Range_dragger.parent===undefined) return;


            var range_x = Range_dragger.parent.range().x;
            var range_y = Range_dragger.parent.range().y;

            var ep_range_x = Range_dragger.parent.labelObject().linkRangeIntersection.x;
            var ep_range_y = Range_dragger.parent.labelObject().linkRangeIntersection.y;

            var angle = Math.atan2(ep_range_y - range_y, ep_range_x - range_x) * 180 / Math.PI;
            Range_dragger.nodeElement.attr("transform", "translate(" + ep_range_x + "," + ep_range_y + ")" + "rotate(" + angle + ")");


    };

        /** MOUSE HANDLING FUNCTIONS ------------------------------------------------- **/

        Range_dragger.addMouseEvents = function () {
            var rootLayer=Range_dragger.rootNodeLayer.selectAll("*");
            rootLayer.on("mouseover", Range_dragger.onMouseOver)
                .on("mouseout", Range_dragger.onMouseOut)
                 .on("click", function(){
                 })
                 .on("dblclick", function(){
                 })
                .on("mousedown", Range_dragger.mouseDown)
                .on("mouseup", Range_dragger.mouseUp);
        };

        Range_dragger.mouseDown = function () {
            Range_dragger.nodeElement.style("cursor", "move");
            Range_dragger.nodeElement.classed("classDraggerNodeHovered", true);
            Range_dragger.mouseButtonPressed = true;
        };

        Range_dragger.mouseUp = function () {
            Range_dragger.nodeElement.style("cursor", "auto");
            Range_dragger.nodeElement.classed("classDraggerNodeHovered", false);
            Range_dragger.mouseButtonPressed = false;
        };


        Range_dragger.mouseEntered = function (p) {
            if (!arguments.length) return Range_dragger.mouseEnteredVar;
            Range_dragger.mouseEnteredVar = p;
            return Range_dragger;
        };

        Range_dragger.selectedViaTouch=function(val){
             Range_dragger.nodeElement.classed("classDraggerNode", !val);
            Range_dragger.nodeElement.classed("classDraggerNodeHovered", val);

        };

        Range_dragger.onMouseOver = function () {
            if (Range_dragger.mouseEntered()) {
                return;
            }
            Range_dragger.nodeElement.classed("classDraggerNode", false);
            Range_dragger.nodeElement.classed("classDraggerNodeHovered", true);
            var selectedNode = Range_dragger.rootElement.node(),
                nodeContainer = selectedNode.parentNode;
            nodeContainer.appendChild(selectedNode);

            Range_dragger.mouseEntered(true);

        };
        Range_dragger.onMouseOut = function () {
            if (Range_dragger.mouseButtonPressed === true)
                return;
            Range_dragger.nodeElement.classed("classDraggerNodeHovered", false);
            Range_dragger.nodeElement.classed("classDraggerNode", true);
            Range_dragger.mouseEntered(false);
        };

        Range_dragger.setPosition=function(x,y){
            var range_x=Range_dragger.parent.domain().x;
            var range_y=Range_dragger.parent.domain().y;

            // var position of the rangeEndPoint
            var ep_range_x=x;
            var ep_range_y=y;

            var angle = Math.atan2(range_y-ep_range_y  , range_x-ep_range_x ) * 180 / Math.PI;
            Range_dragger.nodeElement.attr("transform","translate(" + ep_range_x  + "," + ep_range_y  + ")"+"rotate(" + angle + ")");
            // if (Range_dragger.pathElement) {
            Range_dragger.x=x;
            Range_dragger.y=y;

        };

        Range_dragger.setAdditionalClassForClass_dragger = function (name, val) {

        };
        return Range_dragger;
};

