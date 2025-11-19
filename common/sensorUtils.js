/**
 * 传感器工具类
 * 提供数据处理和分析功能
 */
class SensorUtils {
  /**
   * 计算三维向量的模
   */
  static magnitude(vector) {
    return Math.sqrt(
      vector.x * vector.x +
      vector.y * vector.y +
      vector.z * vector.z
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
    // #ifdef H5
    const isH5 = true;
    const hasMotion = 'DeviceMotionEvent' in window;
    const hasOrientation = 'DeviceOrientationEvent' in window;
    const needsPermission = 
      hasMotion && 
      typeof DeviceMotionEvent.requestPermission === 'function';
    
    return {
      platform: 'h5',
      isSupported: hasMotion && hasOrientation,
      needsPermission,
      apis: {
        motion: hasMotion,
        orientation: hasOrientation
      }
    };
    // #endif

    // #ifdef APP-PLUS
    const isApp = true;
    const hasAccelerometer = plus.accelerometer !== undefined;
    const hasCompass = plus.compass !== undefined;

    return {
      platform: 'app',
      isSupported: hasAccelerometer && hasCompass,
      needsPermission: false,
      apis: {
        accelerometer: hasAccelerometer,
        compass: hasCompass
      }
    };
    // #endif

    return {
      platform: 'unknown',
      isSupported: false,
      needsPermission: false,
      apis: {}
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
      accelThreshold = 20,    // 加速度异常阈值
      rotationThreshold = 15, // 旋转速度异常阈值
      noiseThreshold = 0.1    // 噪声阈值
    } = config;

    const anomalies = {
      hasAnomalies: false,
      details: []
    };

    // 检查加速度异常
    const accelMag = this.magnitude(data.acceleration);
    if (accelMag > accelThreshold) {
      anomalies.hasAnomalies = true;
      anomalies.details.push({
        type: 'acceleration',
        value: accelMag,
        threshold: accelThreshold
      });
    }

    // 检查旋转速度异常
    const rotationMag = this.magnitude(data.rotationRate);
    if (rotationMag > rotationThreshold) {
      anomalies.hasAnomalies = true;
      anomalies.details.push({
        type: 'rotation',
        value: rotationMag,
        threshold: rotationThreshold
      });
    }

    // 检查噪声
    if (Math.abs(data.acceleration.x) < noiseThreshold &&
        Math.abs(data.acceleration.y) < noiseThreshold &&
        Math.abs(data.acceleration.z) < noiseThreshold) {
      anomalies.hasAnomalies = true;
      anomalies.details.push({
        type: 'noise',
        threshold: noiseThreshold
      });
    }

    return anomalies;
  }

  /**
   * 分析游泳姿势
   */
  static analyzeSwimmingStyle(data, window = 10) {
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

    // 分析数据特征
    this._analyzeFreestyle(data, patterns.freestyle);
    this._analyzeButterfly(data, patterns.butterfly);
    this._analyzeBreaststroke(data, patterns.breaststroke);
    this._analyzeBackstroke(data, patterns.backstroke);

    // 找出得分最高的姿势
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
      strokesPerMinute: (strokeCount / time) * 60000,
      distancePerStroke: distance / strokeCount,
      speed: (distance / time) * 1000,
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

    // 计算各维度的动作质量得分
    const symmetryScore = this._calculateSymmetry(acceleration, rotationRate);
    const powerScore = this._calculatePower(acceleration);
    const smoothnessScore = this._calculateSmoothness(acceleration, rotationRate);
    const balanceScore = this._calculateBalance(orientation);

    // 汇总得分
    const totalScore = (
      symmetryScore * 0.3 +
      powerScore * 0.3 +
      smoothnessScore * 0.2 +
      balanceScore * 0.2
    );

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
    
    // 检查手臂旋转
    if (Math.abs(rotationRate.z) > 1.5) {
      pattern.score += 30;
      pattern.features.armRotation = true;
    }
    
    // 检查身体翻滚
    if (Math.abs(orientation.gamma) > 30) {
      pattern.score += 40;
      pattern.features.bodyRoll = true;
    }
    
    // 检查节奏
    const accelPattern = Math.abs(acceleration.x) > 1.0 &&
                        Math.abs(acceleration.y) > 0.5;
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
    
    // 检查对称划水
    const symmetricMotion = Math.abs(acceleration.x) < 0.5 &&
                          Math.abs(acceleration.y) > 2.0;
    if (symmetricMotion) {
      pattern.score += 35;
      pattern.features.symmetricArms = true;
    }
    
    // 检查身体波浪
    if (Math.abs(rotationRate.x) > 1.2) {
      pattern.score += 35;
      pattern.features.bodyUndulation = true;
    }
    
    // 检查协调性
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
    
    // 检查对称划水
    const symmetricPull = Math.abs(acceleration.x) < 0.8 &&
                         Math.abs(acceleration.y) > 1.0;
    if (symmetricPull) {
      pattern.score += 35;
      pattern.features.symmetricPull = true;
    }
    
    // 检查蹬腿
    const legKick = Math.abs(acceleration.z) > 1.2 &&
                    Math.abs(rotationRate.x) < 0.8;
    if (legKick) {
      pattern.score += 35;
      pattern.features.legKick = true;
    }
    
    // 检查滑行
    const glide = Math.abs(acceleration.x) < 0.3 &&
                  Math.abs(acceleration.y) < 0.3 &&
                  Math.abs(acceleration.z) < 0.3;
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
    
    // 检查仰卧姿势
    if (Math.abs(orientation.beta - 180) < 20) {
      pattern.score += 35;
      pattern.features.backPosition = true;
    }
    
    // 检查手臂动作
    const armMotion = Math.abs(acceleration.x) > 1.2 &&
                      Math.abs(acceleration.y) < 0.8;
    if (armMotion) {
      pattern.score += 35;
      pattern.features.armRotation = true;
    }
    
    // 检查腿部动作
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
      feedback.push('保持左右划水动作的对称性');
    }
    
    if (scores.power < 0.6) {
      feedback.push('增加划水力度，但注意保持动作协调');
    }
    
    if (scores.smoothness < 0.7) {
      feedback.push('动作要更流畅，避免急促动作');
    }
    
    if (scores.balance < 0.6) {
      feedback.push('注意身体平衡，保持正确姿势');
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
    return Math.min(magnitude / 10, 1.0);
  }

  /**
   * 计算平滑度得分
   */
  static _calculateSmoothness(acceleration, rotationRate) {
    const accelJerk = Math.abs(
      acceleration.x * acceleration.x +
      acceleration.y * acceleration.y +
      acceleration.z * acceleration.z
    );
    
    const rotationJerk = Math.abs(
      rotationRate.alpha * rotationRate.alpha +
      rotationRate.beta * rotationRate.beta +
      rotationRate.gamma * rotationRate.gamma
    );
    
    const smoothness = 1 - Math.min(
      (accelJerk + rotationJerk) / 100,
      1.0
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

export default SensorUtils;
