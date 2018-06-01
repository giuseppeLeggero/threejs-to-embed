import { Container, Stage, Text } from "@createjs/easeljs/dist/easeljs.module";
import { Cubic, Expo, Quart } from "gsap/umd/EasePack";
import * as TimelineMax from "gsap/umd/TimelineMax";
import * as TweenMax from "gsap/umd/TweenMax";
import * as THREE from "three";
import * as WebFont from "webfontloader";
import { BasicView } from "./BasicView";

const FONT_NAME = "Source Sans Pro";

/**
 * 3Dのパーティクル表現のデモクラスです。プリロードしてから実行します。
 * @author Yausnobu Ikeda a.k.a clockmaker
 */
export class DemoIconsPreload {
  constructor() {
    // ウェブフォントのロードを待ってから初期化
    WebFont.load({
      custom: {
        families: ["Source Code Pro", "FontAwesome"],
        urls: [
          "http://fonts.googleapis.com/css?family=Source+Sans+Pro:900,900italic",
          "http://netdna.bootstrapcdn.com/font-awesome/4.0.3/css/font-awesome.css"
        ],
        testStrings: {
          FontAwesome: "\uf001"
        }
      },
      // Web Fontが使用可能になったとき
      active: () => {
        new DemoIconsWorld();
      }
    });
  }
}

/**
 * 3Dのパーティクル表現のクラスです。
 * @author Yausnobu Ikeda a.k.a clockmaker
 */
class DemoIconsWorld extends BasicView {
  private CANVAS_W: number = 250;
  private CANVAS_H: number = 40;
  private WORD_LIST = ["ICS", "4000"];
  private _matrixLength: number = 8;
  private _particleList = [];
  private _wrap: THREE.Object3D;
  private _wordIndex = 0;
  private _bg: THREE.Mesh;
  /** 色相 0.0〜1.0 */
  private _hue: number = 0.6;

  constructor() {
    super();
    this.();
    this.createLogo();
    this.startRendering();
  }

  /**
   * セットアップします。
   */
  private setup(): void {
    // ------------------------------
    // カメラの配置
    // ------------------------------
    this.camera.far = 100000;
    this.camera.near = 1;
    this.camera.position.z = 5000;
    this.camera.lookAt(this.HELPER_ZERO);

    // ------------------------------
    // 背景のsetup作成
    // ------------------------------
    const plane = new THREE.PlaneBufferGeometry(50000, 50000, 1, 1);
    const mat = new THREE.MeshBasicMaterial({
      map: THREE.ImageUtils.loadTexture("imgs/bg.png")
    });
    const bg = new THREE.Mesh(plane, mat);
    bg.position.z = -10000;
    this.scene.add(bg);
    this._bg = bg;

    const hoge = "";

    

    // ------------------------------
    // 3D空間のパーツを配置
    // ------------------------------
    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 1, +1).normalize();
    this.scene.add(light);

    // particle motion
    this._wrap = new THREE.Object3D();
    this.scene.add(this._wrap);

    // ------------------------------
    // パーティクルのテクスチャアトラスを生成
    // ------------------------------
    const container = new Container();

    const SIZE = 256;
    const LIST = [
      61570, // facebook SQUARE
      61594, // facebook
      61575, // fa-thumbs-o-up
      61796, // fa-thumbs-up
      61444, // fa-heart
      61488, // camera
      61755 // html5
    ];
    for (
      let i = 0, len = this._matrixLength * this._matrixLength;
      i < len;
      i++
    ) {
      const char = String.fromCharCode(
        LIST[(LIST.length * Math.random()) >> 0]
      );
      const text2: Text = new Text(char, "200px FontAwesome", "#FFF");
      text2.textBaseline = "middle";
      text2.textAlign = "center";
      text2.x = SIZE * (i % this._matrixLength) + SIZE / 2;
      text2.y = SIZE * Math.floor(i / this._matrixLength) + SIZE / 2;
      container.addChild(text2);
    }

    container.cache(0, 0, SIZE * this._matrixLength, SIZE * this._matrixLength);
    const cacheUrl: string = container.cacheCanvas.toDataURL();
    const image = new Image();
    image.src = cacheUrl;

    const texture: THREE.Texture = new THREE.Texture(image);
    texture.needsUpdate = true;

    // ------------------------------
    // パーティクルの作成
    // ------------------------------
    const ux = 1 / this._matrixLength;
    const uy = 1 / this._matrixLength;

