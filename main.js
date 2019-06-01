const data = {
    "A": ["B", "C", "A"],
    "B": ["A", "C", "D", "E"] ,
    "C": ["A", "B", "D", "G", "H"],
    "D": ["B", "C", "F", "G"],
    "E": ["B", "F"],
    "F": ["D", "E", "I"],
    "G": ["C", "D", "I", "J"],
    "H": ["C"],
    "I": ["E", "F", "G", "J"],
    "J": ["G", "H", "I"]
}

let start, finish;

document.addEventListener('input', function(e) {
  const element = e.target;
  if (element.type != 'text') return;
  if (element == startInput) {
    cy.$(`#${start}`).removeClass('start');
    start = element.value.toUpperCase();
    if (cy.$(`#${start}`).length == 1)
    cy.$(`#${start}`).addClass('start');
  }
  if (element == finishInput) {
    cy.$(`#${finish}`).removeClass('finish');
    finish = element.value.toUpperCase();
    if (cy.$(`#${finish}`).length == 1)
      cy.$(`#${finish}`).addClass('finish');
  }
});

    function graphFromData(data) {
      const nodes = [], edges = [];
      Object.keys(data).map((key) => {
          nodes.push({
            data: {
              id: String(key)
            }
          });
          data[key].forEach((v) => {
              if (!edges.find(edge => {
                  return (edge.data.source == v && edge.data.target == key) || (edge.data.source == key && edge.data.target == v)
  
              })) {
                  edges.push({data: {id: `${key}${v}`, weight: Math.floor(Math.random() * (20 - 1)) + 1, source: String(key), target: String(v)}})
              }
          });
      });  
      return {nodes, edges};
  }  
  let graph = graphFromData(data);  
  let a = cytoscape({
    elements: {
      nodes: graph.nodes,    
      edges: graph.edges
    }
  });


  let cy = cytoscape({
      container: document.getElementById('container'),   
      style: cytoscape.stylesheet()
        .selector('node')
          .style({
            'label': 'data(id)',
            'background-color': '#acc',
            'text-valign': 'center',
            'text-halign': 'center',
            'width': '70',
            'height': '70'
          })
          .selector('.aStar')
          .style({
            'label': 'data(lbl)'
          })
        .selector('edge')
          .style({
            'curve-style': 'bezier',
            // 'target-arrow-shape': 'triangle-backcurve',
            'width': 6,
            'content': 'data(weight)',
            'color': '#000',
            'font-size': 18,
            'line-color': '#ccc',
          })
      .selector(':selected')
      .style({
          'background-color': '#0f0',
          'line-color': '#00f',  
          'transition-property': 'background-color, line-color',
          'transition-duration': '0.5s'     
      })
      .selector('.start')
      .style({
        'background-color': 'pink',
      })
      .selector('.finish')
      .style({
        'background-color': 'red',
      })
      .selector('.highlighted')
        .style({
          'background-color': '#0f0',
          'line-color': '#61bffc',
          'transition-property': 'background-color, line-color, target-arrow-color',
          'transition-duration': '0.5s'
        }),
    
      elements: {
          nodes: graph.nodes,    
          edges: graph.edges
        },
    
      layout: {
        name: 'breadthfirst',
        directed: false,
        roots: '#A',
        padding: 10
      }
    });

    function unselect() {
      cy.elements().unselect();
    }





    function aStar() {
      if (!(start && finish)) return;
      unselect();
      const fw = cy.elements().floydWarshall({
        weight: edge => edge.data('weight')
      });
      const nodeIDs = [];
      graph.nodes.forEach(node => {
        node.data.h = fw.distance(`#${finish}`, `#${node.data.id}`);
        node.data.lbl = `${node.data.id} (${node.data.h})`;
        nodeIDs.push(node.data.id);

      });
      



      cy.elements('node').addClass('aStar');
      const startNode = cy.elements(`#${start}`);
      const finishNode = cy.elements(`#${finish}`);

      const g = graph.nodes.reduce((gv, v) => {
        gv[v.data.id] = fw.distance(startNode, `#${v.data.id}`);
        return gv;
      }, {});

      const f = {};

      const sortByHeuristic = (node1, node2) => f[node1.data('id')] > f[node2.data('id')] ? -1 : 1;

      let currNode;
      let prevID;

      const queue = [];
      const visited = new Set();
      queue.push(startNode);

      while (queue.length > 0) {
        console.log('Очередь: ', queue.map(el => el.data('id')).join(', '));
        console.log('Вершины не в очереди: ', nodeIDs.filter(id => !queue.map(el => el.data('id')).includes(id)).join(', '));
        currNode = queue.pop();
        currNode.edgesWith(`#${prevID}`).select();
        visited.add(currNode);
        currNode.select();
        console.log('Посещенные вершины: ', Array.from(visited).map(el => el.data('id')).join(', '));



        if (currNode.data('id') == finishNode.data('id')) {
          return true;
        }
        const neighbors = currNode.neighborhood().nodes().map(node => node);

        let tempG = g[currNode.data('id')];
        for (let node of neighbors) {
          let d = currNode.edgesWith(node).data('weight');
          let tScore = d + tempG;


          if (visited.has(node) && tScore >= g[node.data('id')]) continue;

          if (!visited.has(node) || tScore < g[node.data('id')]) {
            g[node.data('id')] = tScore;
            f[node.data('id')] = g[node.data('id')] + node.data('h');
          }
          
          if(!queue.includes(node))
            queue.push(node);
            queue.sort(sortByHeuristic); 

        } 
        prevID = currNode.data('id');
        
        console.log('-----');
      }
      return false;   
    }

    function ACO(graph) {

      let V=[];			//Vertex Set
      let algoOn=0;
      let a=[[0],[0]]//Adjacency Matrix
      let n=0;			//Nodes
      let i,j;
      //let iteration
      let A=[];			///Ants
      let destination=3;
      let p=[[0],[0]];
      let antNumber=4;
      let p_max=150;		//Max Pheromone
      let e_factor;	//Evaporation Factor
      let iACO=0;			//Counter
      let best=-1;
      let alphaC=1,beta=0;
      let gount=5;
    }




