'use strict';

// d3.Selection.enter.prototype.translate =
d3.Selection.prototype.translate = function(left, top) {
  this.attr("transform", "translate("+left+","+top+")");
  return this;
};

d3.Selection.prototype.removeDOM = function() {
  $(this.nodes()).remove();
}

d3.selection.prototype.removeDOM = function() {
  $(this.nodes()).remove();
}