    this._particleList = [];
    for (let i = 0; i < this.CANVAS_W; i++) {
      for (let j = 0; j < this.CANVAS_H; j++) {
        const ox = (this._matrixLength * Math.random()) >> 0;
        const oy = (this._matrixLength * Math.random()) >> 0;

        const geometry = new THREE.PlaneGeometry(40, 40, 1, 1);
        this.change_uvs(geometry, ux, uy, ox, oy);

        const material = new THREE.MeshLambertMaterial({
          color: 0xffffff,
          map: texture,
          transparent: true,
          side: THREE.DoubleSide
        });

        material.blending = THREE.AdditiveBlending;

        const word: THREE.Mesh = new THREE.Mesh(geometry, material);
        this._wrap.add(word);

        this._particleList.push(word);
      }
    }

    this.createParticleCloud();
  }

  private createParticleCloud() {
    // 形状データを作成
    const geometry = new THREE.Geometry();
    const numParticles = 50000;
    const SIZE = 10000;
    for (let i = 0; i < numParticles; i++) {
      geometry.vertices.push(
        new THREE.Vector3(
          SIZE * (Math.random() - 0.5),
          SIZE * (Math.random() - 0.5),
          SIZE * (Math.random() - 0.5)
        )
      );
    }

    // マテリアルを作成
    const texture = new THREE.TextureLoader().load("imgs/fire_particle.png");
    const material = new THREE.PointsMaterial({
      size: 20,
      color: 0x666666,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthTest: false,
      map: texture
    });

    // 物体を作成
    const points = new THREE.Points(geometry, material);
    this.scene.add(points);
  }

  /**
   * ロゴを生成し、モーションします。
   */
  private createLogo(): void {
    // レターオブジェクトを生成します。
    const canvas: HTMLCanvasElement = <HTMLCanvasElement>(
      document.createElement("canvas")
    );
    canvas.setAttribute("width", this.CANVAS_W + "px");
    canvas.setAttribute("height", this.CANVAS_H + "px");

    const stage = new Stage(canvas);
    const text1 = new Text(
      this.WORD_LIST[this._wordIndex],
      "32px " + FONT_NAME,
      "#FFF"
    );
    this._wordIndex++;
    if (this._wordIndex >= this.WORD_LIST.length) {
      this._wordIndex = 0;
    }

    text1.textAlign = "center";
    text1.x = this.CANVAS_W / 2;
    stage.addChild(text1);
    stage.update();

    const timeline = new TimelineMax({
      onComplete: () => {
        const tm = new TimelineMax();
        tm.to("#coverBlack", 1.0, { css: { opacity: 1.0 } });
        tm.call(() => {
          this.createLogo();
        });
      }
    });

    const ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D>(
      canvas.getContext("2d")
    );

    for (let i = 0; i < this._particleList.length; i++) {
      this._particleList[i].visible = false;
    }

    // 透過領域を判定する
    const pixcelColors = ctx.getImageData(0, 0, this.CANVAS_W, this.CANVAS_H)
      .data;
    const existDotList = [];
    let existDotCount = 0;
    for (let i = 0; i < this.CANVAS_W; i++) {
      existDotList[i] = [];
      for (let j = 0; j < this.CANVAS_H; j++) {
        // 透過しているか判定
        const flag = pixcelColors[(i + j * this.CANVAS_W) * 4 + 3] == 0;
        existDotList[i][j] = flag;

        if (flag == true) existDotCount++;
      }
    }

    // レターのモーションを作成する
    let cnt = 0;
    const max = this.CANVAS_W * this.CANVAS_H;
    for (let i = 0; i < this.CANVAS_W; i++) {
      for (let j = 0; j < this.CANVAS_H; j++) {
        // 透過していたらパスする
        if (existDotList[i][j] == true) continue;

        const word: THREE.Mesh = this._particleList[cnt];
        (<THREE.MeshLambertMaterial>word.material).color.setHSL(
          this._hue + ((i * canvas.height) / max - 0.5) * 0.2,
          0.5,
          0.6 + 0.4 * Math.random()
        );
        (<THREE.MeshLambertMaterial>word.material).blending =
          THREE.AdditiveBlending;
        this._wrap.add(word);

        const toObj = {
          x: (i - canvas.width / 2) * 30,
          y: (canvas.height / 2 - j) * 30,
          z: 0
        };

        const fromObj = {
          x: 2000 * (Math.random() - 0.5) - 500,
          y: 1000 * (Math.random() - 0.5),
          z: +10000
        };

        word.position.x = fromObj.x;
        word.position.y = fromObj.y;
        word.position.z = fromObj.z;

        const toRotationObj = {
          z: 0
        };

        const fromRotationObj = {
          z: 10 * Math.PI * (Math.random() - 0.5)
        };

        word.rotation.z = fromRotationObj.z;

        const delay =
          Cubic.easeInOut.getRatio(cnt / 1600) * 3.0 + 1.5 * Math.random();

        timeline.to(
          word.rotation,
          6.0,
          {
            z: toRotationObj.z,
            ease: Cubic.easeInOut
          },
          delay
        );

        //
        word.visible = false;
        timeline.set(word, { visible: true }, delay);

        timeline.to(
          word.position,
          7.0,
          {
            bezier: [
              fromObj,
              {
                x: (0 + toObj.x) / 2 + 300,
                y: (fromObj.y + toObj.y) / 2 + 500 * Math.random(),
                z: (fromObj.z + toObj.z) / 2
              },
              toObj
            ],
            delay: delay / 1.0,
            ease: Expo.easeInOut
          },
          0
        );

        cnt++;
      }
    }

    this._wrap.position.z = -5000;
    timeline.to(this._wrap.position, 12.0, { z: 6000, ease: Quart.easeIn }, 0);

    // ------------------------
    // 2種類のカメラモーションのいずれかを適用する
    // (バリエーションを少なくしてる 2015-08-10)
    // ------------------------
    if (Math.random() < 0.3) {
      timeline.set(this.camera.position, { x: 200, y: -200, z: 1000 }, 0);
      timeline.to(
        this.camera.position,
        14.0,
        { x: 0, y: 0, z: 5000, ease: Quart.easeInOut },
        0
      );
      timeline.set(this.camera, { fov: 90 }, 0);
      timeline.to(this.camera, 14.0, { fov: 45, ease: Quart.easeInOut }, 0);
    } else {
      timeline.set(this.camera.position, { x: 100, y: +1000, z: 1000 }, 0);
      timeline.to(
        this.camera.position,
        14.0,
        { x: 0, y: 0, z: 5000, ease: Quart.easeInOut },
        0
      );
    }

    // 黒マットのフェードイン
    timeline.to("#coverBlack", 1.0, { css: { opacity: 0.0 } }, 0.0);

    // ------------------------
    // 3種類のタイムリマップのいずれかを適用する
    // ------------------------
    if (Math.random() < 0.6) {
      timeline.timeScale(3.0);

      timeline.addCallback(function () {
        TweenMax.to(timeline, 1.0, { timeScale: 0.05, ease: Cubic.easeInOut });
        TweenMax.to(timeline, 0.5, {
          timeScale: 3.0,
          delay: 3.5,
          ease: Cubic.easeInOut
        });
        TweenMax.to(timeline, 0.5, {
          timeScale: 0.05,
          delay: 4.0,
          ease: Cubic.easeInOut
        });
        TweenMax.to(timeline, 2.0, {
          timeScale: 5.0,
          delay: 9.0,
          ease: Cubic.easeIn
        });
      }, 3.5);
    } else {
      timeline.timeScale(1.0);
    }

    // 背景の色変更
    //(<THREE.MeshLambertMaterial>this._bg.material).color.setHSL(this._hue, 1.0, 0.5);

    // 色相を移動
    /* 色相を変更しない 2015-08-10
    this._hue += 0.2;
    if (this._hue >= 1.0) {
      this._hue = 0.0;
    }
    */
  }

  private HELPER_ZERO: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  public onTick(): void {
    super.onTick();

    this.camera.lookAt(this.HELPER_ZERO);

    // 背景をカメラの反対側に配置
    const vec = this.camera.position.clone();
    vec.negate();
    vec.normalize();
    vec.multiplyScalar(10000);
    this._bg.position.copy(vec);
    this._bg.lookAt(this.camera.position);
  }

  /**
   * ジオメトリ内のUVを変更します。
   * @param geometry    {THREE.PlaneGeometry}
   * @param unitx    {number}
   * @param unity    {number}
   * @param offsetx    {number}
   * @param offsety    {number}
   */
  private change_uvs(
    geometry: THREE.PlaneGeometry,
    unitx: number,
    unity: number,
    offsetx: number,
    offsety: number
  ) {
    const faceVertexUvs = geometry.faceVertexUvs[0];
    for (let i = 0; i < faceVertexUvs.length; i++) {
      const uvs = faceVertexUvs[i];
      for (let j = 0; j < uvs.length; j++) {
        const uv = uvs[j];
        uv.x = (uv.x + offsetx) * unitx;
        uv.y = (uv.y + offsety) * unity;
      }
    }
  }
}