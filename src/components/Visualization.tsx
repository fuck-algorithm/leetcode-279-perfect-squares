import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { DPSnapshot, getOptimalPath } from '../algorithm'
import './Visualization.css'

interface VisualizationProps {
  snapshot: DPSnapshot
  n: number
  isFinal: boolean
  finalDP: number[]
}

const Visualization: React.FC<VisualizationProps> = ({
  snapshot,
  n,
  isFinal,
  finalDP,
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight || 600
    const margin = { top: Math.min(45, height * 0.08), right: 30, bottom: 30, left: 30 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    svg.attr('width', width).attr('height', height)

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // 添加图例说明 - 使用动态字体大小
    const legendFontSize = Math.min(11, chartHeight * 0.018)
    const legendY = -Math.min(30, chartHeight * 0.05)
    g.append('text')
      .attr('x', 0)
      .attr('y', legendY)
      .attr('font-size', legendFontSize + 'px')
      .attr('font-weight', 'bold')
      .attr('fill', '#333')
      .text('📊 DP数组说明：')

    g.append('text')
      .attr('x', 0)
      .attr('y', legendY + Math.min(14, chartHeight * 0.023))
      .attr('font-size', (legendFontSize - 1) + 'px')
      .attr('fill', '#666')
      .text('每个格子：上方数字 = 该数字最少需要的完全平方数个数 | 下方数字 = 目标数字')

    // 定义箭头标记
    const defs = svg.append('defs')
    
    // 绿色箭头（最优选择）
    defs.append('marker')
      .attr('id', 'arrow-green')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 9)
      .attr('refY', 5)
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', '#4caf50')

    // 灰色箭头（尝试）
    defs.append('marker')
      .attr('id', 'arrow-gray')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 9)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', '#999')

    // 红色箭头（最优路径）
    defs.append('marker')
      .attr('id', 'arrow-red')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 9)
      .attr('refY', 5)
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', '#ff5722')

    // DP 数组区域
    const dpAreaY = 0
    const cellWidth = Math.min(50, chartWidth / (n + 1))
    const cellHeight = Math.min(70, chartHeight * 0.15)
    const dpStartX = (chartWidth - cellWidth * (n + 1)) / 2

    // 绘制 DP 数组
    snapshot.dp.forEach((value, index) => {
      const x = dpStartX + index * cellWidth
      const y = dpAreaY

      // 背景矩形
      const rect = g
        .append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', cellWidth - 4)
        .attr('height', cellHeight)
        .attr('fill', value === Infinity ? '#f5f5f5' : '#e3f2fd')
        .attr('stroke', '#333')
        .attr('stroke-width', 2)
        .attr('rx', 6)
        .attr('opacity', index > snapshot.i ? 0.3 : 1)

      // 高亮当前计算的数字 - 添加脉冲动画
      if (index === snapshot.i) {
        rect
          .attr('fill', '#ffeb3b')
          .attr('stroke', '#f57f17')
          .attr('stroke-width', 4)
        
        // 添加脉冲效果
        rect
          .transition()
          .duration(800)
          .attr('stroke-width', 6)
          .transition()
          .duration(800)
          .attr('stroke-width', 4)
          .on('end', function repeat() {
            d3.select(this)
              .transition()
              .duration(800)
              .attr('stroke-width', 6)
              .transition()
              .duration(800)
              .attr('stroke-width', 4)
              .on('end', repeat)
          })
      }

      // 高亮已计算完成的数字
      if (index < snapshot.i && value !== Infinity) {
        rect.attr('fill', '#c8e6c9')
      }

      // 数值文本 - 大字体
      const textValue = value === Infinity ? '∞' : value.toString()
      g.append('text')
        .attr('x', x + cellWidth / 2)
        .attr('y', y + cellHeight / 2 - 8)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', Math.min(20, cellHeight * 0.3) + 'px')
        .attr('font-weight', 'bold')
        .attr('fill', index === snapshot.i ? '#f57f17' : '#333')
        .text(textValue)

      // 索引标签
      g.append('text')
        .attr('x', x + cellWidth / 2)
        .attr('y', y + cellHeight - 3)
        .attr('text-anchor', 'middle')
        .attr('font-size', Math.min(10, cellHeight * 0.15) + 'px')
        .attr('fill', '#666')
        .text(index)
    })

    // 当前数字的可视化分解区域
    const decompositionY = dpAreaY + cellHeight + Math.min(40, chartHeight * 0.08)
    const currentNum = snapshot.i
    let transferY = decompositionY + Math.min(100, chartHeight * 0.18) // 默认值，如果没有步骤

    if (currentNum > 0 && snapshot.steps.length > 0) {
      // 标题：当前数字 - 使用动态字体大小
      const titleFontSize = Math.min(16, chartHeight * 0.025)
      const subtitleFontSize = Math.min(12, chartHeight * 0.02)
      const titleOffset = Math.min(35, chartHeight * 0.06)
      const subtitleOffset = Math.min(18, chartHeight * 0.03)
      
      g.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', decompositionY - titleOffset)
        .attr('text-anchor', 'middle')
        .attr('font-size', titleFontSize + 'px')
        .attr('font-weight', 'bold')
        .attr('fill', '#333')
        .text(`🔍 正在计算数字 ${currentNum}`)

      g.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', decompositionY - subtitleOffset)
        .attr('text-anchor', 'middle')
        .attr('font-size', subtitleFontSize + 'px')
        .attr('fill', '#666')
        .text('尝试所有可能的完全平方数，找出最优方案：')

      // 绘制每个尝试的完全平方数 - 根据可用空间调整大小
      const squareSize = Math.min(35, chartHeight * 0.06)
      const spacing = Math.min(15, chartHeight * 0.025)
      const totalWidth = snapshot.steps.length * (squareSize + spacing) - spacing
      const startX = (chartWidth - totalWidth) / 2

      snapshot.steps.forEach((step, idx) => {
        const squareX = startX + idx * (squareSize + spacing)
        const squareY = decompositionY

        // 完全平方数的可视化 - 用方块表示
        const squareGroup = g.append('g')
          .attr('class', `square-group-${idx}`)

        // 绘制方块（表示完全平方数）
        const squareCount = step.j
        const cols = Math.ceil(Math.sqrt(squareCount))
        const smallSize = squareSize / cols

        for (let row = 0; row < cols; row++) {
          for (let col = 0; col < cols && (row * cols + col) < squareCount; col++) {
            squareGroup
              .append('rect')
              .attr('x', squareX + col * smallSize)
              .attr('y', squareY + row * smallSize)
              .attr('width', smallSize - 1)
              .attr('height', smallSize - 1)
              .attr('fill', step.updated ? '#4caf50' : '#90caf9')
              .attr('stroke', step.updated ? '#2e7d32' : '#1976d2')
              .attr('stroke-width', 1)
              .attr('rx', 2)
              .attr('opacity', 0)
              .transition()
              .delay(idx * 200 + (row * cols + col) * 30)
              .duration(300)
              .attr('opacity', 1)
          }
        }

        // 标签：j² = square
        const labelFontSize = Math.min(11, chartHeight * 0.018)
        squareGroup
          .append('text')
          .attr('x', squareX + squareSize / 2)
          .attr('y', squareY + squareSize + Math.min(15, chartHeight * 0.025))
          .attr('text-anchor', 'middle')
          .attr('font-size', labelFontSize + 'px')
          .attr('font-weight', 'bold')
          .attr('fill', step.updated ? '#4caf50' : '#666')
          .text(`${step.j}² = ${step.square}`)

        // 如果是最优选择，添加选中标记
        if (step.updated) {
          squareGroup
            .append('circle')
            .attr('cx', squareX + squareSize / 2)
            .attr('cy', squareY - 15)
            .attr('r', 12)
            .attr('fill', '#4caf50')
            .attr('opacity', 0)
            .transition()
            .delay(idx * 200 + 500)
            .duration(300)
            .attr('opacity', 1)

          squareGroup
            .append('text')
            .attr('x', squareX + squareSize / 2)
            .attr('y', squareY - 15)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '16px')
            .attr('font-weight', 'bold')
            .attr('fill', 'white')
            .text('✓')
            .attr('opacity', 0)
            .transition()
            .delay(idx * 200 + 500)
            .duration(300)
            .attr('opacity', 1)
        }
      })

      // 绘制转移箭头 - 从 DP 数组到当前数字
      transferY = decompositionY + squareSize + Math.min(45, chartHeight * 0.08)
      snapshot.steps.forEach((step, idx) => {
        const fromX = dpStartX + (step.i - step.square) * cellWidth + cellWidth / 2
        const toX = dpStartX + step.i * cellWidth + cellWidth / 2
        const arrowY = transferY

        // 箭头线
        const arrow = g
          .append('line')
          .attr('x1', fromX)
          .attr('y1', arrowY)
          .attr('x2', toX)
          .attr('y2', arrowY)
          .attr('stroke', step.updated ? '#4caf50' : '#999')
          .attr('stroke-width', step.updated ? 4 : 2)
          .attr('stroke-dasharray', step.updated ? '0' : '5,5')
          .attr('marker-end', step.updated ? 'url(#arrow-green)' : 'url(#arrow-gray)')
          .attr('opacity', 0)

        // 箭头动画
        arrow
          .transition()
          .delay(idx * 200)
          .duration(500)
          .attr('opacity', 1)
          .attrTween('x2', function() {
            return (t: number) => String(d3.interpolate(fromX, toX)(t))
          })

        // 数值标签 - 更详细的说明
        const prevVal = step.prevValue === Infinity ? '∞' : step.prevValue.toString()
        const labelText = step.updated 
          ? `✓ ${prevVal} + 1 = ${step.newValue}（最优！）`
          : `${prevVal} + 1 = ${step.newValue}`
        
        const labelFontSize = Math.min(11, chartHeight * 0.018)
        g.append('text')
          .attr('x', (fromX + toX) / 2)
          .attr('y', arrowY - Math.min(8, chartHeight * 0.015))
          .attr('text-anchor', 'middle')
          .attr('font-size', (step.updated ? labelFontSize + 1 : labelFontSize) + 'px')
          .attr('fill', step.updated ? '#4caf50' : '#999')
          .attr('font-weight', step.updated ? 'bold' : 'normal')
          .text(labelText)
          .attr('opacity', 0)
          .transition()
          .delay(idx * 200 + 300)
          .duration(300)
          .attr('opacity', 1)

        // 添加更详细的说明
        if (step.updated) {
          const detailText = `从 ${step.i - step.square} 转移过来`
          const detailFontSize = Math.min(9, chartHeight * 0.015)
          g.append('text')
            .attr('x', (fromX + toX) / 2)
            .attr('y', arrowY + Math.min(12, chartHeight * 0.02))
            .attr('text-anchor', 'middle')
            .attr('font-size', detailFontSize + 'px')
            .attr('fill', '#4caf50')
            .attr('font-style', 'italic')
            .text(detailText)
            .attr('opacity', 0)
            .transition()
            .delay(idx * 200 + 500)
            .duration(300)
            .attr('opacity', 1)
        }
      })
    }

    // 绘制最优解路径（仅在最后一步显示）
    if (isFinal) {
      const path = getOptimalPath(n, finalDP)
      const pathY = transferY + Math.min(60, chartHeight * 0.1)
      let current = 0

      // 路径标题
      const pathTitleFontSize = Math.min(15, chartHeight * 0.025)
      g.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', pathY - Math.min(15, chartHeight * 0.025))
        .attr('text-anchor', 'middle')
        .attr('font-size', pathTitleFontSize + 'px')
        .attr('font-weight', 'bold')
        .attr('fill', '#ff5722')
        .text('最优解路径')
        .attr('opacity', 0)
        .transition()
        .delay(500)
        .duration(500)
        .attr('opacity', 1)

      path.forEach((square, idx) => {
        const fromX = dpStartX + current * cellWidth + cellWidth / 2
        current += square
        const toX = dpStartX + current * cellWidth + cellWidth / 2

        // 路径箭头 - 动画
        const pathArrow = g
          .append('line')
          .attr('x1', fromX)
          .attr('y1', pathY)
          .attr('x2', fromX)
          .attr('y2', pathY)
          .attr('stroke', '#ff5722')
          .attr('stroke-width', 5)
          .attr('marker-end', 'url(#arrow-red)')
          .attr('opacity', 0)

        pathArrow
          .transition()
          .delay(800 + idx * 400)
          .duration(600)
          .attr('opacity', 1)
          .attrTween('x2', function() {
            return (t: number) => String(d3.interpolate(fromX, toX)(t))
          })

        // 路径标签
        const pathLabelFontSize = Math.min(13, chartHeight * 0.022)
        g.append('text')
          .attr('x', (fromX + toX) / 2)
          .attr('y', pathY - Math.min(12, chartHeight * 0.02))
          .attr('text-anchor', 'middle')
          .attr('font-size', pathLabelFontSize + 'px')
          .attr('fill', '#ff5722')
          .attr('font-weight', 'bold')
          .text(`+${square}`)
          .attr('opacity', 0)
          .transition()
          .delay(800 + idx * 400 + 300)
          .duration(300)
          .attr('opacity', 1)
      })

      // 最终结果展示
      const resultY = pathY + Math.min(40, chartHeight * 0.07)
      const resultText = `${path.join(' + ')} = ${n}`
      const resultFontSize = Math.min(18, chartHeight * 0.03)
      g.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', resultY)
        .attr('text-anchor', 'middle')
        .attr('font-size', resultFontSize + 'px')
        .attr('font-weight', 'bold')
        .attr('fill', '#ff5722')
        .text(resultText)
        .attr('opacity', 0)
        .transition()
        .delay(800 + path.length * 400)
        .duration(500)
        .attr('opacity', 1)
    }
  }, [snapshot, n, isFinal, finalDP])

  return (
    <div className="visualization-container" ref={containerRef}>
      <svg ref={svgRef}></svg>
    </div>
  )
}

export default Visualization
