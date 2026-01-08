import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform } from "ogl";
import { useEffect, useRef } from "react";
import localFont from "next/font/local";

const JersyFont = localFont({
  src: "../../../public/fonts/jersey-10-latin-400-normal.woff2",
  display: "swap",
});



function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1, p2, t) {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance) {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach((key) => {
    if (key !== "constructor" && typeof instance[key] === "function") {
      instance[key] = instance[key].bind(instance);
    }
  });
}

function createTextTexture(gl, text, font = "bold 30px monospace", color = "black") {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context.font = font;
  const metrics = context.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const textHeight = Math.ceil(parseInt(font, 10) * 1.2);
  canvas.width = textWidth + 20;
  canvas.height = textHeight + 30;
  context.font = font;
  context.fillStyle = color;
  context.textBaseline = "middle";
  context.textAlign = "center";
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

class Title {
  constructor({ gl, plane, renderer, text, level, textColor = "#545050", font = "30px JersyFont" }) {
    autoBind(this);
    this.gl = gl;
    this.plane = plane;
    this.renderer = renderer;
    this.text = text;
    this.level = level; // our second text
    this.textColor = textColor;
    this.font = font;
    this.createMeshes();
    // Start with text hidden by default
    this.hide();
  }

  makeProgram(texture) {
    return new Program(this.gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true,
    });
  }

  createMeshes() {
    // --- main text ---
    const main = createTextTexture(this.gl, this.text, this.font, this.textColor);
    const mainGeometry = new Plane(this.gl);
    const mainProgram = this.makeProgram(main.texture);

    this.meshText = new Mesh(this.gl, { geometry: mainGeometry, program: mainProgram });
    const aspectText = main.width / main.height;
    const textHeight = this.plane.scale.y * 0.2;
    const textWidth = textHeight * aspectText;
    this.meshText.scale.set(textWidth, textHeight, 1);
    this.meshText.position.y = -this.plane.scale.y * 0.45 - textHeight * 0.5 - 0.05;
    this.meshText.setParent(this.plane);

    // --- level text ---
    if (this.level) {
      const level = createTextTexture(this.gl, this.level, this.font, this.textColor);
      const levelGeometry = new Plane(this.gl);
      const levelProgram = this.makeProgram(level.texture);

      this.meshLevel = new Mesh(this.gl, { geometry: levelGeometry, program: levelProgram });
      const aspectLevel = level.width / level.height;
      const levelHeight = textHeight ;
      const levelWidth = levelHeight * aspectLevel*1.2;
      this.meshLevel.scale.set(levelWidth, levelHeight, 1);
      // place a bit lower than the main text
      this.meshLevel.position.y = this.meshText.position.y - levelHeight*0.4;
      this.meshLevel.setParent(this.plane);
    }
  }

  show() {
    if (this.meshText) {
      this.meshText.visible = true;
    }
    if (this.meshLevel) {
      this.meshLevel.visible = true;
    }
  }

  hide() {
    if (this.meshText) {
      this.meshText.visible = false;
    }
    if (this.meshLevel) {
      this.meshLevel.visible = false;
    }
  }
}



