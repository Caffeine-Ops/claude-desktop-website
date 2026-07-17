'use client'

/*
  全站共享的指针位置（Motion 的 MotionValue 版）。

  MotionValue 是 Motion 的「可订阅数值」：写它不触发 React 重渲染，
  订阅它的动画每帧直接读——这正是鼠标跟随类动效要的性质（一秒几十次
  的坐标更新走 React state 会把整棵树刷炸）。

  光斑、磁性按钮、终端 3D、内容墙视差全都订阅这同一对值：
  整页只挂一个 pointermove 监听，而不是每个组件各挂一个。
*/

import { motionValue } from 'motion/react'

export const pointerX = motionValue(0)
export const pointerY = motionValue(0)

let started = false

/** 幂等的启动：谁先用谁调，多次调用只挂一次监听。 */
export function ensurePointerTracking() {
  if (started || typeof window === 'undefined') return
  started = true
  pointerX.set(window.innerWidth / 2)
  pointerY.set(window.innerHeight / 2)
  window.addEventListener(
    'pointermove',
    (e) => {
      pointerX.set(e.clientX)
      pointerY.set(e.clientY)
    },
    { passive: true },
  )
}
