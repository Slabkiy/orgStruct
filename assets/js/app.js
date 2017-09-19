var treeData = {
  "name": "Top Level",
  "id": 1,
  "children": [{
    "name": "Node (level 2)",
    "id": 2,
    "children": [{
      "name": "Node (level 3)",
      "id": 3,
    }, {
      "name": "Node (level 3)",
      "id": 4,
    }]
  }, {
    "name": "Node (level 2)",
    "id": 5,
    "children": [{
      "name": "Node (level 3)",
      "id": 6,
    }, {
      "name": "Node (level 3)",
      "id": 7,
    }]
  }, {
    "name": "Node (level 2)",
    "id": 8,
    "children": [{
      "name": "Node (level 3)",
      "id": 9,
    }, {
      "name": "Node (level 3)",
      "id": 10,
    }]
  }, {
    "name": "Node (level 2)",
    "children": [{
      "name": "Node (level 3)",
      "id": 11,
    }, {
      "name": "Node (level 3)",
      "id": 12,
    }]
  }, {
    "name": "Node (level 2)",
    "id": 13,
    "children": [{
      "name": "Node (level 3)",
      "id": 14,
      "children": [{
        "name": "Node (level 4)",
        "id": 15,
      }, {
        "name": "Node (level 4)",
        "id": 16,
      }]
    }, {
      "name": "Node (level 3)",
      "id": 17,
    }]
  }]
};
var tools = false;
// Set the dimensions and margins of the diagram
var margin = {
    top: 50,
    right: 90,
    bottom: 30,
    left: 90
  },
  width = $('.grid').width() - margin.left - margin.right,
  height = $('.grid').height() - margin.top - margin.bottom;
var rect = {
  width: 200,
  height: 100,
  rx: 3,
  ry: 3
};
// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select(".grid").append("svg")
  .attr("width", '100%')
  .attr("height", '100%')
  .call(d3.zoom().on("zoom", function() {
    svg.attr("transform", d3.event.transform)
  }))
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var i = 0,
  duration = 550,
  root;

// declares a tree layout and assigns the size
var treemap = d3.tree().size([width, height]);

// Assigns parent, children, height, depth
root = d3.hierarchy(treeData, function(d) {
  return d.children;
});
root.x0 = 0;
root.y0 = height / 2;

// Collapse after the second level
root.children.forEach(collapse);

update(root);
// Collapse the node and all it's children
function collapse(d) {
  if (d.children) {
    d._children = d.children
    d._children.forEach(collapse)
    d.children = null
  }
}

