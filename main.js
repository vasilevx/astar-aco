const data = {
  "A": ["B", "C"],
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
(() => {
  Object.keys(data).forEach(id => {
    const option = document.createElement('option');
    option.value = id;
    option.innerText = id;

    startInput.appendChild(option);
    finishInput.appendChild(option.cloneNode(true));
  })
})()

document.addEventListener('change', function(e) {
  const element = e.target;
  // if (element.type != 'text') return;
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
    'opacity': 1,
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
const fw = cy.elements().floydWarshall({
  weight: edge => edge.data('weight')
});

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
  if(!nodeIDs.includes(finish) || !nodeIDs.includes(start)) return false;

  
  
  
  output.value = '';
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
    output.value += `Очередь: ${queue.map(el => el.data('id')).join(', ')}\n`;
    console.log('Очередь: ', queue.map(el => el.data('id')).join(', '));
    output.value += `Вершины не в очереди: ${nodeIDs.filter(id => !queue.map(el => el.data('id')).includes(id)).join(', ')}\n`;
    console.log('Вершины не в очереди: ', nodeIDs.filter(id => !queue.map(el => el.data('id')).includes(id)).join(', '));
    currNode = queue.pop();
    currNode.edgesWith(`#${prevID}`).select();
    visited.add(currNode);
    currNode.select();
    output.value += `Посещенные вершины: ${Array.from(visited).map(el => el.data('id')).join(', ')}\n`;
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

    output.value += `--------------\n`;
    console.log('--------------');
  }
  return false;   
}

function ACO(numberOfAnts) {
  unselect();
  const ants = Number(numberOfAnts);
  const iters = Number(nIters.value)
  const decay = 0.8;
  const alpha = 1;
  const beta = 0;
  const Q = 1;
  let allPaths;
  if (isNaN(numberOfAnts) || isNaN(iters)) return;
  output.value = '';

  const pheromone = graph.nodes.reduce((obj, node) => {
    const neighbors = cy.nodes(`#${node.data.id}`).neighborhood().nodes().map(node => node.data('id'));
    obj[node.data.id] = neighbors.map(neighbor => {
        return {node: neighbor, ph: 0}
    }
    );
    return obj;
  }, {});

  let optimalPath;
  let i = 0;

  iterations = iters;

  

  while (i < iters) {
    allPaths = genAllPaths();
    phDecay(); 
    spreadPh();
    console.log('Феромоны (изм.): ', pheromone);

    optimalPath = getOptimalPath();
    console.log('Optimal ',optimalPath);
    i++;

  }

  function genPath() {
    const cameFrom = {};
    cameFrom[start] = null;

    let current = start;


    while (current !== finish) {
      let next = pickMove(cameFrom, current);

      console.log(next);
      if (next == -1) return -1;

      cameFrom[next] = current;
      current = next;


    }

    delete cameFrom[start];
    return cameFrom;


  }

  function pickMove(visited, current) {
    // const phRow = pheromone[current].map(n => n.node).reduce((obj, node) => {
    //   obj[node] = cy.nodes(`#${current}`).edgesWith(`#${node}`).data('weight');

    //   return obj;
    // }, {});

    const phRow = pheromone[current].map(n => n).reduce((obj, node) => {
      // obj[node.node] = 50 - cy.nodes(`#${current}`).edgesWith(`#${node.node}`).data('weight');
      obj[node.node] = 1;

      return obj;
    }, {});

    for (let node of Object.keys(visited)) {
      if (Object.keys(phRow).includes(node)) {
        phRow[node] = 0;
      }
    }

    console.log(phRow);
    console.log(pheromone);


    let wayToEsc = Object.keys(phRow).length;

    for (let way of Object.keys(phRow)) {
      if (phRow[way] == 0) {
        wayToEsc -= 1;
        if (wayToEsc == 0) return -1;
      }
    }
    
    const distr = [];

    for (let move of pheromone[current].map(n => n.node)) {
      distr.push(phRow[move] ** alpha * (1.0 / cy.nodes(`#${current}`).edgesWith(`#${move}`).data('weight')) ** beta)
    }

    
    let sumOfDistr = distr.reduce((sum, d) => {
      sum += d;
      return sum;
    }, 0);

    
    for (let i = 0; i < distr.length; i++) {
      distr[i] /= sumOfDistr;
    }
    const move = (function() {
      let num = Math.random(), s = 0, lstIndx = distr.length - 1;

      for (let i = 0; i < lstIndx; ++i) {
        s += distr[i];
        if (num < s) 
          return Array.from(Object.keys(phRow))[i];
      }
      return Array.from(Object.keys(phRow))[lstIndx];
    })();
    return move;
  }

  function phDecay() {
    for (let i of Object.keys(pheromone)) {
      for (let j of pheromone[i]) {
       j.ph *= (1 - decay);
      }
    }
  }

  function getOptimalPath() {
    const visited = [];

    let current = start;

    visited.push(start);

    while (current != finish) {
      let nextMove = -1;

      const currentNeighbors = pheromone[current].sort((a, b) => b.ph - a.ph);
      for (let neighbor of currentNeighbors) {
        if (!visited.includes(neighbor.node)) {
          nextMove = neighbor.node;
          current = nextMove;

          visited.push(current);
          break;
        }
      }

      if (nextMove == -1) return -1;
    }
    return visited;
  }

  function spreadPh() {
    console.log('Пути: ', allPaths);
    allPaths.forEach(way => {
      Object.keys(way.path).forEach(to => {
          for(let direction of pheromone[to]) {
            if (direction.node == way.path[to]) {
                let dist = cy.nodes(`#${to}`).edgesWith(`#${direction.node}`).data('weight');
                direction.ph += Q / dist;
                pheromone[way.path[to]].forEach(n => {
                  if (n.node == to) {
                    n.ph += Q / dist;
                  }
                });
              }
          }
        
      });
    })
  }

  function genAllPaths() {
    const allPaths = [];

    for(let i = 0; i < ants; i++) {
      const path = genPath();
      if (path == -1) continue;
      let totalCost = Object.keys(path).reduce((pathLen, node) => {
        return pathLen +  cy.$(`#${node}`).edgesWith(`#${path[node]}`).data('weight');
      }, 0);
      allPaths.push({path, totalCost});

    }
    
    return allPaths;
  }



}




