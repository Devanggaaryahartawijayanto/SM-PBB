"use client"

import { useEffect, useRef } from "react"

const Fireflies = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const c = canvas.getContext("2d")
    if (!c) return

    canvas.width = window.innerWidth
    let w = canvas.width
    canvas.height = window.innerHeight
    let h = canvas.height

    class Firefly {
      x: number
      y: number
      s: number
      ang: number
      v: number

      constructor() {
        this.x = Math.random() * w
        this.y = Math.random() * h
        this.s = Math.random() * 2
        this.ang = Math.random() * 2 * Math.PI
        this.v = (this.s * this.s) / 4
      }

      move() {
        this.x += this.v * Math.cos(this.ang)
        this.y += this.v * Math.sin(this.ang)
        this.ang += Math.random() * 20 * (Math.PI / 180) - 10 * (Math.PI / 180)
      }

      show() {
        if (!c) return
        c.beginPath()
        c.arc(this.x, this.y, this.s, 0, 2 * Math.PI)
        c.fillStyle = Math.random() < 0.5 ? "#fddba3" : "#ff5522"
        c.fill()
      }
    }

    const f: Firefly[] = []

    function draw() {
      if (f.length < 100) {
        for (let j = 0; j < 10; j++) {
          f.push(new Firefly())
        }
      }

      for (let i = 0; i < f.length; i++) {
        f[i].move()
        f[i].show()
        if (f[i].x < 0 || f[i].x > w || f[i].y < 0 || f[i].y > h) {
          f.splice(i, 1)
        }
      }
    }

    function loop() {
      if (c) {
        c.clearRect(0, 0, w, h)
      }
      draw()
      requestAnimationFrame(loop)
    }

    loop()

    const handleResize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      id="firefly-canvas"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0, // Make sure it's behind the login content
        filter: "blur(1px)",
        pointerEvents: "none", // prevent it from blocking clicks
      }}
    />
  )
}

export default Fireflies
