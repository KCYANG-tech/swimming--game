/**
 * 游泳游戏逻辑类
 * 处理游戏状态、角色控制、碰撞检测等
 */
class SwimmingGame {
  constructor() {
    // 游戏状态
    this.gameState = 'ready'; // ready, playing, paused, ended
    this.gameTime = 0;
    this.maxGameTime = 60000; // 60秒
    
    // 游戏数据
    this.distance = 0;
    this.speed = 0;
    this.score = 0;
    this.strokeCount = 0;
    this.lives = 3; // 初始生命值
    this.coinStreak = 0; // 连续吃币计数
    this.invulnerableUntil = 0; // 无敌截止时间戳（ms）
    this.endReason = null; // 'time' | 'lives'
    
    // 角色数据
    this.player = {
      x: 50, // 角色X位置 (百分比)
      y: 50, // 角色Y位置 (百分比)
      size: 20, // 角色大小
      speed: 0, // 当前水平速度(用于距离统计)（不再由挥臂触发）
      maxSpeed: 3, // 最大水平速度（用于整体前进基准）
      acceleration: 0.05, // 基础缓动加速度（倾斜不直接修改）
      deceleration: 0.02, // 缓慢衰减
      vx: 0, // 水平移动速度分量（百分比/秒）
      vy: 0,  // 垂直移动速度分量（百分比/秒）
      hitRadius: 3.8 // 初始碰撞半径（%）
    };
    
    // 游戏对象
    this.obstacles = [];
    this.coins = [];
    this.particles = [];
    
    // 游戏设置
    this.settings = {
      // 旧：基于帧的概率生成（保留但不再使用）
      obstacleSpawnRate: 0.02,
      coinSpawnRate: 0.01,
      // 新：基于时间的生成间隔，确保全程稳定生成，并随时间增加难度
      obstacleIntervalStart: 1600, // ms，开局障碍物生成间隔
      obstacleIntervalEnd: 700,    // ms，末段障碍物生成间隔（更密集）
      coinIntervalStart: 1200,     // ms，开局金币生成间隔
      coinIntervalEnd: 1000,       // ms，末段金币生成间隔（略微加快或持平）
      obstacleMaxStart: 5,         // 同屏障碍物上限（开局）
      obstacleMaxEnd: 10,          // 同屏障碍物上限（末段）
      coinMax: 8,                  // 同屏金币上限
      obstacleSpeed: 2, // 障碍物移动速度
      coinSpeed: 1.5, // 金币移动速度
      obstacleSize: 15, // 障碍物大小
  coinSize: 10, // 金币大小
      moveScale: 22, // vx/vy 应用于坐标的缩放（% 每 1 速度单位每秒）
      dirSmoothing: 8, // 方向速度插值响应（越大越跟手）
      deadZone: 0.05, // 输入死区
      baseForwardSpeed: 0.3, // 基础前进距离速度(用于距离累计)
      hitInvulnMs: 1200, // 撞击后无敌时长(ms)
      maxLives: 5, // 生命上限
      coinStreakTarget: 3, // 连续吃N个金币奖励一条命
      // 碰撞半径（单位：百分比坐标的半径），用于更贴合视觉大小
      hitRadiusPlayerPct: 3.8,
      hitRadiusCoinPct: 2.4,
      hitRadiusObstaclePct: 3.2
    };
    
    // 回调函数
    this.callbacks = {
      onStateChange: null,
      onScoreUpdate: null,
      onGameOver: null
    };
    
    // 游戏循环
    this.gameLoop = null;
    this.lastTime = 0;
    // rAF 封装（H5 优先，缺失则使用 setTimeout 兜底）
    const root = (typeof window !== 'undefined') ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
    this._raf = (root && typeof root.requestAnimationFrame === 'function')
      ? root.requestAnimationFrame.bind(root)
      : (cb) => setTimeout(() => cb((typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now())), 16);
    this._caf = (root && typeof root.cancelAnimationFrame === 'function')
      ? root.cancelAnimationFrame.bind(root)
      : (id) => clearTimeout(id);
  // 生成计时器（基于时间的生成逻辑）
  this._obstacleTimer = 0;
  this._coinTimer = 0;
    // 摇杆方向（-1..1）
    this.dirX = 0;
    this.dirY = 0;
    // 自动前进朝向（无输入时沿此方向缓慢前进）
    this.headingX = 1;
    this.headingY = 0;
  }

