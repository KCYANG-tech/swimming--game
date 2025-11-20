if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global2 = uni.requireGlobal();
  ArrayBuffer = global2.ArrayBuffer;
  Int8Array = global2.Int8Array;
  Uint8Array = global2.Uint8Array;
  Uint8ClampedArray = global2.Uint8ClampedArray;
  Int16Array = global2.Int16Array;
  Uint16Array = global2.Uint16Array;
  Int32Array = global2.Int32Array;
  Uint32Array = global2.Uint32Array;
  Float32Array = global2.Float32Array;
  Float64Array = global2.Float64Array;
  BigInt64Array = global2.BigInt64Array;
  BigUint64Array = global2.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  const AUTH_USER_KEY = "auth_user";
  const AUTH_TOKEN_KEY = "auth_token";
  const AUTH_EXPIRES_KEY = "auth_expires";
  const USER_PREFIX = "user:";
  function saveSession({ user, token = "mock-token", ttlMs = 7 * 24 * 60 * 60 * 1e3 }) {
    const now2 = Date.now();
    try {
      uni.setStorageSync(AUTH_USER_KEY, user);
      uni.setStorageSync(AUTH_TOKEN_KEY, token);
      uni.setStorageSync(AUTH_EXPIRES_KEY, now2 + ttlMs);
    } catch (e) {
    }
  }
  function getSession() {
    try {
      const user = uni.getStorageSync(AUTH_USER_KEY);
      const token = uni.getStorageSync(AUTH_TOKEN_KEY);
      const exp = uni.getStorageSync(AUTH_EXPIRES_KEY);
      if (!user || !token || !exp)
        return null;
      if (Date.now() > Number(exp)) {
        logout();
        return null;
      }
      return { user, token, expiresAt: Number(exp) };
    } catch (e) {
      return null;
    }
  }
  function logout() {
    try {
      uni.removeStorageSync(AUTH_USER_KEY);
      uni.removeStorageSync(AUTH_TOKEN_KEY);
      uni.removeStorageSync(AUTH_EXPIRES_KEY);
    } catch (e) {
    }
  }
  async function register(name, password) {
    {
      if (!name || !password)
        throw new Error("请输入用户名和密码");
      const exists = uni.getStorageSync(USER_PREFIX + name);
      if (exists)
        throw new Error("用户名已存在");
      uni.setStorageSync(USER_PREFIX + name, { name, password });
      const user = { id: Date.now(), name };
      return { ok: true, user };
    }
  }
  async function login(name, password) {
    {
      const rec = uni.getStorageSync(USER_PREFIX + name);
      if (rec && rec.password === password) {
        const user = { id: Date.now(), name };
        saveSession({ user });
        return { ok: true, token: "mock-token", user };
      }
      throw new Error("账号或密码错误");
    }
  }
  function getCurrentUser() {
    const s = getSession();
    return s ? s.user : null;
  }
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$6 = {
    data() {
      return { name: "", password: "", loading: false, error: "" };
    },
    mounted() {
      const user = getCurrentUser();
      if (user) {
        uni.switchTab({ url: "/pages/swimming/index" });
      }
    },
    methods: {
      async doLogin() {
        this.error = "";
        if (!this.name || !this.password) {
          this.error = "请输入用户名和密码";
          return;
        }
        this.loading = true;
        try {
          await login(this.name, this.password);
          uni.switchTab({ url: "/pages/swimming/index" });
        } catch (e) {
          this.error = e.message || "登录失败";
        } finally {
          this.loading = false;
        }
      },
      goRegister() {
        uni.navigateTo({ url: "/pages/auth/register" });
      }
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "auth-page" }, [
      vue.createElementVNode("view", { class: "card" }, [
        vue.createElementVNode("text", { class: "title" }, "登录"),
        vue.withDirectives(vue.createElementVNode(
          "input",
          {
            class: "ipt",
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.name = $event),
            placeholder: "用户名"
          },
          null,
          512
          /* NEED_PATCH */
        ), [
          [vue.vModelText, $data.name]
        ]),
        vue.withDirectives(vue.createElementVNode(
          "input",
          {
            class: "ipt",
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.password = $event),
            placeholder: "密码",
            password: ""
          },
          null,
          512
          /* NEED_PATCH */
        ), [
          [vue.vModelText, $data.password]
        ]),
        vue.createElementVNode("button", {
          class: "btn primary",
          disabled: $data.loading,
          onClick: _cache[2] || (_cache[2] = (...args) => $options.doLogin && $options.doLogin(...args))
        }, vue.toDisplayString($data.loading ? "登录中..." : "登录"), 9, ["disabled"]),
        vue.createElementVNode("button", {
          class: "btn",
          onClick: _cache[3] || (_cache[3] = (...args) => $options.goRegister && $options.goRegister(...args))
        }, "去注册"),
        $data.error ? (vue.openBlock(), vue.createElementBlock(
          "text",
          {
            key: 0,
            class: "err"
          },
          vue.toDisplayString($data.error),
          1
          /* TEXT */
        )) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesAuthLogin = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__scopeId", "data-v-2cc9f8c3"], ["__file", "C:/Users/ykc04/Documents/HBuilderProjects/Swim-app/pages/auth/login.vue"]]);
  const _sfc_main$5 = {
    data() {
      return { name: "", password: "", loading: false, error: "", ok: false };
    },
    methods: {
      async doRegister() {
        this.error = "";
        this.ok = false;
        if (!this.name || !this.password) {
          this.error = "请输入用户名和密码";
          return;
        }
        this.loading = true;
        try {
          await register(this.name, this.password);
          this.ok = true;
          setTimeout(() => uni.redirectTo({ url: "/pages/auth/login" }), 800);
        } catch (e) {
          this.error = e.message || "注册失败";
        } finally {
          this.loading = false;
        }
      },
      goLogin() {
        uni.navigateTo({ url: "/pages/auth/login" });
      }
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "auth-page" }, [
      vue.createElementVNode("view", { class: "card" }, [
        vue.createElementVNode("text", { class: "title" }, "注册"),
        vue.withDirectives(vue.createElementVNode(
          "input",
          {
            class: "ipt",
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.name = $event),
            placeholder: "用户名"
          },
          null,
          512
          /* NEED_PATCH */
        ), [
          [vue.vModelText, $data.name]
        ]),
        vue.withDirectives(vue.createElementVNode(
          "input",
          {
            class: "ipt",
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.password = $event),
            placeholder: "密码",
            password: ""
          },
          null,
          512
          /* NEED_PATCH */
        ), [
          [vue.vModelText, $data.password]
        ]),
        vue.createElementVNode("button", {
          class: "btn primary",
          disabled: $data.loading,
          onClick: _cache[2] || (_cache[2] = (...args) => $options.doRegister && $options.doRegister(...args))
        }, vue.toDisplayString($data.loading ? "注册中..." : "注册"), 9, ["disabled"]),
        vue.createElementVNode("button", {
          class: "btn",
          onClick: _cache[3] || (_cache[3] = (...args) => $options.goLogin && $options.goLogin(...args))
        }, "返回登录"),
        $data.error ? (vue.openBlock(), vue.createElementBlock(
          "text",
          {
            key: 0,
            class: "err"
          },
          vue.toDisplayString($data.error),
          1
          /* TEXT */
        )) : vue.createCommentVNode("v-if", true),
        $data.ok ? (vue.openBlock(), vue.createElementBlock("text", {
          key: 1,
          class: "ok"
        }, "注册成功，已自动保存到本地（演示模式）")) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesAuthRegister = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-4bb68961"], ["__file", "C:/Users/ykc04/Documents/HBuilderProjects/Swim-app/pages/auth/register.vue"]]);
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
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
      this.strokeConfig = { threshold: 1.2, cooldown: 500, minPower: 0.5, maxPower: 2, smoothing: 0.8 };
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
        throw new Error("设备不支持传感器或浏览器已禁用");
      }
      try {
        await this._requestPermission();
        this.isInitialized = true;
        formatAppLog("log", "at common/sensorManager.js:42", "传感器初始化成功");
      } catch (error) {
        formatAppLog("error", "at common/sensorManager.js:44", "传感器初始化失败:", error);
        throw error;
      }
    }
    /**
     * 开始监听传感器数据
     */
    startListening() {
      if (!this.isInitialized) {
        throw new Error("传感器未初始化");
      }
      if (this.isListening) {
        return;
      }
      try {
        const g = 9.80665;
        const RAD2DEG = 180 / Math.PI;
        this._plusAccelId = plus.accelerometer.watchAcceleration(
          (accel) => {
            const ax = accel && typeof accel.x === "number" ? accel.x : accel && typeof accel.xAxis === "number" ? accel.xAxis : 0;
            const ay = accel && typeof accel.y === "number" ? accel.y : accel && typeof accel.yAxis === "number" ? accel.yAxis : 0;
            const az = accel && typeof accel.z === "number" ? accel.z : accel && typeof accel.zAxis === "number" ? accel.zAxis : 0;
            this.sensorData.acceleration = { x: ax, y: ay, z: az };
            const beta = Math.max(-90, Math.min(90, -Math.atan2(ay, Math.sqrt(ax * ax + az * az || 1e-6)) * RAD2DEG));
            let gamma = Math.atan2(ax, az || 1e-6) * RAD2DEG;
            if (gamma > 90)
              gamma = 90;
            if (gamma < -90)
              gamma = -90;
            this.sensorData.orientation = { alpha: this.sensorData.orientation.alpha || 0, beta, gamma };
            if (this.callbacks.motion)
              this.callbacks.motion(this.sensorData);
            if (this.callbacks.orientation)
              this.callbacks.orientation(this.sensorData);
          },
          (error) => {
            formatAppLog("warn", "at common/sensorManager.js:91", "plus 加速度监听失败", error);
          },
          { frequency: 50 }
        );
        if (plus.compass && plus.compass.watchHeading) {
          this._plusCompassId = plus.compass.watchHeading(
            (head) => {
              this.sensorData.orientation.alpha = head.magneticHeading || 0;
            },
            () => {
            },
            { frequency: 200 }
          );
        }
        this.isListening = true;
        formatAppLog("log", "at common/sensorManager.js:106", "开始监听传感器数据");
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
      if (this._plusAccelId) {
        try {
          plus.accelerometer.clearWatch(this._plusAccelId);
        } catch (e) {
        }
        this._plusAccelId = null;
      }
      if (this._plusCompassId) {
        try {
          plus.compass.clearWatch(this._plusCompassId);
        } catch (e) {
        }
        this._plusCompassId = null;
      }
      this.isListening = false;
      formatAppLog("log", "at common/sensorManager.js:135", "停止监听传感器数据");
    }
    /**
     * 检查传感器支持
     */
    _checkSensorSupport() {
      const accelerometer = plus.accelerometer;
      const compass = plus.compass;
      this.support.motion = !!accelerometer;
      this.support.orientation = !!compass;
      return !!accelerometer;
    }
    /**
     * 请求传感器权限
     */
    async _requestPermission() {
      try {
        await new Promise((resolve, reject) => {
          let watchId = plus.accelerometer.watchAcceleration(
            (accel) => {
              try {
                plus.accelerometer.clearWatch(watchId);
              } catch (e) {
              }
              resolve(accel);
            },
            (error) => {
              try {
                plus.accelerometer.clearWatch(watchId);
              } catch (e) {
              }
              reject(new Error("加速度传感器初始化失败: " + (error && error.message ? error.message : "未知错误")));
            },
            { frequency: 50 }
          );
        });
        if (plus.compass && plus.compass.watchHeading) {
          try {
            let cid = plus.compass.watchHeading(
              () => {
                try {
                  plus.compass.clearWatch(cid);
                } catch (e) {
                }
              },
              () => {
                try {
                  plus.compass.clearWatch(cid);
                } catch (e) {
                }
              },
              { frequency: 100 }
            );
          } catch (e) {
          }
        }
        this.permissionGranted = true;
      } catch (error) {
        throw new Error("请求传感器权限失败: " + error.message);
      }
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
      formatAppLog("error", "at common/sensorManager.js:262", "传感器错误:", error);
      if (this.callbacks.error) {
        this.callbacks.error(error);
      }
    }
    _detectSwimmingStroke() {
      const now2 = Date.now();
      const { acceleration, rotationRate } = this.sensorData;
      if (now2 - this.strokeState.lastTime < this.strokeConfig.cooldown) {
        return;
      }
      const accelMagnitude = Math.sqrt(acceleration.x * acceleration.x + acceleration.y * acceleration.y + acceleration.z * acceleration.z);
      const rotationMagnitude = Math.sqrt(rotationRate.alpha * rotationRate.alpha + rotationRate.beta * rotationRate.beta + rotationRate.gamma * rotationRate.gamma);
      this.strokeState.smoothedAccel = this.strokeState.smoothedAccel * this.strokeConfig.smoothing + accelMagnitude * (1 - this.strokeConfig.smoothing);
      this.strokeState.smoothedRotation = this.strokeState.smoothedRotation * this.strokeConfig.smoothing + rotationMagnitude * (1 - this.strokeConfig.smoothing);
      const totalPower = this.strokeState.smoothedAccel + this.strokeState.smoothedRotation;
      if (totalPower > this.strokeConfig.threshold) {
        const strokePower = Math.max(this.strokeConfig.minPower, Math.min(totalPower / this.strokeConfig.maxPower, 1));
        this.strokeState.lastTime = now2;
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
  class SensorUtils {
    /**
     * 计算三维向量的模
     */
    static magnitude(vector) {
      return Math.sqrt(
        vector.x * vector.x + vector.y * vector.y + vector.z * vector.z
      );
    }
    /**
     * 数据平滑滤波
     */
    static smoothFilter(newValue, lastValue, alpha = 0.8) {
      return lastValue * alpha + newValue * (1 - alpha);
    }
    /**
     * 计算动量
     */
    static momentum(acceleration, velocity) {
      return {
        x: acceleration.x * velocity.x,
        y: acceleration.y * velocity.y,
        z: acceleration.z * velocity.z
      };
    }
    /**
     * 检查平台兼容性
     */
    static checkPlatformSupport() {
      const hasAccelerometer = plus.accelerometer !== void 0;
      const hasCompass = plus.compass !== void 0;
      return {
        platform: "app",
        isSupported: hasAccelerometer && hasCompass,
        needsPermission: false,
        apis: {
          accelerometer: hasAccelerometer,
          compass: hasCompass
        }
      };
    }
    /**
     * 计算加权平均
     */
    static weightedAverage(values, weights) {
      let sum = 0;
      let weightSum = 0;
      for (let i = 0; i < values.length; i++) {
        sum += values[i] * weights[i];
        weightSum += weights[i];
      }
      return sum / weightSum;
    }
    /**
     * 分析传感器数据异常
     */
    static analyzeSensorAnomalies(data, config = {}) {
      const {
        accelThreshold = 20,
        // 加速度异常阈值
        rotationThreshold = 15,
        // 旋转速度异常阈值
        noiseThreshold = 0.1
        // 噪声阈值
      } = config;
      const anomalies = {
        hasAnomalies: false,
        details: []
      };
      const accelMag = this.magnitude(data.acceleration);
      if (accelMag > accelThreshold) {
        anomalies.hasAnomalies = true;
        anomalies.details.push({
          type: "acceleration",
          value: accelMag,
          threshold: accelThreshold
        });
      }
      const rotationMag = this.magnitude(data.rotationRate);
      if (rotationMag > rotationThreshold) {
        anomalies.hasAnomalies = true;
        anomalies.details.push({
          type: "rotation",
          value: rotationMag,
          threshold: rotationThreshold
        });
      }
      if (Math.abs(data.acceleration.x) < noiseThreshold && Math.abs(data.acceleration.y) < noiseThreshold && Math.abs(data.acceleration.z) < noiseThreshold) {
        anomalies.hasAnomalies = true;
        anomalies.details.push({
          type: "noise",
          threshold: noiseThreshold
        });
      }
      return anomalies;
    }
    /**
     * 分析游泳姿势
     */
    static analyzeSwimmingStyle(data, window2 = 10) {
      const patterns = {
        freestyle: {
          score: 0,
          features: {
            armRotation: false,
            bodyRoll: false,
            rhythm: false
          }
        },
        butterfly: {
          score: 0,
          features: {
            symmetricArms: false,
            bodyUndulation: false,
            timing: false
          }
        },
        breaststroke: {
          score: 0,
          features: {
            symmetricPull: false,
            legKick: false,
            glide: false
          }
        },
        backstroke: {
          score: 0,
          features: {
            backPosition: false,
            armRotation: false,
            legKick: false
          }
        }
      };
      this._analyzeFreestyle(data, patterns.freestyle);
      this._analyzeButterfly(data, patterns.butterfly);
      this._analyzeBreaststroke(data, patterns.breaststroke);
      this._analyzeBackstroke(data, patterns.backstroke);
      let bestStyle = null;
      let maxScore = 0;
      for (const [style, info] of Object.entries(patterns)) {
        if (info.score > maxScore) {
          maxScore = info.score;
          bestStyle = style;
        }
      }
      return {
        style: bestStyle,
        confidence: maxScore / 100,
        patterns
      };
    }
    /**
     * 分析游泳效率
     */
    static analyzeEfficiency(data) {
      const {
        strokeCount,
        distance,
        time,
        energy
      } = data;
      return {
        strokesPerMinute: strokeCount / time * 6e4,
        distancePerStroke: distance / strokeCount,
        speed: distance / time * 1e3,
        energyEfficiency: distance / energy
      };
    }
    /**
     * 分析动作质量
     */
    static analyzeStrokeQuality(data) {
      const {
        acceleration,
        rotationRate,
        orientation
      } = data;
      const symmetryScore = this._calculateSymmetry(acceleration, rotationRate);
      const powerScore = this._calculatePower(acceleration);
      const smoothnessScore = this._calculateSmoothness(acceleration, rotationRate);
      const balanceScore = this._calculateBalance(orientation);
      const totalScore = symmetryScore * 0.3 + powerScore * 0.3 + smoothnessScore * 0.2 + balanceScore * 0.2;
      return {
        total: Math.round(totalScore * 100),
        details: {
          symmetry: Math.round(symmetryScore * 100),
          power: Math.round(powerScore * 100),
          smoothness: Math.round(smoothnessScore * 100),
          balance: Math.round(balanceScore * 100)
        },
        feedback: this._generateFeedback({
          symmetry: symmetryScore,
          power: powerScore,
          smoothness: smoothnessScore,
          balance: balanceScore
        })
      };
    }
    /**
     * 分析自由泳特征
     */
    static _analyzeFreestyle(data, pattern) {
      const { acceleration, rotationRate, orientation } = data;
      if (Math.abs(rotationRate.z) > 1.5) {
        pattern.score += 30;
        pattern.features.armRotation = true;
      }
      if (Math.abs(orientation.gamma) > 30) {
        pattern.score += 40;
        pattern.features.bodyRoll = true;
      }
      const accelPattern = Math.abs(acceleration.x) > 1 && Math.abs(acceleration.y) > 0.5;
      if (accelPattern) {
        pattern.score += 30;
        pattern.features.rhythm = true;
      }
    }
    /**
     * 分析蝶泳特征
     */
    static _analyzeButterfly(data, pattern) {
      const { acceleration, rotationRate } = data;
      const symmetricMotion = Math.abs(acceleration.x) < 0.5 && Math.abs(acceleration.y) > 2;
      if (symmetricMotion) {
        pattern.score += 35;
        pattern.features.symmetricArms = true;
      }
      if (Math.abs(rotationRate.x) > 1.2) {
        pattern.score += 35;
        pattern.features.bodyUndulation = true;
      }
      const timing = Math.abs(acceleration.z) > 1.5;
      if (timing) {
        pattern.score += 30;
        pattern.features.timing = true;
      }
    }
    /**
     * 分析蛙泳特征
     */
    static _analyzeBreaststroke(data, pattern) {
      const { acceleration, rotationRate } = data;
      const symmetricPull = Math.abs(acceleration.x) < 0.8 && Math.abs(acceleration.y) > 1;
      if (symmetricPull) {
        pattern.score += 35;
        pattern.features.symmetricPull = true;
      }
      const legKick = Math.abs(acceleration.z) > 1.2 && Math.abs(rotationRate.x) < 0.8;
      if (legKick) {
        pattern.score += 35;
        pattern.features.legKick = true;
      }
      const glide = Math.abs(acceleration.x) < 0.3 && Math.abs(acceleration.y) < 0.3 && Math.abs(acceleration.z) < 0.3;
      if (glide) {
        pattern.score += 30;
        pattern.features.glide = true;
      }
    }
    /**
     * 分析仰泳特征
     */
    static _analyzeBackstroke(data, pattern) {
      const { acceleration, orientation } = data;
      if (Math.abs(orientation.beta - 180) < 20) {
        pattern.score += 35;
        pattern.features.backPosition = true;
      }
      const armMotion = Math.abs(acceleration.x) > 1.2 && Math.abs(acceleration.y) < 0.8;
      if (armMotion) {
        pattern.score += 35;
        pattern.features.armRotation = true;
      }
      const legMotion = Math.abs(acceleration.z) > 0.8;
      if (legMotion) {
        pattern.score += 30;
        pattern.features.legKick = true;
      }
    }
    /**
     * 生成反馈建议
     */
    static _generateFeedback(scores) {
      const feedback = [];
      if (scores.symmetry < 0.7) {
        feedback.push("保持左右划水动作的对称性");
      }
      if (scores.power < 0.6) {
        feedback.push("增加划水力度，但注意保持动作协调");
      }
      if (scores.smoothness < 0.7) {
        feedback.push("动作要更流畅，避免急促动作");
      }
      if (scores.balance < 0.6) {
        feedback.push("注意身体平衡，保持正确姿势");
      }
      return feedback;
    }
    /**
     * 计算动作对称性得分
     */
    static _calculateSymmetry(acceleration, rotationRate) {
      const accelSymmetry = Math.abs(acceleration.x) / (Math.abs(acceleration.y) + 0.1);
      const rotationSymmetry = Math.abs(rotationRate.gamma) / (Math.abs(rotationRate.beta) + 0.1);
      return this.weightedAverage(
        [accelSymmetry, rotationSymmetry],
        [0.6, 0.4]
      );
    }
    /**
     * 计算力量得分
     */
    static _calculatePower(acceleration) {
      const magnitude = this.magnitude(acceleration);
      return Math.min(magnitude / 10, 1);
    }
    /**
     * 计算平滑度得分
     */
    static _calculateSmoothness(acceleration, rotationRate) {
      const accelJerk = Math.abs(
        acceleration.x * acceleration.x + acceleration.y * acceleration.y + acceleration.z * acceleration.z
      );
      const rotationJerk = Math.abs(
        rotationRate.alpha * rotationRate.alpha + rotationRate.beta * rotationRate.beta + rotationRate.gamma * rotationRate.gamma
      );
      const smoothness = 1 - Math.min(
        (accelJerk + rotationJerk) / 100,
        1
      );
      return smoothness;
    }
    /**
     * 计算平衡得分
     */
    static _calculateBalance(orientation) {
      const verticalDiff = Math.abs(orientation.beta - 90) / 90;
      const rollDiff = Math.abs(orientation.gamma) / 90;
      return 1 - (verticalDiff * 0.6 + rollDiff * 0.4);
    }
  }
  const _sfc_main$4 = {
    name: "TestSensorsPage",
    data() {
      return {
        sm: null,
        initializing: false,
        listening: false,
        permGranted: null,
        support: { isSupported: false, needsPermission: false, apis: {} },
        plusDebug: { hasPlus: false, plusReady: false, hasAccel: false, hasCompass: false },
        alpha: 0.8,
        windowSize: 100,
        // 原始与滤波数据
        accRaw: { x: 0, y: 0, z: 0 },
        rotRaw: { alpha: 0, beta: 0, gamma: 0 },
        oriRaw: { alpha: 0, beta: 0, gamma: 0 },
        accFilt: { x: 0, y: 0, z: 0 },
        rotFilt: { alpha: 0, beta: 0, gamma: 0 },
        oriZero: { alpha: 0, beta: 0, gamma: 0 },
        oriRel: { alpha: 0, beta: 0, gamma: 0 },
        // 统计
        samples: 0,
        lastTick: 0,
        avgInterval: 0,
        eps: 0,
        lastError: "",
        // 日志
        logs: []
      };
    },
    computed: {
      permText() {
        if (this.permGranted === true)
          return "已授权";
        if (this.permGranted === false)
          return "未授权";
        return this.support.needsPermission ? "需授权" : "无需授权";
      },
      accMag() {
        return Math.sqrt(this.accFilt.x ** 2 + this.accFilt.y ** 2 + this.accFilt.z ** 2);
      },
      rotMag() {
        return Math.sqrt(this.rotFilt.alpha ** 2 + this.rotFilt.beta ** 2 + this.rotFilt.gamma ** 2);
      },
      cubeStyle() {
        const rX = this.oriRel.beta;
        const rY = this.oriRel.gamma;
        const rZ = this.oriRel.alpha;
        return { transform: `rotateX(${rX}deg) rotateY(${rY}deg) rotateZ(${rZ}deg)` };
      }
    },
    mounted() {
      const initSM = () => {
        try {
          const info = SensorUtils.checkPlatformSupport();
          this.support = info;
        } catch (e) {
        }
        this.sm = new SensorManager();
        this.sm.onMotion(this.onMotion);
        this.sm.onOrientation(this.onOrientation);
        this.sm.onError((err) => {
          this.lastError = err && err.message ? err.message : String(err);
        });
        this.plusDebug.hasPlus = typeof plus !== "undefined";
        if (this.plusDebug.hasPlus) {
          this.plusDebug.hasAccel = !!(plus && plus.accelerometer);
          this.plusDebug.hasCompass = !!(plus && plus.compass);
        }
      };
      if (typeof plus === "undefined") {
        document.addEventListener("plusready", () => {
          this.plusDebug.plusReady = true;
          initSM();
        }, { once: true });
      } else {
        this.plusDebug.plusReady = true;
        initSM();
      }
    },
    methods: {
      async requestPermission() {
        this.initializing = true;
        try {
          await this.sm.initialize();
          this.permGranted = true;
          uni.showToast({ title: "已授权", icon: "success" });
        } catch (e) {
          this.permGranted = false;
          uni.showModal({ title: "授权失败", content: e.message || "无法获取权限" });
        } finally {
          this.initializing = false;
        }
      },
      start() {
        try {
          if (!this.sm)
            throw new Error("未初始化");
          if (!this.sm.isInitialized) {
            return this.requestPermission().then(() => this.start());
          }
          this.sm.startListening();
          this.listening = true;
          this.resetStats();
          if (!this.support.isSupported)
            this.support.isSupported = true;
        } catch (e) {
          this.lastError = e.message;
        }
      },
      forceRetest() {
        this.plusDebug.hasPlus = typeof plus !== "undefined";
        if (this.plusDebug.hasPlus) {
          this.plusDebug.hasAccel = !!plus.accelerometer;
          this.plusDebug.hasCompass = !!plus.compass;
        }
        if (this.sm)
          this.sm.isInitialized = false;
        this.support.isSupported = false;
        this.permGranted = null;
        this.listening = false;
        uni.showToast({ title: "已重置探测", icon: "none" });
      },
      stop() {
        this.sm.stopListening();
        this.listening = false;
      },
      resetCalib() {
        this.oriZero = { ...this.oriRaw };
      },
      onWindowChange(e) {
        const opts = [50, 100, 200, 500];
        this.windowSize = opts[e.detail.value] || 100;
      },
      fmt(v) {
        return (Number(v) || 0).toFixed(2);
      },
      barStyle(v, vmax = 100) {
        const w = Math.min(100, Math.abs(v) / vmax * 100);
        return { width: w + "%" };
      },
      resetStats() {
        this.samples = 0;
        this.avgInterval = 0;
        this.eps = 0;
        this.lastTick = 0;
        this.logs = [];
      },
      onMotion(data) {
        const now2 = performance.now ? performance.now() : Date.now();
        const a = data.acceleration || { x: 0, y: 0, z: 0 };
        const r = data.rotationRate || { alpha: 0, beta: 0, gamma: 0 };
        this.accRaw = a;
        this.rotRaw = r;
        const t = this.alpha;
        this.accFilt = {
          x: this.accFilt.x * t + a.x * (1 - t),
          y: this.accFilt.y * t + a.y * (1 - t),
          z: this.accFilt.z * t + a.z * (1 - t)
        };
        this.rotFilt = {
          alpha: this.rotFilt.alpha * t + r.alpha * (1 - t),
          beta: this.rotFilt.beta * t + r.beta * (1 - t),
          gamma: this.rotFilt.gamma * t + r.gamma * (1 - t)
        };
        if (this.lastTick) {
          const dt = now2 - this.lastTick;
          this.avgInterval = this.avgInterval === 0 ? dt : this.avgInterval * 0.9 + dt * 0.1;
          this.eps = this.avgInterval > 0 ? 1e3 / this.avgInterval : 0;
        }
        this.lastTick = now2;
        this.samples++;
        this.logs.push({ t: now2, a: this.accRaw, r: this.rotRaw, o: this.oriRaw });
        if (this.logs.length > this.windowSize)
          this.logs.shift();
      },
      onOrientation(data) {
        const o = data.orientation || { alpha: 0, beta: 0, gamma: 0 };
        this.oriRaw = o;
        this.oriRel = {
          alpha: this.wrapDeg(o.alpha - this.oriZero.alpha, 180),
          beta: this.clamp(o.beta - this.oriZero.beta, -180, 180),
          gamma: this.clamp(o.gamma - this.oriZero.gamma, -90, 90)
        };
      },
      wrapDeg(v, range = 180) {
        let x = v;
        while (x > range)
          x -= 2 * range;
        while (x < -range)
          x += 2 * range;
        return x;
      },
      clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
      },
      clearLogs() {
        this.logs = [];
        uni.showToast({ title: "已清除", icon: "none" });
      },
      copyLogs() {
        try {
          const text = JSON.stringify(this.logs);
          uni.setClipboardData({ data: text, success: () => uni.showToast({ title: "已复制", icon: "success" }) });
        } catch (e) {
          uni.showToast({ title: "复制失败", icon: "none" });
        }
      }
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "sensor-page" }, [
      vue.createElementVNode("view", { class: "topbar" }, [
        vue.createElementVNode("text", { class: "title" }, "传感器测试"),
        vue.createElementVNode("view", { class: "badges" }, [
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["badge", { ok: $data.support.isSupported, warn: !$data.support.isSupported }])
            },
            vue.toDisplayString($data.support.isSupported ? "已支持" : "不支持"),
            3
            /* TEXT, CLASS */
          ),
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["badge", { ok: $data.permGranted === true, warn: $data.permGranted === false }])
            },
            vue.toDisplayString($options.permText),
            3
            /* TEXT, CLASS */
          ),
          vue.createElementVNode(
            "text",
            {
              class: vue.normalizeClass(["badge", { ok: $data.listening, warn: !$data.listening }])
            },
            vue.toDisplayString($data.listening ? "监听中" : "未监听"),
            3
            /* TEXT, CLASS */
          )
        ])
      ]),
      vue.createElementVNode("view", { class: "controls" }, [
        vue.createElementVNode("button", {
          class: "btn primary",
          disabled: $data.initializing,
          onClick: _cache[0] || (_cache[0] = (...args) => $options.requestPermission && $options.requestPermission(...args))
        }, "授权", 8, ["disabled"]),
        vue.createElementVNode("button", {
          class: "btn",
          disabled: !$data.permGranted || $data.initializing || $data.listening,
          onClick: _cache[1] || (_cache[1] = (...args) => $options.start && $options.start(...args))
        }, "开始", 8, ["disabled"]),
        vue.createElementVNode("button", {
          class: "btn",
          disabled: !$data.listening,
          onClick: _cache[2] || (_cache[2] = (...args) => $options.stop && $options.stop(...args))
        }, "停止", 8, ["disabled"]),
        vue.createElementVNode("button", {
          class: "btn",
          onClick: _cache[3] || (_cache[3] = (...args) => $options.resetCalib && $options.resetCalib(...args))
        }, "校准零点"),
        vue.createElementVNode("button", {
          class: "btn",
          onClick: _cache[4] || (_cache[4] = (...args) => $options.clearLogs && $options.clearLogs(...args))
        }, "清除日志"),
        vue.createElementVNode("button", {
          class: "btn",
          onClick: _cache[5] || (_cache[5] = (...args) => $options.copyLogs && $options.copyLogs(...args))
        }, "复制日志"),
        vue.createElementVNode("button", {
          class: "btn",
          onClick: _cache[6] || (_cache[6] = (...args) => $options.forceRetest && $options.forceRetest(...args))
        }, "重新探测")
      ]),
      vue.createElementVNode("view", { class: "section" }, [
        vue.createElementVNode("text", { class: "sec-title" }, "参数"),
        vue.createElementVNode("view", { class: "kv" }, [
          vue.createElementVNode("text", { class: "k" }, "滤波α(0-1)"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              class: "v-input",
              type: "number",
              step: "0.05",
              "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $data.alpha = $event)
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [
              vue.vModelText,
              $data.alpha,
              void 0,
              { number: true }
            ]
          ])
        ]),
        vue.createElementVNode("view", { class: "kv" }, [
          vue.createElementVNode("text", { class: "k" }, "采样窗口"),
          vue.createElementVNode(
            "picker",
            {
              range: [50, 100, 200, 500],
              onChange: _cache[8] || (_cache[8] = (...args) => $options.onWindowChange && $options.onWindowChange(...args))
            },
            [
              vue.createElementVNode(
                "view",
                { class: "v" },
                vue.toDisplayString($data.windowSize) + " 条",
                1
                /* TEXT */
              )
            ],
            32
            /* NEED_HYDRATION */
          )
        ])
      ]),
      vue.createElementVNode("view", { class: "grid" }, [
        vue.createElementVNode("view", { class: "card" }, [
          vue.createElementVNode("text", { class: "card-title" }, "加速度 (m/s²)"),
          vue.createElementVNode("view", { class: "rows" }, [
            (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList(["x", "y", "z"], (key) => {
                return vue.createElementVNode("view", {
                  class: "row",
                  key: "acc-" + key
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "label" },
                    vue.toDisplayString(key.toUpperCase()),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "val" },
                    vue.toDisplayString($options.fmt($data.accFilt[key])),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "bar" }, [
                    vue.createElementVNode(
                      "view",
                      {
                        class: "fill",
                        style: vue.normalizeStyle($options.barStyle($data.accFilt[key], 30))
                      },
                      null,
                      4
                      /* STYLE */
                    )
                  ])
                ]);
              }),
              64
              /* STABLE_FRAGMENT */
            )),
            vue.createElementVNode("view", { class: "row" }, [
              vue.createElementVNode("text", { class: "label" }, "|a|"),
              vue.createElementVNode(
                "text",
                { class: "val" },
                vue.toDisplayString($options.fmt($options.accMag)),
                1
                /* TEXT */
              )
            ])
          ])
        ]),
        vue.createElementVNode("view", { class: "card" }, [
          vue.createElementVNode("text", { class: "card-title" }, "旋转速率 (°/s)"),
          vue.createElementVNode("view", { class: "rows" }, [
            (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList(["alpha", "beta", "gamma"], (key) => {
                return vue.createElementVNode("view", {
                  class: "row",
                  key: "rot-" + key
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "label" },
                    vue.toDisplayString(key),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "val" },
                    vue.toDisplayString($options.fmt($data.rotFilt[key])),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "bar" }, [
                    vue.createElementVNode(
                      "view",
                      {
                        class: "fill",
                        style: vue.normalizeStyle($options.barStyle($data.rotFilt[key], 300))
                      },
                      null,
                      4
                      /* STYLE */
                    )
                  ])
                ]);
              }),
              64
              /* STABLE_FRAGMENT */
            )),
            vue.createElementVNode("view", { class: "row" }, [
              vue.createElementVNode("text", { class: "label" }, "|ω|"),
              vue.createElementVNode(
                "text",
                { class: "val" },
                vue.toDisplayString($options.fmt($options.rotMag)),
                1
                /* TEXT */
              )
            ])
          ])
        ]),
        vue.createElementVNode("view", { class: "card" }, [
          vue.createElementVNode("text", { class: "card-title" }, "方向角 (°) - 零点校准"),
          vue.createElementVNode("view", { class: "rows" }, [
            (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList(["alpha", "beta", "gamma"], (key) => {
                return vue.createElementVNode("view", {
                  class: "row",
                  key: "ori-" + key
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "label" },
                    vue.toDisplayString(key),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "val" },
                    vue.toDisplayString($options.fmt($data.oriRel[key])),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "bar" }, [
                    vue.createElementVNode(
                      "view",
                      {
                        class: "fill",
                        style: vue.normalizeStyle($options.barStyle($data.oriRel[key], key === "alpha" ? 180 : 90))
                      },
                      null,
                      4
                      /* STYLE */
                    )
                  ])
                ]);
              }),
              64
              /* STABLE_FRAGMENT */
            ))
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "section" }, [
        vue.createElementVNode("text", { class: "sec-title" }, "统计"),
        vue.createElementVNode("view", { class: "stats" }, [
          vue.createElementVNode(
            "text",
            null,
            "事件数：" + vue.toDisplayString($data.samples),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            null,
            "采样率：" + vue.toDisplayString($data.eps.toFixed(1)) + " evt/s",
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            null,
            "间隔均值：" + vue.toDisplayString(Math.round($data.avgInterval)) + " ms",
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            null,
            "监听错误：" + vue.toDisplayString($data.lastError || "无"),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createElementVNode("view", { class: "section" }, [
        vue.createElementVNode("text", { class: "sec-title" }, "原生通道"),
        vue.createElementVNode("view", { class: "stats" }, [
          vue.createElementVNode(
            "text",
            null,
            "plus对象：" + vue.toDisplayString($data.plusDebug.hasPlus ? "存在" : "无"),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            null,
            "plusready：" + vue.toDisplayString($data.plusDebug.plusReady ? "已触发" : "未触发"),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            null,
            "accelerometer：" + vue.toDisplayString($data.plusDebug.hasAccel ? "有" : "无"),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            null,
            "compass：" + vue.toDisplayString($data.plusDebug.hasCompass ? "有" : "无"),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createElementVNode("view", { class: "tiltbox-wrap" }, [
        vue.createElementVNode("text", { class: "sec-title" }, "倾斜可视化"),
        vue.createElementVNode("view", { class: "tiltbox" }, [
          vue.createElementVNode(
            "view",
            {
              class: "cube",
              style: vue.normalizeStyle($options.cubeStyle)
            },
            null,
            4
            /* STYLE */
          )
        ])
      ])
    ]);
  }
  const PagesTestSensors = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-38464bc6"], ["__file", "C:/Users/ykc04/Documents/HBuilderProjects/Swim-app/pages/test-sensors.vue"]]);
  class SwimmingGame {
    constructor() {
      this.gameState = "ready";
      this.gameTime = 0;
      this.maxGameTime = 6e4;
      this.distance = 0;
      this.speed = 0;
      this.score = 0;
      this.strokeCount = 0;
      this.lives = 3;
      this.coinStreak = 0;
      this.invulnerableUntil = 0;
      this.endReason = null;
      this.player = {
        x: 50,
        // 角色X位置 (百分比)
        y: 50,
        // 角色Y位置 (百分比)
        size: 20,
        // 角色大小
        speed: 0,
        // 当前水平速度(用于距离统计)（不再由挥臂触发）
        maxSpeed: 3,
        // 最大水平速度（用于整体前进基准）
        acceleration: 0.05,
        // 基础缓动加速度（倾斜不直接修改）
        deceleration: 0.02,
        // 缓慢衰减
        vx: 0,
        // 水平移动速度分量（百分比/秒）
        vy: 0,
        // 垂直移动速度分量（百分比/秒）
        hitRadius: 3.8
        // 初始碰撞半径（%）
      };
      this.obstacles = [];
      this.coins = [];
      this.particles = [];
      this.settings = {
        // 旧：基于帧的概率生成（保留但不再使用）
        obstacleSpawnRate: 0.02,
        coinSpawnRate: 0.01,
        // 新：基于时间的生成间隔，确保全程稳定生成，并随时间增加难度
        obstacleIntervalStart: 1600,
        // ms，开局障碍物生成间隔
        obstacleIntervalEnd: 700,
        // ms，末段障碍物生成间隔（更密集）
        coinIntervalStart: 1200,
        // ms，开局金币生成间隔
        coinIntervalEnd: 1e3,
        // ms，末段金币生成间隔（略微加快或持平）
        obstacleMaxStart: 5,
        // 同屏障碍物上限（开局）
        obstacleMaxEnd: 10,
        // 同屏障碍物上限（末段）
        coinMax: 8,
        // 同屏金币上限
        obstacleSpeed: 2,
        // 障碍物移动速度
        coinSpeed: 1.5,
        // 金币移动速度
        obstacleSize: 15,
        // 障碍物大小
        coinSize: 10,
        // 金币大小
        moveScale: 22,
        // vx/vy 应用于坐标的缩放（% 每 1 速度单位每秒）
        dirSmoothing: 8,
        // 方向速度插值响应（越大越跟手）
        deadZone: 0.05,
        // 输入死区
        baseForwardSpeed: 0.3,
        // 基础前进距离速度(用于距离累计)
        hitInvulnMs: 1200,
        // 撞击后无敌时长(ms)
        maxLives: 5,
        // 生命上限
        coinStreakTarget: 3,
        // 连续吃N个金币奖励一条命
        // 碰撞半径（单位：百分比坐标的半径），用于更贴合视觉大小
        hitRadiusPlayerPct: 3.8,
        hitRadiusCoinPct: 2.4,
        hitRadiusObstaclePct: 3.2
      };
      this.callbacks = {
        onStateChange: null,
        onScoreUpdate: null,
        onGameOver: null
      };
      this.gameLoop = null;
      this.lastTime = 0;
      const root = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : {};
      this._raf = root && typeof root.requestAnimationFrame === "function" ? root.requestAnimationFrame.bind(root) : (cb) => setTimeout(() => cb(typeof performance !== "undefined" && performance.now ? performance.now() : Date.now()), 16);
      this._caf = root && typeof root.cancelAnimationFrame === "function" ? root.cancelAnimationFrame.bind(root) : (id) => clearTimeout(id);
      this._obstacleTimer = 0;
      this._coinTimer = 0;
      this.dirX = 0;
      this.dirY = 0;
      this.headingX = 1;
      this.headingY = 0;
    }
    /**
     * 初始化游戏
     */
    init() {
      this.resetGame();
      formatAppLog("log", "at common/swimmingGame.js:105", "游泳游戏已初始化");
    }
    /**
     * 重置游戏数据
     */
    resetGame() {
      this.gameState = "ready";
      this.gameTime = 0;
      this.distance = 0;
      this.speed = 0;
      this.score = 0;
      this.strokeCount = 0;
      this.lives = 3;
      this.coinStreak = 0;
      this.invulnerableUntil = 0;
      this.endReason = null;
      this._obstacleTimer = 0;
      this._coinTimer = 0;
      this.player = {
        x: 50,
        y: 50,
        size: 20,
        speed: 0,
        maxSpeed: 3,
        acceleration: 0.05,
        deceleration: 0.02,
        vx: 0,
        vy: 0,
        hitRadius: this.settings.hitRadiusPlayerPct
      };
      this.obstacles = [];
      this.coins = [];
      this.particles = [];
      this.dirX = 0;
      this.dirY = 0;
      this.headingX = 1;
      this.headingY = 0;
    }
    /**
     * 开始游戏
     */
    startGame() {
      if (this.gameState !== "ready" && this.gameState !== "ended") {
        return;
      }
      this.gameState = "playing";
      this.lastTime = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
      this.startGameLoop();
      this.triggerCallback("onStateChange", this.gameState);
      formatAppLog("log", "at common/swimmingGame.js:162", "游戏开始");
    }
    /**
     * 暂停游戏
     */
    pauseGame() {
      if (this.gameState !== "playing") {
        return;
      }
      this.gameState = "paused";
      this.stopGameLoop();
      this.triggerCallback("onStateChange", this.gameState);
      formatAppLog("log", "at common/swimmingGame.js:177", "游戏暂停");
    }
    /**
     * 恢复游戏
     */
    resumeGame() {
      if (this.gameState !== "paused") {
        return;
      }
      this.gameState = "playing";
      this.lastTime = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
      this.startGameLoop();
      this.triggerCallback("onStateChange", this.gameState);
      formatAppLog("log", "at common/swimmingGame.js:193", "游戏恢复");
    }
    /**
     * 结束游戏
     */
    endGame() {
      this.gameState = "ended";
      this.stopGameLoop();
      this.triggerCallback("onStateChange", this.gameState);
      this.triggerCallback("onGameOver", {
        score: this.score,
        distance: this.distance,
        strokeCount: this.strokeCount,
        time: this.gameTime,
        lives: this.lives,
        endReason: this.endReason
      });
      formatAppLog("log", "at common/swimmingGame.js:213", "游戏结束", {
        score: this.score,
        distance: this.distance,
        strokeCount: this.strokeCount,
        lives: this.lives,
        endReason: this.endReason
      });
    }
    /**
     * 开始游戏循环
     */
    startGameLoop() {
      if (this.gameLoop) {
        return;
      }
      this.gameLoop = (currentTime) => {
        if (this.gameState !== "playing") {
          return;
        }
        if (!this.lastTime) {
          this.lastTime = currentTime;
        }
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        this.updateGame(deltaTime);
        this._rafId = this._raf(this.gameLoop);
      };
      this._rafId = this._raf(this.gameLoop);
    }
    /**
     * 停止游戏循环
     */
    stopGameLoop() {
      if (this._rafId) {
        this._caf(this._rafId);
        this._rafId = null;
      }
      this.gameLoop = null;
    }
    /**
     * 更新游戏逻辑
     */
    updateGame(deltaTime) {
      this.gameTime += deltaTime;
      if (this.gameTime >= this.maxGameTime) {
        this.endReason = "time";
        this.endGame();
        return;
      }
      this.updatePlayer(deltaTime);
      this.updateObstacles(deltaTime);
      this.updateCoins(deltaTime);
      this.updateParticles(deltaTime);
      this.spawnObjects(deltaTime);
      this.checkCollisions();
      this.updateDistance();
      this.updateSpeed();
    }
    /**
     * 更新角色
     */
    updatePlayer(deltaTime) {
      const dt = deltaTime / 1e3;
      let ix = Math.abs(this.dirX) > this.settings.deadZone ? this.dirX : Math.abs(this.tiltX || 0) > this.settings.deadZone ? this.tiltX : 0;
      let iy = Math.abs(this.dirY) > this.settings.deadZone ? this.dirY : Math.abs(this.tiltY || 0) > this.settings.deadZone ? this.tiltY : 0;
      const mag = Math.sqrt(ix * ix + iy * iy);
      if (mag > 1) {
        ix /= mag;
        iy /= mag;
      }
      const targetVx = ix * this.player.maxSpeed;
      const targetVy = iy * this.player.maxSpeed;
      const follow = Math.min(1, this.settings.dirSmoothing * dt);
      this.player.vx += (targetVx - this.player.vx) * follow;
      this.player.vy += (targetVy - this.player.vy) * follow;
      if (mag > this.settings.deadZone) {
        const hm = Math.sqrt(ix * ix + iy * iy) || 1;
        this.headingX = ix / hm;
        this.headingY = iy / hm;
      }
      if (mag === 0) {
        const damp = Math.pow(0.92, deltaTime / 16.67);
        this.player.vx *= damp;
        this.player.vy *= damp;
      }
      this.player.x += this.player.vx * this.settings.moveScale * dt;
      this.player.y += this.player.vy * this.settings.moveScale * dt;
      const autoMove = (this.settings.autoMoveScale || 6) * dt;
      this.player.x += this.headingX * autoMove * 0.2;
      this.player.y += this.headingY * autoMove * 0.2;
      this.player.x = Math.max(5, Math.min(95, this.player.x));
      this.player.y = Math.max(5, Math.min(95, this.player.y));
      this.player.speed = Math.sqrt(this.player.vx * this.player.vx + this.player.vy * this.player.vy);
    }
    /**
     * 处理游泳动作
     */
    // 倾斜输入接口：由外部传入规范化 tiltX/tiltY (-1..1)
    setTilt(x, y) {
      this.tiltX = Math.max(-1, Math.min(1, x));
      this.tiltY = Math.max(-1, Math.min(1, y));
    }
    // 摇杆方向持续控制
    setDirection(dx, dy) {
      this.dirX = Math.max(-1, Math.min(1, dx));
      this.dirY = Math.max(-1, Math.min(1, dy));
    }
    // 方向微调：供调试轮盘的上下左右按钮调用，立即位移
    nudge(dx = 0, dy = 0) {
      if (this.gameState !== "playing")
        return;
      this.player.x = Math.max(5, Math.min(95, this.player.x + dx));
      this.player.y = Math.max(5, Math.min(95, this.player.y + dy));
    }
    /**
     * 调试：手动生成一个障碍物
     */
    spawnObstacle() {
      if (this.gameState !== "playing")
        return;
      this.addObstacle();
    }
    /**
     * 调试：手动生成一个金币
     */
    spawnCoin() {
      if (this.gameState !== "playing")
        return;
      this.addCoin();
    }
    /**
     * 调试：直接提升玩家速度
     */
    boostSpeed(amount = 0.5) {
      if (this.gameState !== "playing")
        return;
      this.player.speed = Math.min(this.player.speed + amount, this.player.maxSpeed);
    }
    /**
     * 调试：模拟一次挥臂（strokePower 可调）
     */
    simulateStroke(power = 1) {
      if (this.gameState !== "playing")
        return;
      this.addParticle(this.player.x, this.player.y, "stroke");
    }
    /**
     * 更新障碍物
     */
    updateObstacles(deltaTime) {
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obstacle = this.obstacles[i];
        obstacle.x -= this.settings.obstacleSpeed * deltaTime * 0.01;
        if (obstacle.x < -this.settings.obstacleSize) {
          obstacle.isActive = false;
          this.obstacles.splice(i, 1);
        }
      }
    }
    /**
     * 更新金币
     */
    updateCoins(deltaTime) {
      for (let i = this.coins.length - 1; i >= 0; i--) {
        const coin = this.coins[i];
        coin.x -= this.settings.coinSpeed * deltaTime * 0.01;
        if (coin.x < -this.settings.coinSize) {
          coin.isActive = false;
          this.coins.splice(i, 1);
        }
      }
    }
    /**
     * 更新粒子效果
     */
    updateParticles(deltaTime) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const particle = this.particles[i];
        particle.x += particle.vx * deltaTime * 0.01;
        particle.y += particle.vy * deltaTime * 0.01;
        particle.life -= deltaTime;
        if (particle.life <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }
    /**
     * 生成游戏对象
     */
    spawnObjects(deltaTime) {
      const dt = Math.max(0, deltaTime || 0);
      const prog = Math.min(1, this.gameTime / this.maxGameTime);
      const lerp = (a, b, t) => a + (b - a) * t;
      const obsInterval = lerp(this.settings.obstacleIntervalStart, this.settings.obstacleIntervalEnd, prog);
      const coinInterval = lerp(this.settings.coinIntervalStart, this.settings.coinIntervalEnd, prog);
      const obsMax = Math.round(lerp(this.settings.obstacleMaxStart, this.settings.obstacleMaxEnd, prog));
      const coinMax = this.settings.coinMax || 8;
      this._obstacleTimer -= dt;
      this._coinTimer -= dt;
      const jitter = (base, low = 0.85, high = 1.15) => base * (low + Math.random() * (high - low));
      while (this._obstacleTimer <= 0) {
        if (this.obstacles.length < obsMax) {
          this.addObstacle();
        }
        this._obstacleTimer += jitter(obsInterval, 0.85, 1.15);
      }
      while (this._coinTimer <= 0) {
        if (this.coins.length < coinMax) {
          this.addCoin();
        }
        this._coinTimer += jitter(coinInterval, 0.9, 1.1);
      }
    }
    /**
     * 添加障碍物
     */
    addObstacle() {
      if (!this.obstaclesPool)
        this.obstaclesPool = [];
      if (!this.maxObstaclePool)
        this.maxObstaclePool = 30;
      if (!this.obstaclesPool.length) {
        for (let i = 0; i < this.maxObstaclePool; i++) {
          this.obstaclesPool.push({ x: 0, y: 0, size: this.settings.obstacleSize, type: "obstacle", hitRadius: this.settings.hitRadiusObstaclePct, isActive: false });
        }
      }
      const obstacle = this.obstaclesPool.find((o) => !o.isActive);
      if (!obstacle)
        return;
      obstacle.x = 110;
      obstacle.y = Math.random() * 80 + 10;
      obstacle.size = this.settings.obstacleSize;
      obstacle.hitRadius = this.settings.hitRadiusObstaclePct;
      obstacle.isActive = true;
      this.obstacles.push(obstacle);
    }
    /**
     * 添加金币
     */
    addCoin() {
      if (!this.coinsPool)
        this.coinsPool = [];
      if (!this.maxCoinPool)
        this.maxCoinPool = 30;
      if (!this.coinsPool.length) {
        for (let i = 0; i < this.maxCoinPool; i++) {
          this.coinsPool.push({ x: 0, y: 0, size: this.settings.coinSize, type: "coin", value: 1, hitRadius: this.settings.hitRadiusCoinPct, isActive: false });
        }
      }
      const coin = this.coinsPool.find((c) => !c.isActive);
      if (!coin)
        return;
      coin.x = 110;
      coin.y = Math.random() * 80 + 10;
      coin.size = this.settings.coinSize;
      coin.value = 1;
      coin.hitRadius = this.settings.hitRadiusCoinPct;
      coin.isActive = true;
      this.coins.push(coin);
    }
    /**
     * 添加粒子效果
     */
    addParticle(x, y, type) {
      const particle = {
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 1e3,
        // 1秒生命周期
        type
      };
      this.particles.push(particle);
    }
    /**
     * 检测碰撞
     */
    checkCollisions() {
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obstacle = this.obstacles[i];
        if (this.checkCollision(this.player, obstacle)) {
          const now2 = typeof performance !== "undefined" && performance.now ? performance.now() : Date.now();
          if (now2 < this.invulnerableUntil) {
            this.obstacles.splice(i, 1);
            continue;
          }
          this.obstacles.splice(i, 1);
          this.addParticle(obstacle.x, obstacle.y, "hit");
          this.lives = Math.max(0, this.lives - 1);
          this.coinStreak = 0;
          this.invulnerableUntil = now2 + this.settings.hitInvulnMs;
          if (this.lives === 0) {
            this.endReason = "lives";
            this.endGame();
            return;
          }
        }
      }
      for (let i = this.coins.length - 1; i >= 0; i--) {
        const coin = this.coins[i];
        if (this.checkCollision(this.player, coin)) {
          this.score += 1;
          this.coinStreak += 1;
          if (this.coinStreak % this.settings.coinStreakTarget === 0 && this.lives < this.settings.maxLives) {
            this.lives += 1;
            this.addParticle(coin.x, coin.y, "life");
          }
          this.coins.splice(i, 1);
          this.addParticle(coin.x, coin.y, "coin");
          this.triggerCallback("onScoreUpdate", this.score);
        }
      }
    }
    /**
     * 检测两个对象是否碰撞
     */
    checkCollision(obj1, obj2) {
      const dx = obj1.x - obj2.x;
      const dy = obj1.y - obj2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const r1 = typeof obj1.hitRadius === "number" ? obj1.hitRadius : 3;
      const r2 = typeof obj2.hitRadius === "number" ? obj2.hitRadius : 3;
      return distance < r1 + r2;
    }
    /**
     * 更新距离
     */
    updateDistance() {
      this.distance += (this.settings.baseForwardSpeed + this.player.speed * 0.4) * 0.1;
    }
    /**
     * 更新速度
     */
    updateSpeed() {
      this.speed = this.player.speed;
    }
    /**
     * 获取游戏数据
     */
    getGameData() {
      return {
        state: this.gameState,
        time: this.gameTime,
        maxTime: this.maxGameTime,
        maxLives: this.settings.maxLives,
        distance: this.distance,
        speed: this.speed,
        score: this.score,
        strokeCount: this.strokeCount,
        lives: this.lives,
        player: { ...this.player },
        obstacles: [...this.obstacles],
        coins: [...this.coins],
        particles: [...this.particles]
      };
    }
    /**
     * 设置回调函数
     */
    onStateChange(callback) {
      this.callbacks.onStateChange = callback;
    }
    onScoreUpdate(callback) {
      this.callbacks.onScoreUpdate = callback;
    }
    onGameOver(callback) {
      this.callbacks.onGameOver = callback;
    }
    /**
     * 触发回调函数
     */
    triggerCallback(event, data) {
      if (this.callbacks[event]) {
        this.callbacks[event](data);
      }
    }
  }
  const _sfc_main$3 = {
    name: "SwimmingGameUI",
    data() {
      return {
        sensorManager: null,
        swimmingGame: null,
        sensorReady: false,
        permissionError: "",
        isSwimming: false,
        gameData: {
          score: 0,
          distance: 0,
          speed: 0,
          strokeCount: 0,
          lives: 3,
          maxSpeed: 0,
          player: { x: 50, y: 50, size: 20 },
          obstacles: [],
          coins: [],
          particles: [],
          time: 0,
          maxTime: 6e4
        },
        gameState: "ready",
        endReason: null,
        waveOffset: 0,
        _lastSync: 0,
        _syncInterval: 1e3 / 30,
        showDebugWheel: false,
        wheelPos: { x: 100, y: 220 },
        wheelDragging: false,
        wheelDragOffset: { x: 0, y: 0 },
        stickX: 0,
        stickY: 0,
        stickActive: false,
        _stickMoveHandler: null,
        _stickEndHandler: null,
        _autoStartAttempted: false,
        _joystickRect: null
      };
    },
    computed: {
      livesHearts() {
        const lives = Math.max(0, this.gameData && typeof this.gameData.lives === "number" ? this.gameData.lives : 0);
        const cap = this.gameData && typeof this.gameData.maxLives === "number" ? this.gameData.maxLives : Math.max(lives, 3);
        const n = Math.min(lives, cap);
        const filled = "❤️".repeat(n);
        const empty = "🤍".repeat(Math.max(0, cap - n));
        return filled + empty;
      },
      endMessage() {
        if (!this.endReason)
          return "";
        if (this.endReason === "time")
          return "时间到，挑战结束";
        if (this.endReason === "lives")
          return "生命耗尽，挑战结束";
        return "挑战结束";
      },
      timeDisplay() {
        const ms = Math.max(0, this.gameData.maxTime - this.gameData.time);
        const s = Math.ceil(ms / 1e3);
        const m = Math.floor(s / 60);
        const sec = (s % 60).toString().padStart(2, "0");
        return `${m}:${sec}`;
      },
      distanceDisplay() {
        return Math.round(this.gameData.distance);
      },
      speedDisplay() {
        return (this.gameData.speed * 10).toFixed(1);
      },
      maxSpeedDisplay() {
        return (this.gameData.maxSpeed * 10).toFixed(1);
      },
      playerStyle() {
        return {
          left: this.gameData.player.x + "%",
          top: this.gameData.player.y + "%"
        };
      },
      stickStyle() {
        const r = 40;
        return {
          transform: `translate(-50%,-50%) translate(${this.stickX * r}px, ${this.stickY * r}px)`
        };
      }
    },
    mounted() {
      this.initGame();
    },
    beforeUnmount() {
      this.cleanup();
    },
    methods: {
      _getEventHost() {
        const w = typeof window !== "undefined" && window && typeof window.addEventListener === "function" ? window : null;
        if (w)
          return w;
        const d = typeof document !== "undefined" && document && typeof document.addEventListener === "function" ? document : null;
        return d;
      },
      _getViewportSize() {
        const sys = typeof uni !== "undefined" && uni && uni.getSystemInfoSync ? uni.getSystemInfoSync() : null;
        const width = typeof window !== "undefined" && window && typeof window.innerWidth === "number" ? window.innerWidth : sys ? sys.windowWidth : 750;
        const height = typeof window !== "undefined" && window && typeof window.innerHeight === "number" ? window.innerHeight : sys ? sys.windowHeight : 1334;
        return { width, height };
      },
      _measureJoystick(cb) {
        try {
          const q = typeof uni !== "undefined" && uni && uni.createSelectorQuery ? uni.createSelectorQuery().in(this) : null;
          if (!q) {
            if (cb)
              cb(null);
            return;
          }
          q.select(".joystick").boundingClientRect((rect) => {
            if (rect)
              this._joystickRect = rect;
            if (cb)
              cb(rect);
          }).exec(() => {
          });
        } catch (e) {
          if (cb)
            cb(null);
        }
      },
      _extractPoint(e) {
        const t = e && (e.touches && e.touches[0]) || e && (e.changedTouches && e.changedTouches[0]) || e || {};
        const x = t.clientX ?? t.pageX ?? (e && e.detail && e.detail.x) ?? 0;
        const y = t.clientY ?? t.pageY ?? (e && e.detail && e.detail.y) ?? 0;
        const target = t.target || e && e.target || null;
        return { x, y, target };
      },
      async initGame() {
        const setup = async () => {
          this.sensorManager = new SensorManager();
          this.sensorManager.onMotion(this.handleMotion);
          this.sensorManager.onError((err) => formatAppLog("error", "at components/SwimmingGameUI.vue:230", "传感器错误", err));
          this.swimmingGame = new SwimmingGame();
          this.swimmingGame.onStateChange((state) => {
            this.gameState = state;
          });
          this.swimmingGame.onScoreUpdate((score) => {
            this.gameData.score = score;
          });
          this.swimmingGame.onGameOver((data) => {
            formatAppLog("log", "at components/SwimmingGameUI.vue:235", "GameOver", data);
          });
          this.swimmingGame.onGameOver((data) => {
            try {
              const prevBest = uni.getStorageSync("bestScore");
              if (!prevBest || data.score > prevBest) {
                uni.setStorageSync("bestScore", data.score);
              }
              uni.setStorageSync("recentScore", data.score);
              this.endReason = data && data.endReason ? data.endReason : null;
              if (data && typeof data.lives === "number") {
                this.gameData.lives = data.lives;
              }
              const prevLongest = Number(uni.getStorageSync("longestGameMs") || 0);
              const nowTime = Number(data && data.time ? data.time : 0);
              if (!isNaN(nowTime) && nowTime > prevLongest) {
                uni.setStorageSync("longestGameMs", nowTime);
              }
              const prevGames = Number(uni.getStorageSync("totalGames") || 0);
              uni.setStorageSync("totalGames", prevGames + 1);
              const prevCoins = Number(uni.getStorageSync("totalCoins") || 0);
              const addCoins = typeof data.score === "number" && data.score > 0 ? data.score : 0;
              uni.setStorageSync("totalCoins", prevCoins + addCoins);
            } catch (e) {
              formatAppLog("warn", "at components/SwimmingGameUI.vue:257", "保存分数失败", e);
            }
          });
          this.swimmingGame.init();
          try {
            await this.sensorManager.initialize();
            this.sensorManager.startListening();
            this.sensorReady = true;
            this.permissionError = "";
            formatAppLog("log", "at components/SwimmingGameUI.vue:266", "[Sensor] 初始化成功 sensorReady=true");
            uni.showToast({ title: "传感器就绪", icon: "none" });
          } catch (e) {
            formatAppLog("warn", "at components/SwimmingGameUI.vue:269", "传感器未就绪:", e.message);
            this.permissionError = e.message || "无法获取传感器";
            formatAppLog("log", "at components/SwimmingGameUI.vue:271", "[Sensor] 初始化失败 permissionError=", this.permissionError);
            uni.showToast({ title: "传感器失败", icon: "none" });
          }
          setTimeout(() => {
            if (!this._autoStartAttempted && this.gameState === "ready" && !this.sensorReady) {
              this._autoStartAttempted = true;
              formatAppLog("log", "at components/SwimmingGameUI.vue:278", "[AutoStart] 传感器未就绪，自动切换摇杆启动");
              this.enableJoystickAndStart();
            }
          }, 5e3);
        };
        if (typeof plus === "undefined") {
          await setup();
        } else if (typeof plus === "object") {
          try {
            await setup();
          } catch (e) {
            formatAppLog("log", "at components/SwimmingGameUI.vue:292", "[Init] 直接 setup 失败，等待 plusready", e.message);
            document.addEventListener("plusready", setup, { once: true });
          }
        } else {
          document.addEventListener("plusready", setup, { once: true });
        }
      },
      async retryPermission() {
        this.permissionError = "";
        this.sensorReady = false;
        try {
          await this.sensorManager.initialize();
          this.sensorManager.startListening();
          this.sensorReady = true;
        } catch (e) {
          this.permissionError = e.message || "授权失败";
        }
      },
      enableJoystickMode() {
        this.joystickOnly = true;
        this.sensorReady = true;
        this.permissionError = "";
        this.showDebugWheel = true;
        if (!this.swimmingGame) {
          this.swimmingGame = new SwimmingGame();
          this.swimmingGame.onStateChange((state) => {
            this.gameState = state;
          });
          this.swimmingGame.onScoreUpdate((score) => {
            this.gameData.score = score;
          });
          this.swimmingGame.onGameOver((data) => {
            formatAppLog("log", "at components/SwimmingGameUI.vue:321", "GameOver", data);
          });
          this.swimmingGame.init();
        }
      },
      enableJoystickAndStart() {
        this.enableJoystickMode();
        this.startGame();
      },
      startGame() {
        formatAppLog("log", "at components/SwimmingGameUI.vue:330", "[UI] startGame 被触发 sensorReady=", this.sensorReady);
        if (!this.sensorReady) {
          formatAppLog("log", "at components/SwimmingGameUI.vue:332", "[UI] 传感器未就绪，尝试自动启用摇杆模式");
          this.enableJoystickMode();
        }
        if (!this.swimmingGame) {
          formatAppLog("log", "at components/SwimmingGameUI.vue:336", "[UI] swimmingGame 实例不存在，兜底创建");
          this.swimmingGame = new SwimmingGame();
          this.swimmingGame.onStateChange((state) => {
            this.gameState = state;
          });
          this.swimmingGame.onScoreUpdate((score) => {
            this.gameData.score = score;
          });
          this.swimmingGame.onGameOver((data) => {
            formatAppLog("log", "at components/SwimmingGameUI.vue:340", "GameOver", data);
          });
          this.swimmingGame.init();
        }
        this.swimmingGame.startGame();
        this.tickSync();
      },
      pauseGame() {
        this.swimmingGame.pauseGame();
      },
      resumeGame() {
        this.swimmingGame.resumeGame();
        this.tickSync();
      },
      endGame() {
        this.swimmingGame.endGame();
      },
      togglePause() {
        if (this.gameState === "playing")
          this.pauseGame();
        else if (this.gameState === "paused")
          this.resumeGame();
      },
      restartGame() {
        this.endReason = null;
        this.swimmingGame.resetGame();
        this.swimmingGame.startGame();
        this.tickSync();
      },
      toggleDebugWheel() {
        this.showDebugWheel = !this.showDebugWheel;
      },
      doLogout() {
        try {
          logout();
        } catch (e) {
        }
        uni.reLaunch({ url: "/pages/auth/login" });
      },
      wheelAction(action) {
        switch (action) {
          case "up":
            this.swimmingGame.nudge(0, -3);
            break;
          case "down":
            this.swimmingGame.nudge(0, 3);
            break;
          case "left":
            this.swimmingGame.nudge(-3, 0);
            break;
          case "right":
            this.swimmingGame.nudge(3, 0);
            break;
          case "obstacle":
            this.swimmingGame.spawnObstacle();
            break;
          case "coin":
            this.swimmingGame.spawnCoin();
            break;
          case "speed+":
            this.swimmingGame.boostSpeed(0.5);
            break;
          case "speed-":
            this.swimmingGame.player.speed = Math.max(0, this.swimmingGame.player.speed - 0.5);
            break;
          case "stroke":
            this.swimmingGame.simulateStroke(1.2);
            break;
          case "pause":
            this.pauseGame();
            break;
          case "resume":
            this.resumeGame();
            break;
          case "end":
            this.endGame();
            break;
        }
      },
      startStick(e) {
        const point = this._extractPoint(e);
        this.stickActive = true;
        if (!this._joystickRect) {
          this._measureJoystick(() => {
            this.updateStick(point);
          });
        } else {
          this.updateStick(point);
        }
        if (!this._stickMoveHandler)
          this._stickMoveHandler = (ev) => this.onStickMove(ev);
        if (!this._stickEndHandler)
          this._stickEndHandler = () => this.endStick();
        const host = this._getEventHost();
        if (host) {
          host.addEventListener("touchmove", this._stickMoveHandler, { passive: false });
          host.addEventListener("mousemove", this._stickMoveHandler);
          host.addEventListener("touchend", this._stickEndHandler);
          host.addEventListener("mouseup", this._stickEndHandler);
        }
      },
      onStickMove(e) {
        if (!this.stickActive)
          return;
        const point = this._extractPoint(e);
        this.updateStick(point);
        if (e.cancelable)
          e.preventDefault();
      },
      endStick() {
        this.stickActive = false;
        this.stickX = 0;
        this.stickY = 0;
        if (this.swimmingGame)
          this.swimmingGame.setDirection(0, 0);
        const host = this._getEventHost();
        if (host) {
          if (this._stickMoveHandler) {
            host.removeEventListener("touchmove", this._stickMoveHandler);
            host.removeEventListener("mousemove", this._stickMoveHandler);
          }
          if (this._stickEndHandler) {
            host.removeEventListener("touchend", this._stickEndHandler);
            host.removeEventListener("mouseup", this._stickEndHandler);
          }
        }
      },
      updateStick(point) {
        let rect = this._joystickRect;
        if (!rect) {
          this._measureJoystick(() => this.updateStick(point));
          return;
        }
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = point.x - cx;
        const dy = point.y - cy;
        const maxR = rect.width / 2 - 20;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const clamped = Math.min(dist, maxR);
        const ratio = clamped / maxR;
        const nx = dx / dist * ratio || 0;
        const ny = dy / dist * ratio || 0;
        this.stickX = nx;
        this.stickY = ny;
        if (this.swimmingGame)
          this.swimmingGame.setDirection(nx, ny);
      },
      startWheelDrag(e) {
        const point = this._extractPoint(e);
        const target = e.target || e.touches && e.touches[0] && e.touches[0].target;
        if (this.stickActive || target && target.closest && target.closest(".joystick")) {
          return;
        }
        this.wheelDragging = true;
        this.wheelDragOffset.x = point.x - this.wheelPos.x;
        this.wheelDragOffset.y = point.y - this.wheelPos.y;
        const host = this._getEventHost();
        if (host) {
          host.addEventListener("touchmove", this.onWheelDrag, { passive: false });
          host.addEventListener("mousemove", this.onWheelDrag);
          host.addEventListener("touchend", this.endWheelDrag);
          host.addEventListener("mouseup", this.endWheelDrag);
        }
      },
      onWheelDrag(e) {
        if (!this.wheelDragging)
          return;
        const point = this._extractPoint(e);
        const nx = point.x - this.wheelDragOffset.x;
        const ny = point.y - this.wheelDragOffset.y;
        const { width: vw, height: vh } = this._getViewportSize();
        this.wheelPos.x = Math.max(20, Math.min(vw - 260, nx));
        this.wheelPos.y = Math.max(80, Math.min(vh - 260, ny));
        if (e.cancelable)
          e.preventDefault();
      },
      endWheelDrag() {
        this.wheelDragging = false;
        const host = this._getEventHost();
        if (host) {
          host.removeEventListener("touchmove", this.onWheelDrag);
          host.removeEventListener("mousemove", this.onWheelDrag);
          host.removeEventListener("touchend", this.endWheelDrag);
          host.removeEventListener("mouseup", this.endWheelDrag);
        }
      },
      handleMotion(data) {
        const ori = data.orientation || {};
        const tiltX = (ori.gamma || 0) / 90;
        const cappedBeta = Math.max(-90, Math.min(90, ori.beta || 0));
        const tiltY = cappedBeta / 90;
        this.swimmingGame.setTilt(tiltX, tiltY);
      },
      tickSync() {
        const raf = typeof window !== "undefined" && typeof window.requestAnimationFrame === "function" ? window.requestAnimationFrame.bind(window) : (cb) => setTimeout(() => cb(typeof performance !== "undefined" && performance.now ? performance.now() : Date.now()), 16);
        const sync = (ts) => {
          if (this.gameState === "playing") {
            if (!this._lastSync || ts - this._lastSync >= this._syncInterval) {
              const data = this.swimmingGame.getGameData();
              if (data.speed > data.maxSpeed)
                data.maxSpeed = data.speed;
              this.gameData = data;
              this._lastSync = ts;
            }
            raf(sync);
          }
        };
        raf(sync);
      },
      objectStyle(obj) {
        return { left: obj.x + "%", top: obj.y + "%", width: obj.size + "px", height: obj.size + "px" };
      },
      particleStyle(p) {
        return { left: p.x + "%", top: p.y + "%", opacity: (p.life / 1e3).toFixed(2) };
      },
      cleanup() {
        if (this.sensorManager)
          this.sensorManager.stopListening();
        if (this.swimmingGame)
          this.swimmingGame.stopGameLoop();
      }
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "swimming-game-container" }, [
      vue.createCommentVNode(" 权限失败覆盖层 "),
      $data.permissionError ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "overlay"
      }, [
        vue.createElementVNode("view", { class: "overlay-box" }, [
          vue.createElementVNode("text", { class: "ov-title" }, "传感器不可用"),
          vue.createElementVNode("text", { class: "ov-msg" }, [
            vue.createTextVNode(
              vue.toDisplayString($data.permissionError) + " ",
              1
              /* TEXT */
            ),
            !$data.sensorReady ? (vue.openBlock(), vue.createElementBlock(
              vue.Fragment,
              { key: 0 },
              [
                vue.createTextVNode("如果多次授权失败，仍可使用“摇杆模式”体验游戏。")
              ],
              64
              /* STABLE_FRAGMENT */
            )) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("view", { style: { "display": "flex", "gap": "24rpx", "flex-wrap": "wrap", "justify-content": "center" } }, [
            vue.createElementVNode("button", {
              class: "btn primary",
              onClick: [
                _cache[0] || (_cache[0] = (...args) => $options.retryPermission && $options.retryPermission(...args)),
                _cache[1] || (_cache[1] = (...args) => $options.retryPermission && $options.retryPermission(...args))
              ]
            }, "重试授权"),
            vue.createElementVNode("button", {
              class: "btn",
              onClick: [
                _cache[2] || (_cache[2] = (...args) => $options.enableJoystickMode && $options.enableJoystickMode(...args)),
                _cache[3] || (_cache[3] = (...args) => $options.enableJoystickMode && $options.enableJoystickMode(...args))
              ]
            }, "仅摇杆模式")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" Ready Screen "),
      $data.gameState === "ready" ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "panel start"
      }, [
        vue.createElementVNode("text", { class: "title" }, "游泳游戏"),
        vue.createElementVNode("text", { class: "subtitle" }, "倾斜手机来控制方向，收集金币并躲避障碍"),
        vue.createElementVNode("button", {
          class: "btn primary",
          disabled: !$data.sensorReady,
          onClick: [
            _cache[4] || (_cache[4] = (...args) => $options.startGame && $options.startGame(...args)),
            _cache[5] || (_cache[5] = (...args) => $options.startGame && $options.startGame(...args))
          ],
          onTouchstart: _cache[6] || (_cache[6] = (...args) => $options.startGame && $options.startGame(...args))
        }, vue.toDisplayString($data.sensorReady ? "开始游戏" : "等待传感器权限"), 41, ["disabled"]),
        vue.createElementVNode(
          "button",
          {
            class: "btn",
            onClick: [
              _cache[7] || (_cache[7] = (...args) => $options.enableJoystickAndStart && $options.enableJoystickAndStart(...args)),
              _cache[8] || (_cache[8] = (...args) => $options.enableJoystickAndStart && $options.enableJoystickAndStart(...args))
            ],
            onTouchstart: _cache[9] || (_cache[9] = (...args) => $options.enableJoystickAndStart && $options.enableJoystickAndStart(...args))
          },
          "改用摇杆开始",
          32
          /* NEED_HYDRATION */
        ),
        vue.createElementVNode("view", { class: "tips" }, [
          vue.createElementVNode("text", null, "📱 倾斜手机：左右/前后控制方向"),
          vue.createElementVNode("text", null, "🎯 收集金币，避开障碍物"),
          vue.createElementVNode("text", null, "⏰ 游戏时长：60秒")
        ])
      ])) : $data.gameState === "playing" ? (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 2 },
        [
          vue.createCommentVNode(" Playing Screen "),
          vue.createElementVNode("view", { class: "panel playing" }, [
            vue.createElementVNode("view", { class: "hud" }, [
              vue.createElementVNode("view", { class: "hud-item" }, [
                vue.createElementVNode("text", { class: "label" }, "分数"),
                vue.createElementVNode(
                  "text",
                  { class: "val" },
                  vue.toDisplayString($data.gameData.score),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "hud-item" }, [
                vue.createElementVNode("text", { class: "label" }, "距离"),
                vue.createElementVNode(
                  "text",
                  { class: "val" },
                  vue.toDisplayString($options.distanceDisplay) + "m",
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "hud-item" }, [
                vue.createElementVNode("text", { class: "label" }, "速度"),
                vue.createElementVNode(
                  "text",
                  { class: "val" },
                  vue.toDisplayString($options.speedDisplay) + "km/h",
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "hud-item" }, [
                vue.createElementVNode("text", { class: "label" }, "剩余"),
                vue.createElementVNode(
                  "text",
                  { class: "val" },
                  vue.toDisplayString($options.timeDisplay),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "hud-item" }, [
                vue.createElementVNode("text", { class: "label" }, "生命"),
                vue.createElementVNode(
                  "text",
                  { class: "val" },
                  vue.toDisplayString($options.livesHearts),
                  1
                  /* TEXT */
                )
              ]),
              vue.createCommentVNode(" 已改为倾斜控制，移除挥臂统计 "),
              vue.createElementVNode("view", { class: "hud-item" }, [
                vue.createElementVNode("text", { class: "label" }, "最高速"),
                vue.createElementVNode(
                  "text",
                  { class: "val" },
                  vue.toDisplayString($options.maxSpeedDisplay) + "km/h",
                  1
                  /* TEXT */
                )
              ])
            ]),
            vue.createCommentVNode(" 大号生命徽章 "),
            vue.createElementVNode(
              "view",
              {
                class: "life-badge",
                "aria-label": "生命"
              },
              vue.toDisplayString($options.livesHearts),
              1
              /* TEXT */
            ),
            vue.createElementVNode("view", { class: "game-area" }, [
              vue.createCommentVNode(" Player "),
              vue.createElementVNode(
                "view",
                {
                  class: vue.normalizeClass(["player", { swimming: $data.isSwimming }]),
                  style: vue.normalizeStyle($options.playerStyle)
                },
                "🏊‍♂️",
                6
                /* CLASS, STYLE */
              ),
              vue.createCommentVNode(" Obstacles "),
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.gameData.obstacles, (o, i) => {
                  return vue.openBlock(), vue.createElementBlock(
                    "view",
                    {
                      key: "ob-" + i,
                      class: "obj obstacle",
                      style: vue.normalizeStyle($options.objectStyle(o))
                    },
                    "🪨",
                    4
                    /* STYLE */
                  );
                }),
                128
                /* KEYED_FRAGMENT */
              )),
              vue.createCommentVNode(" Coins "),
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.gameData.coins, (c, i) => {
                  return vue.openBlock(), vue.createElementBlock(
                    "view",
                    {
                      key: "coin-" + i,
                      class: "obj coin",
                      style: vue.normalizeStyle($options.objectStyle(c))
                    },
                    "🪙",
                    4
                    /* STYLE */
                  );
                }),
                128
                /* KEYED_FRAGMENT */
              )),
              vue.createCommentVNode(" Particles "),
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.gameData.particles, (p, i) => {
                  return vue.openBlock(), vue.createElementBlock(
                    "view",
                    {
                      key: "p-" + i,
                      class: "obj particle",
                      style: vue.normalizeStyle($options.particleStyle(p))
                    },
                    "✨",
                    4
                    /* STYLE */
                  );
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ]),
            vue.createCommentVNode(" 底部工具条 "),
            vue.createElementVNode("view", { class: "bottom-toolbar" }, [
              vue.createElementVNode("button", {
                class: "tb-btn",
                onClick: _cache[10] || (_cache[10] = (...args) => $options.togglePause && $options.togglePause(...args)),
                "aria-label": $data.gameState === "playing" ? "暂停" : "继续"
              }, vue.toDisplayString($data.gameState === "playing" ? "⏸️" : "▶️"), 9, ["aria-label"]),
              vue.createElementVNode("button", {
                class: "tb-btn",
                onClick: _cache[11] || (_cache[11] = (...args) => $options.restartGame && $options.restartGame(...args)),
                "aria-label": "重开"
              }, "🔄"),
              vue.createElementVNode("button", {
                class: "tb-btn danger",
                onClick: _cache[12] || (_cache[12] = (...args) => $options.endGame && $options.endGame(...args)),
                "aria-label": "结束"
              }, "⏹")
            ]),
            vue.createCommentVNode(" 调试轮盘开关 "),
            vue.createElementVNode("view", {
              class: "debug-toggle",
              onClick: _cache[13] || (_cache[13] = (...args) => $options.toggleDebugWheel && $options.toggleDebugWheel(...args))
            }, "🛠️"),
            vue.createCommentVNode(" 调试轮盘 "),
            $data.showDebugWheel ? (vue.openBlock(), vue.createElementBlock(
              "view",
              {
                key: 0,
                class: vue.normalizeClass(["debug-wheel", { dragging: $data.wheelDragging }]),
                style: vue.normalizeStyle({ left: $data.wheelPos.x + "px", top: $data.wheelPos.y + "px" }),
                onMousedown: _cache[26] || (_cache[26] = vue.withModifiers((...args) => $options.startWheelDrag && $options.startWheelDrag(...args), ["prevent"])),
                onTouchstart: _cache[27] || (_cache[27] = vue.withModifiers((...args) => $options.startWheelDrag && $options.startWheelDrag(...args), ["prevent"]))
              },
              [
                vue.createElementVNode(
                  "view",
                  {
                    class: "joystick",
                    ref: "joystick",
                    onMousedown: _cache[14] || (_cache[14] = vue.withModifiers((...args) => $options.startStick && $options.startStick(...args), ["stop", "prevent"])),
                    onTouchstart: _cache[15] || (_cache[15] = vue.withModifiers((...args) => $options.startStick && $options.startStick(...args), ["stop", "prevent"])),
                    onMousemove: _cache[16] || (_cache[16] = vue.withModifiers((...args) => $options.onStickMove && $options.onStickMove(...args), ["stop", "prevent"])),
                    onTouchmove: _cache[17] || (_cache[17] = vue.withModifiers((...args) => $options.onStickMove && $options.onStickMove(...args), ["stop", "prevent"]))
                  },
                  [
                    vue.createElementVNode(
                      "view",
                      {
                        class: "stick",
                        style: vue.normalizeStyle($options.stickStyle)
                      },
                      null,
                      4
                      /* STYLE */
                    )
                  ],
                  544
                  /* NEED_HYDRATION, NEED_PATCH */
                ),
                vue.createElementVNode("view", { class: "dbg-row" }, [
                  vue.createElementVNode("button", {
                    class: "dbg-small",
                    onClick: _cache[18] || (_cache[18] = ($event) => $options.wheelAction("obstacle"))
                  }, "障碍+"),
                  vue.createElementVNode("button", {
                    class: "dbg-small",
                    onClick: _cache[19] || (_cache[19] = ($event) => $options.wheelAction("coin"))
                  }, "金币+"),
                  vue.createElementVNode("button", {
                    class: "dbg-small",
                    onClick: _cache[20] || (_cache[20] = ($event) => $options.wheelAction("speed+"))
                  }, "速度+"),
                  vue.createElementVNode("button", {
                    class: "dbg-small",
                    onClick: _cache[21] || (_cache[21] = ($event) => $options.wheelAction("speed-"))
                  }, "速度-")
                ]),
                vue.createElementVNode("view", { class: "dbg-row" }, [
                  vue.createElementVNode("button", {
                    class: "dbg-small",
                    onClick: _cache[22] || (_cache[22] = ($event) => $options.wheelAction("stroke"))
                  }, "粒子"),
                  vue.createElementVNode(
                    "button",
                    {
                      class: "dbg-small",
                      onClick: _cache[23] || (_cache[23] = ($event) => $options.wheelAction($data.swimmingGame && $data.swimmingGame.gameState === "playing" ? "pause" : "resume"))
                    },
                    vue.toDisplayString($data.swimmingGame && $data.swimmingGame.gameState === "playing" ? "暂停" : "继续"),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("button", {
                    class: "dbg-small",
                    onClick: _cache[24] || (_cache[24] = ($event) => $options.wheelAction("end"))
                  }, "结束"),
                  vue.createElementVNode("button", {
                    class: "dbg-small",
                    onClick: _cache[25] || (_cache[25] = (...args) => $options.restartGame && $options.restartGame(...args))
                  }, "重开")
                ])
              ],
              38
              /* CLASS, STYLE, NEED_HYDRATION */
            )) : vue.createCommentVNode("v-if", true)
          ])
        ],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      )) : $data.gameState === "paused" ? (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 3 },
        [
          vue.createCommentVNode(" Paused Screen "),
          vue.createElementVNode("view", { class: "panel paused" }, [
            vue.createElementVNode("text", { class: "title" }, "已暂停"),
            vue.createElementVNode("button", {
              class: "btn primary",
              onClick: _cache[28] || (_cache[28] = (...args) => $options.resumeGame && $options.resumeGame(...args))
            }, "继续"),
            vue.createElementVNode("button", {
              class: "btn",
              onClick: _cache[29] || (_cache[29] = (...args) => $options.endGame && $options.endGame(...args))
            }, "结束")
          ])
        ],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      )) : (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 4 },
        [
          vue.createCommentVNode(" Ended Screen "),
          vue.createElementVNode("view", { class: "panel ended" }, [
            vue.createElementVNode("text", { class: "title" }, "游戏结束"),
            $data.endReason ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "subtitle"
              },
              vue.toDisplayString($options.endMessage),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true),
            vue.createElementVNode("view", { class: "summary" }, [
              vue.createElementVNode(
                "text",
                null,
                "分数：" + vue.toDisplayString($data.gameData.score),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                null,
                "距离：" + vue.toDisplayString($options.distanceDisplay) + "m",
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                null,
                "最高速度：" + vue.toDisplayString($options.maxSpeedDisplay) + "km/h",
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                null,
                "剩余生命：" + vue.toDisplayString($options.livesHearts),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("button", {
              class: "btn primary",
              onClick: _cache[30] || (_cache[30] = (...args) => $options.restartGame && $options.restartGame(...args))
            }, "再玩一次")
          ])
        ],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      ))
    ]);
  }
  const SwimmingGameUI = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-d4f1ba7f"], ["__file", "C:/Users/ykc04/Documents/HBuilderProjects/Swim-app/components/SwimmingGameUI.vue"]]);
  const _sfc_main$2 = {
    name: "SwimmingPage",
    components: {
      SwimmingGameUI
    },
    data() {
      return {
        showInstructions: false,
        showPermissionTip: false,
        gameStarted: false,
        countdown: 0,
        bestScore: uni.getStorageSync("bestScore") || 0
      };
    },
    onLoad() {
      this.checkSensorSupport();
    },
    onShow() {
      this.checkSensorStatus();
    },
    methods: {
      /**
       * 返回上一页
       */
      /**
       * 检查传感器支持
       */
      checkSensorSupport() {
        const hasMotion = "DeviceMotionEvent" in window;
        const hasOrientation = "DeviceOrientationEvent" in window;
        if (!hasMotion && !hasOrientation) {
          uni.showModal({
            title: "设备不支持",
            content: "您的设备不支持传感器功能，无法进行游戏",
            showCancel: false,
            success: () => {
              uni.navigateBack();
            }
          });
          return false;
        }
        return true;
      },
      /**
       * 检查传感器状态
       */
      checkSensorStatus() {
        if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
          this.showPermissionTip = true;
        }
      },
      /**
       * 请求传感器权限
       */
      async requestPermission() {
        try {
          if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
            const motionPermission = await DeviceMotionEvent.requestPermission();
            if (motionPermission !== "granted") {
              throw new Error("运动传感器权限被拒绝");
            }
          }
          if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
            const orientationPermission = await DeviceOrientationEvent.requestPermission();
            if (orientationPermission !== "granted") {
              throw new Error("方向传感器权限被拒绝");
            }
          }
          this.showPermissionTip = false;
          uni.showToast({
            title: "权限获取成功",
            icon: "success"
          });
        } catch (error) {
          formatAppLog("error", "at pages/swimming/index.vue:170", "权限获取失败:", error);
          uni.showModal({
            title: "权限获取失败",
            content: "无法获取传感器权限，请检查浏览器设置",
            showCancel: false
          });
        }
      },
      /**
       * 开始游戏
       */
      startGame() {
        this.showInstructions = false;
        this.gameStarted = true;
        this.countdown = 3;
        const tick = () => {
          if (this.countdown <= 0) {
            this.countdown = 0;
            const ui = this.$refs.gameUI;
            if (ui && ui.sensorReady) {
              ui.startGame();
            } else if (ui && typeof ui.enableJoystickAndStart === "function") {
              ui.enableJoystickAndStart();
            } else if (ui && typeof ui.enableJoystickMode === "function") {
              ui.enableJoystickMode();
              ui.startGame();
            }
          } else {
            this.countdown--;
            setTimeout(tick, 1e3);
          }
        };
        setTimeout(tick, 1e3);
      },
      /**
       * 关闭说明弹窗
       */
      closeInstructions() {
        this.showInstructions = false;
      },
      openInstructions() {
        this.showInstructions = true;
      },
      /**
       * 关闭权限提示
       */
      closePermissionTip() {
        this.showPermissionTip = false;
      },
      /**
       * 处理游戏开始
       */
      handleGameStart() {
        this.gameStarted = true;
        formatAppLog("log", "at pages/swimming/index.vue:227", "游戏开始");
      },
      /**
       * 处理游戏结束
       */
      handleGameEnd(data) {
        this.gameStarted = false;
        formatAppLog("log", "at pages/swimming/index.vue:235", "游戏结束:", data);
        uni.showModal({
          title: "游戏结束",
          content: `最终分数：${data.score}
游泳距离：${Math.round(data.distance)}m
挥臂次数：${data.strokeCount}`,
          showCancel: false,
          confirmText: "再来一局",
          success: (res) => {
            if (res.confirm) {
              this.restartGame();
            }
          }
        });
        if (data && typeof data.score === "number" && data.score > this.bestScore) {
          this.bestScore = data.score;
          uni.setStorageSync("bestScore", this.bestScore);
          uni.showToast({ title: "新纪录!", icon: "success" });
        }
      },
      /**
       * 重新开始游戏
       */
      restartGame() {
        this.$refs.gameUI.restartGame();
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    const _component_SwimmingGameUI = vue.resolveComponent("SwimmingGameUI");
    return vue.openBlock(), vue.createElementBlock("view", { class: "swimming-page" }, [
      vue.createCommentVNode(" 页面头部 "),
      vue.createElementVNode("view", { class: "page-header" }, [
        vue.createElementVNode("view", { class: "header-content" }, [
          vue.createElementVNode("text", { class: "page-title" }, "游泳游戏"),
          vue.createElementVNode("view", { class: "header-spacer" })
        ])
      ]),
      vue.createCommentVNode(" 游戏组件 "),
      vue.createVNode(_component_SwimmingGameUI, {
        ref: "gameUI",
        onGameStart: $options.handleGameStart,
        onGameEnd: $options.handleGameEnd
      }, null, 8, ["onGameStart", "onGameEnd"]),
      $data.countdown > 0 && $data.gameStarted ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "countdown-overlay"
      }, [
        vue.createElementVNode(
          "text",
          { class: "count-text" },
          vue.toDisplayString($data.countdown),
          1
          /* TEXT */
        )
      ])) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("view", { class: "best-score-box" }, [
        vue.createElementVNode(
          "text",
          { class: "best-score-text" },
          "最佳分数：" + vue.toDisplayString($data.bestScore),
          1
          /* TEXT */
        )
      ]),
      vue.createCommentVNode(" 游戏说明弹窗 "),
      $data.showInstructions ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "instructions-modal"
      }, [
        vue.createElementVNode("view", { class: "modal-content" }, [
          vue.createElementVNode("view", { class: "modal-header" }, [
            vue.createElementVNode("text", { class: "modal-title" }, "游戏说明"),
            vue.createElementVNode("button", {
              class: "close-button",
              onClick: [
                _cache[0] || (_cache[0] = (...args) => $options.closeInstructions && $options.closeInstructions(...args)),
                _cache[1] || (_cache[1] = (...args) => $options.closeInstructions && $options.closeInstructions(...args))
              ]
            }, "×")
          ]),
          vue.createElementVNode("view", { class: "modal-body" }, [
            vue.createElementVNode("view", { class: "instruction-section" }, [
              vue.createElementVNode("text", { class: "section-title" }, "🎮 游戏玩法"),
              vue.createElementVNode("text", { class: "instruction-text" }, "• 倾斜手机控制方向（左右/前后）"),
              vue.createElementVNode("text", { class: "instruction-text" }, "• 角色持续前进，方向受倾斜与摇杆影响"),
              vue.createElementVNode("text", { class: "instruction-text" }, "• 收集金币获取分数，避开障碍物")
            ]),
            vue.createElementVNode("view", { class: "instruction-section" }, [
              vue.createElementVNode("text", { class: "section-title" }, "📱 传感器与安全"),
              vue.createElementVNode("text", { class: "instruction-text" }, "• 需要方向传感器（DeviceOrientation）权限"),
              vue.createElementVNode("text", { class: "instruction-text" }, "• 请在安全环境下游玩，避免剧烈晃动"),
              vue.createElementVNode("text", { class: "instruction-text" }, "• 建议坐姿或站立轻微倾斜操作")
            ]),
            vue.createElementVNode("view", { class: "instruction-section" }, [
              vue.createElementVNode("text", { class: "section-title" }, "🏆 规则与时长"),
              vue.createElementVNode("text", { class: "instruction-text" }, "• 金币 +1 分；每连续吃 3 个金币 +1 命（上限 5）"),
              vue.createElementVNode("text", { class: "instruction-text" }, "• 碰撞障碍物会扣 1 命，并获得短暂无敌"),
              vue.createElementVNode("text", { class: "instruction-text" }, "• 初始 3 条命；总时长 60 秒")
            ])
          ]),
          vue.createElementVNode("view", { class: "modal-footer" }, [
            vue.createElementVNode("button", {
              class: "start-game-button",
              onClick: [
                _cache[2] || (_cache[2] = (...args) => $options.startGame && $options.startGame(...args)),
                _cache[3] || (_cache[3] = (...args) => $options.startGame && $options.startGame(...args))
              ]
            }, " 开始游戏 ")
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 规则浮动按钮 "),
      vue.createElementVNode("button", {
        class: "rules-fab",
        onClick: [
          _cache[4] || (_cache[4] = (...args) => $options.openInstructions && $options.openInstructions(...args)),
          _cache[5] || (_cache[5] = (...args) => $options.openInstructions && $options.openInstructions(...args))
        ]
      }, "规则"),
      vue.createCommentVNode(" 传感器权限提示 "),
      $data.showPermissionTip ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "permission-tip"
      }, [
        vue.createElementVNode("view", { class: "tip-content" }, [
          vue.createElementVNode("text", { class: "tip-text" }, "需要传感器权限才能进行游戏"),
          vue.createElementVNode("button", {
            class: "tip-button",
            onClick: [
              _cache[6] || (_cache[6] = (...args) => $options.requestPermission && $options.requestPermission(...args)),
              _cache[7] || (_cache[7] = (...args) => $options.requestPermission && $options.requestPermission(...args))
            ]
          }, " 授权 "),
          vue.createElementVNode("button", {
            class: "tip-close",
            onClick: [
              _cache[8] || (_cache[8] = (...args) => $options.closePermissionTip && $options.closePermissionTip(...args)),
              _cache[9] || (_cache[9] = (...args) => $options.closePermissionTip && $options.closePermissionTip(...args))
            ]
          }, " × ")
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesSwimmingIndex = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-cd4f8b1e"], ["__file", "C:/Users/ykc04/Documents/HBuilderProjects/Swim-app/pages/swimming/index.vue"]]);
  const _sfc_main$1 = {
    data() {
      return {
        session: null,
        user: null,
        bestScore: 0,
        recentScore: 0,
        totalGames: 0,
        totalCoins: 0,
        longestGameMs: 0
      };
    },
    computed: {
      expiresDisplay() {
        if (!this.session)
          return "";
        const d = new Date(this.session.expiresAt);
        const pad2 = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
      },
      longestGameDisplay() {
        const ms = Number(this.longestGameMs || 0);
        if (!ms || isNaN(ms))
          return "0:00";
        const totalSec = Math.round(ms / 1e3);
        const m = Math.floor(totalSec / 60);
        const s = String(totalSec % 60).padStart(2, "0");
        return `${m}:${s}`;
      }
    },
    mounted() {
      this.session = getSession();
      this.user = getCurrentUser();
      try {
        const best = uni.getStorageSync("bestScore");
        if (typeof best === "number")
          this.bestScore = best;
        const recent = uni.getStorageSync("recentScore");
        if (typeof recent === "number")
          this.recentScore = recent;
        const tGames = uni.getStorageSync("totalGames");
        if (typeof tGames === "number")
          this.totalGames = tGames;
        const tCoins = uni.getStorageSync("totalCoins");
        if (typeof tCoins === "number")
          this.totalCoins = tCoins;
        const lg = uni.getStorageSync("longestGameMs");
        if (typeof lg === "number")
          this.longestGameMs = lg;
      } catch (e) {
      }
    },
    methods: {
      goLogin() {
        uni.reLaunch({ url: "/pages/auth/login" });
      },
      doLogout() {
        logout();
        uni.reLaunch({ url: "/pages/auth/login" });
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "my-page" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("text", { class: "title" }, "我的"),
        vue.createElementVNode("text", { class: "subtitle" }, "账户与数据")
      ]),
      $data.user ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "card"
      }, [
        vue.createElementVNode("text", { class: "row" }, [
          vue.createElementVNode("text", { class: "label" }, "用户名："),
          vue.createTextVNode(
            vue.toDisplayString($data.user.name),
            1
            /* TEXT */
          )
        ]),
        $data.session ? (vue.openBlock(), vue.createElementBlock("text", {
          key: 0,
          class: "row"
        }, [
          vue.createElementVNode("text", { class: "label" }, "登录有效期："),
          vue.createTextVNode(
            vue.toDisplayString($options.expiresDisplay),
            1
            /* TEXT */
          )
        ])) : vue.createCommentVNode("v-if", true),
        $data.session ? (vue.openBlock(), vue.createElementBlock("text", {
          key: 1,
          class: "row"
        }, [
          vue.createElementVNode("text", { class: "label" }, "令牌："),
          vue.createTextVNode(
            vue.toDisplayString($data.session.token),
            1
            /* TEXT */
          )
        ])) : vue.createCommentVNode("v-if", true)
      ])) : (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "card"
      }, [
        vue.createElementVNode("text", null, "未登录，请前往登录页。"),
        vue.createElementVNode("button", {
          class: "btn",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.goLogin && $options.goLogin(...args))
        }, "去登录")
      ])),
      vue.createElementVNode("view", { class: "section" }, [
        vue.createElementVNode("text", { class: "sec-title" }, "游戏概要（示例）"),
        vue.createElementVNode("view", { class: "stats" }, [
          vue.createElementVNode(
            "text",
            null,
            "最近分数：" + vue.toDisplayString($data.recentScore),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            null,
            "最佳分数：" + vue.toDisplayString($data.bestScore),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            null,
            "累计对局：" + vue.toDisplayString($data.totalGames),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            null,
            "累计金币：" + vue.toDisplayString($data.totalCoins),
            1
            /* TEXT */
          ),
          vue.createElementVNode(
            "text",
            null,
            "最长一局：" + vue.toDisplayString($options.longestGameDisplay),
            1
            /* TEXT */
          )
        ])
      ]),
      $data.user ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "footer"
      }, [
        vue.createElementVNode("button", {
          class: "btn danger",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.doLogout && $options.doLogout(...args))
        }, "退出登录")
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesProfileMy = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-4e6dda54"], ["__file", "C:/Users/ykc04/Documents/HBuilderProjects/Swim-app/pages/profile/my.vue"]]);
  __definePage("pages/auth/login", PagesAuthLogin);
  __definePage("pages/auth/register", PagesAuthRegister);
  __definePage("pages/test-sensors", PagesTestSensors);
  __definePage("pages/swimming/index", PagesSwimmingIndex);
  __definePage("pages/profile/my", PagesProfileMy);
  const _sfc_main = {
    onLaunch() {
      formatAppLog("log", "at App.vue:4", "游泳游戏启动");
    },
    onShow() {
      formatAppLog("log", "at App.vue:7", "游泳游戏显示");
    },
    onHide() {
      formatAppLog("log", "at App.vue:10", "游泳游戏隐藏");
    },
    globalData: {
      gameVersion: "1.0.0"
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "C:/Users/ykc04/Documents/HBuilderProjects/Swim-app/App.vue"]]);
  const store = {
    state: {
      // 游戏相关状态
      gameState: {
        isPlaying: false,
        score: 0,
        level: 1
      },
      // 传感器相关状态
      sensorState: {
        isEnabled: false,
        acceleration: {
          x: 0,
          y: 0,
          z: 0
        }
      }
    },
    mutations: {
      // 更新游戏状态
      UPDATE_GAME_STATE(state, payload) {
        state.gameState = { ...state.gameState, ...payload };
      },
      // 更新传感器状态
      UPDATE_SENSOR_STATE(state, payload) {
        state.sensorState = { ...state.sensorState, ...payload };
      }
    },
    actions: {
      // 开始游戏
      startGame({ commit }) {
        commit("UPDATE_GAME_STATE", { isPlaying: true, score: 0 });
      },
      // 结束游戏
      endGame({ commit }) {
        commit("UPDATE_GAME_STATE", { isPlaying: false });
      },
      // 更新分数
      updateScore({ commit }, score) {
        commit("UPDATE_GAME_STATE", { score });
      },
      // 更新加速度数据
      updateAcceleration({ commit }, acceleration) {
        commit("UPDATE_SENSOR_STATE", { acceleration });
      }
    },
    getters: {
      isGamePlaying: (state) => state.gameState.isPlaying,
      currentScore: (state) => state.gameState.score,
      currentLevel: (state) => state.gameState.level,
      accelerationData: (state) => state.sensorState.acceleration
    }
  };
  var isVue2 = false;
  function set(target, key, val) {
    if (Array.isArray(target)) {
      target.length = Math.max(target.length, key);
      target.splice(key, 1, val);
      return val;
    }
    target[key] = val;
    return val;
  }
  function del(target, key) {
    if (Array.isArray(target)) {
      target.splice(key, 1);
      return;
    }
    delete target[key];
  }
  function getDevtoolsGlobalHook$1() {
    return getTarget$1().__VUE_DEVTOOLS_GLOBAL_HOOK__;
  }
  function getTarget$1() {
    return typeof navigator !== "undefined" && typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
  }
  const isProxyAvailable$1 = typeof Proxy === "function";
  const HOOK_SETUP$1 = "devtools-plugin:setup";
  const HOOK_PLUGIN_SETTINGS_SET$1 = "plugin:settings:set";
  let supported;
  let perf;
  function isPerformanceSupported() {
    var _a;
    if (supported !== void 0) {
      return supported;
    }
    if (typeof window !== "undefined" && window.performance) {
      supported = true;
      perf = window.performance;
    } else if (typeof global !== "undefined" && ((_a = global.perf_hooks) === null || _a === void 0 ? void 0 : _a.performance)) {
      supported = true;
      perf = global.perf_hooks.performance;
    } else {
      supported = false;
    }
    return supported;
  }
  function now() {
    return isPerformanceSupported() ? perf.now() : Date.now();
  }
  let ApiProxy$1 = class ApiProxy {
    constructor(plugin, hook) {
      this.target = null;
      this.targetQueue = [];
      this.onQueue = [];
      this.plugin = plugin;
      this.hook = hook;
      const defaultSettings = {};
      if (plugin.settings) {
        for (const id in plugin.settings) {
          const item = plugin.settings[id];
          defaultSettings[id] = item.defaultValue;
        }
      }
      const localSettingsSaveId = `__vue-devtools-plugin-settings__${plugin.id}`;
      let currentSettings = Object.assign({}, defaultSettings);
      try {
        const raw = localStorage.getItem(localSettingsSaveId);
        const data = JSON.parse(raw);
        Object.assign(currentSettings, data);
      } catch (e) {
      }
      this.fallbacks = {
        getSettings() {
          return currentSettings;
        },
        setSettings(value) {
          try {
            localStorage.setItem(localSettingsSaveId, JSON.stringify(value));
          } catch (e) {
          }
          currentSettings = value;
        },
        now() {
          return now();
        }
      };
      if (hook) {
        hook.on(HOOK_PLUGIN_SETTINGS_SET$1, (pluginId, value) => {
          if (pluginId === this.plugin.id) {
            this.fallbacks.setSettings(value);
          }
        });
      }
      this.proxiedOn = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target.on[prop];
          } else {
            return (...args) => {
              this.onQueue.push({
                method: prop,
                args
              });
            };
          }
        }
      });
      this.proxiedTarget = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target[prop];
          } else if (prop === "on") {
            return this.proxiedOn;
          } else if (Object.keys(this.fallbacks).includes(prop)) {
            return (...args) => {
              this.targetQueue.push({
                method: prop,
                args,
                resolve: () => {
                }
              });
              return this.fallbacks[prop](...args);
            };
          } else {
            return (...args) => {
              return new Promise((resolve) => {
                this.targetQueue.push({
                  method: prop,
                  args,
                  resolve
                });
              });
            };
          }
        }
      });
    }
    async setRealTarget(target) {
      this.target = target;
      for (const item of this.onQueue) {
        this.target.on[item.method](...item.args);
      }
      for (const item of this.targetQueue) {
        item.resolve(await this.target[item.method](...item.args));
      }
    }
  };
  function setupDevtoolsPlugin$1(pluginDescriptor, setupFn) {
    const descriptor = pluginDescriptor;
    const target = getTarget$1();
    const hook = getDevtoolsGlobalHook$1();
    const enableProxy = isProxyAvailable$1 && descriptor.enableEarlyProxy;
    if (hook && (target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !enableProxy)) {
      hook.emit(HOOK_SETUP$1, pluginDescriptor, setupFn);
    } else {
      const proxy = enableProxy ? new ApiProxy$1(descriptor, hook) : null;
      const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || [];
      list.push({
        pluginDescriptor: descriptor,
        setupFn,
        proxy
      });
      if (proxy)
        setupFn(proxy.proxiedTarget);
    }
  }
  /*!
   * pinia v2.1.7
   * (c) 2023 Eduardo San Martin Morote
   * @license MIT
   */
  let activePinia;
  const setActivePinia = (pinia) => activePinia = pinia;
  const getActivePinia = () => vue.hasInjectionContext() && vue.inject(piniaSymbol) || activePinia;
  const piniaSymbol = Symbol("pinia");
  function isPlainObject(o) {
    return o && typeof o === "object" && Object.prototype.toString.call(o) === "[object Object]" && typeof o.toJSON !== "function";
  }
  var MutationType;
  (function(MutationType2) {
    MutationType2["direct"] = "direct";
    MutationType2["patchObject"] = "patch object";
    MutationType2["patchFunction"] = "patch function";
  })(MutationType || (MutationType = {}));
  const IS_CLIENT = typeof window !== "undefined";
  const USE_DEVTOOLS = IS_CLIENT;
  const _global = /* @__PURE__ */ (() => typeof window === "object" && window.window === window ? window : typeof self === "object" && self.self === self ? self : typeof global === "object" && global.global === global ? global : typeof globalThis === "object" ? globalThis : { HTMLElement: null })();
  function bom(blob, { autoBom = false } = {}) {
    if (autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(blob.type)) {
      return new Blob([String.fromCharCode(65279), blob], { type: blob.type });
    }
    return blob;
  }
  function download(url, name, opts) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.onload = function() {
      saveAs(xhr.response, name, opts);
    };
    xhr.onerror = function() {
      console.error("could not download file");
    };
    xhr.send();
  }
  function corsEnabled(url) {
    const xhr = new XMLHttpRequest();
    xhr.open("HEAD", url, false);
    try {
      xhr.send();
    } catch (e) {
    }
    return xhr.status >= 200 && xhr.status <= 299;
  }
  function click(node) {
    try {
      node.dispatchEvent(new MouseEvent("click"));
    } catch (e) {
      const evt = document.createEvent("MouseEvents");
      evt.initMouseEvent("click", true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
      node.dispatchEvent(evt);
    }
  }
  const _navigator = typeof navigator === "object" ? navigator : { userAgent: "" };
  const isMacOSWebView = /* @__PURE__ */ (() => /Macintosh/.test(_navigator.userAgent) && /AppleWebKit/.test(_navigator.userAgent) && !/Safari/.test(_navigator.userAgent))();
  const saveAs = !IS_CLIENT ? () => {
  } : (
    // Use download attribute first if possible (#193 Lumia mobile) unless this is a macOS WebView or mini program
    typeof HTMLAnchorElement !== "undefined" && "download" in HTMLAnchorElement.prototype && !isMacOSWebView ? downloadSaveAs : (
      // Use msSaveOrOpenBlob as a second approach
      "msSaveOrOpenBlob" in _navigator ? msSaveAs : (
        // Fallback to using FileReader and a popup
        fileSaverSaveAs
      )
    )
  );
  function downloadSaveAs(blob, name = "download", opts) {
    const a = document.createElement("a");
    a.download = name;
    a.rel = "noopener";
    if (typeof blob === "string") {
      a.href = blob;
      if (a.origin !== location.origin) {
        if (corsEnabled(a.href)) {
          download(blob, name, opts);
        } else {
          a.target = "_blank";
          click(a);
        }
      } else {
        click(a);
      }
    } else {
      a.href = URL.createObjectURL(blob);
      setTimeout(function() {
        URL.revokeObjectURL(a.href);
      }, 4e4);
      setTimeout(function() {
        click(a);
      }, 0);
    }
  }
  function msSaveAs(blob, name = "download", opts) {
    if (typeof blob === "string") {
      if (corsEnabled(blob)) {
        download(blob, name, opts);
      } else {
        const a = document.createElement("a");
        a.href = blob;
        a.target = "_blank";
        setTimeout(function() {
          click(a);
        });
      }
    } else {
      navigator.msSaveOrOpenBlob(bom(blob, opts), name);
    }
  }
  function fileSaverSaveAs(blob, name, opts, popup) {
    popup = popup || open("", "_blank");
    if (popup) {
      popup.document.title = popup.document.body.innerText = "downloading...";
    }
    if (typeof blob === "string")
      return download(blob, name, opts);
    const force = blob.type === "application/octet-stream";
    const isSafari = /constructor/i.test(String(_global.HTMLElement)) || "safari" in _global;
    const isChromeIOS = /CriOS\/[\d]+/.test(navigator.userAgent);
    if ((isChromeIOS || force && isSafari || isMacOSWebView) && typeof FileReader !== "undefined") {
      const reader = new FileReader();
      reader.onloadend = function() {
        let url = reader.result;
        if (typeof url !== "string") {
          popup = null;
          throw new Error("Wrong reader.result type");
        }
        url = isChromeIOS ? url : url.replace(/^data:[^;]*;/, "data:attachment/file;");
        if (popup) {
          popup.location.href = url;
        } else {
          location.assign(url);
        }
        popup = null;
      };
      reader.readAsDataURL(blob);
    } else {
      const url = URL.createObjectURL(blob);
      if (popup)
        popup.location.assign(url);
      else
        location.href = url;
      popup = null;
      setTimeout(function() {
        URL.revokeObjectURL(url);
      }, 4e4);
    }
  }
  function toastMessage(message, type) {
    const piniaMessage = "🍍 " + message;
    if (typeof __VUE_DEVTOOLS_TOAST__ === "function") {
      __VUE_DEVTOOLS_TOAST__(piniaMessage, type);
    } else if (type === "error") {
      console.error(piniaMessage);
    } else if (type === "warn") {
      console.warn(piniaMessage);
    } else {
      console.log(piniaMessage);
    }
  }
  function isPinia(o) {
    return "_a" in o && "install" in o;
  }
  function checkClipboardAccess() {
    if (!("clipboard" in navigator)) {
      toastMessage(`Your browser doesn't support the Clipboard API`, "error");
      return true;
    }
  }
  function checkNotFocusedError(error) {
    if (error instanceof Error && error.message.toLowerCase().includes("document is not focused")) {
      toastMessage('You need to activate the "Emulate a focused page" setting in the "Rendering" panel of devtools.', "warn");
      return true;
    }
    return false;
  }
  async function actionGlobalCopyState(pinia) {
    if (checkClipboardAccess())
      return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(pinia.state.value));
      toastMessage("Global state copied to clipboard.");
    } catch (error) {
      if (checkNotFocusedError(error))
        return;
      toastMessage(`Failed to serialize the state. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  async function actionGlobalPasteState(pinia) {
    if (checkClipboardAccess())
      return;
    try {
      loadStoresState(pinia, JSON.parse(await navigator.clipboard.readText()));
      toastMessage("Global state pasted from clipboard.");
    } catch (error) {
      if (checkNotFocusedError(error))
        return;
      toastMessage(`Failed to deserialize the state from clipboard. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  async function actionGlobalSaveState(pinia) {
    try {
      saveAs(new Blob([JSON.stringify(pinia.state.value)], {
        type: "text/plain;charset=utf-8"
      }), "pinia-state.json");
    } catch (error) {
      toastMessage(`Failed to export the state as JSON. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  let fileInput;
  function getFileOpener() {
    if (!fileInput) {
      fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".json";
    }
    function openFile() {
      return new Promise((resolve, reject) => {
        fileInput.onchange = async () => {
          const files = fileInput.files;
          if (!files)
            return resolve(null);
          const file = files.item(0);
          if (!file)
            return resolve(null);
          return resolve({ text: await file.text(), file });
        };
        fileInput.oncancel = () => resolve(null);
        fileInput.onerror = reject;
        fileInput.click();
      });
    }
    return openFile;
  }
  async function actionGlobalOpenStateFile(pinia) {
    try {
      const open2 = getFileOpener();
      const result = await open2();
      if (!result)
        return;
      const { text, file } = result;
      loadStoresState(pinia, JSON.parse(text));
      toastMessage(`Global state imported from "${file.name}".`);
    } catch (error) {
      toastMessage(`Failed to import the state from JSON. Check the console for more details.`, "error");
      console.error(error);
    }
  }
  function loadStoresState(pinia, state) {
    for (const key in state) {
      const storeState = pinia.state.value[key];
      if (storeState) {
        Object.assign(storeState, state[key]);
      } else {
        pinia.state.value[key] = state[key];
      }
    }
  }
  function formatDisplay(display) {
    return {
      _custom: {
        display
      }
    };
  }
  const PINIA_ROOT_LABEL = "🍍 Pinia (root)";
  const PINIA_ROOT_ID = "_root";
  function formatStoreForInspectorTree$1(store2) {
    return isPinia(store2) ? {
      id: PINIA_ROOT_ID,
      label: PINIA_ROOT_LABEL
    } : {
      id: store2.$id,
      label: store2.$id
    };
  }
  function formatStoreForInspectorState$1(store2) {
    if (isPinia(store2)) {
      const storeNames = Array.from(store2._s.keys());
      const storeMap = store2._s;
      const state2 = {
        state: storeNames.map((storeId) => ({
          editable: true,
          key: storeId,
          value: store2.state.value[storeId]
        })),
        getters: storeNames.filter((id) => storeMap.get(id)._getters).map((id) => {
          const store22 = storeMap.get(id);
          return {
            editable: false,
            key: id,
            value: store22._getters.reduce((getters, key) => {
              getters[key] = store22[key];
              return getters;
            }, {})
          };
        })
      };
      return state2;
    }
    const state = {
      state: Object.keys(store2.$state).map((key) => ({
        editable: true,
        key,
        value: store2.$state[key]
      }))
    };
    if (store2._getters && store2._getters.length) {
      state.getters = store2._getters.map((getterName) => ({
        editable: false,
        key: getterName,
        value: store2[getterName]
      }));
    }
    if (store2._customProperties.size) {
      state.customProperties = Array.from(store2._customProperties).map((key) => ({
        editable: true,
        key,
        value: store2[key]
      }));
    }
    return state;
  }
  function formatEventData(events) {
    if (!events)
      return {};
    if (Array.isArray(events)) {
      return events.reduce((data, event) => {
        data.keys.push(event.key);
        data.operations.push(event.type);
        data.oldValue[event.key] = event.oldValue;
        data.newValue[event.key] = event.newValue;
        return data;
      }, {
        oldValue: {},
        keys: [],
        operations: [],
        newValue: {}
      });
    } else {
      return {
        operation: formatDisplay(events.type),
        key: formatDisplay(events.key),
        oldValue: events.oldValue,
        newValue: events.newValue
      };
    }
  }
  function formatMutationType(type) {
    switch (type) {
      case MutationType.direct:
        return "mutation";
      case MutationType.patchFunction:
        return "$patch";
      case MutationType.patchObject:
        return "$patch";
      default:
        return "unknown";
    }
  }
  let isTimelineActive = true;
  const componentStateTypes = [];
  const MUTATIONS_LAYER_ID$1 = "pinia:mutations";
  const INSPECTOR_ID$1 = "pinia";
  const { assign: assign$1 } = Object;
  const getStoreType = (id) => "🍍 " + id;
  function registerPiniaDevtools(app, pinia) {
    setupDevtoolsPlugin$1({
      id: "dev.esm.pinia",
      label: "Pinia 🍍",
      logo: "https://pinia.vuejs.org/logo.svg",
      packageName: "pinia",
      homepage: "https://pinia.vuejs.org",
      componentStateTypes,
      app
    }, (api) => {
      if (typeof api.now !== "function") {
        toastMessage("You seem to be using an outdated version of Vue Devtools. Are you still using the Beta release instead of the stable one? You can find the links at https://devtools.vuejs.org/guide/installation.html.");
      }
      api.addTimelineLayer({
        id: MUTATIONS_LAYER_ID$1,
        label: `Pinia 🍍`,
        color: 15064968
      });
      api.addInspector({
        id: INSPECTOR_ID$1,
        label: "Pinia 🍍",
        icon: "storage",
        treeFilterPlaceholder: "Search stores",
        actions: [
          {
            icon: "content_copy",
            action: () => {
              actionGlobalCopyState(pinia);
            },
            tooltip: "Serialize and copy the state"
          },
          {
            icon: "content_paste",
            action: async () => {
              await actionGlobalPasteState(pinia);
              api.sendInspectorTree(INSPECTOR_ID$1);
              api.sendInspectorState(INSPECTOR_ID$1);
            },
            tooltip: "Replace the state with the content of your clipboard"
          },
          {
            icon: "save",
            action: () => {
              actionGlobalSaveState(pinia);
            },
            tooltip: "Save the state as a JSON file"
          },
          {
            icon: "folder_open",
            action: async () => {
              await actionGlobalOpenStateFile(pinia);
              api.sendInspectorTree(INSPECTOR_ID$1);
              api.sendInspectorState(INSPECTOR_ID$1);
            },
            tooltip: "Import the state from a JSON file"
          }
        ],
        nodeActions: [
          {
            icon: "restore",
            tooltip: 'Reset the state (with "$reset")',
            action: (nodeId) => {
              const store2 = pinia._s.get(nodeId);
              if (!store2) {
                toastMessage(`Cannot reset "${nodeId}" store because it wasn't found.`, "warn");
              } else if (typeof store2.$reset !== "function") {
                toastMessage(`Cannot reset "${nodeId}" store because it doesn't have a "$reset" method implemented.`, "warn");
              } else {
                store2.$reset();
                toastMessage(`Store "${nodeId}" reset.`);
              }
            }
          }
        ]
      });
      api.on.inspectComponent((payload, ctx) => {
        const proxy = payload.componentInstance && payload.componentInstance.proxy;
        if (proxy && proxy._pStores) {
          const piniaStores = payload.componentInstance.proxy._pStores;
          Object.values(piniaStores).forEach((store2) => {
            payload.instanceData.state.push({
              type: getStoreType(store2.$id),
              key: "state",
              editable: true,
              value: store2._isOptionsAPI ? {
                _custom: {
                  value: vue.toRaw(store2.$state),
                  actions: [
                    {
                      icon: "restore",
                      tooltip: "Reset the state of this store",
                      action: () => store2.$reset()
                    }
                  ]
                }
              } : (
                // NOTE: workaround to unwrap transferred refs
                Object.keys(store2.$state).reduce((state, key) => {
                  state[key] = store2.$state[key];
                  return state;
                }, {})
              )
            });
            if (store2._getters && store2._getters.length) {
              payload.instanceData.state.push({
                type: getStoreType(store2.$id),
                key: "getters",
                editable: false,
                value: store2._getters.reduce((getters, key) => {
                  try {
                    getters[key] = store2[key];
                  } catch (error) {
                    getters[key] = error;
                  }
                  return getters;
                }, {})
              });
            }
          });
        }
      });
      api.on.getInspectorTree((payload) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID$1) {
          let stores = [pinia];
          stores = stores.concat(Array.from(pinia._s.values()));
          payload.rootNodes = (payload.filter ? stores.filter((store2) => "$id" in store2 ? store2.$id.toLowerCase().includes(payload.filter.toLowerCase()) : PINIA_ROOT_LABEL.toLowerCase().includes(payload.filter.toLowerCase())) : stores).map(formatStoreForInspectorTree$1);
        }
      });
      api.on.getInspectorState((payload) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID$1) {
          const inspectedStore = payload.nodeId === PINIA_ROOT_ID ? pinia : pinia._s.get(payload.nodeId);
          if (!inspectedStore) {
            return;
          }
          if (inspectedStore) {
            payload.state = formatStoreForInspectorState$1(inspectedStore);
          }
        }
      });
      api.on.editInspectorState((payload, ctx) => {
        if (payload.app === app && payload.inspectorId === INSPECTOR_ID$1) {
          const inspectedStore = payload.nodeId === PINIA_ROOT_ID ? pinia : pinia._s.get(payload.nodeId);
          if (!inspectedStore) {
            return toastMessage(`store "${payload.nodeId}" not found`, "error");
          }
          const { path } = payload;
          if (!isPinia(inspectedStore)) {
            if (path.length !== 1 || !inspectedStore._customProperties.has(path[0]) || path[0] in inspectedStore.$state) {
              path.unshift("$state");
            }
          } else {
            path.unshift("state");
          }
          isTimelineActive = false;
          payload.set(inspectedStore, path, payload.state.value);
          isTimelineActive = true;
        }
      });
      api.on.editComponentState((payload) => {
        if (payload.type.startsWith("🍍")) {
          const storeId = payload.type.replace(/^🍍\s*/, "");
          const store2 = pinia._s.get(storeId);
          if (!store2) {
            return toastMessage(`store "${storeId}" not found`, "error");
          }
          const { path } = payload;
          if (path[0] !== "state") {
            return toastMessage(`Invalid path for store "${storeId}":
${path}
Only state can be modified.`);
          }
          path[0] = "$state";
          isTimelineActive = false;
          payload.set(store2, path, payload.state.value);
          isTimelineActive = true;
        }
      });
    });
  }
  function addStoreToDevtools(app, store2) {
    if (!componentStateTypes.includes(getStoreType(store2.$id))) {
      componentStateTypes.push(getStoreType(store2.$id));
    }
    setupDevtoolsPlugin$1({
      id: "dev.esm.pinia",
      label: "Pinia 🍍",
      logo: "https://pinia.vuejs.org/logo.svg",
      packageName: "pinia",
      homepage: "https://pinia.vuejs.org",
      componentStateTypes,
      app,
      settings: {
        logStoreChanges: {
          label: "Notify about new/deleted stores",
          type: "boolean",
          defaultValue: true
        }
        // useEmojis: {
        //   label: 'Use emojis in messages ⚡️',
        //   type: 'boolean',
        //   defaultValue: true,
        // },
      }
    }, (api) => {
      const now2 = typeof api.now === "function" ? api.now.bind(api) : Date.now;
      store2.$onAction(({ after, onError, name, args }) => {
        const groupId = runningActionId++;
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID$1,
          event: {
            time: now2(),
            title: "🛫 " + name,
            subtitle: "start",
            data: {
              store: formatDisplay(store2.$id),
              action: formatDisplay(name),
              args
            },
            groupId
          }
        });
        after((result) => {
          activeAction = void 0;
          api.addTimelineEvent({
            layerId: MUTATIONS_LAYER_ID$1,
            event: {
              time: now2(),
              title: "🛬 " + name,
              subtitle: "end",
              data: {
                store: formatDisplay(store2.$id),
                action: formatDisplay(name),
                args,
                result
              },
              groupId
            }
          });
        });
        onError((error) => {
          activeAction = void 0;
          api.addTimelineEvent({
            layerId: MUTATIONS_LAYER_ID$1,
            event: {
              time: now2(),
              logType: "error",
              title: "💥 " + name,
              subtitle: "end",
              data: {
                store: formatDisplay(store2.$id),
                action: formatDisplay(name),
                args,
                error
              },
              groupId
            }
          });
        });
      }, true);
      store2._customProperties.forEach((name) => {
        vue.watch(() => vue.unref(store2[name]), (newValue, oldValue) => {
          api.notifyComponentUpdate();
          api.sendInspectorState(INSPECTOR_ID$1);
          if (isTimelineActive) {
            api.addTimelineEvent({
              layerId: MUTATIONS_LAYER_ID$1,
              event: {
                time: now2(),
                title: "Change",
                subtitle: name,
                data: {
                  newValue,
                  oldValue
                },
                groupId: activeAction
              }
            });
          }
        }, { deep: true });
      });
      store2.$subscribe(({ events, type }, state) => {
        api.notifyComponentUpdate();
        api.sendInspectorState(INSPECTOR_ID$1);
        if (!isTimelineActive)
          return;
        const eventData = {
          time: now2(),
          title: formatMutationType(type),
          data: assign$1({ store: formatDisplay(store2.$id) }, formatEventData(events)),
          groupId: activeAction
        };
        if (type === MutationType.patchFunction) {
          eventData.subtitle = "⤵️";
        } else if (type === MutationType.patchObject) {
          eventData.subtitle = "🧩";
        } else if (events && !Array.isArray(events)) {
          eventData.subtitle = events.type;
        }
        if (events) {
          eventData.data["rawEvent(s)"] = {
            _custom: {
              display: "DebuggerEvent",
              type: "object",
              tooltip: "raw DebuggerEvent[]",
              value: events
            }
          };
        }
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID$1,
          event: eventData
        });
      }, { detached: true, flush: "sync" });
      const hotUpdate = store2._hotUpdate;
      store2._hotUpdate = vue.markRaw((newStore) => {
        hotUpdate(newStore);
        api.addTimelineEvent({
          layerId: MUTATIONS_LAYER_ID$1,
          event: {
            time: now2(),
            title: "🔥 " + store2.$id,
            subtitle: "HMR update",
            data: {
              store: formatDisplay(store2.$id),
              info: formatDisplay(`HMR update`)
            }
          }
        });
        api.notifyComponentUpdate();
        api.sendInspectorTree(INSPECTOR_ID$1);
        api.sendInspectorState(INSPECTOR_ID$1);
      });
      const { $dispose } = store2;
      store2.$dispose = () => {
        $dispose();
        api.notifyComponentUpdate();
        api.sendInspectorTree(INSPECTOR_ID$1);
        api.sendInspectorState(INSPECTOR_ID$1);
        api.getSettings().logStoreChanges && toastMessage(`Disposed "${store2.$id}" store 🗑`);
      };
      api.notifyComponentUpdate();
      api.sendInspectorTree(INSPECTOR_ID$1);
      api.sendInspectorState(INSPECTOR_ID$1);
      api.getSettings().logStoreChanges && toastMessage(`"${store2.$id}" store installed 🆕`);
    });
  }
  let runningActionId = 0;
  let activeAction;
  function patchActionForGrouping(store2, actionNames, wrapWithProxy) {
    const actions = actionNames.reduce((storeActions, actionName) => {
      storeActions[actionName] = vue.toRaw(store2)[actionName];
      return storeActions;
    }, {});
    for (const actionName in actions) {
      store2[actionName] = function() {
        const _actionId = runningActionId;
        const trackedStore = wrapWithProxy ? new Proxy(store2, {
          get(...args) {
            activeAction = _actionId;
            return Reflect.get(...args);
          },
          set(...args) {
            activeAction = _actionId;
            return Reflect.set(...args);
          }
        }) : store2;
        activeAction = _actionId;
        const retValue = actions[actionName].apply(trackedStore, arguments);
        activeAction = void 0;
        return retValue;
      };
    }
  }
  function devtoolsPlugin({ app, store: store2, options }) {
    if (store2.$id.startsWith("__hot:")) {
      return;
    }
    store2._isOptionsAPI = !!options.state;
    patchActionForGrouping(store2, Object.keys(options.actions), store2._isOptionsAPI);
    const originalHotUpdate = store2._hotUpdate;
    vue.toRaw(store2)._hotUpdate = function(newStore) {
      originalHotUpdate.apply(this, arguments);
      patchActionForGrouping(store2, Object.keys(newStore._hmrPayload.actions), !!store2._isOptionsAPI);
    };
    addStoreToDevtools(
      app,
      // FIXME: is there a way to allow the assignment from Store<Id, S, G, A> to StoreGeneric?
      store2
    );
  }
  function createPinia() {
    const scope = vue.effectScope(true);
    const state = scope.run(() => vue.ref({}));
    let _p = [];
    let toBeInstalled = [];
    const pinia = vue.markRaw({
      install(app) {
        setActivePinia(pinia);
        {
          pinia._a = app;
          app.provide(piniaSymbol, pinia);
          app.config.globalProperties.$pinia = pinia;
          if (USE_DEVTOOLS) {
            registerPiniaDevtools(app, pinia);
          }
          toBeInstalled.forEach((plugin) => _p.push(plugin));
          toBeInstalled = [];
        }
      },
      use(plugin) {
        if (!this._a && !isVue2) {
          toBeInstalled.push(plugin);
        } else {
          _p.push(plugin);
        }
        return this;
      },
      _p,
      // it's actually undefined here
      // @ts-expect-error
      _a: null,
      _e: scope,
      _s: /* @__PURE__ */ new Map(),
      state
    });
    if (USE_DEVTOOLS && typeof Proxy !== "undefined") {
      pinia.use(devtoolsPlugin);
    }
    return pinia;
  }
  const isUseStore = (fn) => {
    return typeof fn === "function" && typeof fn.$id === "string";
  };
  function patchObject(newState, oldState) {
    for (const key in oldState) {
      const subPatch = oldState[key];
      if (!(key in newState)) {
        continue;
      }
      const targetValue = newState[key];
      if (isPlainObject(targetValue) && isPlainObject(subPatch) && !vue.isRef(subPatch) && !vue.isReactive(subPatch)) {
        newState[key] = patchObject(targetValue, subPatch);
      } else {
        {
          newState[key] = subPatch;
        }
      }
    }
    return newState;
  }
  function acceptHMRUpdate(initialUseStore, hot) {
    return (newModule) => {
      const pinia = hot.data.pinia || initialUseStore._pinia;
      if (!pinia) {
        return;
      }
      hot.data.pinia = pinia;
      for (const exportName in newModule) {
        const useStore2 = newModule[exportName];
        if (isUseStore(useStore2) && pinia._s.has(useStore2.$id)) {
          const id = useStore2.$id;
          if (id !== initialUseStore.$id) {
            console.warn(`The id of the store changed from "${initialUseStore.$id}" to "${id}". Reloading.`);
            return hot.invalidate();
          }
          const existingStore = pinia._s.get(id);
          if (!existingStore) {
            console.log(`[Pinia]: skipping hmr because store doesn't exist yet`);
            return;
          }
          useStore2(pinia, existingStore);
        }
      }
    };
  }
  const noop = () => {
  };
  function addSubscription(subscriptions, callback, detached, onCleanup = noop) {
    subscriptions.push(callback);
    const removeSubscription = () => {
      const idx = subscriptions.indexOf(callback);
      if (idx > -1) {
        subscriptions.splice(idx, 1);
        onCleanup();
      }
    };
    if (!detached && vue.getCurrentScope()) {
      vue.onScopeDispose(removeSubscription);
    }
    return removeSubscription;
  }
  function triggerSubscriptions(subscriptions, ...args) {
    subscriptions.slice().forEach((callback) => {
      callback(...args);
    });
  }
  const fallbackRunWithContext = (fn) => fn();
  function mergeReactiveObjects(target, patchToApply) {
    if (target instanceof Map && patchToApply instanceof Map) {
      patchToApply.forEach((value, key) => target.set(key, value));
    }
    if (target instanceof Set && patchToApply instanceof Set) {
      patchToApply.forEach(target.add, target);
    }
    for (const key in patchToApply) {
      if (!patchToApply.hasOwnProperty(key))
        continue;
      const subPatch = patchToApply[key];
      const targetValue = target[key];
      if (isPlainObject(targetValue) && isPlainObject(subPatch) && target.hasOwnProperty(key) && !vue.isRef(subPatch) && !vue.isReactive(subPatch)) {
        target[key] = mergeReactiveObjects(targetValue, subPatch);
      } else {
        target[key] = subPatch;
      }
    }
    return target;
  }
  const skipHydrateSymbol = Symbol("pinia:skipHydration");
  function skipHydrate(obj) {
    return Object.defineProperty(obj, skipHydrateSymbol, {});
  }
  function shouldHydrate(obj) {
    return !isPlainObject(obj) || !obj.hasOwnProperty(skipHydrateSymbol);
  }
  const { assign } = Object;
  function isComputed(o) {
    return !!(vue.isRef(o) && o.effect);
  }
  function createOptionsStore(id, options, pinia, hot) {
    const { state, actions, getters } = options;
    const initialState = pinia.state.value[id];
    let store2;
    function setup() {
      if (!initialState && !hot) {
        {
          pinia.state.value[id] = state ? state() : {};
        }
      }
      const localState = hot ? (
        // use ref() to unwrap refs inside state TODO: check if this is still necessary
        vue.toRefs(vue.ref(state ? state() : {}).value)
      ) : vue.toRefs(pinia.state.value[id]);
      return assign(localState, actions, Object.keys(getters || {}).reduce((computedGetters, name) => {
        if (name in localState) {
          console.warn(`[🍍]: A getter cannot have the same name as another state property. Rename one of them. Found with "${name}" in store "${id}".`);
        }
        computedGetters[name] = vue.markRaw(vue.computed(() => {
          setActivePinia(pinia);
          const store22 = pinia._s.get(id);
          return getters[name].call(store22, store22);
        }));
        return computedGetters;
      }, {}));
    }
    store2 = createSetupStore(id, setup, options, pinia, hot, true);
    return store2;
  }
  function createSetupStore($id, setup, options = {}, pinia, hot, isOptionsStore) {
    let scope;
    const optionsForPlugin = assign({ actions: {} }, options);
    if (!pinia._e.active) {
      throw new Error("Pinia destroyed");
    }
    const $subscribeOptions = {
      deep: true
      // flush: 'post',
    };
    {
      $subscribeOptions.onTrigger = (event) => {
        if (isListening) {
          debuggerEvents = event;
        } else if (isListening == false && !store2._hotUpdating) {
          if (Array.isArray(debuggerEvents)) {
            debuggerEvents.push(event);
          } else {
            console.error("🍍 debuggerEvents should be an array. This is most likely an internal Pinia bug.");
          }
        }
      };
    }
    let isListening;
    let isSyncListening;
    let subscriptions = [];
    let actionSubscriptions = [];
    let debuggerEvents;
    const initialState = pinia.state.value[$id];
    if (!isOptionsStore && !initialState && !hot) {
      {
        pinia.state.value[$id] = {};
      }
    }
    const hotState = vue.ref({});
    let activeListener;
    function $patch(partialStateOrMutator) {
      let subscriptionMutation;
      isListening = isSyncListening = false;
      {
        debuggerEvents = [];
      }
      if (typeof partialStateOrMutator === "function") {
        partialStateOrMutator(pinia.state.value[$id]);
        subscriptionMutation = {
          type: MutationType.patchFunction,
          storeId: $id,
          events: debuggerEvents
        };
      } else {
        mergeReactiveObjects(pinia.state.value[$id], partialStateOrMutator);
        subscriptionMutation = {
          type: MutationType.patchObject,
          payload: partialStateOrMutator,
          storeId: $id,
          events: debuggerEvents
        };
      }
      const myListenerId = activeListener = Symbol();
      vue.nextTick().then(() => {
        if (activeListener === myListenerId) {
          isListening = true;
        }
      });
      isSyncListening = true;
      triggerSubscriptions(subscriptions, subscriptionMutation, pinia.state.value[$id]);
    }
    const $reset = isOptionsStore ? function $reset2() {
      const { state } = options;
      const newState = state ? state() : {};
      this.$patch(($state) => {
        assign($state, newState);
      });
    } : (
      /* istanbul ignore next */
      () => {
        throw new Error(`🍍: Store "${$id}" is built using the setup syntax and does not implement $reset().`);
      }
    );
    function $dispose() {
      scope.stop();
      subscriptions = [];
      actionSubscriptions = [];
      pinia._s.delete($id);
    }
    function wrapAction(name, action) {
      return function() {
        setActivePinia(pinia);
        const args = Array.from(arguments);
        const afterCallbackList = [];
        const onErrorCallbackList = [];
        function after(callback) {
          afterCallbackList.push(callback);
        }
        function onError(callback) {
          onErrorCallbackList.push(callback);
        }
        triggerSubscriptions(actionSubscriptions, {
          args,
          name,
          store: store2,
          after,
          onError
        });
        let ret;
        try {
          ret = action.apply(this && this.$id === $id ? this : store2, args);
        } catch (error) {
          triggerSubscriptions(onErrorCallbackList, error);
          throw error;
        }
        if (ret instanceof Promise) {
          return ret.then((value) => {
            triggerSubscriptions(afterCallbackList, value);
            return value;
          }).catch((error) => {
            triggerSubscriptions(onErrorCallbackList, error);
            return Promise.reject(error);
          });
        }
        triggerSubscriptions(afterCallbackList, ret);
        return ret;
      };
    }
    const _hmrPayload = /* @__PURE__ */ vue.markRaw({
      actions: {},
      getters: {},
      state: [],
      hotState
    });
    const partialStore = {
      _p: pinia,
      // _s: scope,
      $id,
      $onAction: addSubscription.bind(null, actionSubscriptions),
      $patch,
      $reset,
      $subscribe(callback, options2 = {}) {
        const removeSubscription = addSubscription(subscriptions, callback, options2.detached, () => stopWatcher());
        const stopWatcher = scope.run(() => vue.watch(() => pinia.state.value[$id], (state) => {
          if (options2.flush === "sync" ? isSyncListening : isListening) {
            callback({
              storeId: $id,
              type: MutationType.direct,
              events: debuggerEvents
            }, state);
          }
        }, assign({}, $subscribeOptions, options2)));
        return removeSubscription;
      },
      $dispose
    };
    const store2 = vue.reactive(assign(
      {
        _hmrPayload,
        _customProperties: vue.markRaw(/* @__PURE__ */ new Set())
        // devtools custom properties
      },
      partialStore
      // must be added later
      // setupStore
    ));
    pinia._s.set($id, store2);
    const runWithContext = pinia._a && pinia._a.runWithContext || fallbackRunWithContext;
    const setupStore = runWithContext(() => pinia._e.run(() => (scope = vue.effectScope()).run(setup)));
    for (const key in setupStore) {
      const prop = setupStore[key];
      if (vue.isRef(prop) && !isComputed(prop) || vue.isReactive(prop)) {
        if (hot) {
          set(hotState.value, key, vue.toRef(setupStore, key));
        } else if (!isOptionsStore) {
          if (initialState && shouldHydrate(prop)) {
            if (vue.isRef(prop)) {
              prop.value = initialState[key];
            } else {
              mergeReactiveObjects(prop, initialState[key]);
            }
          }
          {
            pinia.state.value[$id][key] = prop;
          }
        }
        {
          _hmrPayload.state.push(key);
        }
      } else if (typeof prop === "function") {
        const actionValue = hot ? prop : wrapAction(key, prop);
        {
          setupStore[key] = actionValue;
        }
        {
          _hmrPayload.actions[key] = prop;
        }
        optionsForPlugin.actions[key] = prop;
      } else {
        if (isComputed(prop)) {
          _hmrPayload.getters[key] = isOptionsStore ? (
            // @ts-expect-error
            options.getters[key]
          ) : prop;
          if (IS_CLIENT) {
            const getters = setupStore._getters || // @ts-expect-error: same
            (setupStore._getters = vue.markRaw([]));
            getters.push(key);
          }
        }
      }
    }
    {
      assign(store2, setupStore);
      assign(vue.toRaw(store2), setupStore);
    }
    Object.defineProperty(store2, "$state", {
      get: () => hot ? hotState.value : pinia.state.value[$id],
      set: (state) => {
        if (hot) {
          throw new Error("cannot set hotState");
        }
        $patch(($state) => {
          assign($state, state);
        });
      }
    });
    {
      store2._hotUpdate = vue.markRaw((newStore) => {
        store2._hotUpdating = true;
        newStore._hmrPayload.state.forEach((stateKey) => {
          if (stateKey in store2.$state) {
            const newStateTarget = newStore.$state[stateKey];
            const oldStateSource = store2.$state[stateKey];
            if (typeof newStateTarget === "object" && isPlainObject(newStateTarget) && isPlainObject(oldStateSource)) {
              patchObject(newStateTarget, oldStateSource);
            } else {
              newStore.$state[stateKey] = oldStateSource;
            }
          }
          set(store2, stateKey, vue.toRef(newStore.$state, stateKey));
        });
        Object.keys(store2.$state).forEach((stateKey) => {
          if (!(stateKey in newStore.$state)) {
            del(store2, stateKey);
          }
        });
        isListening = false;
        isSyncListening = false;
        pinia.state.value[$id] = vue.toRef(newStore._hmrPayload, "hotState");
        isSyncListening = true;
        vue.nextTick().then(() => {
          isListening = true;
        });
        for (const actionName in newStore._hmrPayload.actions) {
          const action = newStore[actionName];
          set(store2, actionName, wrapAction(actionName, action));
        }
        for (const getterName in newStore._hmrPayload.getters) {
          const getter = newStore._hmrPayload.getters[getterName];
          const getterValue = isOptionsStore ? (
            // special handling of options api
            vue.computed(() => {
              setActivePinia(pinia);
              return getter.call(store2, store2);
            })
          ) : getter;
          set(store2, getterName, getterValue);
        }
        Object.keys(store2._hmrPayload.getters).forEach((key) => {
          if (!(key in newStore._hmrPayload.getters)) {
            del(store2, key);
          }
        });
        Object.keys(store2._hmrPayload.actions).forEach((key) => {
          if (!(key in newStore._hmrPayload.actions)) {
            del(store2, key);
          }
        });
        store2._hmrPayload = newStore._hmrPayload;
        store2._getters = newStore._getters;
        store2._hotUpdating = false;
      });
    }
    if (USE_DEVTOOLS) {
      const nonEnumerable = {
        writable: true,
        configurable: true,
        // avoid warning on devtools trying to display this property
        enumerable: false
      };
      ["_p", "_hmrPayload", "_getters", "_customProperties"].forEach((p) => {
        Object.defineProperty(store2, p, assign({ value: store2[p] }, nonEnumerable));
      });
    }
    pinia._p.forEach((extender) => {
      if (USE_DEVTOOLS) {
        const extensions = scope.run(() => extender({
          store: store2,
          app: pinia._a,
          pinia,
          options: optionsForPlugin
        }));
        Object.keys(extensions || {}).forEach((key) => store2._customProperties.add(key));
        assign(store2, extensions);
      } else {
        assign(store2, scope.run(() => extender({
          store: store2,
          app: pinia._a,
          pinia,
          options: optionsForPlugin
        })));
      }
    });
    if (store2.$state && typeof store2.$state === "object" && typeof store2.$state.constructor === "function" && !store2.$state.constructor.toString().includes("[native code]")) {
      console.warn(`[🍍]: The "state" must be a plain object. It cannot be
	state: () => new MyClass()
Found in store "${store2.$id}".`);
    }
    if (initialState && isOptionsStore && options.hydrate) {
      options.hydrate(store2.$state, initialState);
    }
    isListening = true;
    isSyncListening = true;
    return store2;
  }
  function defineStore(idOrOptions, setup, setupOptions) {
    let id;
    let options;
    const isSetupStore = typeof setup === "function";
    if (typeof idOrOptions === "string") {
      id = idOrOptions;
      options = isSetupStore ? setupOptions : setup;
    } else {
      options = idOrOptions;
      id = idOrOptions.id;
      if (typeof id !== "string") {
        throw new Error(`[🍍]: "defineStore()" must be passed a store id as its first argument.`);
      }
    }
    function useStore2(pinia, hot) {
      const hasContext = vue.hasInjectionContext();
      pinia = // in test mode, ignore the argument provided as we can always retrieve a
      // pinia instance with getActivePinia()
      pinia || (hasContext ? vue.inject(piniaSymbol, null) : null);
      if (pinia)
        setActivePinia(pinia);
      if (!activePinia) {
        throw new Error(`[🍍]: "getActivePinia()" was called but there was no active Pinia. Are you trying to use a store before calling "app.use(pinia)"?
See https://pinia.vuejs.org/core-concepts/outside-component-usage.html for help.
This will fail in production.`);
      }
      pinia = activePinia;
      if (!pinia._s.has(id)) {
        if (isSetupStore) {
          createSetupStore(id, setup, options, pinia);
        } else {
          createOptionsStore(id, options, pinia);
        }
        {
          useStore2._pinia = pinia;
        }
      }
      const store2 = pinia._s.get(id);
      if (hot) {
        const hotId = "__hot:" + id;
        const newStore = isSetupStore ? createSetupStore(hotId, setup, options, pinia, true) : createOptionsStore(hotId, assign({}, options), pinia, true);
        hot._hotUpdate(newStore);
        delete pinia.state.value[hotId];
        pinia._s.delete(hotId);
      }
      if (IS_CLIENT) {
        const currentInstance = vue.getCurrentInstance();
        if (currentInstance && currentInstance.proxy && // avoid adding stores that are just built for hot module replacement
        !hot) {
          const vm = currentInstance.proxy;
          const cache = "_pStores" in vm ? vm._pStores : vm._pStores = {};
          cache[id] = store2;
        }
      }
      return store2;
    }
    useStore2.$id = id;
    return useStore2;
  }
  let mapStoreSuffix = "Store";
  function setMapStoreSuffix(suffix) {
    mapStoreSuffix = suffix;
  }
  function mapStores(...stores) {
    if (Array.isArray(stores[0])) {
      console.warn(`[🍍]: Directly pass all stores to "mapStores()" without putting them in an array:
Replace
	mapStores([useAuthStore, useCartStore])
with
	mapStores(useAuthStore, useCartStore)
This will fail in production if not fixed.`);
      stores = stores[0];
    }
    return stores.reduce((reduced, useStore2) => {
      reduced[useStore2.$id + mapStoreSuffix] = function() {
        return useStore2(this.$pinia);
      };
      return reduced;
    }, {});
  }
  function mapState$1(useStore2, keysOrMapper) {
    return Array.isArray(keysOrMapper) ? keysOrMapper.reduce((reduced, key) => {
      reduced[key] = function() {
        return useStore2(this.$pinia)[key];
      };
      return reduced;
    }, {}) : Object.keys(keysOrMapper).reduce((reduced, key) => {
      reduced[key] = function() {
        const store2 = useStore2(this.$pinia);
        const storeKey2 = keysOrMapper[key];
        return typeof storeKey2 === "function" ? storeKey2.call(this, store2) : store2[storeKey2];
      };
      return reduced;
    }, {});
  }
  const mapGetters$1 = mapState$1;
  function mapActions$1(useStore2, keysOrMapper) {
    return Array.isArray(keysOrMapper) ? keysOrMapper.reduce((reduced, key) => {
      reduced[key] = function(...args) {
        return useStore2(this.$pinia)[key](...args);
      };
      return reduced;
    }, {}) : Object.keys(keysOrMapper).reduce((reduced, key) => {
      reduced[key] = function(...args) {
        return useStore2(this.$pinia)[keysOrMapper[key]](...args);
      };
      return reduced;
    }, {});
  }
  function mapWritableState(useStore2, keysOrMapper) {
    return Array.isArray(keysOrMapper) ? keysOrMapper.reduce((reduced, key) => {
      reduced[key] = {
        get() {
          return useStore2(this.$pinia)[key];
        },
        set(value) {
          return useStore2(this.$pinia)[key] = value;
        }
      };
      return reduced;
    }, {}) : Object.keys(keysOrMapper).reduce((reduced, key) => {
      reduced[key] = {
        get() {
          return useStore2(this.$pinia)[keysOrMapper[key]];
        },
        set(value) {
          return useStore2(this.$pinia)[keysOrMapper[key]] = value;
        }
      };
      return reduced;
    }, {});
  }
  function storeToRefs(store2) {
    {
      store2 = vue.toRaw(store2);
      const refs = {};
      for (const key in store2) {
        const value = store2[key];
        if (vue.isRef(value) || vue.isReactive(value)) {
          refs[key] = // ---
          vue.toRef(store2, key);
        }
      }
      return refs;
    }
  }
  const PiniaVuePlugin = function(_Vue) {
    _Vue.mixin({
      beforeCreate() {
        const options = this.$options;
        if (options.pinia) {
          const pinia = options.pinia;
          if (!this._provided) {
            const provideCache = {};
            Object.defineProperty(this, "_provided", {
              get: () => provideCache,
              set: (v) => Object.assign(provideCache, v)
            });
          }
          this._provided[piniaSymbol] = pinia;
          if (!this.$pinia) {
            this.$pinia = pinia;
          }
          pinia._a = this;
          if (IS_CLIENT) {
            setActivePinia(pinia);
          }
          if (USE_DEVTOOLS) {
            registerPiniaDevtools(pinia._a, pinia);
          }
        } else if (!this.$pinia && options.parent && options.parent.$pinia) {
          this.$pinia = options.parent.$pinia;
        }
      },
      destroyed() {
        delete this._pStores;
      }
    });
  };
  const Pinia = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    get MutationType() {
      return MutationType;
    },
    PiniaVuePlugin,
    acceptHMRUpdate,
    createPinia,
    defineStore,
    getActivePinia,
    mapActions: mapActions$1,
    mapGetters: mapGetters$1,
    mapState: mapState$1,
    mapStores,
    mapWritableState,
    setActivePinia,
    setMapStoreSuffix,
    skipHydrate,
    storeToRefs
  }, Symbol.toStringTag, { value: "Module" }));
  function getDevtoolsGlobalHook() {
    return getTarget().__VUE_DEVTOOLS_GLOBAL_HOOK__;
  }
  function getTarget() {
    return typeof navigator !== "undefined" && typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {};
  }
  const isProxyAvailable = typeof Proxy === "function";
  const HOOK_SETUP = "devtools-plugin:setup";
  const HOOK_PLUGIN_SETTINGS_SET = "plugin:settings:set";
  class ApiProxy {
    constructor(plugin, hook) {
      this.target = null;
      this.targetQueue = [];
      this.onQueue = [];
      this.plugin = plugin;
      this.hook = hook;
      const defaultSettings = {};
      if (plugin.settings) {
        for (const id in plugin.settings) {
          const item = plugin.settings[id];
          defaultSettings[id] = item.defaultValue;
        }
      }
      const localSettingsSaveId = `__vue-devtools-plugin-settings__${plugin.id}`;
      let currentSettings = { ...defaultSettings };
      try {
        const raw = localStorage.getItem(localSettingsSaveId);
        const data = JSON.parse(raw);
        Object.assign(currentSettings, data);
      } catch (e) {
      }
      this.fallbacks = {
        getSettings() {
          return currentSettings;
        },
        setSettings(value) {
          try {
            localStorage.setItem(localSettingsSaveId, JSON.stringify(value));
          } catch (e) {
          }
          currentSettings = value;
        }
      };
      hook.on(HOOK_PLUGIN_SETTINGS_SET, (pluginId, value) => {
        if (pluginId === this.plugin.id) {
          this.fallbacks.setSettings(value);
        }
      });
      this.proxiedOn = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target.on[prop];
          } else {
            return (...args) => {
              this.onQueue.push({
                method: prop,
                args
              });
            };
          }
        }
      });
      this.proxiedTarget = new Proxy({}, {
        get: (_target, prop) => {
          if (this.target) {
            return this.target[prop];
          } else if (prop === "on") {
            return this.proxiedOn;
          } else if (Object.keys(this.fallbacks).includes(prop)) {
            return (...args) => {
              this.targetQueue.push({
                method: prop,
                args,
                resolve: () => {
                }
              });
              return this.fallbacks[prop](...args);
            };
          } else {
            return (...args) => {
              return new Promise((resolve) => {
                this.targetQueue.push({
                  method: prop,
                  args,
                  resolve
                });
              });
            };
          }
        }
      });
    }
    async setRealTarget(target) {
      this.target = target;
      for (const item of this.onQueue) {
        this.target.on[item.method](...item.args);
      }
      for (const item of this.targetQueue) {
        item.resolve(await this.target[item.method](...item.args));
      }
    }
  }
  function setupDevtoolsPlugin(pluginDescriptor, setupFn) {
    const target = getTarget();
    const hook = getDevtoolsGlobalHook();
    const enableProxy = isProxyAvailable && pluginDescriptor.enableEarlyProxy;
    if (hook && (target.__VUE_DEVTOOLS_PLUGIN_API_AVAILABLE__ || !enableProxy)) {
      hook.emit(HOOK_SETUP, pluginDescriptor, setupFn);
    } else {
      const proxy = enableProxy ? new ApiProxy(pluginDescriptor, hook) : null;
      const list = target.__VUE_DEVTOOLS_PLUGINS__ = target.__VUE_DEVTOOLS_PLUGINS__ || [];
      list.push({
        pluginDescriptor,
        setupFn,
        proxy
      });
      if (proxy)
        setupFn(proxy.proxiedTarget);
    }
  }
  /*!
   * vuex v4.1.0
   * (c) 2022 Evan You
   * @license MIT
   */
  var storeKey = "store";
  function useStore(key) {
    if (key === void 0)
      key = null;
    return vue.inject(key !== null ? key : storeKey);
  }
  function find(list, f) {
    return list.filter(f)[0];
  }
  function deepCopy(obj, cache) {
    if (cache === void 0)
      cache = [];
    if (obj === null || typeof obj !== "object") {
      return obj;
    }
    var hit = find(cache, function(c) {
      return c.original === obj;
    });
    if (hit) {
      return hit.copy;
    }
    var copy = Array.isArray(obj) ? [] : {};
    cache.push({
      original: obj,
      copy
    });
    Object.keys(obj).forEach(function(key) {
      copy[key] = deepCopy(obj[key], cache);
    });
    return copy;
  }
  function forEachValue(obj, fn) {
    Object.keys(obj).forEach(function(key) {
      return fn(obj[key], key);
    });
  }
  function isObject(obj) {
    return obj !== null && typeof obj === "object";
  }
  function isPromise(val) {
    return val && typeof val.then === "function";
  }
  function assert(condition, msg) {
    if (!condition) {
      throw new Error("[vuex] " + msg);
    }
  }
  function partial(fn, arg) {
    return function() {
      return fn(arg);
    };
  }
  function genericSubscribe(fn, subs, options) {
    if (subs.indexOf(fn) < 0) {
      options && options.prepend ? subs.unshift(fn) : subs.push(fn);
    }
    return function() {
      var i = subs.indexOf(fn);
      if (i > -1) {
        subs.splice(i, 1);
      }
    };
  }
  function resetStore(store2, hot) {
    store2._actions = /* @__PURE__ */ Object.create(null);
    store2._mutations = /* @__PURE__ */ Object.create(null);
    store2._wrappedGetters = /* @__PURE__ */ Object.create(null);
    store2._modulesNamespaceMap = /* @__PURE__ */ Object.create(null);
    var state = store2.state;
    installModule(store2, state, [], store2._modules.root, true);
    resetStoreState(store2, state, hot);
  }
  function resetStoreState(store2, state, hot) {
    var oldState = store2._state;
    var oldScope = store2._scope;
    store2.getters = {};
    store2._makeLocalGettersCache = /* @__PURE__ */ Object.create(null);
    var wrappedGetters = store2._wrappedGetters;
    var computedObj = {};
    var computedCache = {};
    var scope = vue.effectScope(true);
    scope.run(function() {
      forEachValue(wrappedGetters, function(fn, key) {
        computedObj[key] = partial(fn, store2);
        computedCache[key] = vue.computed(function() {
          return computedObj[key]();
        });
        Object.defineProperty(store2.getters, key, {
          get: function() {
            return computedCache[key].value;
          },
          enumerable: true
          // for local getters
        });
      });
    });
    store2._state = vue.reactive({
      data: state
    });
    store2._scope = scope;
    if (store2.strict) {
      enableStrictMode(store2);
    }
    if (oldState) {
      if (hot) {
        store2._withCommit(function() {
          oldState.data = null;
        });
      }
    }
    if (oldScope) {
      oldScope.stop();
    }
  }
  function installModule(store2, rootState, path, module, hot) {
    var isRoot = !path.length;
    var namespace = store2._modules.getNamespace(path);
    if (module.namespaced) {
      if (store2._modulesNamespaceMap[namespace] && true) {
        console.error("[vuex] duplicate namespace " + namespace + " for the namespaced module " + path.join("/"));
      }
      store2._modulesNamespaceMap[namespace] = module;
    }
    if (!isRoot && !hot) {
      var parentState = getNestedState(rootState, path.slice(0, -1));
      var moduleName = path[path.length - 1];
      store2._withCommit(function() {
        {
          if (moduleName in parentState) {
            console.warn(
              '[vuex] state field "' + moduleName + '" was overridden by a module with the same name at "' + path.join(".") + '"'
            );
          }
        }
        parentState[moduleName] = module.state;
      });
    }
    var local = module.context = makeLocalContext(store2, namespace, path);
    module.forEachMutation(function(mutation, key) {
      var namespacedType = namespace + key;
      registerMutation(store2, namespacedType, mutation, local);
    });
    module.forEachAction(function(action, key) {
      var type = action.root ? key : namespace + key;
      var handler = action.handler || action;
      registerAction(store2, type, handler, local);
    });
    module.forEachGetter(function(getter, key) {
      var namespacedType = namespace + key;
      registerGetter(store2, namespacedType, getter, local);
    });
    module.forEachChild(function(child, key) {
      installModule(store2, rootState, path.concat(key), child, hot);
    });
  }
  function makeLocalContext(store2, namespace, path) {
    var noNamespace = namespace === "";
    var local = {
      dispatch: noNamespace ? store2.dispatch : function(_type, _payload, _options) {
        var args = unifyObjectStyle(_type, _payload, _options);
        var payload = args.payload;
        var options = args.options;
        var type = args.type;
        if (!options || !options.root) {
          type = namespace + type;
          if (!store2._actions[type]) {
            console.error("[vuex] unknown local action type: " + args.type + ", global type: " + type);
            return;
          }
        }
        return store2.dispatch(type, payload);
      },
      commit: noNamespace ? store2.commit : function(_type, _payload, _options) {
        var args = unifyObjectStyle(_type, _payload, _options);
        var payload = args.payload;
        var options = args.options;
        var type = args.type;
        if (!options || !options.root) {
          type = namespace + type;
          if (!store2._mutations[type]) {
            console.error("[vuex] unknown local mutation type: " + args.type + ", global type: " + type);
            return;
          }
        }
        store2.commit(type, payload, options);
      }
    };
    Object.defineProperties(local, {
      getters: {
        get: noNamespace ? function() {
          return store2.getters;
        } : function() {
          return makeLocalGetters(store2, namespace);
        }
      },
      state: {
        get: function() {
          return getNestedState(store2.state, path);
        }
      }
    });
    return local;
  }
  function makeLocalGetters(store2, namespace) {
    if (!store2._makeLocalGettersCache[namespace]) {
      var gettersProxy = {};
      var splitPos = namespace.length;
      Object.keys(store2.getters).forEach(function(type) {
        if (type.slice(0, splitPos) !== namespace) {
          return;
        }
        var localType = type.slice(splitPos);
        Object.defineProperty(gettersProxy, localType, {
          get: function() {
            return store2.getters[type];
          },
          enumerable: true
        });
      });
      store2._makeLocalGettersCache[namespace] = gettersProxy;
    }
    return store2._makeLocalGettersCache[namespace];
  }
  function registerMutation(store2, type, handler, local) {
    var entry = store2._mutations[type] || (store2._mutations[type] = []);
    entry.push(function wrappedMutationHandler(payload) {
      handler.call(store2, local.state, payload);
    });
  }
  function registerAction(store2, type, handler, local) {
    var entry = store2._actions[type] || (store2._actions[type] = []);
    entry.push(function wrappedActionHandler(payload) {
      var res = handler.call(store2, {
        dispatch: local.dispatch,
        commit: local.commit,
        getters: local.getters,
        state: local.state,
        rootGetters: store2.getters,
        rootState: store2.state
      }, payload);
      if (!isPromise(res)) {
        res = Promise.resolve(res);
      }
      if (store2._devtoolHook) {
        return res.catch(function(err) {
          store2._devtoolHook.emit("vuex:error", err);
          throw err;
        });
      } else {
        return res;
      }
    });
  }
  function registerGetter(store2, type, rawGetter, local) {
    if (store2._wrappedGetters[type]) {
      {
        console.error("[vuex] duplicate getter key: " + type);
      }
      return;
    }
    store2._wrappedGetters[type] = function wrappedGetter(store22) {
      return rawGetter(
        local.state,
        // local state
        local.getters,
        // local getters
        store22.state,
        // root state
        store22.getters
        // root getters
      );
    };
  }
  function enableStrictMode(store2) {
    vue.watch(function() {
      return store2._state.data;
    }, function() {
      {
        assert(store2._committing, "do not mutate vuex store state outside mutation handlers.");
      }
    }, { deep: true, flush: "sync" });
  }
  function getNestedState(state, path) {
    return path.reduce(function(state2, key) {
      return state2[key];
    }, state);
  }
  function unifyObjectStyle(type, payload, options) {
    if (isObject(type) && type.type) {
      options = payload;
      payload = type;
      type = type.type;
    }
    {
      assert(typeof type === "string", "expects string as the type, but found " + typeof type + ".");
    }
    return { type, payload, options };
  }
  var LABEL_VUEX_BINDINGS = "vuex bindings";
  var MUTATIONS_LAYER_ID = "vuex:mutations";
  var ACTIONS_LAYER_ID = "vuex:actions";
  var INSPECTOR_ID = "vuex";
  var actionId = 0;
  function addDevtools(app, store2) {
    setupDevtoolsPlugin(
      {
        id: "org.vuejs.vuex",
        app,
        label: "Vuex",
        homepage: "https://next.vuex.vuejs.org/",
        logo: "https://vuejs.org/images/icons/favicon-96x96.png",
        packageName: "vuex",
        componentStateTypes: [LABEL_VUEX_BINDINGS]
      },
      function(api) {
        api.addTimelineLayer({
          id: MUTATIONS_LAYER_ID,
          label: "Vuex Mutations",
          color: COLOR_LIME_500
        });
        api.addTimelineLayer({
          id: ACTIONS_LAYER_ID,
          label: "Vuex Actions",
          color: COLOR_LIME_500
        });
        api.addInspector({
          id: INSPECTOR_ID,
          label: "Vuex",
          icon: "storage",
          treeFilterPlaceholder: "Filter stores..."
        });
        api.on.getInspectorTree(function(payload) {
          if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
            if (payload.filter) {
              var nodes = [];
              flattenStoreForInspectorTree(nodes, store2._modules.root, payload.filter, "");
              payload.rootNodes = nodes;
            } else {
              payload.rootNodes = [
                formatStoreForInspectorTree(store2._modules.root, "")
              ];
            }
          }
        });
        api.on.getInspectorState(function(payload) {
          if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
            var modulePath = payload.nodeId;
            makeLocalGetters(store2, modulePath);
            payload.state = formatStoreForInspectorState(
              getStoreModule(store2._modules, modulePath),
              modulePath === "root" ? store2.getters : store2._makeLocalGettersCache,
              modulePath
            );
          }
        });
        api.on.editInspectorState(function(payload) {
          if (payload.app === app && payload.inspectorId === INSPECTOR_ID) {
            var modulePath = payload.nodeId;
            var path = payload.path;
            if (modulePath !== "root") {
              path = modulePath.split("/").filter(Boolean).concat(path);
            }
            store2._withCommit(function() {
              payload.set(store2._state.data, path, payload.state.value);
            });
          }
        });
        store2.subscribe(function(mutation, state) {
          var data = {};
          if (mutation.payload) {
            data.payload = mutation.payload;
          }
          data.state = state;
          api.notifyComponentUpdate();
          api.sendInspectorTree(INSPECTOR_ID);
          api.sendInspectorState(INSPECTOR_ID);
          api.addTimelineEvent({
            layerId: MUTATIONS_LAYER_ID,
            event: {
              time: Date.now(),
              title: mutation.type,
              data
            }
          });
        });
        store2.subscribeAction({
          before: function(action, state) {
            var data = {};
            if (action.payload) {
              data.payload = action.payload;
            }
            action._id = actionId++;
            action._time = Date.now();
            data.state = state;
            api.addTimelineEvent({
              layerId: ACTIONS_LAYER_ID,
              event: {
                time: action._time,
                title: action.type,
                groupId: action._id,
                subtitle: "start",
                data
              }
            });
          },
          after: function(action, state) {
            var data = {};
            var duration = Date.now() - action._time;
            data.duration = {
              _custom: {
                type: "duration",
                display: duration + "ms",
                tooltip: "Action duration",
                value: duration
              }
            };
            if (action.payload) {
              data.payload = action.payload;
            }
            data.state = state;
            api.addTimelineEvent({
              layerId: ACTIONS_LAYER_ID,
              event: {
                time: Date.now(),
                title: action.type,
                groupId: action._id,
                subtitle: "end",
                data
              }
            });
          }
        });
      }
    );
  }
  var COLOR_LIME_500 = 8702998;
  var COLOR_DARK = 6710886;
  var COLOR_WHITE = 16777215;
  var TAG_NAMESPACED = {
    label: "namespaced",
    textColor: COLOR_WHITE,
    backgroundColor: COLOR_DARK
  };
  function extractNameFromPath(path) {
    return path && path !== "root" ? path.split("/").slice(-2, -1)[0] : "Root";
  }
  function formatStoreForInspectorTree(module, path) {
    return {
      id: path || "root",
      // all modules end with a `/`, we want the last segment only
      // cart/ -> cart
      // nested/cart/ -> cart
      label: extractNameFromPath(path),
      tags: module.namespaced ? [TAG_NAMESPACED] : [],
      children: Object.keys(module._children).map(
        function(moduleName) {
          return formatStoreForInspectorTree(
            module._children[moduleName],
            path + moduleName + "/"
          );
        }
      )
    };
  }
  function flattenStoreForInspectorTree(result, module, filter, path) {
    if (path.includes(filter)) {
      result.push({
        id: path || "root",
        label: path.endsWith("/") ? path.slice(0, path.length - 1) : path || "Root",
        tags: module.namespaced ? [TAG_NAMESPACED] : []
      });
    }
    Object.keys(module._children).forEach(function(moduleName) {
      flattenStoreForInspectorTree(result, module._children[moduleName], filter, path + moduleName + "/");
    });
  }
  function formatStoreForInspectorState(module, getters, path) {
    getters = path === "root" ? getters : getters[path];
    var gettersKeys = Object.keys(getters);
    var storeState = {
      state: Object.keys(module.state).map(function(key) {
        return {
          key,
          editable: true,
          value: module.state[key]
        };
      })
    };
    if (gettersKeys.length) {
      var tree = transformPathsToObjectTree(getters);
      storeState.getters = Object.keys(tree).map(function(key) {
        return {
          key: key.endsWith("/") ? extractNameFromPath(key) : key,
          editable: false,
          value: canThrow(function() {
            return tree[key];
          })
        };
      });
    }
    return storeState;
  }
  function transformPathsToObjectTree(getters) {
    var result = {};
    Object.keys(getters).forEach(function(key) {
      var path = key.split("/");
      if (path.length > 1) {
        var target = result;
        var leafKey = path.pop();
        path.forEach(function(p) {
          if (!target[p]) {
            target[p] = {
              _custom: {
                value: {},
                display: p,
                tooltip: "Module",
                abstract: true
              }
            };
          }
          target = target[p]._custom.value;
        });
        target[leafKey] = canThrow(function() {
          return getters[key];
        });
      } else {
        result[key] = canThrow(function() {
          return getters[key];
        });
      }
    });
    return result;
  }
  function getStoreModule(moduleMap, path) {
    var names = path.split("/").filter(function(n) {
      return n;
    });
    return names.reduce(
      function(module, moduleName, i) {
        var child = module[moduleName];
        if (!child) {
          throw new Error('Missing module "' + moduleName + '" for path "' + path + '".');
        }
        return i === names.length - 1 ? child : child._children;
      },
      path === "root" ? moduleMap : moduleMap.root._children
    );
  }
  function canThrow(cb) {
    try {
      return cb();
    } catch (e) {
      return e;
    }
  }
  var Module = function Module2(rawModule, runtime) {
    this.runtime = runtime;
    this._children = /* @__PURE__ */ Object.create(null);
    this._rawModule = rawModule;
    var rawState = rawModule.state;
    this.state = (typeof rawState === "function" ? rawState() : rawState) || {};
  };
  var prototypeAccessors$1 = { namespaced: { configurable: true } };
  prototypeAccessors$1.namespaced.get = function() {
    return !!this._rawModule.namespaced;
  };
  Module.prototype.addChild = function addChild(key, module) {
    this._children[key] = module;
  };
  Module.prototype.removeChild = function removeChild(key) {
    delete this._children[key];
  };
  Module.prototype.getChild = function getChild(key) {
    return this._children[key];
  };
  Module.prototype.hasChild = function hasChild(key) {
    return key in this._children;
  };
  Module.prototype.update = function update(rawModule) {
    this._rawModule.namespaced = rawModule.namespaced;
    if (rawModule.actions) {
      this._rawModule.actions = rawModule.actions;
    }
    if (rawModule.mutations) {
      this._rawModule.mutations = rawModule.mutations;
    }
    if (rawModule.getters) {
      this._rawModule.getters = rawModule.getters;
    }
  };
  Module.prototype.forEachChild = function forEachChild(fn) {
    forEachValue(this._children, fn);
  };
  Module.prototype.forEachGetter = function forEachGetter(fn) {
    if (this._rawModule.getters) {
      forEachValue(this._rawModule.getters, fn);
    }
  };
  Module.prototype.forEachAction = function forEachAction(fn) {
    if (this._rawModule.actions) {
      forEachValue(this._rawModule.actions, fn);
    }
  };
  Module.prototype.forEachMutation = function forEachMutation(fn) {
    if (this._rawModule.mutations) {
      forEachValue(this._rawModule.mutations, fn);
    }
  };
  Object.defineProperties(Module.prototype, prototypeAccessors$1);
  var ModuleCollection = function ModuleCollection2(rawRootModule) {
    this.register([], rawRootModule, false);
  };
  ModuleCollection.prototype.get = function get(path) {
    return path.reduce(function(module, key) {
      return module.getChild(key);
    }, this.root);
  };
  ModuleCollection.prototype.getNamespace = function getNamespace(path) {
    var module = this.root;
    return path.reduce(function(namespace, key) {
      module = module.getChild(key);
      return namespace + (module.namespaced ? key + "/" : "");
    }, "");
  };
  ModuleCollection.prototype.update = function update$1(rawRootModule) {
    update2([], this.root, rawRootModule);
  };
  ModuleCollection.prototype.register = function register2(path, rawModule, runtime) {
    var this$1$1 = this;
    if (runtime === void 0)
      runtime = true;
    {
      assertRawModule(path, rawModule);
    }
    var newModule = new Module(rawModule, runtime);
    if (path.length === 0) {
      this.root = newModule;
    } else {
      var parent = this.get(path.slice(0, -1));
      parent.addChild(path[path.length - 1], newModule);
    }
    if (rawModule.modules) {
      forEachValue(rawModule.modules, function(rawChildModule, key) {
        this$1$1.register(path.concat(key), rawChildModule, runtime);
      });
    }
  };
  ModuleCollection.prototype.unregister = function unregister(path) {
    var parent = this.get(path.slice(0, -1));
    var key = path[path.length - 1];
    var child = parent.getChild(key);
    if (!child) {
      {
        console.warn(
          "[vuex] trying to unregister module '" + key + "', which is not registered"
        );
      }
      return;
    }
    if (!child.runtime) {
      return;
    }
    parent.removeChild(key);
  };
  ModuleCollection.prototype.isRegistered = function isRegistered(path) {
    var parent = this.get(path.slice(0, -1));
    var key = path[path.length - 1];
    if (parent) {
      return parent.hasChild(key);
    }
    return false;
  };
  function update2(path, targetModule, newModule) {
    {
      assertRawModule(path, newModule);
    }
    targetModule.update(newModule);
    if (newModule.modules) {
      for (var key in newModule.modules) {
        if (!targetModule.getChild(key)) {
          {
            console.warn(
              "[vuex] trying to add a new module '" + key + "' on hot reloading, manual reload is needed"
            );
          }
          return;
        }
        update2(
          path.concat(key),
          targetModule.getChild(key),
          newModule.modules[key]
        );
      }
    }
  }
  var functionAssert = {
    assert: function(value) {
      return typeof value === "function";
    },
    expected: "function"
  };
  var objectAssert = {
    assert: function(value) {
      return typeof value === "function" || typeof value === "object" && typeof value.handler === "function";
    },
    expected: 'function or object with "handler" function'
  };
  var assertTypes = {
    getters: functionAssert,
    mutations: functionAssert,
    actions: objectAssert
  };
  function assertRawModule(path, rawModule) {
    Object.keys(assertTypes).forEach(function(key) {
      if (!rawModule[key]) {
        return;
      }
      var assertOptions = assertTypes[key];
      forEachValue(rawModule[key], function(value, type) {
        assert(
          assertOptions.assert(value),
          makeAssertionMessage(path, key, type, value, assertOptions.expected)
        );
      });
    });
  }
  function makeAssertionMessage(path, key, type, value, expected) {
    var buf = key + " should be " + expected + ' but "' + key + "." + type + '"';
    if (path.length > 0) {
      buf += ' in module "' + path.join(".") + '"';
    }
    buf += " is " + JSON.stringify(value) + ".";
    return buf;
  }
  function createStore(options) {
    return new Store(options);
  }
  var Store = function Store2(options) {
    var this$1$1 = this;
    if (options === void 0)
      options = {};
    {
      assert(typeof Promise !== "undefined", "vuex requires a Promise polyfill in this browser.");
      assert(this instanceof Store2, "store must be called with the new operator.");
    }
    var plugins = options.plugins;
    if (plugins === void 0)
      plugins = [];
    var strict = options.strict;
    if (strict === void 0)
      strict = false;
    var devtools = options.devtools;
    this._committing = false;
    this._actions = /* @__PURE__ */ Object.create(null);
    this._actionSubscribers = [];
    this._mutations = /* @__PURE__ */ Object.create(null);
    this._wrappedGetters = /* @__PURE__ */ Object.create(null);
    this._modules = new ModuleCollection(options);
    this._modulesNamespaceMap = /* @__PURE__ */ Object.create(null);
    this._subscribers = [];
    this._makeLocalGettersCache = /* @__PURE__ */ Object.create(null);
    this._scope = null;
    this._devtools = devtools;
    var store2 = this;
    var ref = this;
    var dispatch2 = ref.dispatch;
    var commit2 = ref.commit;
    this.dispatch = function boundDispatch(type, payload) {
      return dispatch2.call(store2, type, payload);
    };
    this.commit = function boundCommit(type, payload, options2) {
      return commit2.call(store2, type, payload, options2);
    };
    this.strict = strict;
    var state = this._modules.root.state;
    installModule(this, state, [], this._modules.root);
    resetStoreState(this, state);
    plugins.forEach(function(plugin) {
      return plugin(this$1$1);
    });
  };
  var prototypeAccessors = { state: { configurable: true } };
  Store.prototype.install = function install(app, injectKey) {
    app.provide(injectKey || storeKey, this);
    app.config.globalProperties.$store = this;
    var useDevtools = this._devtools !== void 0 ? this._devtools : true;
    if (useDevtools) {
      addDevtools(app, this);
    }
  };
  prototypeAccessors.state.get = function() {
    return this._state.data;
  };
  prototypeAccessors.state.set = function(v) {
    {
      assert(false, "use store.replaceState() to explicit replace store state.");
    }
  };
  Store.prototype.commit = function commit(_type, _payload, _options) {
    var this$1$1 = this;
    var ref = unifyObjectStyle(_type, _payload, _options);
    var type = ref.type;
    var payload = ref.payload;
    var options = ref.options;
    var mutation = { type, payload };
    var entry = this._mutations[type];
    if (!entry) {
      {
        console.error("[vuex] unknown mutation type: " + type);
      }
      return;
    }
    this._withCommit(function() {
      entry.forEach(function commitIterator(handler) {
        handler(payload);
      });
    });
    this._subscribers.slice().forEach(function(sub) {
      return sub(mutation, this$1$1.state);
    });
    if (options && options.silent) {
      console.warn(
        "[vuex] mutation type: " + type + ". Silent option has been removed. Use the filter functionality in the vue-devtools"
      );
    }
  };
  Store.prototype.dispatch = function dispatch(_type, _payload) {
    var this$1$1 = this;
    var ref = unifyObjectStyle(_type, _payload);
    var type = ref.type;
    var payload = ref.payload;
    var action = { type, payload };
    var entry = this._actions[type];
    if (!entry) {
      {
        console.error("[vuex] unknown action type: " + type);
      }
      return;
    }
    try {
      this._actionSubscribers.slice().filter(function(sub) {
        return sub.before;
      }).forEach(function(sub) {
        return sub.before(action, this$1$1.state);
      });
    } catch (e) {
      {
        console.warn("[vuex] error in before action subscribers: ");
        console.error(e);
      }
    }
    var result = entry.length > 1 ? Promise.all(entry.map(function(handler) {
      return handler(payload);
    })) : entry[0](payload);
    return new Promise(function(resolve, reject) {
      result.then(function(res) {
        try {
          this$1$1._actionSubscribers.filter(function(sub) {
            return sub.after;
          }).forEach(function(sub) {
            return sub.after(action, this$1$1.state);
          });
        } catch (e) {
          {
            console.warn("[vuex] error in after action subscribers: ");
            console.error(e);
          }
        }
        resolve(res);
      }, function(error) {
        try {
          this$1$1._actionSubscribers.filter(function(sub) {
            return sub.error;
          }).forEach(function(sub) {
            return sub.error(action, this$1$1.state, error);
          });
        } catch (e) {
          {
            console.warn("[vuex] error in error action subscribers: ");
            console.error(e);
          }
        }
        reject(error);
      });
    });
  };
  Store.prototype.subscribe = function subscribe(fn, options) {
    return genericSubscribe(fn, this._subscribers, options);
  };
  Store.prototype.subscribeAction = function subscribeAction(fn, options) {
    var subs = typeof fn === "function" ? { before: fn } : fn;
    return genericSubscribe(subs, this._actionSubscribers, options);
  };
  Store.prototype.watch = function watch$1(getter, cb, options) {
    var this$1$1 = this;
    {
      assert(typeof getter === "function", "store.watch only accepts a function.");
    }
    return vue.watch(function() {
      return getter(this$1$1.state, this$1$1.getters);
    }, cb, Object.assign({}, options));
  };
  Store.prototype.replaceState = function replaceState(state) {
    var this$1$1 = this;
    this._withCommit(function() {
      this$1$1._state.data = state;
    });
  };
  Store.prototype.registerModule = function registerModule(path, rawModule, options) {
    if (options === void 0)
      options = {};
    if (typeof path === "string") {
      path = [path];
    }
    {
      assert(Array.isArray(path), "module path must be a string or an Array.");
      assert(path.length > 0, "cannot register the root module by using registerModule.");
    }
    this._modules.register(path, rawModule);
    installModule(this, this.state, path, this._modules.get(path), options.preserveState);
    resetStoreState(this, this.state);
  };
  Store.prototype.unregisterModule = function unregisterModule(path) {
    var this$1$1 = this;
    if (typeof path === "string") {
      path = [path];
    }
    {
      assert(Array.isArray(path), "module path must be a string or an Array.");
    }
    this._modules.unregister(path);
    this._withCommit(function() {
      var parentState = getNestedState(this$1$1.state, path.slice(0, -1));
      delete parentState[path[path.length - 1]];
    });
    resetStore(this);
  };
  Store.prototype.hasModule = function hasModule(path) {
    if (typeof path === "string") {
      path = [path];
    }
    {
      assert(Array.isArray(path), "module path must be a string or an Array.");
    }
    return this._modules.isRegistered(path);
  };
  Store.prototype.hotUpdate = function hotUpdate(newOptions) {
    this._modules.update(newOptions);
    resetStore(this, true);
  };
  Store.prototype._withCommit = function _withCommit(fn) {
    var committing = this._committing;
    this._committing = true;
    fn();
    this._committing = committing;
  };
  Object.defineProperties(Store.prototype, prototypeAccessors);
  var mapState = normalizeNamespace(function(namespace, states) {
    var res = {};
    if (!isValidMap(states)) {
      console.error("[vuex] mapState: mapper parameter must be either an Array or an Object");
    }
    normalizeMap(states).forEach(function(ref) {
      var key = ref.key;
      var val = ref.val;
      res[key] = function mappedState() {
        var state = this.$store.state;
        var getters = this.$store.getters;
        if (namespace) {
          var module = getModuleByNamespace(this.$store, "mapState", namespace);
          if (!module) {
            return;
          }
          state = module.context.state;
          getters = module.context.getters;
        }
        return typeof val === "function" ? val.call(this, state, getters) : state[val];
      };
      res[key].vuex = true;
    });
    return res;
  });
  var mapMutations = normalizeNamespace(function(namespace, mutations) {
    var res = {};
    if (!isValidMap(mutations)) {
      console.error("[vuex] mapMutations: mapper parameter must be either an Array or an Object");
    }
    normalizeMap(mutations).forEach(function(ref) {
      var key = ref.key;
      var val = ref.val;
      res[key] = function mappedMutation() {
        var args = [], len = arguments.length;
        while (len--)
          args[len] = arguments[len];
        var commit2 = this.$store.commit;
        if (namespace) {
          var module = getModuleByNamespace(this.$store, "mapMutations", namespace);
          if (!module) {
            return;
          }
          commit2 = module.context.commit;
        }
        return typeof val === "function" ? val.apply(this, [commit2].concat(args)) : commit2.apply(this.$store, [val].concat(args));
      };
    });
    return res;
  });
  var mapGetters = normalizeNamespace(function(namespace, getters) {
    var res = {};
    if (!isValidMap(getters)) {
      console.error("[vuex] mapGetters: mapper parameter must be either an Array or an Object");
    }
    normalizeMap(getters).forEach(function(ref) {
      var key = ref.key;
      var val = ref.val;
      val = namespace + val;
      res[key] = function mappedGetter() {
        if (namespace && !getModuleByNamespace(this.$store, "mapGetters", namespace)) {
          return;
        }
        if (!(val in this.$store.getters)) {
          console.error("[vuex] unknown getter: " + val);
          return;
        }
        return this.$store.getters[val];
      };
      res[key].vuex = true;
    });
    return res;
  });
  var mapActions = normalizeNamespace(function(namespace, actions) {
    var res = {};
    if (!isValidMap(actions)) {
      console.error("[vuex] mapActions: mapper parameter must be either an Array or an Object");
    }
    normalizeMap(actions).forEach(function(ref) {
      var key = ref.key;
      var val = ref.val;
      res[key] = function mappedAction() {
        var args = [], len = arguments.length;
        while (len--)
          args[len] = arguments[len];
        var dispatch2 = this.$store.dispatch;
        if (namespace) {
          var module = getModuleByNamespace(this.$store, "mapActions", namespace);
          if (!module) {
            return;
          }
          dispatch2 = module.context.dispatch;
        }
        return typeof val === "function" ? val.apply(this, [dispatch2].concat(args)) : dispatch2.apply(this.$store, [val].concat(args));
      };
    });
    return res;
  });
  var createNamespacedHelpers = function(namespace) {
    return {
      mapState: mapState.bind(null, namespace),
      mapGetters: mapGetters.bind(null, namespace),
      mapMutations: mapMutations.bind(null, namespace),
      mapActions: mapActions.bind(null, namespace)
    };
  };
  function normalizeMap(map) {
    if (!isValidMap(map)) {
      return [];
    }
    return Array.isArray(map) ? map.map(function(key) {
      return { key, val: key };
    }) : Object.keys(map).map(function(key) {
      return { key, val: map[key] };
    });
  }
  function isValidMap(map) {
    return Array.isArray(map) || isObject(map);
  }
  function normalizeNamespace(fn) {
    return function(namespace, map) {
      if (typeof namespace !== "string") {
        map = namespace;
        namespace = "";
      } else if (namespace.charAt(namespace.length - 1) !== "/") {
        namespace += "/";
      }
      return fn(namespace, map);
    };
  }
  function getModuleByNamespace(store2, helper, namespace) {
    var module = store2._modulesNamespaceMap[namespace];
    if (!module) {
      console.error("[vuex] module namespace not found in " + helper + "(): " + namespace);
    }
    return module;
  }
  function createLogger(ref) {
    if (ref === void 0)
      ref = {};
    var collapsed = ref.collapsed;
    if (collapsed === void 0)
      collapsed = true;
    var filter = ref.filter;
    if (filter === void 0)
      filter = function(mutation, stateBefore, stateAfter) {
        return true;
      };
    var transformer = ref.transformer;
    if (transformer === void 0)
      transformer = function(state) {
        return state;
      };
    var mutationTransformer = ref.mutationTransformer;
    if (mutationTransformer === void 0)
      mutationTransformer = function(mut) {
        return mut;
      };
    var actionFilter = ref.actionFilter;
    if (actionFilter === void 0)
      actionFilter = function(action, state) {
        return true;
      };
    var actionTransformer = ref.actionTransformer;
    if (actionTransformer === void 0)
      actionTransformer = function(act) {
        return act;
      };
    var logMutations = ref.logMutations;
    if (logMutations === void 0)
      logMutations = true;
    var logActions = ref.logActions;
    if (logActions === void 0)
      logActions = true;
    var logger = ref.logger;
    if (logger === void 0)
      logger = console;
    return function(store2) {
      var prevState = deepCopy(store2.state);
      if (typeof logger === "undefined") {
        return;
      }
      if (logMutations) {
        store2.subscribe(function(mutation, state) {
          var nextState = deepCopy(state);
          if (filter(mutation, prevState, nextState)) {
            var formattedTime = getFormattedTime();
            var formattedMutation = mutationTransformer(mutation);
            var message = "mutation " + mutation.type + formattedTime;
            startMessage(logger, message, collapsed);
            logger.log("%c prev state", "color: #9E9E9E; font-weight: bold", transformer(prevState));
            logger.log("%c mutation", "color: #03A9F4; font-weight: bold", formattedMutation);
            logger.log("%c next state", "color: #4CAF50; font-weight: bold", transformer(nextState));
            endMessage(logger);
          }
          prevState = nextState;
        });
      }
      if (logActions) {
        store2.subscribeAction(function(action, state) {
          if (actionFilter(action, state)) {
            var formattedTime = getFormattedTime();
            var formattedAction = actionTransformer(action);
            var message = "action " + action.type + formattedTime;
            startMessage(logger, message, collapsed);
            logger.log("%c action", "color: #03A9F4; font-weight: bold", formattedAction);
            endMessage(logger);
          }
        });
      }
    };
  }
  function startMessage(logger, message, collapsed) {
    var startMessage2 = collapsed ? logger.groupCollapsed : logger.group;
    try {
      startMessage2.call(logger, message);
    } catch (e) {
      logger.log(message);
    }
  }
  function endMessage(logger) {
    try {
      logger.groupEnd();
    } catch (e) {
      logger.log("—— log end ——");
    }
  }
  function getFormattedTime() {
    var time = /* @__PURE__ */ new Date();
    return " @ " + pad(time.getHours(), 2) + ":" + pad(time.getMinutes(), 2) + ":" + pad(time.getSeconds(), 2) + "." + pad(time.getMilliseconds(), 3);
  }
  function repeat(str, times) {
    return new Array(times + 1).join(str);
  }
  function pad(num, maxLength) {
    return repeat("0", maxLength - num.toString().length) + num;
  }
  var index = {
    version: "4.1.0",
    Store,
    storeKey,
    createStore,
    useStore,
    mapState,
    mapMutations,
    mapGetters,
    mapActions,
    createNamespacedHelpers,
    createLogger
  };
  function createApp() {
    const app = vue.createVueApp(App);
    app.use(createPinia());
    app.config.globalProperties.$store = store;
    app.config.globalProperties.$adpid = "1111111111";
    app.config.globalProperties.$backgroundAudioData = {
      playing: false,
      playTime: 0,
      formatedPlayTime: "00:00:00"
    };
    return {
      app,
      Vuex: index,
      // 如果 nvue 使用 vuex 的各种map工具方法时，必须 return Vuex
      Pinia
      // 此处必须将 Pinia 返回
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
