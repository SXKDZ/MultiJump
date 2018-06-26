import * as Three from 'three'
import Tween from 'tween.js'

import {
  random
} from 'lodash'
import * as COLOR from './color.js'

class Object3d {
  constructor ({
    Geometry,
    Material
  }, {
    size,
    position,
    color,
    opacity
  }) {
    this.size = size
    this.position = position
    this.color = color
    this.opacity = opacity

    const cubeGeometry = new Geometry(...this.size)
    const cubeMaterial = new Material(Object.assign({
      color: this.color
    }, opacity === 1 ? {} : {
      transparent: true,
      opacity
    }))
    const object = new Three.Mesh(cubeGeometry, cubeMaterial)
    object.castShadow = true
    object.receiveShadow = true
    object.position.set(...this.position)
    this.object = object
  }

  moveTo ({
    position,
    duration = 1000,
    easing = Tween.Easing.Linear.None,
    delay = 0
  } = {}) {
    return new Promise((resolve, reject) => {
      new Tween.Tween(this.object.position).to(new Three.Vector3(...position), duration).delay(delay).easing(easing).onComplete(resolve).start()
    })
  }

  moveBy ({
    position,
    duration = 1000,
    easing = Tween.Easing.Linear.None,
    delay = 0
  } = {}) {
    return new Promise((resolve, reject) => {
      new Tween.Tween(this.object.position).to(new Three.Vector3(...position).add(this.object.position), duration).delay(delay).easing(easing).onComplete(resolve).start()
    })
  }

  scaleTo ({
    scale,
    duration = 1000,
    easing = Tween.Easing.Linear.None,
    delay = 0
  } = {}) {
    return new Promise((resolve, reject) => {
      new Tween.Tween(this.object.scale).to(new Three.Vector3(...scale), duration).delay(delay).easing(easing).onComplete(resolve).start()
    })
  }

  rotateTo ({
    rotation,
    duration = 1000,
    easing = Tween.Easing.Linear.None
  } = {}) {
    return new Promise((resolve, reject) => {
      new Tween.Tween(this.object.rotation).to(new Three.Vector3(...rotation), duration).easing(easing).onComplete(resolve).start()
    })
  }
  rotateBy ({
    rotation,
    duration = 1000,
    easing = Tween.Easing.Linear.None
  } = {}) {
    return new Promise((resolve, reject) => {
      new Tween.Tween(this.object.rotation).to(new Three.Vector3(...rotation).add(this.object.rotation), duration).easing(easing).onComplete(resolve).start()
    })
  }

  getPosition () {
    return this.object.position
  }

  fall ({
    height = 18,
    delay = 0
  } = {}) {
    return this.moveBy({
      position: [0, -height, 0],
      duration: height / 0.018,
      easing: Tween.Easing.Bounce.Out,
      delay
    })
  }
}

class Cube extends Object3d {
  constructor ({
    size = [10, 6, 10], // [width, height, depth]
    position = [0, 20, 0],
    direction = 'X',
    opacity = 1,
    color
  } = {}) {
    color = color || new Three.Color().setHSL(Math.random(), 0.65, 0.5)
    super({
      Geometry: Three.BoxGeometry,
      Material: Three.MeshLambertMaterial
    }, {
      size,
      position,
      color,
      opacity
    })
    this.direction = direction
  }

  getSize () {
    const {
      width,
      height,
      depth
    } = this.object.geometry.parameters
    return {
      width,
      height,
      depth
    }
  }

  getBounding () {
    const pos = this.getPosition()
    const {
      width,
      height,
      depth
    } = this.getSize()
    return {
      x: {
        max: pos.x + 0.5 * width,
        min: pos.x - 0.5 * width
      },
      y: {
        max: pos.y + 0.5 * height,
        min: pos.y - 0.5 * height
      },
      z: {
        max: pos.z + 0.5 * depth,
        min: pos.z - 0.5 * depth
      }
    }
  }

  contain (point) {
    // console.log('contain para', point)

    if (Object.prototype.toString.apply(point) === '[object Array]') {
      point = new Three.Vector3(...point)
    }
    const {x, y, z} = this.getBounding()
    return (x.min <= point.x) && (point.x <= x.max) &&
        (y.min <= point.y) && (point.y <= y.max) &&
        (z.min <= point.z) && (point.z <= z.max)
  }

  async scale ({
    delay = 0,
    duration
  }) {
    this.object.scale.set(1, 0, 1)
    await this.scaleTo({
      scale: [1, 0.3, 1],
      easing: Tween.Easing.Linear.None,
      duration: duration * 0.1,
      delay
    })
    await this.scaleTo({
      scale: [1, 1, 1],
      easing: Tween.Easing.Elastic.Out,
      duration: duration * 0.9,
      delay
    })
  }
}

