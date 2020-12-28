import React, { useEffect, useState } from 'react'

import * as d3 from 'd3'

interface Link {
  source: string
  target: string
  version: string
}

const height: number = 600
const width: number = 600

// const colors = d3.scaleOrdinal()

function App() {
  const [links, setLinks] = useState<Link[]>([])
  const [nodes, setNodes] = useState<any[]>([])
  let svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any> = d3.select('#somewhere')

  useEffect(() => {
    svg = d3.select('#chart')
  }, [links])

  useEffect(() => {
    renderChart()
    console.log('use effect')
  }, [links])

  // Functions

  function linkArc(d: any) {
    const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y)
    return `
      M${d.source.x},${d.source.y}
      A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
    `
  }


  function renderChart() {
    // let svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any> = d3.select('#chart')

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
      .data(['test'])
      .join('marker')
        .attr('id', 'arrow')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 15)
        .attr('refY', -0.5)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
      .append('path')
        .attr('fill', '#ff0')
        .attr('d', 'M0,-5L10,0L0,5')


    // const url = (d: any) => `url(${new URL(`#arrow-${d.type}`, window.location.href)})`
    const url = (d: any) => `url(${new URL('#arrow', window.location.href)})`

    const link = svg.append('g')
        .attr('fill', 'none')
        .attr('stroke-width', 1.5)
      .selectAll('path')
      .data(links)
      .join('path')
        // .attr('stroke', d => color(d.type))
        .attr('stroke','#ff0')
        .attr('marker-end', url)

    const node = svg.append('g')
        // .attr('fill', '#f00')
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
      .selectAll('g')
      .data(nodes)
      .join('g')

    node.append('circle')
        .attr('stroke', 'white')
        .attr('stroke-width', 1.5)
        .attr('r', 4)
        // .attr('fill', d => color(d.id))
        .attr('fill', '#fff')

    node.append('text')
        .attr('x', 8)
        .attr('y', '0.31em')
        .text(d => d.id)
        .attr('fill', '#fff')
      .clone(true).lower()
        .attr('fill', 'none')

    // node.call((
    //   selection: d3.Selection<Element | d3.EnterElement | Document | Window | SVGGElement | null, any, SVGGElement, unknown>) =>
    //     drag(selection, simulation)
    //   )

    simulation.on('tick', () => {
      link.attr('d', linkArc)
      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    return svg.node()
  }

  function readPackageJson(json: any) {
    const dependencies = Array.from(
      new Set(
        [
          ...Object.keys(json.dependencies)
            .map(id => ({ id, version: json.dependencies[id] })),
          { id: json.name, version: json.version || '' },
        ]
      )
    )
    const nodes = dependencies

    const links = dependencies.reduce((stack: Link[], next: any) => {
      const link: Link = {
        source: json.name,
        target: next.id,
        version: next.version,
      }

      if (link.source !== link.target) {
        return ([
          ...stack,
          link
        ])
      }

      return stack
    }, [])

    console.log(nodes)
    console.log(links)

    setNodes(nodes)
    setLinks(links)
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
