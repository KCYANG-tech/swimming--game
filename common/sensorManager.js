/**
 * 传感器管理器
 * 处理手机加速度计、陀螺仪和方向传感器数据
 */
class SensorManager {
  constructor() {
    this.isListening = false;
    this.isInitialized = false;
    
    // 传感器回调
    this.callbacks = {
      motion: null,
      orientation: null,
      error: null
    };
    
    // 传感器数据缓存
    this.sensorData = {
      acceleration: { x: 0, y: 0, z: 0 },
      rotationRate: { alpha: 0, beta: 0, gamma: 0 },
      orientation: { alpha: 0, beta: 0, gamma: 0 }
    };
    
    // 游泳动作识别参数
    this.strokeConfig = {
      threshold: 1.2,        // 挥臂动作阈值
      cooldown: 500,        // 挥臂冷却时间(ms)
      minPower: 0.5,        // 最小力度要求
      maxPower: 2.0,        // 最大力度限制
      smoothing: 0.8        // 数据平滑系数(0-1)
    };
    
    // 动作状态
    this.strokeState = {
      lastTime: 0,          // 上次挥臂时间
      lastPower: 0,         // 上次挥臂力度
      combo: 0,             // 连续挥臂次数
      smoothedAccel: 0,     // 平滑后的加速度
      smoothedRotation: 0   // 平滑后的旋转速度
    };
    
    // 绑定事件处理函数
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
    
    // 检查传感器支持
    if (!this._checkSensorSupport()) {
      throw new Error('设备不支持所需的传感器');
    }
    
    // 请求权限
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
      // 添加设备运动监听器
      if (window.DeviceMotionEvent) {
        window.addEventListener('devicemotion', this._handleMotion);
      }
      
      // 添加设备方向监听器
      if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', this._handleOrientation);
      }
      
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
    
    window.removeEventListener('devicemotion', this._handleMotion);
    window.removeEventListener('deviceorientation', this._handleOrientation);
    
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
    return hasMotion && hasOrientation;
    // #endif
    
    // #ifdef APP-PLUS
    const accelerometer = plus.accelerometer;
    const compass = plus.compass;
    return !!(accelerometer && compass);
    // #endif
  }

  /**
   * 请求传感器权限
   */
  async _requestPermission() {
    // #ifdef H5
    try {
      // iOS 13+ 需要明确请求权限
      if (DeviceMotionEvent.requestPermission && DeviceOrientationEvent.requestPermission) {
        const motionPermission = await DeviceMotionEvent.requestPermission();
        const orientationPermission = await DeviceOrientationEvent.requestPermission();
        
        if (motionPermission !== 'granted' || orientationPermission !== 'granted') {
          throw new Error('传感器权限被拒绝');
        }
      }
    } catch (error) {
      throw new Error('请求传感器权限失败: ' + error.message);
    }
    // #endif
    
    // #ifdef APP-PLUS
    try {
      await new Promise((resolve, reject) => {
        plus.accelerometer.watchAcceleration(
          () => resolve(),
          (error) => reject(new Error('加速度传感器初始化失败: ' + error.message)),
          { frequency: 50 }
        );
      });
      
      await new Promise((resolve, reject) => {
        plus.compass.watchHeading(
          () => resolve(),
          (error) => reject(new Error('方向传感器初始化失败: ' + error.message)),
          { frequency: 50 }
        );
      });
    } catch (error) {
      throw new Error('请求传感器权限失败: ' + error.message);
    }
    // #endif
  }

  /**
   * 处理运动传感器数据
   */
  _handleMotion(event) {
    if (!event || !event.acceleration || !event.rotationRate) {
      return;
    }

    // 更新传感器数据
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

    // 检测游泳动作
    this._detectSwimmingStroke();
    
    // 触发回调
    if (this.callbacks.motion) {
      this.callbacks.motion(this.sensorData);
    }
  }

  /**
   * 处理方向传感器数据
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

    // 触发回调
    if (this.callbacks.orientation) {
      this.callbacks.orientation(this.sensorData);
    }
  }

  /**
   * 处理错误
   */
  _handleError(error) {
    console.error('传感器错误:', error);
    if (this.callbacks.error) {
      this.callbacks.error(error);
    }
  }

  /**
   * 检测游泳挥臂动作
   * 使用平滑滤波和动态阈值来提高准确性
   */
  _detectSwimmingStroke() {
    const now = Date.now();
    const { acceleration, rotationRate } = this.sensorData;
    
    // 冷却检查
    if (now - this.strokeState.lastTime < this.strokeConfig.cooldown) {
      return;
    }

    // 计算当前力度
    const accelMagnitude = Math.sqrt(
      acceleration.x * acceleration.x + 
      acceleration.y * acceleration.y + 
      acceleration.z * acceleration.z
    );
    
    const rotationMagnitude = Math.sqrt(
      rotationRate.alpha * rotationRate.alpha + 
      rotationRate.beta * rotationRate.beta + 
      rotationRate.gamma * rotationRate.gamma
    );

    // 平滑数据
    this.strokeState.smoothedAccel = this.strokeState.smoothedAccel * this.strokeConfig.smoothing + 
      accelMagnitude * (1 - this.strokeConfig.smoothing);
      
    this.strokeState.smoothedRotation = this.strokeState.smoothedRotation * this.strokeConfig.smoothing + 
      rotationMagnitude * (1 - this.strokeConfig.smoothing);
    
    // 检测挥臂动作
    const totalPower = this.strokeState.smoothedAccel + this.strokeState.smoothedRotation;
    
    if (totalPower > this.strokeConfig.threshold) {
      // 计算挥臂力度（归一化到0-1范围）
      const strokePower = Math.max(
        this.strokeConfig.minPower,
        Math.min(
          totalPower / this.strokeConfig.maxPower,
          1.0
        )
      );
      
      // 更新状态
      this.strokeState.lastTime = now;
      this.strokeState.lastPower = strokePower;
      this.strokeState.combo++;
      
      // 触发回调
      if (this.callbacks.motion) {
        this.callbacks.motion({
          ...this.sensorData,
          stroke: true,
          strokePower,
          strokeCombo: this.strokeState.combo
        });
      }
    } else {
      // 重置连击
      this.strokeState.combo = 0;
    }
  }

  /**
   * 设置动作识别参数
   */
  setStrokeConfig(config) {
    this.strokeConfig = {
      ...this.strokeConfig,
      ...config
    };
  }

  /**
   * 重置状态
   */
  reset() {
    this.strokeState = {
      lastTime: 0,
      lastPower: 0,
      combo: 0,
      smoothedAccel: 0,
      smoothedRotation: 0
    };
  }

  /**
   * 注册传感器回调
   */
  onMotion(callback) {
    this.callbacks.motion = callback;
  }

  onOrientation(callback) {
    this.callbacks.orientation = callback;
  }

  onError(callback) {
    this.callbacks.error = callback;
  }
}

export default SensorManager;