class Media {
  constructor({
    geometry,
    gl,
    image,
    index,
    length,
    renderer,
    scene,
    screen,
    text,
    level,
    viewport,
    bend,
    textColor,
    borderRadius = 0,
    font,
  }) {
    this.extra = 0;
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.level = level; // store level text
    this.viewport = viewport;
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;
    this.createShader();
    this.createMesh();
    this.createTitle();
    this.onResize();
  }
  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: false });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform float uSpeed;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          // Remove the floating effect by commenting out the wave motion
          // p.z = (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.1 + uSpeed * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        varying vec2 vUv;
        
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }
        
        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          
          vec4 color = texture2D(tMap, uv);
          
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          if(d > 0.0) {
            discard;
          }
          
          gl_FragColor = color;
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBorderRadius: { value: this.borderRadius },
        uBlur: { value: 0 },
      },
      transparent: true,
    });
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };
  }
  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    });
    this.plane.setParent(this.scene);
  }
  createTitle() {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: this.text,
      level: this.level,
      textColor: this.textColor,
      fontFamily: this.font,
    });
  }
  update(scroll, direction) {
    // Add extra spacing when card is center
    const centerDistance = Math.abs(this.x - scroll.current - this.extra);
    const centerThreshold = this.viewport.width * 0.1;
    const isCenter = centerDistance < centerThreshold;
    const extraSpacing = isCenter ? 1 : 1; // Add 7px equivalent extra spacing for center
    
    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    // Calculate scale based on distance from center
    const maxDistance = this.viewport.width * 0.6; // Max distance for scale effect
    const minScale = 0.7; // Minimum scale for non-center cards
    const maxScale = 1.2; // Maximum scale for center card
    
    // Calculate scale factor (1.0 at center, decreasing as distance increases)
    const normalizedDistance = Math.min(centerDistance / maxDistance, 1);
    const scaleFactor = maxScale - (maxScale - minScale) * normalizedDistance;
    
    // Show/hide text based on center proximity - only show for the actual center card
    if (isCenter && Math.abs(x) < this.viewport.width * 0.05) {
      this.title.show();
    } else {
      this.title.hide();
    }
    
    
    // Apply scale to both x and y for uniform scaling
    this.plane.scale.x = this.baseScaleX * scaleFactor;
    this.plane.scale.y = this.baseScaleY * scaleFactor;
    
    // Update program uniforms with new scale
    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];

    if (this.bend === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.abs(this.bend);
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);

      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    this.speed = scroll.current - scroll.last;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = this.speed;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
    if (direction === "right" && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === "left" && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }
  onResize({ screen, viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height];
      }
    }
    this.scale = this.screen.height / 1500;
    // Store base scale values for use in update method
    this.baseScaleY = (this.viewport.height * (800 * this.scale)) / this.screen.height;
    this.baseScaleX = (this.viewport.width * (600 * this.scale)) / this.screen.width;
    
    // Set initial scale (will be updated in update method)
    this.plane.scale.y = this.baseScaleY;
    this.plane.scale.x = this.baseScaleX;
    
    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.padding = 4; // Increased padding for better spacing around center card
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

