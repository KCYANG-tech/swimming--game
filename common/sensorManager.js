/**
 * 传感器管理器
 * 处理手机加速度计、陀螺仪和方向传感器数据
 */
class SensorManager {
  constructor() {
    this.isListening = false;
    this.isInitialized = false;
    this.support = { motion: false, orientation: false };
    this.permissionTried = false;
    this.permissionGranted = false;
    this.callbacks = { motion: null, orientation: null, error: null };
    this.sensorData = {
      acceleration: { x: 0, y: 0, z: 0 },
      rotationRate: { alpha: 0, beta: 0, gamma: 0 },
      orientation: { alpha: 0, beta: 0, gamma: 0 }
    };
    this.strokeConfig = { threshold: 1.2, cooldown: 500, minPower: 0.5, maxPower: 2.0, smoothing: 0.8 };
    this.strokeState = { lastTime: 0, lastPower: 0, combo: 0, smoothedAccel: 0, smoothedRotation: 0 };
    this._plusAccelId = null;
    this._plusCompassId = null;
    this._handleMotion = this._handleMotion.bind(this);
    this._handleOrientation = this._handleOrientation.bind(this);
    this._handleError = this._handleError.bind(this);
  }

  /**
   * 初始化传感器
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }
    
    if (!this._checkSensorSupport()) {
      throw new Error('设备不支持传感器或浏览器已禁用');
    }
    
    try {
      await this._requestPermission();
      this.isInitialized = true;
      console.log('传感器初始化成功');
    } catch (error) {
      console.error('传感器初始化失败:', error);
      throw error;
    }
  }

  /**
   * 开始监听传感器数据
   */
  startListening() {
    if (!this.isInitialized) {
      throw new Error('传感器未初始化');
    }
    if (this.isListening) {
      return;
    }
    try {
      // #ifdef H5
      if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', this._handleMotion);
      }
      if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', this._handleOrientation);
      }
      // #endif
      // #ifdef APP-PLUS
      // 使用原生 plus 接口，避免某些 WebView 不触发 devicemotion
      const g = 9.80665;
      const RAD2DEG = 180 / Math.PI;
      this._plusAccelId = plus.accelerometer.watchAcceleration(
        (accel) => {
          // 兼容不同字段：x/y/z 或 xAxis/yAxis/zAxis
          const ax = (accel && typeof accel.x === 'number') ? accel.x : (accel && typeof accel.xAxis === 'number' ? accel.xAxis : 0);
          const ay = (accel && typeof accel.y === 'number') ? accel.y : (accel && typeof accel.yAxis === 'number' ? accel.yAxis : 0);
          const az = (accel && typeof accel.z === 'number') ? accel.z : (accel && typeof accel.zAxis === 'number' ? accel.zAxis : 0);
          this.sensorData.acceleration = { x: ax, y: ay, z: az };
          // 使用重力分量估算倾斜角：
          // 前后倾斜 beta（俯仰，前倾为正）：-atan2(ay, sqrt(ax^2 + az^2))
          const beta = Math.max(-90, Math.min(90, -Math.atan2(ay, Math.sqrt(ax*ax + az*az || 1e-6)) * RAD2DEG));
          // 左右倾斜 gamma（滚转，右倾为正）：atan2(ax, az)
          let gamma = Math.atan2(ax, az || 1e-6) * RAD2DEG;
          if (gamma > 90) gamma = 90; if (gamma < -90) gamma = -90;
          // alpha 保持（由指南针补充）
          this.sensorData.orientation = { alpha: this.sensorData.orientation.alpha || 0, beta, gamma };
          if (this.callbacks.motion) this.callbacks.motion(this.sensorData);
          if (this.callbacks.orientation) this.callbacks.orientation(this.sensorData);
        },
        (error) => {
          console.warn('plus 加速度监听失败', error);
        },
        { frequency: 50 }
      );
      if (plus.compass && plus.compass.watchHeading) {
        this._plusCompassId = plus.compass.watchHeading(
          (head) => {
            this.sensorData.orientation.alpha = head.magneticHeading || 0;
          },
          () => {},
          { frequency: 200 }
        );
      }
      // #endif
      this.isListening = true;
      console.log('开始监听传感器数据');
    } catch (error) {
      this._handleError(error);
      throw error;
    }
  }

  /**
   * 停止监听传感器数据
   */
  stopListening() {
    if (!this.isListening) {
      return;
    }
    // #ifdef H5
    window.removeEventListener('devicemotion', this._handleMotion);
    window.removeEventListener('deviceorientation', this._handleOrientation);
    // #endif
    // #ifdef APP-PLUS
    if (this._plusAccelId) {
      try { plus.accelerometer.clearWatch(this._plusAccelId); } catch(e){}
      this._plusAccelId = null;
    }
    if (this._plusCompassId) {
      try { plus.compass.clearWatch(this._plusCompassId); } catch(e){}
      this._plusCompassId = null;
    }
    // #endif
    this.isListening = false;
    console.log('停止监听传感器数据');
  }

  /**
   * 检查传感器支持
   */
  _checkSensorSupport() {
    // #ifdef H5
    const hasMotion = 'DeviceMotionEvent' in window;
    const hasOrientation = 'DeviceOrientationEvent' in window;
    this.support.motion = hasMotion;
    this.support.orientation = hasOrientation;
    return hasMotion || hasOrientation;
    // #endif
    // #ifdef APP-PLUS
    const accelerometer = plus.accelerometer;
    const compass = plus.compass;
    this.support.motion = !!accelerometer;
    this.support.orientation = !!compass;
    return !!accelerometer; // 加速度存在即可
    // #endif
  }

  /**
   * 请求传感器权限
   */
  async _requestPermission() {
    // #ifdef H5
    try {
      const motionReq = typeof DeviceMotionEvent !== 'undefined' && DeviceMotionEvent.requestPermission ? DeviceMotionEvent.requestPermission.bind(DeviceMotionEvent) : null;
      const orientationReq = typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission ? DeviceOrientationEvent.requestPermission.bind(DeviceOrientationEvent) : null;
      if (motionReq || orientationReq) {
        const results = [];
        if (motionReq) {
          try { results.push(await motionReq()); } catch (e) { results.push(e && e.message ? e.message : 'error'); }
        }
        if (orientationReq) {
          try { results.push(await orientationReq()); } catch (e) { results.push(e && e.message ? e.message : 'error'); }
        }
        this.permissionTried = true;
        if (results.some(r => r === 'denied')) {
          throw new Error('传感器权限被拒绝');
        }
        if (results.every(r => r !== 'granted')) {
          throw new Error('需要用户手势授权，请点击“重试授权”或屏幕任意位置后再试');
        }
        this.permissionGranted = true;
      } else {
        this.permissionGranted = true;
      }
    } catch (error) {
      throw new Error('请求传感器权限失败: ' + error.message);
    }
    // #endif
    // #ifdef APP-PLUS
    try {
      await new Promise((resolve, reject) => {
        let watchId = plus.accelerometer.watchAcceleration(
          (accel) => {
            try { plus.accelerometer.clearWatch(watchId); } catch(e){}
            resolve(accel);
          },
          (error) => {
            try { plus.accelerometer.clearWatch(watchId); } catch(e){}
            reject(new Error('加速度传感器初始化失败: ' + (error && error.message ? error.message : '未知错误')));
          },
          { frequency: 50 }
        );
      });
      // 指南针可选，失败不阻塞
      if (plus.compass && plus.compass.watchHeading) {
        try {
          let cid = plus.compass.watchHeading(
            () => { try { plus.compass.clearWatch(cid); } catch(e){} },
            () => { try { plus.compass.clearWatch(cid); } catch(e){} },
            { frequency: 100 }
          );
        } catch(e) {}
      }
      this.permissionGranted = true;
    } catch (error) {
      throw new Error('请求传感器权限失败: ' + error.message);
    }
    // #endif
  }

  /**
   * 处理运动传感器数据 (H5 devicemotion)
   */
  _handleMotion(event) {
    if (!event || !event.acceleration || !event.rotationRate) {
      return;
    }
    this.sensorData.acceleration = {
      x: event.acceleration.x || 0,
      y: event.acceleration.y || 0,
      z: event.acceleration.z || 0
    };
    this.sensorData.rotationRate = {
      alpha: event.rotationRate.alpha || 0,
      beta: event.rotationRate.beta || 0,
      gamma: event.rotationRate.gamma || 0
    };
    this._detectSwimmingStroke();
    if (this.callbacks.motion) {
      this.callbacks.motion(this.sensorData);
    }
  }

  /**
   * 处理方向传感器数据 (H5 deviceorientation)
   */
  _handleOrientation(event) {
    if (!event) {
      return;
    }
    this.sensorData.orientation = {
      alpha: event.alpha || 0,
      beta: event.beta || 0,
      gamma: event.gamma || 0
    };
    if (this.callbacks.orientation) {
      this.callbacks.orientation(this.sensorData);
    }
  }

  _handleError(error) {
    console.error('传感器错误:', error);
    if (this.callbacks.error) {
      this.callbacks.error(error);
    }
  }

  _detectSwimmingStroke() {
    const now = Date.now();
    const { acceleration, rotationRate } = this.sensorData;
    if (now - this.strokeState.lastTime < this.strokeConfig.cooldown) {
      return;
    }
    const accelMagnitude = Math.sqrt(acceleration.x*acceleration.x + acceleration.y*acceleration.y + acceleration.z*acceleration.z);
    const rotationMagnitude = Math.sqrt(rotationRate.alpha*rotationRate.alpha + rotationRate.beta*rotationRate.beta + rotationRate.gamma*rotationRate.gamma);
    this.strokeState.smoothedAccel = this.strokeState.smoothedAccel * this.strokeConfig.smoothing + accelMagnitude * (1 - this.strokeConfig.smoothing);
    this.strokeState.smoothedRotation = this.strokeState.smoothedRotation * this.strokeConfig.smoothing + rotationMagnitude * (1 - this.strokeConfig.smoothing);
    const totalPower = this.strokeState.smoothedAccel + this.strokeState.smoothedRotation;
    if (totalPower > this.strokeConfig.threshold) {
      const strokePower = Math.max(this.strokeConfig.minPower, Math.min(totalPower / this.strokeConfig.maxPower, 1.0));
      this.strokeState.lastTime = now;
      this.strokeState.lastPower = strokePower;
      this.strokeState.combo++;
      if (this.callbacks.motion) {
        this.callbacks.motion({ ...this.sensorData, stroke: true, strokePower, strokeCombo: this.strokeState.combo });
      }
    } else {
      this.strokeState.combo = 0;
    }
  }

  setStrokeConfig(config) {
    this.strokeConfig = { ...this.strokeConfig, ...config };
  }

  reset() {
    this.strokeState = { lastTime: 0, lastPower: 0, combo: 0, smoothedAccel: 0, smoothedRotation: 0 };
  }

  onMotion(callback) { this.callbacks.motion = callback; }
  onOrientation(callback) { this.callbacks.orientation = callback; }
  onError(callback) { this.callbacks.error = callback; }
}

export default SensorManager;