function update(source) {
  var newWidth = Math.max(getMaxRow(treemap(root).descendants()) * rect.width + margin.left, width);
  d3.select(".grid")
    .attr("width", newWidth + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom);

  treemap = d3.tree().size([newWidth, height]);

  // Assigns the x and y position for the nodes
  var treeData = treemap(root);

  // Compute the new tree layout.
  var nodes = treeData.descendants(),
    links = treeData.descendants().slice(1);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) {
    d.y = d.depth * rect.width;
  });

  // ****************** Nodes section ***************************

  // Update the nodes...
  var node = svg.selectAll('g.node')
    .data(nodes, function(d) {
      return d.id || (d.id = ++i);
    });

  // Enter any new modes at the parent's previous position.
  var nodeEnter = node.enter().append('g')
    .attr('class', function(d) {
      return d._children ? "node parent" : "node";
    })
    .attr("transform", function(d) {
      return "translate(" + source.x0 + "," + source.y0 + ")";
    });

  nodeEnter.append('rect')
    .attr('width', rect.width)
    .attr('height', rect.height)
    .attr('x', -rect.width / 2)
    .attr('y', -rect.height / 2)
    .attr('rx', rect.rx)
    .attr('ry', rect.ry)
    .style("fill", function(d) {
      return d._children ? "#64b5f6" : "rgba(255,255,255,1)";
    })
    .on('click', click);
  nodeEnter.append('text')
    .attr("dy", ".35em")
    .attr("x", function(d) {
      return d.children || d._children ? 0 : 0;
    })
    .attr("text-anchor", function(d) {
      return d.children || d._children ? "middle" : "middle";
    })
    .text(function(d) {
      return d.data.name;
    });
  nodeEnter.append('circle')
    .attr('class', "circle add")
    .attr('r', 15)
    .attr('cx', 0)
    .attr('cy', rect.height / 2)
    .attr('fill', addBackground('add', nodeEnter))
    .on('click', addNewChild);
  nodeEnter.append('circle')
    .attr('class', function(d) {
      return d.depth === 0 ? "circle remove hide" : "circle remove";
    })
    .attr('r', 15)
    .attr('cx', rect.width / 2)
    .attr('cy', -rect.height / 2)
    .attr('fill', addBackground('remove', nodeEnter))
    .on('click', removeNode);
  nodeEnter.append('circle')
    .attr('class', 'circle edit')
    .attr('r', 15)
    .attr('cx', rect.width / 2)
    .attr('cy', (-rect.height / 2) + 35)
    .attr('fill', addBackground('edit', nodeEnter))
    .on('click', editNode);
  // UPDATE
  var nodeUpdate = nodeEnter.merge(node);

  // Transition to the proper position for the node
  nodeUpdate.transition()
    .duration(duration)
    .attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });

  // Update the node attributes and style
  nodeUpdate.select('rect')
    .attr('class', function(d) {
      return d._children ? "node parent" : "node";
    })
    .style("fill", function(d) {
      return d._children ? "#64b5f6" : "rgba(255,255,255,1)";
    })
    .attr('cursor', 'pointer');
  nodeUpdate.select('text')
    .text(function(d) {
      return d.data.name;
    })
    .style("fill", function(d) {
      return d._children ? "#fff" : "#000";
    })
    // Remove any exiting nodes
  var nodeExit = node.exit().transition()
    .duration(duration)
    .attr("transform", function(d) {
      return "translate(" + source.x + "," + source.y + ")";
    })
    .remove();
  // On exit reduce the opacity of text labels
  nodeExit.select('text')
    .style('fill-opacity', 1e-6)
  nodeExit.select('rect')
    .style('fill-opacity', 1e-6)
    .style('stroke-opacity', 1e-6);

  // ****************** links section ***************************

  // Update the linkdsfsds...
  var link = svg.selectAll('path.link')
    .data(links, function(d) {
      return d.id;
    });

  // Enter any new links at the parent's previous position.
  var linkEnter = link.enter().insert('path', "g")
    .attr("class", "link")
    .attr('d', function(d) {
      var o = {
        x: source.x0,
        y: source.y0
      }
      return diagonal(o, o)
    });

  // UPDATE
  var linkUpdate = linkEnter.merge(link);

  // Transition back to the parent element position
  linkUpdate.transition()
    .duration(duration)
    .attr('d', function(d) {
      return diagonal(d, d.parent)
    });

  // Remove any exiting links
  var linkExit = link.exit().transition()
    .duration(duration)
    .attr('d', function(d) {
      var o = {
        x: source.x,
        y: source.y
      }
      return diagonal(o, o)
    })
    .remove();

  // Store the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });

  // Creates a curved (diagonal) path from parent to the child nodes
  function diagonal(s, d) {

    path = `M ${s.x} ${s.y}
            C ${(s.x + s.x) / 2} ${d.y},
              ${(d.x + d.x) / 2} ${s.y},
              ${d.x} ${d.y}`

    return path
  }

  // Toggle children on click.
  function click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update(d);
  }

  function addBackground(type, node) {
    var id = type + "Circle";
    if (type === 'add') {
      var bgCircle = node.append('defs').append('pattern');
      bgCircle.attr('id', id)
        .attr('x', '-14.8')
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('height', '100%')
        .attr('width', '150%')
        .append('rect')
        .attr('x', 0)
        .attr('y', 35)
        .attr('width', '30')
        .attr('height', '30')
      bgCircle.append('image')
        .attr('x', 0)
        .attr('y', 35)
        .attr('width', '30')
        .attr('height', '30')
        .attr('xlink:href', 'assets/images/' + type + '.svg');
    }
    if (type === 'remove') {
      var bgCircle = node.append('defs').append('pattern');
      bgCircle.attr('id', id)
        .attr('x', rect.width/2-15)
        .attr('y', -rect.height/2-15)
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('height', '100%')
        .attr('width', '150%')
        .append('rect')
        //.attr('x', rect.width/2-15)
        //.attr('y', -rect.height/2-15)
        .attr('width', '30')
        .attr('height', '30')
      bgCircle.append('image')
        //.attr('x', rect.width/2-15)
        //.attr('y', -rect.height/2-15)
        .attr('width', '30')
        .attr('height', '30')
        .attr('xlink:href', 'assets/images/' + type + '.svg');
    }
    if (type === 'edit') {
      var bgCircle = node.append('defs').append('pattern');
      bgCircle.attr('id', id)
        .attr('x', rect.width/2-15)
        .attr('y', -rect.height/2+20)
        .attr('patternUnits', 'userSpaceOnUse')
        .attr('height', '100%')
        .attr('width', '150%')
        .append('rect')
        //.attr('x', rect.width/2-15)
        //.attr('y', -rect.height/2+20)
        .attr('width', '30')
        .attr('height', '30')
      bgCircle.append('image')
        //.attr('x', rect.width/2-15)
        //.attr('y', -rect.height/2+20)
        .attr('width', '30')
        .attr('height', '30')
        .attr('xlink:href', 'assets/images/' + type + '.svg');
    }
    //Background circle
    return "url(#" + id + ")";
  }
}


