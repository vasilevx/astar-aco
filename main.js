const data = {
    1: [2, 3],
    2: [1, 3, 4, 5] ,
    3: [1, 2, 4, 7, 8],
    4: [2, 3, 6, 7],
    5: [2, 6],
    6: [4, 5, 9],
    7: [3, 4, 9, 10],
    8: [3, 8],
    9: [5, 6, 7, 10],
    10: [7, 8, 9, 10]


}

// nodes: [
//     { data: { id: 'a' } },
//     { data: { id: 'b' } },
//     { data: { id: 'c' } },
//     { data: { id: 'd' } },
//     { data: { id: 'e' } }
//   ],

//   edges: [
//     { data: { id: 'ae', weight: 1, source: 'a', target: 'e' } },
//     { data: { id: 'ab', weight: 3, source: 'a', target: 'b' } },
//     { data: { id: 'be', weight: 4, source: 'b', target: 'e' } },
//     { data: { id: 'bc', weight: 5, source: 'b', target: 'c' } },
//     { data: { id: 'ce', weight: 6, source: 'c', target: 'e' } },
//     { data: { id: 'cd', weight: 2, source: 'c', target: 'd' } },
//     { data: { id: 'de', weight: 7, source: 'd', target: 'e' } }
//   ]
function graphFromData(data) {
    const nodes = [], edges = [];
    Object.keys(data).map((key, i) => {
        nodes.push({data: {id: String(key)}});
        data[key].forEach((v, j) => {
            if (!edges.find(edge => {
                // console.dir(edge);
                return false;
                return (edge.data.source == v && edge.data.target == key) || (edge.data.source == key && edge.data.target == v)

            })) {
                edges.push({data: {id: "" + i + j, weight: Math.floor(Math.random() * (1000 - 1)) + 1, source: String(key), target: String(v)}})
            }
        });
    });

    return {nodes, edges};
    

}

let g = graphFromData(data);

var cy = cytoscape({
    container: document.getElementById('container'),
  
    // boxSelectionEnabled: false,
    // autounselectify: true,
  
    style: cytoscape.stylesheet()
      .selector('node')
        .style({
          'label': 'data(id)',
          'background-color': '#f00',
          'text-valign': 'center',
          'text-halign': 'center'
        })
      .selector('edge')
        .style({
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle-backcurve',
          'width': 4,
          'content': 'data(weight)',
          'line-color': '#ccc',
          'target-arrow-color': '#000',
          'arrow-scale': 1.5
        })
    .selector(':selected')
    .style({
        'background-color': '#0f0',
        'line-color': '#00f',
     
    })
      .selector('.highlighted')
        .style({
          'background-color': '#0f0',
          'line-color': '#61bffc',
          'transition-property': 'background-color, line-color, target-arrow-color',
          'transition-duration': '0.5s'
        }),
  
    elements: {
        nodes: g.nodes,
  
        edges: g.edges
      },
  
    layout: {
      name: 'breadthfirst',
      directed: false,
      roots: '#1',
      padding: 10
    }
  });
  

  var d = cy.elements().dijkstra({root:'#1', weight: function(e) {
      return e.data('weight');
  }, directed: true});
  var dd = d.pathTo( cy.$('#10') );
    // dd.select();

  var astar = cy.elements().aStar({root: '#1', goal: '#10', heuristic: function(v) {console.log(v._private.data.id);return v.data('id')}, weight:function(edge) {return edge.data('weight')}, directed: true});
  astar.path.select();
  var i = 0;
  var highlightNextEle = function(){

     if( i < astar.path.length ){
         astar.path[i].addClass('highlighted');

        
      i++;
      setTimeout(highlightNextEle, 3);
     }
  };

//   highlightNextEle();