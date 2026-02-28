import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Visualization from '../Visualization'

describe('Visualization Component', () => {
  const mockSnapshot = {
    step: 1,
    i: 5,
    dp: [0, 1, 2, 3, 1, 2],
    steps: [
      {
        i: 5,
        j: 1,
        square: 1,
        prevValue: 1,
        currentValue: Infinity,
        newValue: 2,
        updated: true,
      },
    ],
    explanation: '测试说明',
  }

  it('应该正确渲染可视化组件', () => {
    const { container } = render(
      <Visualization
        snapshot={mockSnapshot}
        n={5}
        isFinal={false}
        finalDP={[0, 1, 2, 3, 1, 2]}
      />
    )

    expect(container.querySelector('.visualization-container')).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('应该显示最终状态', () => {
    const { container } = render(
      <Visualization
        snapshot={mockSnapshot}
        n={5}
        isFinal={true}
        finalDP={[0, 1, 2, 3, 1, 2]}
      />
    )

    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('应该处理空步骤', () => {
    const emptySnapshot = {
      step: 0,
      i: 0,
      dp: [0],
      steps: [],
      explanation: '初始化',
    }

    const { container } = render(
      <Visualization
        snapshot={emptySnapshot}
        n={0}
        isFinal={false}
        finalDP={[0]}
      />
    )

    expect(container.querySelector('.visualization-container')).toBeInTheDocument()
  })

  it('应该处理多个步骤', () => {
    const multiStepSnapshot = {
      step: 3,
      i: 3,
      dp: [0, 1, 2, 3],
      steps: [
        { i: 3, j: 1, square: 1, prevValue: 2, currentValue: 3, newValue: 3, updated: true },
      ],
      explanation: '多步骤测试',
    }

    const { container } = render(
      <Visualization
        snapshot={multiStepSnapshot}
        n={3}
        isFinal={true}
        finalDP={[0, 1, 2, 3]}
      />
    )

    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('应该处理大的 n 值', () => {
    const largeSnapshot = {
      step: 10,
      i: 10,
      dp: [0, 1, 2, 3, 1, 2, 3, 4, 2, 1, 2],
      steps: [
        { i: 10, j: 1, square: 1, prevValue: 1, currentValue: 2, newValue: 2, updated: true },
        { i: 10, j: 2, square: 4, prevValue: 2, currentValue: 2, newValue: 3, updated: false },
        { i: 10, j: 3, square: 9, prevValue: 1, currentValue: 2, newValue: 2, updated: false },
      ],
      explanation: '大数值测试',
    }

    const { container } = render(
      <Visualization
        snapshot={largeSnapshot}
        n={10}
        isFinal={false}
        finalDP={[0, 1, 2, 3, 1, 2, 3, 4, 2, 1, 2]}
      />
    )

    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
