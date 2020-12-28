import React, { useEffect } from 'react'

import * as d3 from 'd3'
// import {} from '@d3'

const links = [
  { source: 'project', target: 'n2', type: 't1' },
  { source: 'project', target: 'n3', type: 't1' },
  { source: 'project', target: 'n5', type: 't1' },
  { source: 'n3', target: 'n4', type: 't2' },
]

const types = Array.from(new Set(links.map(d => d.type)))
const data = ({
  nodes: Array.from(
    new Set(
      links.flatMap(l => [l.source, l.target])
    ),
    id => ({ id })
  ),
  links
})
const color = d3.scaleOrdinal(types, d3.schemeCategory10)

const height: number = 600
const width: number = 600

function App() {
  useEffect(() => {
    renderChart()
    console.log('use effect')
  })

  // Functions

  function drag(
    selection: d3.Selection<Element | d3.EnterElement | Document | Window | SVGGElement | null, any, SVGGElement, unknown>,
    simulation: d3.Simulation<any, undefined>) {

    console.log('drag')

    function dragstarted(event: any, d: any) {
      console.log('start')
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(this: any, event: any, d: any) {
      // console.log('drag')
      // d.fx = event.x
      // d.fy = event.y
      const me = d3.select(this)
      me.attr('x', event.x)
      me.attr('y', event.y)
    }

    function dragended(event: any, d: any) {
      console.log('end')
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    return d3.drag()
      // .on("start", dragstarted)
      .on("drag", dragged)
      // .on("end", dragended)

    // return selection
  }


  function linkArc(d: any) {
    const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y)
    return `
      M${d.source.x},${d.source.y}
      A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
    `
  }


  function renderChart() {
    let svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any> = d3.select('#chart')

    const links = data.links.map(d => Object.create(d))
    const nodes = data.nodes.map(d => Object.create(d))

    const simulation: d3.Simulation<any, undefined> = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id((d: any) => d.id))
        .force('charge', d3.forceManyBody().strength(-400))
        .force('x', d3.forceX())
        .force('y', d3.forceY())


    svg.attr('viewBox', `${[-width / 2, -height / 2, width, height]}`)
        .style('font', '12px sans-serif')

    // Per-type markers, as they don't inherit styles.
    svg.append('defs')
      .selectAll('marker')
      .data(types)
      .join('marker')
        .attr('id', d => `arrow-${d}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 15)
        .attr('refY', -0.5)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
      .append('path')
        .attr('fill', color)
        .attr('d', 'M0,-5L10,0L0,5')
      // .data(data.nodes)
      //   .join('marker')
      //   .attr('id', d => `node-${d.id}`)

    const url = (d: any) => `url(${new URL(`#arrow-${d.type}`, window.location.href)})`

    const link = svg.append('g')
        .attr('fill', 'none')
        .attr('stroke-width', 1.5)
      .selectAll('path')
      .data(links)
      .join('path')
        .attr('stroke', d => color(d.type))
        .attr('marker-end', url)

    const node = svg.append('g')
        // .attr('fill', '#f00')
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
      .selectAll('g')
      .data(nodes)
      .join('g')
        // .attr('fill', d => color(d.id))
        // .call((
        //   selection: d3.Selection<Element | d3.EnterElement | Document | Window | SVGGElement | null, any, SVGGElement, unknown>) =>
        //     drag(selection, simulation)
        //   )

    node.append('circle')
        .attr('stroke', 'white')
        .attr('stroke-width', 1.5)
        .attr('r', 4)
        .attr('fill', d => color(d.id))

    node.append('text')
        .attr('x', 8)
        .attr('y', '0.31em')
        .text(d => d.id)
        .attr('fill', '#fff')
      .clone(true).lower()
        .attr('fill', 'none')

    node.call((
      selection: d3.Selection<Element | d3.EnterElement | Document | Window | SVGGElement | null, any, SVGGElement, unknown>) =>
        drag(selection, simulation)
      )

    simulation.on('tick', () => {
      link.attr('d', linkArc)
      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    return svg.node()
  }

  function readPackageJson(json: any) {
    const dependencies = Array.from(
      new Set(Object.keys(json.dependencies).map(id => ({ id })))
    )
    const nodes = dependencies

    console.log(nodes)
    const links = dependencies.map((dep) => ({
      source: json.name,
      target: dep.id,
    }))

    console.log(links)
  }

  function readFile(file: File) {
    const fileReader = new FileReader()

    fileReader.addEventListener('load', () => {
      let json = {}
      try {
        // eslint-disable-next-line no-mixed-operators
        json = JSON.parse(fileReader && fileReader.result && fileReader?.result?.toString() || '')
        readPackageJson(json)
      } catch (e) {
        console.error(e)
      }
    })

    fileReader.readAsText(file)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files: FileList | null = e.target.files

    if (files && files[0]) {
      console.log('>>', files[0].name)
      readFile(files[0])
    }
  }

  return (
    <div>
      <input onChange={handleFileChange} type="file"/>
      <svg id="chart" />
    </div>
  )
}

export default App
