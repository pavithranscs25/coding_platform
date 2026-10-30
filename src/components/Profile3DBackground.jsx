import { useEffect, useRef } from 'react'

export default function Profile3DBackground() {
  const containerRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    let cleanup

    import('three')
      .then((THREE) => {
        if (!cancelled) cleanup = initializeScene(containerRef.current, THREE)
      })
      .catch((error) => console.warn('Profile background could not load Three.js:', error))

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  return <div className="profile-3d-background" ref={containerRef} aria-hidden="true" />
}

function initializeScene(container, THREE) {
  if (!container) return undefined

  const isMobile = window.matchMedia('(max-width: 700px)').matches
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const particleCount = isMobile ? 34 : 72
  let renderer
  let animationFrame
  let resizeObserver
  let geometry
  let pointMaterial
  let lineGeometry
  let lineMaterial

  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !isMobile })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5))
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 40)
    camera.position.z = 8

    const group = new THREE.Group()
    scene.add(group)

    const positions = new Float32Array(particleCount * 3)
    for (let index = 0; index < particleCount; index += 1) {
      positions[index * 3] = (Math.random() - 0.5) * 10
      positions[index * 3 + 1] = (Math.random() - 0.5) * 6
      positions[index * 3 + 2] = (Math.random() - 0.5) * 3
    }

    geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    pointMaterial = new THREE.PointsMaterial({
      color: getComputedStyle(document.documentElement).getPropertyValue('--ac2').trim() || '#4aa3ff',
      size: isMobile ? 0.035 : 0.045,
      transparent: true,
      opacity: 0.58,
      sizeAttenuation: true,
      depthWrite: false,
    })
    group.add(new THREE.Points(geometry, pointMaterial))

    const segments = []
    const threshold = isMobile ? 1.45 : 1.3
    for (let left = 0; left < particleCount; left += 1) {
      for (let right = left + 1; right < particleCount; right += 1) {
        const leftOffset = left * 3
        const rightOffset = right * 3
        const dx = positions[leftOffset] - positions[rightOffset]
        const dy = positions[leftOffset + 1] - positions[rightOffset + 1]
        const dz = positions[leftOffset + 2] - positions[rightOffset + 2]
        if (dx * dx + dy * dy + dz * dz < threshold * threshold) {
          segments.push(
            positions[leftOffset], positions[leftOffset + 1], positions[leftOffset + 2],
            positions[rightOffset], positions[rightOffset + 1], positions[rightOffset + 2]
          )
        }
      }
    }

    lineGeometry = new THREE.BufferGeometry()
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(segments, 3))
    lineMaterial = new THREE.LineBasicMaterial({
      color: getComputedStyle(document.documentElement).getPropertyValue('--ac').trim() || '#7c6cff',
      transparent: true,
      opacity: 0.15,
      depthWrite: false,
    })
    group.add(new THREE.LineSegments(lineGeometry, lineMaterial))

    const resize = () => {
      const width = container.clientWidth
      const height = container.clientHeight
      if (!width || !height) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
      renderer.render(scene, camera)
    }

    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    resize()

    let pointerX = 0
    let pointerY = 0
    const onPointerMove = (event) => {
      pointerX = (event.clientX / window.innerWidth - 0.5) * 2
      pointerY = (event.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })

    const animate = (time) => {
      group.rotation.y = Math.sin(time * 0.00012) * 0.035 + pointerX * (isMobile ? 0.015 : 0.045)
      group.rotation.x = Math.cos(time * 0.0001) * 0.018 - pointerY * (isMobile ? 0.008 : 0.025)
      renderer.render(scene, camera)
      if (!reducedMotion) animationFrame = window.requestAnimationFrame(animate)
    }

    if (reducedMotion) {
      renderer.render(scene, camera)
    } else {
      animationFrame = window.requestAnimationFrame(animate)
    }

    return () => {
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('pointermove', onPointerMove)
      resizeObserver?.disconnect()
      geometry?.dispose()
      pointMaterial?.dispose()
      lineGeometry?.dispose()
      lineMaterial?.dispose()
      renderer?.dispose()
      renderer?.domElement.remove()
    }
  } catch (error) {
    console.warn('Profile background could not initialize WebGL:', error)
    renderer?.dispose()
    renderer?.domElement.remove()
    geometry?.dispose()
    pointMaterial?.dispose()
    lineGeometry?.dispose()
    lineMaterial?.dispose()
  }

  return undefined
}
