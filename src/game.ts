import "phaser";

// const DEBUG = true;
const pathfindingConfig = {
  stepX: 10,
  stepY: 10,
  jumpDeltas: [-2, -1, -1, 0, 0, 1, 1, 2],
  unitHeight: 30,
  unitWidth: 40,
};
export default class Demo extends Phaser.Scene {
  private platforms: Phaser.Physics.Arcade.StaticGroup;
  private player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private catFacing: "left" | "right" = "left";
  // private debugText: Phaser.GameObjects.Text;

  // private graph: Graph<string, undefined>;
  // private debugJumpPower: number = 0;
  // private path: Node<string>[] = [];
  // private finder: PathFinder<string>;

  constructor() {
    super("demo");
  }

  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("ground", "assets/platform.png");
    this.load.image("star", "assets/star.png");
    this.load.spritesheet("cat", "assets/catspritesoriginal.png", {
      frameWidth: 21,
      frameHeight: 17,
    });
  }

  create() {
    this.add.image(400, 300, "sky");

    this.platforms = this.physics.add.staticGroup();

    this.platforms.create(400, 568, "ground").setScale(2).refreshBody();

    this.platforms.create(600, 400, "ground");
    this.platforms.create(50, 250, "ground");
    this.platforms.create(750, 220, "ground");

    this.player = this.physics.add.sprite(100, 1000, "cat").setScale(4);

    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(15, 12);
    this.player.body.setOffset(3, 5);
    this.player.setPosition(100, 100);
    // const platforms = this.platforms.children
    //   .getArray()
    //   .map((x) => (x as Phaser.Physics.Arcade.Image).body);
    // this.graph = buildGraph(
    //   this.physics.world.bounds,
    //   platforms,
    //   pathfindingConfig
    // );
    // this.finder = aStar(this.graph, {
    //   oriented: true,
    //   distance(f, t) {
    //     const fNode = devert(f.id);
    //     const tNode = devert(t.id);
    //     return Math.abs(fNode.i - tNode.i) + Math.abs(fNode.j - tNode.j);
    //   },
    // });

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("cat", { start: 6, end: 11 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "sit-left",
      frames: this.anims.generateFrameNumbers("cat", { start: 2, end: 3 }),
      frameRate: 20,
    });

    this.anims.create({
      key: "sit-right",
      frames: this.anims.generateFrameNumbers("cat", { frames: [26, 25] }),
      frameRate: 20,
    });

    this.anims.create({
      key: "turn-right",
      frames: this.anims.generateFrameNumbers("cat", { frames: [1, 27] }),
      frameRate: 10,
    });

    this.anims.create({
      key: "turn-left",
      frames: this.anims.generateFrameNumbers("cat", { frames: [27, 1] }),
      frameRate: 10,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("cat", { start: 12, end: 17 }),
      frameRate: 10,
      repeat: -1,
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    const stars = this.physics.add.group({
      key: "star",
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    stars.children.iterate(function (child) {
      (child as any as Phaser.Physics.Arcade.Image).setBounceY(
        Phaser.Math.FloatBetween(0.4, 0.8)
      );
    });

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(stars, this.platforms);

    this.physics.add.overlap(
      this.player,
      stars,
      this.collectStar,
      undefined,
      this
    );

    this.time.timeScale = 100;
    // if (DEBUG) {
    //   this.debugText = this.add
    //     .text(10, 10, "Cursors to move", {
    //       font: "16px Courier",
    //       color: "#00ff00",
    //     })
    //     .setScrollFactor(0);
    //   this.input.keyboard.on(
    //     Phaser.Input.Keyboard.Events.ANY_KEY_DOWN,
    //     (e: KeyboardEvent) => {
    //       if (!isNaN(+e.key)) {
    //         this.debugJumpPower = +e.key;
    //       }
    //     }
    //   );
    // }
  }

  handleMovement(left: boolean, right: boolean, up: boolean) {
    const isTurning =
      this.player.anims.isPlaying &&
      this.player.anims.currentAnim.key.startsWith("turn");
    const handleDirection = (dir: "left" | "right") => {
      if (this.catFacing !== dir) {
        this.catFacing = dir;
        this.player.anims.play("turn-" + dir, true);
      } else {
        if (!isTurning) this.player.anims.play(dir, true);
      }
      this.player.setVelocityX(dir === "left" ? -160 : 160);
    };

    if (left) {
      handleDirection("left");
    } else if (right) {
      handleDirection("right");
    } else {
      this.player.setVelocityX(0);
      if (this.player.body.touching.down) {
        if (
          (!this.player.anims.isPlaying &&
            !this.player.anims.currentAnim?.key.startsWith("sit")) ||
          this.player.anims.currentAnim?.key === "left" ||
          this.player.anims.currentAnim?.key === "right"
        ) {
          this.player.anims.play("sit-" + this.catFacing, true);
        }
      } else {
        if (!isTurning) this.player.anims.play(this.catFacing, true);
      }
    }
    if (up && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
  }
  // debugPath(fromX: number, fromY: number, toX: number, toY: number) {
  //   this.path = this.finder.find(
  //     vert(fromX, fromY, 0),
  //     vert(toX, toY)
  //   );
  // }

  update() {
    const c = this.cursors;
    this.handleMovement(c.left.isDown, c.right.isDown, c.up.isDown);
    // if (DEBUG) {
    //   const i = Math.floor(
    //     this.input.mousePointer.worldX / pathfindingConfig.stepX
    //   );
    //   const j = Math.floor(
    //     this.input.mousePointer.worldY / pathfindingConfig.stepY
    //   );
    //   const inLinks = getIncomingLinks(
    //     this.graph,
    //     vert(i, j, this.debugJumpPower)
    //   );
    //   const outLinks = getOutgoingLinks(
    //     this.graph,
    //     vert(i, j, this.debugJumpPower)
    //   );
    //   this.debugText.setText([
    //     "world x: " + this.input.mousePointer.worldX,
    //     "world y: " + this.input.mousePointer.worldY,
    //     `i j power: ${vert(i, j, this.debugJumpPower)}`,
    //     `in/out links count: ${inLinks.length} / ${outLinks.length}`,
    //   ]);
    //   this.debugGraph(i, j);
    // }
  }
  debugRects: Phaser.GameObjects.Rectangle[] = [];

  drawRect(i: number, j: number, color: number) {
    this.debugRects.push(
      this.add
        .rectangle(
          i * pathfindingConfig.stepX,
          j * pathfindingConfig.stepY,
          pathfindingConfig.stepX,
          pathfindingConfig.stepY
        )
        .setStrokeStyle(2, color)
        .setOrigin(0, 0)
    );
  }

  // debugGraph(x: number, y: number) {
  //   for (const r of this.debugRects) r.destroy();

  //   this.drawRect(x, y, 0x1a65ac);
  //   // for (const link of getIncomingLinks(this.graph, vert(x, y, this.debugJumpPower))) {
  //   //   const [linkedX, linkedY] = link.fromId.toString().split("_");
  //   //   drawRect(+linkedX, +linkedY, 0xffff00);
  //   // }
  //   for (const link of getOutgoingLinks(
  //     this.graph,
  //     vert(x, y, this.debugJumpPower)
  //   )) {
  //     const [linkedX, linkedY] = link.toId.toString().split("_");
  //     this.drawRect(+linkedX, +linkedY, 0xff00ff);
  //   }

  //   for (const n of this.path) {
  //     const { i, j } = devert(n.id);
  //     this.drawRect(i, j, 0xffff00);
  //   }
  // }

  collectStar(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    star: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ) {
    (star as any as Phaser.Physics.Arcade.Image).disableBody(true, true);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "phaser-example",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: true,
    },
  },
  pixelArt: true,
  scene: Demo,
};

(window as any)["g"] = new Phaser.Game(config);
