function Point(defaultX, defaultY) {
  'use strict'

  var x=0, y=0;

  if(defaultX) {x=defaultX;}
  if(defaultY) {y=defaultY;}

  this.getX = function() {
    return x;
  }
  this.getY = function() {
    return y;
  }
  this.setX = function(paramX) {
    if(paramX) {x=paramX;}
  }
  this.setY = function(paramY) {
    if(paramY) {y=paramY;}
  }
  this.get = function() {
    return this;
  }
  this.getPoint = function(){
    return {"x":x, "y":y};
  }
  this.setPoint = function(paramX, paramY) {
    if (paramX) {x=paramX;}
    if (paramY) {y=paramY;}
  }
}

function AreaCanvasModule(){
  'use strict'

  //private function
  function _isNullOrUndefined(paramValue){
    return paramValue == undefined || paramValue == null;
  }

  function _getIeVersion(){
    var msIeRegExp = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})"),
        tridentRegExp  = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})"),
        userAgent = window.navigator.userAgent,
        ieVersion = -1;

    if (window.navigator.appName == 'Microsoft Internet Explorer') {
      if (msIeRegExp.exec(userAgent) != null)
      ieVersion = parseFloat( RegExp.$1 );
    } else if (window.navigator.appName == 'Netscape') {
      if (tridentRegExp.exec(userAgent) != null)
      ieVersion = parseFloat( RegExp.$1 );
    }

    return ieVersion;
  };

  function _addPointToArea(paramAreaIndex, paramPoint) {
    if(paramAreaIndex < 0) {return false;}
    if(!arrayArea[paramAreaIndex] && arrayArea[paramAreaIndex].length<pointNumberLimit) {
      for(var i=0; i<=paramAreaIndex; i++) {
        if(arrayArea[i] == undefined) {
          arrayArea[i] = new Array()
        };
      }
    }

    if(paramPoint && paramPoint instanceof Point) {
      arrayArea[paramAreaIndex].push(paramPoint);
      debugLog("new Point Object("+paramPoint.getX()+", "+paramPoint.getY()+") is add to area"+paramAreaIndex+".");
    } else if((paramPoint.x != undefined) && (paramPoint.y != undefined)) {
      arrayArea[paramAreaIndex].push(new Point(paramPoint.x, paramPoint.y));
      debugLog("new Point Object("+paramPoint.x+", "+paramPoint.y+") is add to area"+paramAreaIndex+".");
    } else {
      debugLog("param error!");
      return false;
    }

    _refreshCanvas();

    return true;
  }

  function _drawArea(){
    var i=0, j=0,
    area = null,
    point = null,
    arrayAreaLength = arrayArea.length,
    areaLength = 0;
    // for(i=0, area=arrayArea[i]; area; area=arrayArea[++i]) {
    for(i=0; i<arrayAreaLength;i++) {
      area = arrayArea[i];
      areaLength = area.length;

      context.beginPath();
      // for(var j=0, point=area[j]; point; point=area[++j]) {
      for(j=0; j<areaLength; j++) {
        point = area[j];
        if(j===0) {
          //draw point
          context.moveTo(point.getX(), point.getY());
          context.arc(point.getX(), point.getY(), pointRadius, 0, 2*Math.PI, true);
          context.fillStyle = arrayColor[i];
          context.fill();
          context.moveTo(point.getX(), point.getY());
        } else {
          //draw line
          context.lineTo(point.getX(), point.getY());
          //draw point(circle)
          context.moveTo(point.getX(), point.getY());
          context.arc(point.getX(), point.getY(), pointRadius, 0, 2*Math.PI, true);
          context.fillStyle = arrayColor[i];
          context.fill();
          context.moveTo(point.getX(), point.getY());
        }
      }

      context.lineTo(area[0].getX(), area[0].getY());
      context.globalAlpha = 1;
      context.strokeStyle = arrayColor[i];
      context.stroke();
    }

    return true;
  }

  function _refreshCanvas(paramURL){
    var imageURL = paramURL ? paramURL : previewImage.src;
    context.clearRect(0, 0, elemAreaCanvas.width, elemAreaCanvas.height);
  
    _setImageURL(imageURL);
    if(hoveredAreaHighlight == true 
      && (hoveredAreaIndex >= 0 || selectedAreaIndex >= 0)) {
      var areaIndex = selectedAreaIndex>=0 ? selectedAreaIndex:hoveredAreaIndex;
      _fillColorToArea(arrayArea[areaIndex], hoveredAreaColor);
    }
    _drawArea();

    return true;
  };

  function _setImageURL(paramJpegURL) {
    var jpegURL = defaultImage;
    if(paramJpegURL) {jpegURL = paramJpegURL;}

    previewImage = new Image(width, height);
    previewImage.onload = function (){
      //rendering image
      // context.drawImage(this, 0, 0, elemAreaCanvas.width, elemAreaCanvas.height);
      elemAreaCanvas.style.background="url("+jpegURL+")";
      elemAreaCanvas.style.backgroundSize = "100% 100%";

      //rendering area
    }
    
    previewImage.src = jpegURL;
  };

  function _isPointOnTheLine(paramPointA, paramPointB, paramTargetPoint) {
    var result = false;

    if(!paramPointA instanceof Point) {return result;}
    if(!paramPointB instanceof Point) {return result;}
    if(!paramTargetPoint instanceof Point) {return result;}

    var pointA = paramPointA,
        pointB = paramPointB,
        minX = Math.min(pointA.getX(), pointB.getX()),
        maxX = Math.max(pointA.getX(), pointB.getX()),
        minY = Math.min(pointA.getY(), pointB.getY()),
        maxY = Math.max(pointA.getY(), pointB.getY()),
        m = (pointB.getY()-pointA.getY())/(pointB.getX()-pointA.getX());

    if((pointA.getY() == pointB.getY())
        && (pointA.getY()-pointRadius < paramTargetPoint.getY() && paramTargetPoint.getY() < pointA.getY()+pointRadius)
        && (minX < paramTargetPoint.getX() && paramTargetPoint.getX() < maxX)) {
      result = true;
    } else if((pointA.getX() == pointB.getX())
        && (pointA.getX()-pointRadius < paramTargetPoint.getX() && paramTargetPoint.getX() < pointA.getX()+pointRadius)
        && (minY < paramTargetPoint.getY() && paramTargetPoint.getY() < maxY)) {
      result = true;
    } else if(paramTargetPoint.getY()-pointA.getY()-3 <= m*(paramTargetPoint.getX()-pointA.getX())
              && m*(paramTargetPoint.getX()-pointA.getX()) <= paramTargetPoint.getY()-pointA.getY()+3
              && minX < paramTargetPoint.getX() && paramTargetPoint.getX() < maxX) {
      result = true;
    }

    return result;
  }

  function _initSelectedArea() {
    selectedAreaTop = -1,
    selectedAreaLeft = -1,
    selectedAreaRight = -1,
    selectedAreaBottom = -1;
  }

  function _calcSelectedAreaBound(paramAreaIndex){
    var area=arrayArea[paramAreaIndex];
    if(!area) {return false;}
    
    for(var i=0, point=area[i]; point; point=area[++i]) {
      if(selectedAreaLeft==-1 || selectedAreaLeft>point.getX()) {
        selectedAreaLeft = point.getX();
      }
      if(selectedAreaTop==-1 || selectedAreaTop>point.getY()) {
        selectedAreaTop = point.getY();
      }
      if(selectedAreaRight==-1 || selectedAreaRight<point.getX()) {
        selectedAreaRight = point.getX();
      }
      if(selectedAreaBottom==-1 || selectedAreaBottom<point.getY()) {
        selectedAreaBottom = point.getY();
      }
    }
    
    return true;
  }

  function _isMouseOnArea(paramX, paramY, paramArea) {
    context.beginPath();

    for(var j=0, point=paramArea[j]; point; point=paramArea[++j]) {
      if (j==0) {
        context.moveTo(point.getX(), point.getY());
      } else {
        context.lineTo(point.getX(), point.getY());
      }

    }
    context.closePath();

    return context.isPointInPath(paramX, paramY)
  }

  function _fillColorToArea(paramArea, colorCode) {
    context.beginPath();

    for(var j=0, point=paramArea[j]; point; point=paramArea[++j]) {
      if (j==0) {
        context.moveTo(point.getX(), point.getY());
      } else {
        context.lineTo(point.getX(), point.getY());
      }
    }
    context.closePath();
    context.fillStyle = colorCode;
    context.globalAlpha = hoveredAreaAlpha;

    return context.fill();
  }

  //private values  
  var elemFrameAreaCanvas = null,
      elemAreaCanvasId = null,
      elemAreaCanvas = null,
      ieVersion = _getIeVersion(),
      width = 640,
      height = 480,
      previewImage = null,
      selectedAreaIndex = -1,
      selectedAreaX = -1,
      selectedAreaY = -1,
      selectedAreaTop = -1,
      selectedAreaLeft = -1,
      selectedAreaRight = -1,
      selectedAreaBottom = -1,
      selectedPointIndex = -1,
      context = null,
      arrayArea = [],
      isDebugMode = false,
      pointRadius = 3,
      pointNumberLimit = 16,
      areaNumberLimit = 4,
      defaultImage = null,
      arrayColor = ["#EC7063", "#AF7AC5", "#5DADE2", "#7DCEA0", "#F4D03F", "#EB984E"],
      isFixPointNumber = false,
      hoveredAreaColor = "#CCAF0A",
      hoveredAreaIndex = -1,
      hoveredAreaAlpha = 0.5,
      hoveredAreaHighlight = true,
      debugLog = function(paramMsg){
        if(console && console.log && isDebugMode) {
          console.log(paramMsg);
        }
      };
  
  //public
  this.init = function(paramOption) {
    if (paramOption.width != null) {width=paramOption.width;}
    if (paramOption.height != null) {height=paramOption.height;}
    if (paramOption.debug != null) {isDebugMode=paramOption.debug;}
    if (paramOption.id != null) {elemAreaCanvasId=paramOption.id;}
    if (paramOption.pointNumberLimit != null) {pointNumberLimit=paramOption.pointNumberLimit;}
    if (paramOption.areaNumberLimit != null) {areaNumberLimit=paramOption.areaNumberLimit;}
    if (paramOption.defaultImage != null) {defaultImage=paramOption.defaultImage;}
    if (paramOption.hoveredAreaColor != null) {hoveredAreaColor=paramOption.hoveredAreaColor;}
    if (paramOption.hoveredAreaAlpha != null) {hoveredAreaAlpha=paramOption.hoveredAreaAlpha;}
    if (paramOption.hoveredAreaHighlight != null) {hoveredAreaHighlight=paramOption.hoveredAreaHighlight;}

    if (paramOption.arrayColor != null) {
      arrayColor = (function(paramArrayColor, paramAreaNumberLimit){
        var tmpArrayColor = paramArrayColor,
            index = tmpArrayColor.length,
            lengthDefaultColorArray = arrayColor.length;
        if(tmpArrayColor.length<paramAreaNumberLimit) {
          for(index = tmpArrayColor.length; index<paramAreaNumberLimit && index<lengthDefaultColorArray; index++) {
            tmpArrayColor.push(paramArrayColor[index]);
          }
        }
        
        return tmpArrayColor;
      })(paramOption.arrayColor, areaNumberLimit);
    }
    if (paramOption.isFixPointNumber != null) {isFixPointNumber=paramOption.isFixPointNumber;}
  
    elemFrameAreaCanvas = document.getElementById(elemAreaCanvasId);

    if(!elemFrameAreaCanvas) {
      debugLog("paramElemId is not found.")
      return false;
    }

    if(0<ieVersion && ieVersion<10) { //not support canvas
      elemFrameAreaCanvas.innerHTML = "<span>not support Internet Explorer "+ieVersion+". Please using Chrome Browser.</span>"
    } else {
      elemFrameAreaCanvas.innerHTML = "<canvas width=\""+width+"\" height=\""+height+"\"></canvas>"
    }

    elemAreaCanvas = elemFrameAreaCanvas.children[0];
    if(!elemAreaCanvas) {
      debugLog("Can not create Canavas Element.");
      return false;
    } else {
      context = elemAreaCanvas.getContext("2d");
    }

    _setImageURL(defaultImage)

    if(!elemAreaCanvas.onmousedown) {
      elemAreaCanvas.onmousedown = function(event) {
        var rect = elemAreaCanvas.getBoundingClientRect(),
            x = event.clientX - rect.left,
            y = event.clientY - rect.top;
  
        debugLog("click point: ("+x+", "+y+")");
        //find point from arrayArea
        for(var i=0, area=arrayArea[i]; area; area=arrayArea[++i]) {

          context.beginPath();

          for(var j=0, point=area[j]; point; point=area[++j]) {
            if (j==0) {
              context.moveTo(point.getX(), point.getY());
            } else {
              context.lineTo(point.getX(), point.getY());
            }

            if(((point.getX()-pointRadius)<x && x<(point.getX()+pointRadius))
              && ((point.getY()-pointRadius)<y && y<(point.getY()+pointRadius))) {

              if (event.button == 0) {
                //left-click on the point
                selectedAreaIndex = i;
                selectedPointIndex = j;
              } else if((event.button==2) && (area.length>3)){
                //right-click on the point
                event.preventDefault();
                area.splice(j, 1);
                _refreshCanvas();
              }

              break;
            }

          }
          context.closePath();

          if(context.isPointInPath(x, y)
            && selectedAreaIndex < 0
            && selectedPointIndex < 0) {
            selectedAreaIndex = i;
            selectedAreaX = x;
            selectedAreaY = y;
            _initSelectedArea();
            _calcSelectedAreaBound(selectedAreaIndex);
          }
          
        }
      }

    }

    if(!elemAreaCanvas.oncontextmenu) {
      elemAreaCanvas.oncontextmenu = function(event) {
        event.preventDefault();
      }
    }

    if(!elemAreaCanvas.onmousemove) {
      elemAreaCanvas.onmousemove = function(event) {
        var rect = elemAreaCanvas.getBoundingClientRect(),
            x = event.clientX - rect.left,
            y = event.clientY - rect.top,
            targetX = 0,
            targetY = 0,
            area = null,
            areaLength = 0,
            i=0,
            modX = 0,
            modY = 0,
            boundOver = false,
            isMouseOnArea = false;

        for(var i=0; i<arrayArea.length; i++) {
          if(_isMouseOnArea(x-selectedAreaX, y-selectedAreaY, arrayArea[i])) {
            hoveredAreaIndex = i;
            isMouseOnArea = true;
          }
        }

        area = arrayArea[selectedAreaIndex];
        if(area) {
          if(selectedAreaIndex >= 0 && selectedPointIndex >= 0) {
            area[selectedPointIndex].setPoint(x, y);
            _refreshCanvas();
          } else if(selectedAreaIndex >= 0 && selectedAreaX >= 0 && selectedAreaY >= 0) {
            areaLength = area.length;
            modX = x-selectedAreaX;
            modY = y-selectedAreaY;
            _calcSelectedAreaBound(selectedAreaIndex);

            if((modX<0 && (selectedAreaLeft+modX)<=0)
              || (modX>0 && (selectedAreaRight+modX)>=elemAreaCanvas.width)) {
              modX=0;
              boundOver = true;
            }
            if(modY<=0 && (selectedAreaTop+modY)<=0
              || modY>0 && (selectedAreaBottom+modY)>=elemAreaCanvas.height) {
              modY=0;
              boundOver = true;
            }

            for(i=0; i<areaLength; i++) {
              targetX = area[i].getX()+modX;
              targetY = area[i].getY()+modY;
              area[i].setPoint(targetX, targetY);
            }

            _calcSelectedAreaBound(selectedAreaIndex);
            selectedAreaX = x;
            selectedAreaY = y;
            _refreshCanvas();
          }

        } else if(hoveredAreaIndex >= 0 && isMouseOnArea == false) {
          hoveredAreaIndex = -1;
          _refreshCanvas();
        } else if(isMouseOnArea) {
          _refreshCanvas();
        }
      };
    }
    
    if(!elemAreaCanvas.onmouseup) {
      elemAreaCanvas.onmouseup = function(event) {
        selectedAreaIndex = -1;
        selectedAreaX = -1;
        selectedAreaY = -1;
        _initSelectedArea();
        selectedPointIndex = -1;
      };
    }
    
    if(!elemAreaCanvas.ondblclick) {
      elemAreaCanvas.ondblclick = function(event) {
        if(isFixPointNumber) {return false;}
        var i=0, j=0,
            area = null,
            pointA = null,
            pointB = null,
            arrayAreaLength = arrayArea.length,
            areaLength = 0,
            rect = elemAreaCanvas.getBoundingClientRect(),
            x = event.clientX - rect.left,
            y = event.clientY - rect.top,
            targetPoint = new Point(x, y);
  
        for(var i=0; i<arrayAreaLength; i++) {
          area = arrayArea[i];
          areaLength = area.length;
          
          if(areaLength < pointNumberLimit) {
            for(var j=1; j<areaLength; j++) {
              pointA = area[j-1];
              pointB = area[j];
  
              if(_isPointOnTheLine(pointA, pointB, targetPoint)) {
                area.splice(j, 0, targetPoint);
                break;
              }
            }
  
            //end point <-> start point
            pointA = area[j-1];
            pointB = area[0];
  
            if(_isPointOnTheLine(pointA, pointB, targetPoint)) {
              area.splice(j, 0, targetPoint);
            }
          }
        }

        _refreshCanvas();
      };
    }
  };
  
  this.getAllArea = function() {return arrayArea;};
  
  this.getArea = function(paramAreaIndex) {
    if(paramAreaIndex < 0) {return false;}
    if(!arrayArea[paramAreaIndex]) {return false;}

    return arrayArea[paramAreaIndex];
  }

  this.getAreaToRelativeCoordinates = function(paramAreaIndex) {
    if(paramAreaIndex < 0) {return false;}
    if(!arrayArea[paramAreaIndex]) {return false;}

    var resultArray = [];
    var tempPoint = null;
    for(var i=0; i<arrayArea[paramAreaIndex].length; i++) {
      tempPoint = arrayArea[paramAreaIndex][i];
      resultArray.push(new Point(tempPoint.getX()/width, tempPoint.getY()/height));
    }

    return resultArray;
  }

  this.addPointToArea = function(paramAreaIndex, paramPoint) {
    return _addPointToArea(paramAreaIndex, paramPoint);
  };

  this.addPointArrayToArea = function(paramAreaIndex, paramPointArray) {
    if(paramAreaIndex < 0) {return false;}
    if(paramAreaIndex > areaNumberLimit) {return false;}
    if(!arrayArea[paramAreaIndex]) {
      for(var i=0; i<=paramAreaIndex; i++) {
        if(arrayArea[i] == undefined) {
          arrayArea[i] = new Array();
        };
      }
    }

    for(var data in paramPointArray) {
      if(paramPointArray[data] != undefined && paramPointArray[data] instanceof Point) {
        arrayArea[paramAreaIndex].push(paramPointArray[data]);
        debugLog("new Point Object("+paramPointArray[data].getX()+", "+paramPointArray[data].getY()+") is add to area"+paramAreaIndex+".");
      } else if((paramPointArray[data].x != undefined) && (paramPointArray[data].y != undefined)) {
        arrayArea[paramAreaIndex].push(new Point(paramPointArray[data].x, paramPointArray[data].y));
        debugLog("new Point Object("+paramPointArray[data].x+", "+paramPointArray[data].y+") is add to area"+paramAreaIndex+".");
      } else {
        debugLog("param error!");
        return false;
      }
    }

    _refreshCanvas();

    return true;
  };

  this.addPushArrayToArea = function(paramPointArray) {
    var arrayAreaLength = arrayArea.length;
    if(arrayAreaLength >= areaNumberLimit) {return false;}
    if(!arrayArea[arrayAreaLength]) {
      arrayArea[arrayAreaLength] = new Array();
    }

    for(var data in paramPointArray) {
      if(paramPointArray[data] != undefined && paramPointArray[data] instanceof Point) {
        arrayArea[arrayAreaLength].push(paramPointArray[data]);
        debugLog("new Point Object("+paramPointArray[data].getX()+", "+paramPointArray[data].getY()+") is add to area"+arrayAreaLength+".");
      } else if((paramPointArray[data].x != undefined) && (paramPointArray[data].y != undefined)) {
        arrayArea[arrayAreaLength].push(new Point(paramPointArray[data].x, paramPointArray[data].y));
        debugLog("new Point Object("+paramPointArray[data].x+", "+paramPointArray[data].y+") is add to area"+arrayAreaLength+".");
      } else {
        debugLog("param error!");
        return false;
      }
    }

    _refreshCanvas();

    return true;
  }

  this.deletePointFromArea = function(paramAreaIndex, paramPointIndex) {
    if(paramAreaIndex < 0) {
      debugLog("paramAreaIndex is wrong!");
      return false;
    }
    if(paramPointIndex < 0) {
      debugLog("paramPointIndex is wrong!");
      return false;
    }
    if(arrayArea[paramAreaIndex] == undefined) {
      debugLog("arrayArea["+paramAreaIndex+"] is undefined!");
      return false;
    }
    if(arrayArea[paramAreaIndex][paramPointIndex] == undefined) {
      debugLog("arrayArea["+paramAreaIndex+"]["+paramPointIndex+"] is undefined!");
      return false;
    }
    if(arrayArea[paramAreaIndex].length < 4) {
      debugLog("arrayArea["+paramAreaIndex+"] has 3 points!");
      return false;
    }

    arrayArea[paramAreaIndex].splice(paramPointIndex, 1);

    _refreshCanvas();

    return true;
  }

  this.setImageURL = function(paramJpegURL) {
    _setImageURL(paramJpegURL);

    return true;
  };

  this.refreshCanvas = function(paramUrl) {
    _refreshCanvas(paramUrl);

    return true;
  };

  this.drawRect = function(paramStartX, paramStartY, paramEndX, paramEndY, paramLabel) {
    var label = null, //reserved
        startX = 0,
        startY = 0,
        endX = 0,
        endY = 0, 
        width = 0,
        height = 0;

    if(_isNullOrUndefined(paramStartX) || _isNullOrUndefined(paramStartY)
      || _isNullOrUndefined(paramEndX) || _isNullOrUndefined(paramEndY)) {
        return false;
    }
    if(paramLabel) {label = paramLabel;}
    if (paramStartX) {startX = paramStartX;}
    if (paramStartY) {startY = paramStartY;}
    if (paramEndX) {endX = paramEndX;}
    if (paramEndY) {endY = paramEndY;}
    
    width = endX-startX;
    height = endY-startY;

    context.beginPath();
    context.strokeStyle = "#8561c7"
    context.rect(startX, startY, width, height);
    context.stroke();

    return true;
  }
};
