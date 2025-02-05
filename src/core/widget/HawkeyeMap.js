/**
 * @Author: Caven
 * @Date: 2020-03-15 17:47:42
 */

import { DomUtil, Util } from '../utils'
import { SceneEventType } from '../event'
import State from '../state/State'
import Widget from './Widget'

const { Cesium } = DC.Namespace

const DEF_OPTS = {
  animation: false,
  baseLayerPicker: false,
  fullscreenButton: false,
  geocoder: false,
  homeButton: false,
  infoBox: false,
  sceneModePicker: false,
  selectionIndicator: false,
  timeline: false,
  navigationHelpButton: false,
  navigationInstructionsInitiallyVisible: false,
  creditContainer: undefined
}

class HawkeyeMap extends Widget {
  constructor() {
    super()
    this._wrapper = DomUtil.create('div', 'dc-hawkeye-map', null)
    this._wrapper.setAttribute('id', Util.uuid())
    this._baseLayers = []
    this._map = undefined
    this.type = Widget.getWidgetType('hawkeye_map')
    this._state = State.INITIALIZED
  }

  get baseLayers() {
    return this._baseLayers
  }

  _mountMap() {
    let map = new Cesium.Viewer(this._wrapper, {
      ...DEF_OPTS,
      sceneMode: Cesium.SceneMode.SCENE2D
    })
    map.imageryLayers.removeAll()
    map.cesiumWidget._creditContainer.style.display = 'none'
    map.cesiumWidget.screenSpaceEventHandler.removeInputAction(
      Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
    )
    map.scene.backgroundColor = Cesium.Color.TRANSPARENT
    Util.merge(map.scene.screenSpaceCameraController, {
      enableRotate: false,
      enableTranslate: false,
      enableZoom: false,
      enableTilt: false,
      enableLook: false,
      maximumZoomDistance: 40489014.0
    })
    this._map = map
  }

  _bindEvent() {
    this._viewer.on(SceneEventType.CAMERA_CHANGED, this._syncMap, this)
  }

  _unbindEvent() {
    this._viewer.off(SceneEventType.CAMERA_CHANGED, this._syncMap, this)
  }

  _installHook() {
    this._mountMap()
    this._viewer.camera.percentageChanged = 0.01
  }

  _syncMap() {
    let viewCenter = new Cesium.Cartesian2(
      Math.floor(this._viewer.canvas.clientWidth / 2),
      Math.floor(this._viewer.canvas.clientHeight / 2)
    )
    let worldPosition = this._viewer.scene.camera.pickEllipsoid(viewCenter)
    if (!worldPosition) {
      return false
    }
    let distance = Cesium.Cartesian3.distance(
      worldPosition,
      this._viewer.scene.camera.positionWC
    )
    this._map.scene.camera.lookAt(
      worldPosition,
      new Cesium.Cartesian3(0.0, 0.0, distance)
    )
  }

  /**
   *
   * @param baseLayer
   * @returns {HawkeyeMap}
   */
  addBaseLayer(baseLayer) {
    if (!this._map || !this._enable) {
      return this
    }
    if (baseLayer) {
      if (this._baseLayers && this._baseLayers.length) {
        this._map.imageryLayers.removeAll()
      }
      if (!Array.isArray(baseLayer)) {
        baseLayer = [baseLayer]
      }
      baseLayer.forEach(item => {
        this._baseLayers.push(this._map.imageryLayers.addImageryProvider(item))
      })
    }
    return this
  }
}

Widget.registerType('hawkeye_map')

export default HawkeyeMap
