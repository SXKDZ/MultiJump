import { Playground } from './game.js'
import { toHex } from './color.js'
import Tween from 'tween.js'
import { handleStart, handleNoJump, handleJump, handleTerminate, channel } from './socket.js'

const state = {}

const Setter = {
  energy (energy) {
    document.querySelector('#trigger').style.color = energy > 0 ? 'gray' : 'black'
    document.querySelector('#trigger .energy').style.height = energy * 100 + '%'
    document.querySelector('canvas').style.filter = `grayscale(document.querySelector{0.4 * (1 - Math.pow(energy, 1 / 3))})`
  },
  score (score) {
    handleJump()
    document.querySelector('.score .value').innerHTML = score
  },
  scoreColorLight (scoreColorLight) {
    if (scoreColorLight) {
      document.querySelector('#app').classList.add('light')
    } else {
      document.querySelector('#app').classList.remove('light')
    }
  },
  triggerDown (triggerDown) {
    if (triggerDown) {
      document.querySelector('#trigger').classList.add('down')
    } else {
      document.querySelector('#trigger').classList.remove('down')
    }
  },
  color (color) {
    document.querySelector('#trigger .energy').style.backgroundColor = color
  },
  gameover (gameover) {
    if (gameover) {
      document.querySelector('#app').classList.add('gameover')
    } else {
      document.querySelector('#app').classList.remove('gameover')
    }
    document.querySelector('#restart').hidden = !gameover
    document.querySelector('#trigger').hidden = gameover
  },
  status (status) {
    const log = document.querySelector('#log')
    log.innerHTML = ''
    for (let key in status) {
      const div = document.createElement('div')
      div.innerText = `${key}.当前得分 = ${status[key]}`
      log.appendChild(div)
    }
  }
}

function setState (param) {
  Object.assign(state, param)
  for (let key in param) {
    const value = param[key]
    Setter[key](value)
  }
}

function onClick () {
  document.querySelector('#start').removeEventListener('click', onClick)
  document.querySelector('#trigger').classList.add('game')

  const room = document.querySelector('#room').value
  const name = document.querySelector('#name').value
  handleStart(room, name)

  function updateBillboard () {
    const billboard = document.querySelector('#billboard')
    billboard.innerHTML = ''
    fetch(`http://localhost:4000/scoreboard?room=${room}`)
      .then(res => res.json())
      .then(json => {
        const scores = json.reduce((s, x) => Object.assign(s, {
          [x.name]: Math.max(s[x.name] || 0, x.score)
        }), {})
        const scoreList = []
        for (let key in scores) {
          const score = scores[key]
          scoreList.push({score, key})
        }
        scoreList.sort((x, y) => y.score - x.score)
        scoreList.forEach(({score, key}) => {
          const div = document.createElement('div')
          if (key === name) {
            div.className = 'current'
          }
          div.innerText = `${key}.最高分 = ${score}`
          billboard.appendChild(div)
        })
      })
  }
  updateBillboard()

  setState({
    gameover: false,
    score: 0,
    scoreColorLight: false,
    energy: 0,
    color: '#909090',
    triggerDown: false,
    status: {}
  })

  const playground = new Playground(room, false)

  playground.bindEvent('score', score => {
    setState({score})
    handleJump(room, name, -1, score)
  })
  playground.bindEvent('color', color => setState({color: toHex(color)}))
  playground.bindEvent('down', color => setState({triggerDown: true}))
  playground.bindEvent('up', color => setState({triggerDown: false}))

  playground.bindEvent('jump', ({squatRatio, rltvPos, toX}) => handleJump(room, name, squatRatio, state.score, rltvPos, toX))
  playground.bindEvent('energy', e =>
    new Tween.Tween().to(null, 800 + 1200 * e).easing(Tween.Easing.Quadratic.Out).onUpdate(i => setState({energy: e - e * i})).start()
  )
  playground.bindEvent('gameover', color => {
    handleNoJump(room, name, state.score)
    setState({scoreColorLight: true}) // getBrightness(color) < 0.5
    setState({gameover: true})
  })
  playground.startRender()

  channel.on('jump', function (payload) {
    // {
    //   name,
    //   room,
    //   squatRatio,
    //   rltvPos
    //   message: 'jumped'
    // }
    if (payload.room === room && payload.name !== name) {
      setState({
        status: Object.assign(state.status, {
          [payload.name]: payload.score
        })
      })
      if (payload.squatRatio > 0) {
        console.log(payload)
        playground.playersJump(payload)
      }
    }
  })

  channel.on('no-jump', payload => {
    if (payload.room === room) {
      updateBillboard()
      if (payload.name !== name) {
      // console.log('no-jump', payload)
        playground.playersFall(payload.name)
      }
    }
  })
  channel.on('terminate', payload => {
    if (payload.room === room) {
      window.history.go(0)
    }
  })

  document.querySelector('#restart').addEventListener('click', () => {
    setState({
      gameover: false,
      score: 0,
      scoreColorLight: false,
      energy: 0,
      color: '#909090',
      triggerDown: false,
      status: {}
    })
    playground.reset()
  })

  document.querySelector('#shutdown').addEventListener('click', () => {
    handleTerminate(room, name)
  })
}

document.querySelector('#start').addEventListener('click', onClick)

window.state = state
