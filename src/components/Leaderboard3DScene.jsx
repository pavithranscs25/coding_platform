import { useEffect, useRef } from 'react'

export default function Leaderboard3DScene() {
  const containerRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    let cleanup

    import('three')
      .then((THREE) => {
        if (!cancelled) cleanup = createPodiumScene(containerRef.current, THREE)
      })
      .catch((error) => console.warn('Leaderboard podium scene could not load:', error))

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [])

  return <div className="leaderboard-3d-scene" ref={containerRef} aria-hidden="true" />
}

function createPodiumScene(container, THREE) {
  if (!container) return undefined

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  const geometries = []
  const materials = []
  const textures = []
  let animationFrame
  let resizeObserver

  try {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50)
    camera.position.set(0, 2.5, 7.5)
    camera.lookAt(0, 1.35, 0)

    scene.add(new THREE.AmbientLight(0xffffff, 1.1))
    const keyLight = new THREE.DirectionalLight(0xffe4a2, 2.3)
    keyLight.position.set(-3, 6, 5)
    scene.add(keyLight)
    const fillLight = new THREE.PointLight(0x64b5ff, 13, 12)
    fillLight.position.set(3, 3, 3)
    scene.add(fillLight)

    const podium = new THREE.Group()
    podium.position.y = -0.12
    scene.add(podium)

    const makeMaterial = (color, options = {}) => {
      const material = new THREE.MeshStandardMaterial({ color, metalness: 0.62, roughness: 0.32, ...options })
      materials.push(material)
      return material
    }
    const makeGeometry = (geometry) => {
      geometries.push(geometry)
      return geometry
    }

    podium.add(new THREE.Mesh(
      makeGeometry(new THREE.CylinderGeometry(2.35, 2.45, 0.16, 64)),
      makeMaterial('#192334', { metalness: 0.48, roughness: 0.4 })
    ))

    const places = [
      { rank: 2, x: -1.2, height: 1.18, color: '#9baec7', glow: '#dce8f7' },
      { rank: 1, x: 0, height: 1.8, color: '#d9a940', glow: '#ffe3a1' },
      { rank: 3, x: 1.2, height: 0.9, color: '#b8764c', glow: '#e6a47b' },
    ]

    places.forEach(({ rank, x, height, color, glow }) => {
      const block = new THREE.Mesh(
        makeGeometry(new THREE.BoxGeometry(0.92, height, 0.72)),
        makeMaterial(color)
      )
      block.position.set(x, 0.08 + height / 2, 0)
      podium.add(block)

      const edge = new THREE.LineSegments(
        makeGeometry(new THREE.EdgesGeometry(block.geometry)),
        new THREE.LineBasicMaterial({ color: glow, transparent: true, opacity: 0.7 })
      )
      materials.push(edge.material)
      edge.position.copy(block.position)
      podium.add(edge)

      const coin = new THREE.Mesh(
        makeGeometry(new THREE.CylinderGeometry(0.2, 0.2, 0.075, 32)),
        makeMaterial(glow, { metalness: 0.72, roughness: 0.22 })
      )
      coin.rotation.x = Math.PI / 2
      coin.position.set(x, height + 0.37, 0.1)
      podium.add(coin)

      const numberCanvas = document.createElement('canvas')
      numberCanvas.width = 128
      numberCanvas.height = 128
      const context = numberCanvas.getContext('2d')
      context.fillStyle = '#17202c'
      context.font = '700 76px sans-serif'
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(String(rank), 64, 66)
      const numberTexture = new THREE.CanvasTexture(numberCanvas)
      textures.push(numberTexture)

      const number = new THREE.Mesh(
        makeGeometry(new THREE.CircleGeometry(0.145, 32)),
        new THREE.MeshBasicMaterial({ map: numberTexture, transparent: true, toneMapped: false })
      )
      materials.push(number.material)
      number.position.set(x, height + 0.37, 0.144)
      podium.add(number)

      const rim = new THREE.Mesh(
        makeGeometry(new THREE.TorusGeometry(0.23, 0.018, 8, 32)),
        makeMaterial(color, { metalness: 0.7, roughness: 0.25 })
      )
      rim.position.set(x, height + 0.37, 0.12)
      podium.add(rim)
    })

    const render = () => {
      renderer.render(scene, camera)
    }
    const resize = () => {
      const { clientWidth: width, clientHeight: height } = container
      if (!width || !height) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
      render()
    }

    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    resize()

    if (!reducedMotion) {
      const animate = (time) => {
        podium.rotation.y = Math.sin(time * 0.00035) * 0.055
        render()
        animationFrame = window.requestAnimationFrame(animate)
      }
      animationFrame = window.requestAnimationFrame(animate)
    }

    return () => {
      window.cancelAnimationFrame(animationFrame)
      resizeObserver?.disconnect()
      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((material) => material.dispose())
      textures.forEach((texture) => texture.dispose())
      renderer.dispose()
      renderer.domElement.remove()
    }
  } catch (error) {
    console.warn('Leaderboard podium scene could not initialize:', error)
    geometries.forEach((geometry) => geometry.dispose())
    materials.forEach((material) => material.dispose())
    textures.forEach((texture) => texture.dispose())
    renderer.dispose()
    renderer.domElement.remove()
  }

  return undefined
}