// https://observablehq.com/@annassanchez/parallel-sets-2-clasificacion-y-usos-del-suelo@317
export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["sankey_class_usos_clasi.csv",new URL("./files/ea7ee830aacb9fe1509e308a7dccb8c5b9aa55e12b382c43c5853e61e99d13d4166f4597a35019d6933934eb01322cb2d1e806431b81041e8db38696415509a1",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# Parallel Sets #2: clasificación y usos del suelo

[Parallel sets](https://kosara.net/publications/Bendix_InfoVis_2005.html) (o distribuciones paralelas) son como   [parallel coordinates](/@d3/parallel-coordinates) (o coordenadas paralelas), pero para dimensiones categóricas. El ancho de cada curva representa la cantidad de veces que se repite la la subdivisión de cada categoría. `
)});
  main.variable(observer("chart")).define("chart", ["d3","width","height","sankey","graph","color"], function(d3,width,height,sankey,graph,color)
{
  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height]);

  const {nodes, links} = sankey({
    nodes: graph.nodes.map(d => Object.assign({}, d)),
    links: graph.links.map(d => Object.assign({}, d))
  });

  svg.append("g")
    .selectAll("rect")
    .data(nodes)
    .join("rect")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("height", d => d.y1 - d.y0)
      .attr("width", d => d.x1 - d.x0)
    .append("title")
      .text(d => `${d.name}\n${d.value.toLocaleString()}`);

  svg.append("g")
      .attr("fill", "none")
    .selectAll("g")
    .data(links)
    .join("path")
      .attr("d", d3.sankeyLinkHorizontal())
      .attr("stroke", d => color(d.names[0]))
      .attr("stroke-width", d => d.width)
      .style("mix-blend-mode", "multiply")
    .append("title")
      .text(d => `${d.names.join(" → ")}\n${d.value.toLocaleString()}`);

  svg.append("g")
      .style("font", "10px sans-serif")
    .selectAll("text")
    .data(nodes)
    .join("text")
      .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr("y", d => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
      .text(d => d.name)
    .append("tspan")
      .attr("fill-opacity", 0.7)
      .text(d => ` ${d.value.toLocaleString()}`);

  return svg.node();
}
);
  main.variable(observer("width")).define("width", function(){return(
1250
)});
  main.variable(observer("height")).define("height", function(){return(
450
)});
  main.variable(observer("sankey")).define("sankey", ["d3","width","height"], function(d3,width,height){return(
d3.sankey()
    .nodeSort(null)
    .linkSort(null)
    .nodeWidth(4)
    .nodePadding(20)
    .extent([[0, 5], [width, height - 5]])
)});
  main.variable(observer("graph")).define("graph", ["keys","data"], function(keys,data)
{
  let index = -1;
  const nodes = [];
  const nodeByKey = new Map;
  const indexByKey = new Map;
  const links = [];

  for (const k of keys) {
    for (const d of data) {
      const key = JSON.stringify([k, d[k]]);
      if (nodeByKey.has(key)) continue;
      const node = {name: d[k]};
      nodes.push(node);
      nodeByKey.set(key, node);
      indexByKey.set(key, ++index);
    }
  }

  for (let i = 1; i < keys.length; ++i) {
    const a = keys[i - 1];
    const b = keys[i];
    const prefix = keys.slice(0, i + 1);
    const linkByKey = new Map;
    for (const d of data) {
      const names = prefix.map(k => d[k]);
      const key = JSON.stringify(names);
      const value = d.value || 1;
      let link = linkByKey.get(key);
      if (link) { link.value += value; continue; }
      link = {
        source: indexByKey.get(JSON.stringify([a, d[a]])),
        target: indexByKey.get(JSON.stringify([b, d[b]])),
        names,
        value
      };
      links.push(link);
      linkByKey.set(key, link);
    }
  }

  return {nodes, links};
}
);
  main.variable(observer("color")).define("color", ["d3"], function(d3){return(
d3.scaleOrdinal(["Urbano", "Urbanizable", "No Urbanizable", "Sistemas Generales", "No definido"], ["#d7191c", "#fdae61", "#ffffbf", "#a6d96a", "#1a9641"]).unknown("#ccc")
)});
  main.variable(observer("keys")).define("keys", ["data"], function(data){return(
data.columns.slice(0, 4)
)});
  main.variable(observer("data")).define("data", ["d3","FileAttachment"], async function(d3,FileAttachment){return(
d3.csvParse(await FileAttachment("sankey_class_usos_clasi.csv").text(), d3.autoType)
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@6", "d3-sankey@0.12")
)});
  return main;
}
