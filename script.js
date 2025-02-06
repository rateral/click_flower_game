const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// オーディオコンテキストの初期化
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const soundBuffers = new Map();

// サウンドファイルの配列
const soundFiles = [
    'maou_se_inst_piano2_0.ogg',
    'maou_se_inst_piano2_1.ogg',
    'maou_se_inst_piano2_2.ogg',
    'maou_se_inst_piano2_3.ogg',
    'maou_se_inst_piano2_4.ogg',
    'maou_se_inst_piano2_5.ogg',
    'maou_se_inst_piano2_6.ogg'
];

// パーティクルクラス（花びら）
class Particle {
    constructor(x, y, color, angle) {
        this.x = x;
        this.y = y;
        this.color = { ...color };
        this.size = Math.random() * 4 + 2;
        
        // より遅い初期速度に調整
        const speed = Math.random() * 2 + 1;
        this.vx = Math.cos(angle ?? Math.random() * Math.PI * 2) * speed;
        this.vy = Math.sin(angle ?? Math.random() * Math.PI * 2) * speed;
        
        this.life = 1;
        this.decay = Math.random() * 0.001 + 0.0005; // より遅い減衰
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        
        // 摩擦係数を追加
        this.friction = 0.995;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        // より緩やかな減速
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.rotation += this.rotationSpeed;
        this.life -= this.decay;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.beginPath();
        // 花びらの形状
        ctx.moveTo(0, -this.size);
        ctx.bezierCurveTo(
            this.size * 0.5, -this.size,
            this.size, -this.size * 0.5,
            this.size, 0
        );
        ctx.bezierCurveTo(
            this.size, this.size * 0.5,
            this.size * 0.5, this.size,
            0, this.size
        );
        ctx.bezierCurveTo(
            -this.size * 0.5, this.size,
            -this.size, this.size * 0.5,
            -this.size, 0
        );
        ctx.bezierCurveTo(
            -this.size, -this.size * 0.5,
            -this.size * 0.5, -this.size,
            0, -this.size
        );

        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.life * 0.9})`);
        gradient.addColorStop(0.7, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.life * 0.5})`);
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
    }
}

// 背景の星クラス
class Star {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5;
        this.speed = Math.random() * 0.2 + 0.1;
        this.brightness = Math.random() * 0.5 + 0.5;
        this.pulseSpeed = Math.random() * 0.03 + 0.01;
        this.pulseAngle = Math.random() * Math.PI * 2;
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.reset();
            this.y = 0;
        }
        this.pulseAngle += this.pulseSpeed;
        this.currentBrightness = this.brightness * (0.7 + Math.sin(this.pulseAngle) * 0.3);
    }

    draw() {
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 2
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.currentBrightness})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 背景の星を生成
const stars = Array.from({ length: 150 }, () => new Star());

// カラーパレット（パステルカラー）
const colors = [
    { r: 255, g: 182, b: 193 }, // ピンク
    { r: 221, g: 160, b: 221 }, // プラム
    { r: 176, g: 224, b: 230 }, // パウダーブルー
    { r: 255, g: 218, b: 185 }, // ピーチ
    { r: 240, g: 230, b: 140 }  // カーキ
];

// エフェクトクラス
class Effect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.petals = [];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.petalCount = 12;
        this.time = 0;
        
        // 花びらの生成
        for (let i = 0; i < this.petalCount; i++) {
            this.petals.push({
                angle: (i / this.petalCount) * Math.PI * 2,
                size: 0,
                maxSize: 100 + Math.random() * 50,
                opacity: 0.9,
                speed: 0.5 + Math.random() * 0.5
            });
        }

        // 全方位にパーティクルを放出（数を増やしてより滑らかに）
        for (let i = 0; i < 48; i++) {
            const angle = (i / 48) * Math.PI * 2;
            particles.push(new Particle(x, y, this.color, angle));
        }

        // ランダムな方向のパーティクルも追加
        for (let i = 0; i < 30; i++) {
            particles.push(new Particle(x, y, this.color));
        }
    }

    update() {
        this.time += 0.02;
        let isAlive = false;
        this.petals.forEach(petal => {
            if (petal.size < petal.maxSize) {
                petal.size += petal.speed;
                petal.opacity = Math.max(0, 0.9 - (petal.size / petal.maxSize) ** 1.2);
                isAlive = true;
            }
        });
        return isAlive;
    }

    draw() {
        this.petals.forEach(petal => {
            if (petal.opacity <= 0) return;

            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(petal.angle + this.time * 0.2);

            // 花びらの描画
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, petal.size);
            gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${petal.opacity})`);
            gradient.addColorStop(0.6, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${petal.opacity * 0.5})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

            ctx.beginPath();
            // 花びらの形状
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(
                petal.size * 0.5, -petal.size * 0.2,
                petal.size, 0
            );
            ctx.quadraticCurveTo(
                petal.size * 0.5, petal.size * 0.2,
                0, 0
            );

            ctx.fillStyle = gradient;
            ctx.fill();

            // 花びらの光沢
            const shineGradient = ctx.createLinearGradient(0, -petal.size * 0.2, petal.size * 0.8, petal.size * 0.2);
            shineGradient.addColorStop(0, `rgba(255, 255, 255, ${petal.opacity * 0.4})`);
            shineGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = shineGradient;
            ctx.fill();

            ctx.restore();
        });
    }
}

// サウンドの読み込み
async function loadSounds() {
    for (const file of soundFiles) {
        try {
            const response = await fetch(file);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            soundBuffers.set(file, audioBuffer);
        } catch (error) {
            console.error('音声ファイルの読み込みエラー:', error);
        }
    }
}

// サウンドの再生
function playRandomSound() {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    const randomFile = soundFiles[Math.floor(Math.random() * soundFiles.length)];
    const buffer = soundBuffers.get(randomFile);
    
    if (buffer) {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
    }
}

// キャンバスのリサイズ処理
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// エフェクトとパーティクルを管理する配列
let effects = [];
let particles = [];

// クリックイベントの処理
canvas.addEventListener('click', (e) => {
    effects.push(new Effect(e.clientX, e.clientY));
    playRandomSound();
});

// アニメーションループ
function animate() {
    ctx.fillStyle = 'rgba(26, 26, 46, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    stars.forEach(star => {
        star.update();
        star.draw();
    });
    
    particles = particles.filter(particle => {
        particle.update();
        particle.draw();
        return particle.life > 0;
    });
    
    effects = effects.filter(effect => {
        effect.draw();
        return effect.update();
    });
    
    requestAnimationFrame(animate);
}

// サウンドの読み込みと開始
loadSounds().then(() => {
    animate();
    console.log('サウンドの読み込みが完了しました');
});