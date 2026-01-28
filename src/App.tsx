import React, { useState, useEffect } from 'react'
import Visualization from './components/Visualization'
import { numSquaresWithSteps, getOptimalPath } from './algorithm'
import './App.css'

function App() {
  const [n, setN] = useState(12)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [result, setResult] = useState<{
    result: number
    snapshots: any[]
    finalDP: number[]
  } | null>(null)

  // 计算算法结果
  useEffect(() => {
    const data = numSquaresWithSteps(n)
    setResult(data)
    setCurrentStep(0)
    setIsPlaying(false)
  }, [n])

  // 自动播放
  useEffect(() => {
    if (!isPlaying || !result) return

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= result.snapshots.length - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 2500) // 增加播放间隔，让动画更清晰

    return () => clearInterval(interval)
  }, [isPlaying, result])

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleNext = () => {
    if (result && currentStep < result.snapshots.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePlay = () => {
    if (result && currentStep >= result.snapshots.length - 1) {
      setCurrentStep(0)
    }
    setIsPlaying(!isPlaying)
  }

  const currentSnapshot = result?.snapshots[currentStep]

  return (
    <div className="app">
      <div className="header">
        <h1>LeetCode 279 - 完全平方数</h1>
        <p className="subtitle">动态规划算法可视化演示</p>
      </div>

      <div className="controls">
        <div className="input-group">
          <label htmlFor="n-input">输入 n：</label>
          <input
            id="n-input"
            type="number"
            min="1"
            max="100"
            value={n}
            onChange={(e) => setN(parseInt(e.target.value) || 1)}
          />
        </div>

        <div className="step-controls">
          <button onClick={handlePrev} disabled={currentStep === 0}>
            上一步
          </button>
          <button onClick={handlePlay}>
            {isPlaying ? '暂停' : '播放'}
          </button>
          <button
            onClick={handleNext}
            disabled={result ? currentStep >= result.snapshots.length - 1 : true}
          >
            下一步
          </button>
        </div>

        <div className="step-info">
          <span>
            步骤 {currentStep + 1} / {result?.snapshots.length || 0}
          </span>
        </div>
      </div>

      {result && currentSnapshot && (
        <div className="main-content">
          <div className="sidebar">
            <div className="result-panel">
              <div className="result-card">
                {currentStep === result.snapshots.length - 1 ? (
                  <div className="result-value">
                    最终结果：数字 <strong>{n}</strong> 最少需要 <strong>{result.result}</strong> 个完全平方数
                  </div>
                ) : (
                  <div className="result-value">
                    正在计算：数字 <strong>{currentSnapshot.i}</strong>
                  </div>
                )}
              </div>
            </div>

            <div className="explanation-panel">
              <div className="explanation-card">
                <h3>📖 当前步骤说明</h3>
                <div className="explanation-text">
                  {currentSnapshot.explanation.split('\n').map((line, idx) => (
                    <p key={idx} style={{ margin: line.trim() ? '4px 0' : '2px 0', whiteSpace: 'pre-wrap' }}>
                      {line.trim() || '\u00A0'}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="visualization-wrapper">
            <Visualization
              snapshot={currentSnapshot}
              n={n}
              isFinal={currentStep === result.snapshots.length - 1}
              finalDP={result.finalDP}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default App