  /**
   * 初始化游戏
   */
  init() {
    this.resetGame();
    console.log('游泳游戏已初始化');
  }

  /**
   * 重置游戏数据
   */
  resetGame() {
    this.gameState = 'ready';
    this.gameTime = 0;
    this.distance = 0;
    this.speed = 0;
    this.score = 0;
    this.strokeCount = 0;
    this.lives = 3;
    this.coinStreak = 0;
    this.invulnerableUntil = 0;
    this.endReason = null;
  // 重置生成计时器
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
    if (this.gameState !== 'ready' && this.gameState !== 'ended') {
      return;
    }
    
  this.gameState = 'playing';
  // 使用与 requestAnimationFrame 相同的时间源
  this.lastTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    this.startGameLoop();
    
    this.triggerCallback('onStateChange', this.gameState);
    console.log('游戏开始');
  }

  /**
   * 暂停游戏
   */
  pauseGame() {
    if (this.gameState !== 'playing') {
      return;
    }
    
    this.gameState = 'paused';
    this.stopGameLoop();
    
    this.triggerCallback('onStateChange', this.gameState);
    console.log('游戏暂停');
  }

  /**
   * 恢复游戏
   */
  resumeGame() {
    if (this.gameState !== 'paused') {
      return;
    }
    
  this.gameState = 'playing';
  this.lastTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    this.startGameLoop();
    
    this.triggerCallback('onStateChange', this.gameState);
    console.log('游戏恢复');
  }

