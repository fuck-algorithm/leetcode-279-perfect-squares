import { describe, it, expect } from 'vitest'
import { numSquaresWithSteps, getOptimalPath } from '../algorithm'

/**
 * **Feature: leetcode-279-perfect-squares, Property 1: 算法正确性**
 *
 * 测试完全平方数算法的核心功能：
 * 1. 对于任何正整数 n，返回最少完全平方数的个数
 * 2. 记录每一步的 DP 状态
 * 3. 能够回溯最优解路径
 */
describe('完全平方数算法测试', () => {
  // 基础测试用例
  describe('基础功能测试', () => {
    it('n = 1 应该返回 1 (1 = 1²)', () => {
      const result = numSquaresWithSteps(1)
      expect(result.result).toBe(1)
      expect(result.finalDP[1]).toBe(1)
    })

    it('n = 2 应该返回 2 (2 = 1² + 1²)', () => {
      const result = numSquaresWithSteps(2)
      expect(result.result).toBe(2)
    })

    it('n = 3 应该返回 3 (3 = 1² + 1² + 1²)', () => {
      const result = numSquaresWithSteps(3)
      expect(result.result).toBe(3)
    })

    it('n = 4 应该返回 1 (4 = 2²)', () => {
      const result = numSquaresWithSteps(4)
      expect(result.result).toBe(1)
      expect(result.finalDP[4]).toBe(1)
    })

    it('n = 12 应该返回 3 (12 = 4 + 4 + 4 = 2² + 2² + 2²)', () => {
      const result = numSquaresWithSteps(12)
      expect(result.result).toBe(3)
    })

    it('n = 13 应该返回 2 (13 = 4 + 9 = 2² + 3²)', () => {
      const result = numSquaresWithSteps(13)
      expect(result.result).toBe(2)
    })
  })

  // 边界测试
  describe('边界测试', () => {
    it('n = 0 应该返回 0', () => {
      const result = numSquaresWithSteps(0)
      expect(result.result).toBe(0)
    })

    it('n = 100 应该返回正确结果', () => {
      const result = numSquaresWithSteps(100)
      // 100 = 10²，所以应该是 1
      expect(result.result).toBe(1)
    })
  })

  // 快照测试
  describe('DP 快照测试', () => {
    it('应该生成正确的 DP 快照', () => {
      const result = numSquaresWithSteps(5)
      expect(result.snapshots.length).toBeGreaterThan(0)
      expect(result.snapshots[0].step).toBe(0)
      expect(result.snapshots[0].dp[0]).toBe(0)
    })

    it('每个快照应该包含正确的字段', () => {
      const result = numSquaresWithSteps(3)
      const snapshot = result.snapshots[1]
      expect(snapshot).toHaveProperty('step')
      expect(snapshot).toHaveProperty('i')
      expect(snapshot).toHaveProperty('dp')
      expect(snapshot).toHaveProperty('steps')
      expect(snapshot).toHaveProperty('explanation')
    })
  })

  // 最优路径测试
  describe('最优路径测试', () => {
    it('getOptimalPath 应该返回正确的分解', () => {
      const n = 12
      const result = numSquaresWithSteps(n)
      const path = getOptimalPath(n, result.finalDP)

      // 路径的和应该等于 n
      const sum = path.reduce((a, b) => a + b, 0)
      expect(sum).toBe(n)

      // 每个元素都应该是完全平方数
      path.forEach((num) => {
        const sqrt = Math.sqrt(num)
        expect(Number.isInteger(sqrt)).toBe(true)
      })

      // 路径长度应该等于结果
      expect(path.length).toBe(result.result)
    })

    it('n = 1 的路径应该是 [1]', () => {
      const result = numSquaresWithSteps(1)
      const path = getOptimalPath(1, result.finalDP)
      expect(path).toEqual([1])
    })

    it('n = 4 的路径应该是 [4]', () => {
      const result = numSquaresWithSteps(4)
      const path = getOptimalPath(4, result.finalDP)
      expect(path).toEqual([4])
    })
  })

  // 数学性质测试（拉格朗日四平方和定理）
  describe('数学性质测试', () => {
    it('任何正整数最多只需要 4 个完全平方数', () => {
      // 测试 1 到 50 的所有数字
      for (let n = 1; n <= 50; n++) {
        const result = numSquaresWithSteps(n)
        expect(result.result).toBeLessThanOrEqual(4)
      }
    })

    it('完全平方数的结果应该是 1', () => {
      // 测试 1, 4, 9, 16, 25, 36, 49
      const squares = [1, 4, 9, 16, 25, 36, 49]
      squares.forEach((n) => {
        const result = numSquaresWithSteps(n)
        expect(result.result).toBe(1)
      })
    })
  })
})