function addNewChild(d) {
  var newNode = {
    name: "New node (level " + (d.depth + 1) + ")"
  };
  //Creates a Node from newNode object using d3.hierarchy(.)
  var newNode = d3.hierarchy(newNode);

  //later added some properties to Node like child,parent,depth
  newNode.depth = d.depth + 1;
  newNode.height = d.height - 1;
  newNode.parent = d;
  newNode.id = Date.now();

  //Selected is a node, to which we are adding the new node as a child
  //If no child array, create an empty array
  if (d._children) {
    d._children.push(newNode);
    Materialize.toast("New children", 2500);
  }
  if (!d._children) {
    if (!d.children) {
      d.children = [];
      d.data.children = [];
    }
    d.children.push(newNode);
    d.data.children.push(newNode.data);
    Materialize.toast("New children", 2500);
  }
  if (!d.children) {
    d.children = d._children;
    d._children = null;
  }
  update(d)
}

function removeNode(node) {
  debug("removeNode\n", "info");
  node.parent.children.forEach(function(item, i, arr) {
    if (item.id === node.id) {
      var children = item.children ? item.children : item._children;
      node.parent.children.splice(i, 1);
      if (node.parent.children.length === 0) {
        node.parent.children = null;
      }
      if (children) {
        for (var i = 0; i < children.length; i++) {
          children[i].parent = node.parent;
          replaceDepth(children[i]);
          node.parent.height += children.length;
          node.parent.children.push(children[i]);
        }
      }
      Materialize.toast("Remove node", 2500);
      update(node);
    }
  });

  function replaceDepth(children) {
    children.depth -= 1;
    var ch = children.children ? children.children : children._children;
    if (ch) {
      for (var i = 0; i < ch.length; i++) {
        replaceDepth(ch[i]);
      }
    }
  }
}

function editNode(d) {
  $("#nodeTools").modal('open');
  var scope = angular.element($('body')).scope();
  scope.$apply(function() {
    scope.tree.edit(d);
    Materialize.updateTextFields();
  });
  nodeForTools = d;
}

function getMaxRow(arr) {
  var count = [];
  for (var i = 0; i < arr.length; i++) {
    if (!count[arr[i].depth]) {
      count[arr[i].depth] = 1;
    } else {
      count[arr[i].depth]++;
    }
  }
  return Math.max.apply(null, count) + count[findArrayIndex(count, Math.max.apply(null, count))];
}
/**
 *Find an element in an array
 * @param  {Array}  array  
 * @param  {Number} value The required element
 * @return {Number}       Element index
 */
function findArrayIndex(array, value) {
  if (array.indexOf) {
    return array.indexOf(value);
  }

  for (var i = 0; i < array.length; i++) {
    if (array[i] === value) return i;
  }

  return -1;
}
/**
 * Debug
 * @param  {[String]} msg  [message]
 * @param  {[String]} type [type: "log", "error", "warn", "info"]
 * @return {[Boolead]}     [status]
 */
function debug(msg, type) {
  console[type](msg);
}

function treeCtrl() {
  debug("Controller 'treeCtrl' initialized", "info");
  this.node = {
    data: {
      name: "Node name"
    }
  };
  this.edit = function(node) {
    this.node = node;
  }
  this.saveChange = function() {
    update(this.node);
  }
}
var appTree = angular.module("appTree", []);
appTree.controller('treeCtrl', treeCtrl);