class App {
  constructor(
    container,
    {
      items,
      bend,
      textColor = "#ffffff",
      borderRadius = 0,
      font = "bold 30px Figtree",
      scrollSpeed = 2,
      scrollEase = 0.05,
      onCardChange = null,
    } = {}
  ) {
    document.documentElement.classList.remove("no-js");
    this.container = container;
    this.scrollSpeed = scrollSpeed;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onCheckDebounce = debounce(this.onCheck, 200);
    this.onCardChange = onCardChange || null;
    this.currentCardIndex = 0;
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias(items, bend, textColor, borderRadius, font);
    this.update();
    this.addEventListeners();
  }
  createRenderer() {
    this.renderer = new Renderer({ alpha: true });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.gl.canvas);
  }
  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 25; // Increased from 20 to 25
  }
  createScene() {
    this.scene = new Transform();
  }
  onClick(e) {
  // Check if we're on the Specific_Collection page - if so, disable redirects
  if (window && window.location && window.location.pathname === '/Specific_Collection') {
    return; // Exit early, no redirect
  }

  // Detect which card is currently in center (you already track it)
  const centerIndex = this.currentCardIndex % (this.medias.length / 2);
  const clickedCard = this.medias[centerIndex];

  if (clickedCard) {
    // For example: navigate to /gamecollections
    if (window && window.location) {
      window.location.href = "/gamecollections";
    }

    // Optional: if you want per-card routes, you could do:
    // window.location.href = `/gamecollections/${clickedCard.text.toLowerCase()}`;
  }
}

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 50,
      widthSegments: 120,
    });
    
  }
  createMedias(items, bend = 1, textColor, borderRadius, font) {
    const defaultItems = items || [
      {
        image: "/images/home/cards/card1.jpg",
        text: "Adventure Quest",
        level: "Level 1",
      },
      {
        image: "/images/home/cards/card2.jpg",
        text: "Mystery Manor",
        level: "Level 2",
      },
      {
        image: "/images/home/cards/card3.jpg",
        text: "Space Odyssey",
        level: "Level 3",
      },
      {
        image: "/images/home/cards/card4.jpg",
        text: "Fantasy Realm",
        level: "Level 4",
      },
    ] ;
    const galleryItems = items && items.length ? items : defaultItems;
    this.mediasImages = galleryItems.concat(galleryItems);
    this.medias = this.mediasImages.map((data, index) => {
      return new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: this.mediasImages.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: data.text || data.name,
        level: data.level,
        viewport: this.viewport,
        bend,
        textColor,
        borderRadius,
        font,
      });
    });
  }
  onTouchDown(e) {
    this.isDown = true;
    this.scroll.position = this.scroll.current;
    this.start = e.touches ? e.touches[0].clientX : e.clientX;
  }
  onTouchMove(e) {
  if (!this.isDown) return;
  e.preventDefault(); // stop the browser from scrolling vertically
  const x = e.touches ? e.touches[0].clientX : e.clientX;
  const distance = (this.start - x) * (this.scrollSpeed * 0.1);
  this.scroll.target = this.scroll.position + distance;
}

  onTouchUp() {
    this.isDown = false;
    this.onCheck();
  }
 onWheel(e) {
  // Only handle horizontal gestures, ignore vertical
  const horizontal = e.deltaX;
  const vertical = e.deltaY;

  if (Math.abs(horizontal) > Math.abs(vertical)) {
    // scale horizontal movement to your scrollSpeed
    this.scroll.target += horizontal * 0.2; // tweak 0.2 to desired sensitivity
    this.onCheckDebounce();
  }
}


  onCheck() {
    if (!this.medias || !this.medias[0]) return;
    const width = this.medias[0].width;
    const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
    const item = width * itemIndex;
    this.scroll.target = this.scroll.target < 0 ? -item : item;
  }
  onResize() {
    this.screen = {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({
      aspect: this.screen.width / this.screen.height,
    });
    const fov = (this.camera.fov * Math.PI) / 180; // Changed from 190 to 180
    const height = 2.2 * Math.tan(fov / 2) * this.camera.position.z; // Changed from 1.9 to 2.2
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    if (this.medias) {
      this.medias.forEach((media) => media.onResize({ screen: this.screen, viewport: this.viewport }));
    }
  }
  update() {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? "right" : "left";
    
    // Calculate current center card index
    if (this.medias && this.medias[0]) {
      const width = this.medias[0].width;
      const newCardIndex = Math.round(Math.abs(this.scroll.current) / width) % (this.medias.length / 2);
      
      // Notify parent component when center card changes
      if (newCardIndex !== this.currentCardIndex && this.onCardChange) {
        this.currentCardIndex = newCardIndex;
        this.onCardChange(newCardIndex);
      }
    }
    
    if (this.medias) {
      this.medias.forEach((media) => media.update(this.scroll, direction));
    }
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }
  addEventListeners() {
    this.boundOnClick = this.onClick.bind(this);
this.gl.canvas.addEventListener("click", this.boundOnClick);
    this.boundOnResize = this.onResize.bind(this);
    this.boundOnWheel = this.onWheel.bind(this);
    this.boundOnTouchDown = this.onTouchDown.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchUp = this.onTouchUp.bind(this);
    window.addEventListener("resize", this.boundOnResize);
    window.addEventListener("mousewheel", this.boundOnWheel);
    window.addEventListener("wheel", this.boundOnWheel);
    window.addEventListener("mousedown", this.boundOnTouchDown);
    window.addEventListener("mousemove", this.boundOnTouchMove);
    window.addEventListener("mouseup", this.boundOnTouchUp);
    this.gl.canvas.addEventListener("touchstart", this.boundOnTouchDown, { passive: false });
this.gl.canvas.addEventListener("touchmove", this.boundOnTouchMove, { passive: false });
this.gl.canvas.addEventListener("touchend", this.boundOnTouchUp);

  }
  destroy() {
    this.gl.canvas.removeEventListener("click", this.boundOnClick);
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.boundOnResize);
    window.removeEventListener("mousewheel", this.boundOnWheel);
    window.removeEventListener("wheel", this.boundOnWheel);
    window.removeEventListener("mousedown", this.boundOnTouchDown);
    window.removeEventListener("mousemove", this.boundOnTouchMove);
    window.removeEventListener("mouseup", this.boundOnTouchUp);
    window.removeEventListener("touchstart", this.boundOnTouchDown);
    window.removeEventListener("touchmove", this.boundOnTouchMove);
    window.removeEventListener("touchend", this.boundOnTouchUp);
    if (this.renderer && this.renderer.gl && this.renderer.gl.canvas.parentNode) {
      this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas);
    }
  }
}

export default function CircularGallery({
  items,
  bend = 3,
  textColor = "#ffffff",
  borderRadius = 0.05,
  font = "bold 30px Figtree",
  scrollSpeed = 2,
  scrollEase = 0.05,
  onCardChange,
}) {
  const containerRef = useRef(null);
  useEffect(() => {
    const app = new App(containerRef.current, { items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase, onCardChange });
    return () => {
      app.destroy();
    };
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase, onCardChange]);
  return <div className="w-[100%] h-full overflow-hidden cursor-grab active:cursor-grabbing" ref={containerRef} />;
}