class Hero {
  constructor ({
    headSize = [1, 32, 32],
    bodySize = [0.4, 1, 4, 32],
    position = [0, 2, 0],
    color = COLOR.darkBlue,
    opacity = 1
  } = {}) {
    const mesh = new Three.Object3D()
    const material = new Three.MeshLambertMaterial({
      color,
      transparent: opacity !== 1,
      opacity
    })

    this.size = {
      head: headSize,
      body: bodySize
    }

    const head = new Three.Mesh(new Three.SphereGeometry(...headSize), material)
    const body = new Three.Mesh(new Three.CylinderGeometry(...bodySize), material)
    head.position.y = 2
    body.castShadow = head.castShadow = true

    mesh.add(head)
    mesh.add(body)

    mesh.position.set(...position)
    this.object = mesh

    Object.setPrototypeOf(Hero.prototype, Object3d.prototype)

    this.squatTimestamp = null
    this.squatTweens = []
  }

  getSize () {
    return this.size
  }

  rotateAloneZ (z, para) {
    console.log('z', z)
    const size = this.getSize()
    this.object.children.forEach(child => child.position.x -= z)
    this.object.children.forEach(child => child.position.y += size.body[2] * 0.5)

    this.object.position.x += z
    this.object.position.y -= size.body[2] * 0.5

    return this.rotateBy(para)
  }

  rotateAloneX (x, para) {
    console.log('x', x)
    const size = this.getSize()
    this.object.children.forEach(child => child.position.z -= x)
    this.object.children.forEach(child => child.position.y += size.body[2] * 0.5)

    this.object.position.z += x
    this.object.position.y -= size.body[2] * 0.5

    return this.rotateBy(para)
  }

  startSquat (maxDuration = 1500) {
    if (this.squatTweens.length || this.squatTimestamp) {
      return
    }
    this.squatTimestamp = new Date()

    /**
         * head:
         *  hero.object.children[0].position.y : 2 -> .5
         *
         * body:
         *  hero.object.children[1].scale.y : 1 -> .5
         *  hero.object.children[1].position.y : 0 -> -1
         */

    function squatTween (target, delta, easing = Tween.Easing.Linear.None) {
      return {
        tween: new Tween.Tween(target).to(new Three.Vector3(...delta).add(target), maxDuration).easing(easing).start(),
        target,
        from: target.toArray()
      }
    }
    this.squatTweens = [
      squatTween(this.object.children[0].position, [0, -1.5, 0]),
      squatTween(this.object.children[1].scale, [0, -0.5, 0]),
      squatTween(this.object.children[1].position, [0, -1, 0])
    ]
  }

  stopSquat () {
    function restoreTween (target, from, duration = 1000, easing = Tween.Easing.Linear.None) {
      return new Tween.Tween(target).to(new Three.Vector3(...from), duration).easing(easing).start()
    }

    const squatDuration = new Date() - this.squatTimestamp
    const squatRatio = Math.min(squatDuration / 1500, 1)
    this.squatTimestamp = null

    this.squatTweens.forEach(({
      tween,
      target,
      from
    }) => {
      restoreTween(target, from, squatRatio * 200)
      Tween.remove(tween)
    })
    this.squatTweens = []

    return squatRatio
    // return {
    //     promise: this.jump(ratio * 20, squatDuration > 200),
    //     squatDuration
    // }

    // console.log(squatDuration)
  }

  async hop (height, duration, x = 0, z = 0) {
    // await this.moveBy({
    //   position: [0, height, 0],
    //   duration,
    //   easing: Tween.Easing.Quadratic.Out
    // })
    // await this.moveBy({
    //   position: [0, -height, 0],
    //   duration,
    //   easing: Tween.Easing.Quadratic.In
    // })

    const from = this.object.position.clone()
    new Tween
      .Tween()
      .to(null, duration * 2)
      .onUpdate(ratio => {
        this.object.position.x = from.x + x * ratio
        this.object.position.z = from.z + z * ratio
      })
      .start()
    await new Promise(resolve => new Tween
      .Tween()
      .to(null, duration)
      .easing(Tween.Easing.Quadratic.Out)
      .onUpdate(ratio => {
        this.object.position.y = from.y + height * ratio
      })
      .onComplete(resolve)
      .start()
    )
    await new Promise(resolve => new Tween
      .Tween()
      .to(null, duration)
      .easing(Tween.Easing.Quadratic.In)
      .onUpdate(ratio => {
        this.object.position.y = from.y + height * (1 - ratio)
      })
      .onComplete(resolve)
      .start()
    )
  }
  async jump (height, duration, rotate = true, rotateXDirection = true, distance = 0) {
    // console.log(duration)
    rotate && this.rotateBy({
      rotation: [0, 0, (rotateXDirection ? -1 : 1) * Math.PI * 2],
      duration: duration * 2
    }).then(() => {
      this.object.rotation.set(0, 0, 0) // 转完 2 * Pi 之后旋转清零
    })
    await this.hop(height, duration, rotateXDirection * distance, -!rotateXDirection * distance)
    // for (let i = 0; i < 3; ++i) {
    //     console.log(duration, height)
    //     await this.hop(duration, height)
    //     duration /= 2
    //     height /= 4
    // }
  }
}

export {
  Cube,
  Hero
}
