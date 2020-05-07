/*
 * @Author: Caven
 * @Date: 2020-02-26 23:05:44
 * @Last Modified by: Caven
 * @Last Modified time: 2020-05-06 14:56:15
 */
import Cesium from '@/namespace'
import Effect from './Effect'

let FogShader = require('../shader/FogShader.glsl')

DC.FogEffect = class extends Effect {
  constructor(id, color, trength = 1) {
    super(id)
    this._trength = trength || 1
    this._color = color || new Cesium.Color(0.8, 0.8, 0.8, 0.5)
    this._state = DC.EffectState.INITIALIZED
    this._addable = true
    this.type = DC.EffectType.FOG
  }

  _mountedHook() {
    let _this = this
    this._delegate = new Cesium.PostProcessStage({
      name: this._id,
      fragmentShader: FogShader,
      uniforms: {
        trength: () => {
          return _this._trength
        },
        fogcolor: () => {
          return _this._color
        }
      }
    })
  }
}

DC.EffectType.FOG = 'fog'
