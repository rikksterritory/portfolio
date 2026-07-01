import { useState, useEffect, useRef } from 'react'

const BREATHING_PATTERNS = {
  '4-4-4': { inhale: 4, hold: 4, exhale: 4, holdAfter: 0, label: '4-4-4' },
  'box':   { inhale: 4, hold: 4, exhale: 4, holdAfter: 4, label: 'Box' },
  '4-7-8': { inhale: 4, hold: 7, exhale: 8, holdAfter: 0, label: '4-7-8' },
}

function BreathBlob() {
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentPattern, setCurrentPattern] = useState('4-4-4')
  const [currentPhase, setCurrentPhase] = useState(0)
  const [progress, setProgress] = useState(0)
  const [countdown, setCountdown] = useState(0)
  const startTimeRef = useRef(null)
  const animationFrameRef = useRef(null)

  const pattern = BREATHING_PATTERNS[currentPattern]
  const phaseNames = ['inhale', 'hold', 'exhale', ...(pattern.holdAfter > 0 ? ['hold'] : [])]
  const phaseDurations = [
    pattern.inhale,
    pattern.hold,
    pattern.exhale,
    ...(pattern.holdAfter > 0 ? [pattern.holdAfter] : []),
  ]

  const getPhaseName = () => {
    const name = phaseNames[currentPhase] || 'inhale'
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      return
    }

    const updateProgress = () => {
      if (!startTimeRef.current) startTimeRef.current = Date.now()

      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const duration = phaseDurations[currentPhase] || phaseDurations[0]
      const newProgress = Math.min((elapsed / duration) * 100, 100)
      const remaining = Math.max(Math.ceil(duration - elapsed), 0)

      setProgress(newProgress)
      setCountdown(remaining)

      if (elapsed >= duration) {
        startTimeRef.current = Date.now()
        setCurrentPhase((prev) => (prev + 1) % phaseNames.length)
        setProgress(0)
      }

      animationFrameRef.current = requestAnimationFrame(updateProgress)
    }

    animationFrameRef.current = requestAnimationFrame(updateProgress)

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [isPlaying, currentPhase, currentPattern])

  useEffect(() => {
    startTimeRef.current = Date.now()
    setProgress(0)
  }, [currentPattern, currentPhase])

  const handlePatternChange = (key) => {
    setCurrentPattern(key)
    setCurrentPhase(0)
    startTimeRef.current = Date.now()
    setProgress(0)
  }

  const circumference = 2 * Math.PI * 54
  const strokeOffset = circumference * (1 - progress / 100)

  // Blob gradient colors shift slightly per phase
  const blobColors = {
    inhale:  ['#9FE870', '#5CC85A', '#163300'],
    hold:    ['#9FE870', '#9FE870', '#265200'],
    exhale:  ['#5CC85A', '#3AA040', '#163300'],
  }
  const phaseKey = (phaseNames[currentPhase] || 'inhale').replace('hold', 'hold')
  const colors = blobColors[phaseKey] || blobColors.inhale

  return (
    <div className="breathblob-container">
      <div className="breathblob-header">
        <span className="breathblob-eyebrow">Breathwork</span>
        <span className="breathblob-title">Find your rhythm</span>
      </div>

      <div className="blob-wrapper">
        {/* Ambient blob */}
        <svg className="morphing-blob" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colors[0]} />
              <stop offset="50%" stopColor={colors[1]} />
              <stop offset="100%" stopColor={colors[2]} />
            </linearGradient>
          </defs>
          <path className="blob-path" fill="url(#blobGradient)" />
        </svg>

        {/* Progress ring */}
        <div className="progress-ring">
          <svg className="progress-svg" viewBox="0 0 120 120">
            <circle
              className="progress-circle-bg"
              cx="60" cy="60" r="54"
              fill="none"
              stroke="#9FE870"
              strokeWidth="2"
            />
            <circle
              className="progress-circle"
              cx="60" cy="60" r="54"
              fill="none"
              stroke="#9FE870"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              transform="rotate(-90 60 60)"
            />
          </svg>
        </div>

        {/* Phase text */}
        <div className="breathing-text" key={`${currentPhase}-${currentPattern}`}>
          <span className="phase-label">{getPhaseName()}</span>
          {isPlaying && <span className="phase-count">{countdown}</span>}
        </div>
      </div>

      <div className="controls">
        <button className="play-pause-btn" onClick={() => setIsPlaying((p) => !p)}>
          {isPlaying ? 'Pause' : 'Resume'}
        </button>

        <div className="pattern-selector">
          {Object.entries(BREATHING_PATTERNS).map(([key, val]) => (
            <button
              key={key}
              className={`pattern-btn ${currentPattern === key ? 'active' : ''}`}
              onClick={() => handlePatternChange(key)}
            >
              {val.label}
            </button>
          ))}
        </div>
      </div>

      <span className="breathblob-footer">Wise Design System · Neptune</span>
    </div>
  )
}

export default BreathBlob
