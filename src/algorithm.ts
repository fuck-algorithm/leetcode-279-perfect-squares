// DP 转移步骤记录
export interface DPStep {
  i: number; // 当前计算的数字
  j: number; // 尝试的完全平方数根
  square: number; // 完全平方数 j*j
  prevValue: number; // dp[i - square] 的值
  currentValue: number; // dp[i] 的当前值
  newValue: number; // dp[i] 的新值（如果更新）
  updated: boolean; // 是否更新了 dp[i]
}

// DP 状态快照
export interface DPSnapshot {
  step: number; // 步骤编号
  i: number; // 当前计算的数字
  dp: number[]; // 当前 DP 数组状态
  steps: DPStep[]; // 这一步的所有转移尝试
  explanation: string; // 这一步的解释
}

// 计算完全平方数的最少数量，并记录每一步
export function numSquaresWithSteps(n: number): {
  result: number;
  snapshots: DPSnapshot[];
  finalDP: number[];
} {
  const dp: number[] = new Array(n + 1).fill(Infinity);
  dp[0] = 0;
  const snapshots: DPSnapshot[] = [];

  // 初始状态快照
  snapshots.push({
    step: 0,
    i: 0,
    dp: [...dp],
    steps: [],
    explanation: '初始化：dp[0] = 0（0 需要 0 个完全平方数）',
  });

  let stepCount = 1;

  // 计算 dp[1] 到 dp[n]
  for (let i = 1; i <= n; i++) {
    const steps: DPStep[] = [];
    let minValue = Infinity;
    let bestJ = -1;

    // 尝试所有可能的完全平方数
    for (let j = 1; j * j <= i; j++) {
      const square = j * j;
      const prevValue = dp[i - square];
      const newValue = prevValue + 1;
      const currentValue = dp[i];

      const step: DPStep = {
        i,
        j,
        square,
        prevValue,
        currentValue,
        newValue,
        updated: false,
      };

      // 如果新值更小，更新
      if (newValue < minValue) {
        minValue = newValue;
        bestJ = j;
        step.updated = true;
      }

      steps.push(step);
    }

    // 更新 dp[i]
    if (minValue < Infinity) {
      dp[i] = minValue;
    }

    // 标记最佳转移
    steps.forEach((step) => {
      if (step.j === bestJ) {
        step.updated = true;
      }
    });

    // 创建详细的说明文案
    let explanation = '';
    
    if (steps.length === 0) {
      explanation = `计算 dp[${i}]：无法表示（没有可用的完全平方数）`;
    } else {
      explanation = `🎯 目标：计算数字 ${i} 最少需要多少个完全平方数\n\n`;
      explanation += `💡 思路：尝试所有可能的完全平方数（1², 2², 3²...），看看哪个能给出最小的结果\n\n`;
      explanation += `📊 尝试过程：\n\n`;
      
      // 列出所有尝试的选项
      steps.forEach((step, idx) => {
        const prevVal = step.prevValue === Infinity ? '∞' : step.prevValue.toString();
        const marker = step.updated ? '✅' : '  ';
        const status = step.updated ? '（最优！）' : '';
        
        explanation += `${marker} 选项 ${idx + 1}：使用 ${step.j}² = ${step.square}\n`;
        explanation += `   └─ 如果使用 ${step.square}，那么剩余 ${i - step.square}\n`;
        explanation += `   └─ 数字 ${i - step.square} 最少需要 ${prevVal} 个完全平方数\n`;
        explanation += `   └─ 所以：${prevVal} + 1 = ${step.newValue} 个完全平方数${status}\n`;
        
        if (idx < steps.length - 1) {
          explanation += '\n';
        }
      });
      
      explanation += `\n✨ 最终选择：dp[${i}] = ${dp[i]}\n`;
      explanation += `   数字 ${i} 最少需要 ${dp[i]} 个完全平方数`;
      
      // 添加具体例子 - 使用 bestJ 确保找到最优路径
      if (dp[i] < Infinity && bestJ > 0) {
        const bestStep = steps.find(s => s.j === bestJ);
        if (bestStep) {
          explanation += `\n\n📝 举例：${i} = ${i - bestStep.square} + ${bestStep.square} = ${i - bestStep.square} + ${bestStep.j}²`;
        }
      }
    }

    snapshots.push({
      step: stepCount++,
      i,
      dp: [...dp],
      steps: [...steps],
      explanation,
    });
  }

  return {
    result: dp[n],
    snapshots,
    finalDP: dp,
  };
}

// 获取最优解的路径
export function getOptimalPath(n: number, dp: number[]): number[] {
  const path: number[] = [];
  let current = n;

  while (current > 0) {
    for (let j = 1; j * j <= current; j++) {
      const square = j * j;
      if (dp[current] === dp[current - square] + 1) {
        path.push(square);
        current -= square;
        break;
      }
    }
  }

  return path;
}