  /**
   * 结束游戏
   */
  endGame() {
    this.gameState = 'ended';
    this.stopGameLoop();
    
    this.triggerCallback('onStateChange', this.gameState);
    this.triggerCallback('onGameOver', {
      score: this.score,
      distance: this.distance,
      strokeCount: this.strokeCount,
      time: this.gameTime,
      lives: this.lives,
      endReason: this.endReason
    });
    
    console.log('游戏结束', {
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
      if (this.gameState !== 'playing') {
        return;
      }
      
      // 首帧对齐时间源
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
    // 更新游戏时间
    this.gameTime += deltaTime;
    
    // 检查游戏时间限制
    if (this.gameTime >= this.maxGameTime) {
      this.endReason = 'time';
      this.endGame();
      return;
    }
    
    // 更新角色
    this.updatePlayer(deltaTime);
    
    // 更新游戏对象
    this.updateObstacles(deltaTime);
    this.updateCoins(deltaTime);
    this.updateParticles(deltaTime);
    
  // 生成新对象（时间驱动，保证全程有产出并逐步增加难度）
  this.spawnObjects(deltaTime);
    
    // 检测碰撞
    this.checkCollisions();
    
    // 更新距离和速度
    this.updateDistance();
    this.updateSpeed();
  }

  /**
   * 更新角色
   */
  updatePlayer(deltaTime) {
    const dt = deltaTime / 1000; // 换算为秒

    // 读取输入（摇杆优先，其次倾斜）
    let ix = Math.abs(this.dirX) > this.settings.deadZone ? this.dirX : (Math.abs(this.tiltX||0) > this.settings.deadZone ? this.tiltX : 0);
    let iy = Math.abs(this.dirY) > this.settings.deadZone ? this.dirY : (Math.abs(this.tiltY||0) > this.settings.deadZone ? this.tiltY : 0);

    // 归一化方向向量（保持圆形速度）
    const mag = Math.sqrt(ix*ix + iy*iy);
    if (mag > 1) { ix /= mag; iy /= mag; }

    // 目标速度分量（丝滑的：输入 * 最大速度）
    const targetVx = ix * this.player.maxSpeed;
    const targetVy = iy * this.player.maxSpeed;

    // 速度插值 (lerp) 实现平滑跟随
    const follow = Math.min(1, this.settings.dirSmoothing * dt); // 插值比率
    this.player.vx += (targetVx - this.player.vx) * follow;
    this.player.vy += (targetVy - this.player.vy) * follow;

    // 更新朝向（有有效输入时采用输入方向）
    if (mag > this.settings.deadZone) {
      const hm = Math.sqrt(ix*ix + iy*iy) || 1;
      this.headingX = ix / hm;
      this.headingY = iy / hm;
    }

    // 如果没有输入，轻微阻尼让角色缓慢停下
    if (mag === 0) {
      const damp = Math.pow(0.92, deltaTime/16.67); // 帧率无关阻尼
      this.player.vx *= damp;
      this.player.vy *= damp;
    }

    // 根据速度更新位置（百分比坐标）
    this.player.x += this.player.vx * this.settings.moveScale * dt;
    this.player.y += this.player.vy * this.settings.moveScale * dt;

  // 自动轻微前进：沿 heading 方向小幅位移，增强“始终在游泳”的体感
  const autoMove = (this.settings.autoMoveScale || 6) * dt;
  this.player.x += this.headingX * autoMove * 0.2;
  this.player.y += this.headingY * autoMove * 0.2;

    // 边界限制
    this.player.x = Math.max(5, Math.min(95, this.player.x));
    this.player.y = Math.max(5, Math.min(95, this.player.y));

    // 计算展示速度（标量）
    this.player.speed = Math.sqrt(this.player.vx*this.player.vx + this.player.vy*this.player.vy);
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
    if (this.gameState !== 'playing') return;
    this.player.x = Math.max(5, Math.min(95, this.player.x + dx));
    this.player.y = Math.max(5, Math.min(95, this.player.y + dy));
  }

  /**
   * 调试：手动生成一个障碍物
   */
  spawnObstacle() {
    if (this.gameState !== 'playing') return;
    this.addObstacle();
  }

  /**
   * 调试：手动生成一个金币
   */
  spawnCoin() {
    if (this.gameState !== 'playing') return;
    this.addCoin();
  }

  /**
   * 调试：直接提升玩家速度
   */
  boostSpeed(amount = 0.5) {
    if (this.gameState !== 'playing') return;
    this.player.speed = Math.min(this.player.speed + amount, this.player.maxSpeed);
  }

  /**
   * 调试：模拟一次挥臂（strokePower 可调）
   */
  simulateStroke(power = 1) {
    // 已废弃：挥臂逻辑不再影响速度，保留用于产生粒子视觉调试
    if (this.gameState !== 'playing') return;
    this.addParticle(this.player.x, this.player.y, 'stroke');
  }

  /**
   * 更新障碍物
   */
  updateObstacles(deltaTime) {
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      obstacle.x -= this.settings.obstacleSpeed * deltaTime * 0.01;
      
      // 移除超出屏幕的障碍物
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
      
      // 移除超出屏幕的金币
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
      
      // 移除生命周期结束的粒子
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
    // 难度进度（0..1）
    const prog = Math.min(1, this.gameTime / this.maxGameTime);

    // 计算当前间隔与上限
    const lerp = (a,b,t) => a + (b - a) * t;
    const obsInterval = lerp(this.settings.obstacleIntervalStart, this.settings.obstacleIntervalEnd, prog);
    const coinInterval = lerp(this.settings.coinIntervalStart, this.settings.coinIntervalEnd, prog);
    const obsMax = Math.round(lerp(this.settings.obstacleMaxStart, this.settings.obstacleMaxEnd, prog));
    const coinMax = this.settings.coinMax || 8;

    // 推进计时器
    this._obstacleTimer -= dt;
    this._coinTimer -= dt;

    // 障碍物：在上限内，按时间步进生成；加入微小抖动避免周期感
    const jitter = (base, low=0.85, high=1.15) => base * (low + Math.random() * (high - low));
    while (this._obstacleTimer <= 0) {
      if (this.obstacles.length < obsMax) {
        this.addObstacle();
      }
      this._obstacleTimer += jitter(obsInterval, 0.85, 1.15);
    }

    // 金币：保持基本稳定数量
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
    if (!this.obstaclesPool) this.obstaclesPool = [];
    if (!this.maxObstaclePool) this.maxObstaclePool = 30;
    if (!this.obstaclesPool.length) {
      for (let i=0;i<this.maxObstaclePool;i++) {
        this.obstaclesPool.push({ x:0,y:0,size:this.settings.obstacleSize,type:'obstacle',hitRadius:this.settings.hitRadiusObstaclePct,isActive:false });
      }
    }
    const obstacle = this.obstaclesPool.find(o => !o.isActive);
    if (!obstacle) return;
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
    if (!this.coinsPool) this.coinsPool = [];
    if (!this.maxCoinPool) this.maxCoinPool = 30;
    if (!this.coinsPool.length) {
    for (let i=0;i<this.maxCoinPool;i++) {
  this.coinsPool.push({ x:0,y:0,size:this.settings.coinSize,type:'coin',value:1,hitRadius:this.settings.hitRadiusCoinPct,isActive:false });
    }
    }
    const coin = this.coinsPool.find(c => !c.isActive);
    if (!coin) return;
    coin.x = 110;
    coin.y = Math.random() * 80 + 10;
    coin.size = this.settings.coinSize;
  coin.value = 1; // 每枚金币 +1 分
    coin.hitRadius = this.settings.hitRadiusCoinPct;
    coin.isActive = true;
    this.coins.push(coin);
  }

  /**
   * 添加粒子效果
   */
  addParticle(x, y, type) {
    const particle = {
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      life: 1000, // 1秒生命周期
      type: type
    };
    this.particles.push(particle);
  }

  /**
   * 检测碰撞
   */
  checkCollisions() {
    // 检测与障碍物的碰撞
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obstacle = this.obstacles[i];
      if (this.checkCollision(this.player, obstacle)) {
        const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
        // 若无敌中：移除该障碍以避免重复碰撞，但不扣生命
        if (now < this.invulnerableUntil) {
          this.obstacles.splice(i, 1);
          continue;
        }
        // 扣一条命并开启无敌
        this.obstacles.splice(i, 1);
        this.addParticle(obstacle.x, obstacle.y, 'hit');
        this.lives = Math.max(0, this.lives - 1);
        this.coinStreak = 0; // 撞击后清空连吃计数
        this.invulnerableUntil = now + this.settings.hitInvulnMs;
        if (this.lives === 0) {
          this.endReason = 'lives';
          this.endGame();
          return; // 游戏已结束
        }
      }
    }
    
    // 检测与金币的碰撞
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      if (this.checkCollision(this.player, coin)) {
        // 收集金币：每枚 +1 分
        this.score += 1;
        this.coinStreak += 1;
        if (this.coinStreak % this.settings.coinStreakTarget === 0 && this.lives < this.settings.maxLives) {
          this.lives += 1;
          this.addParticle(coin.x, coin.y, 'life');
        }
        this.coins.splice(i, 1);
        this.addParticle(coin.x, coin.y, 'coin');
        this.triggerCallback('onScoreUpdate', this.score);
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
    const r1 = typeof obj1.hitRadius === 'number' ? obj1.hitRadius : 3;
    const r2 = typeof obj2.hitRadius === 'number' ? obj2.hitRadius : 3;
    return distance < (r1 + r2);
  }

  /**
   * 更新距离
   */
  updateDistance() {
    // 距离按基础前进 + 当前速度的加成，体现持续运动感
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

export default SwimmingGame;
