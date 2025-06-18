import React, { useRef, useEffect } from 'react';
import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

// Crisp pixel scaling
PIXI.Application.RESOLUTION = window.devicePixelRatio || 1;
PIXI.Application.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.Application.ROUND_PIXELS = true;

function coverSprite(sprite, screenWidth, screenHeight) {
    const tex = sprite.texture;
    const ratio = tex.width / tex.height;
    const screenRatio = screenWidth / screenHeight;
    let scale;
    if (screenRatio > ratio) {
        scale = screenWidth / tex.width;
    } else {
        scale = screenHeight / tex.height;
    }
    sprite.scale.set(scale);
    sprite.x = screenWidth / 2;
    sprite.y = screenHeight / 2;
}


export default function CanvasScene() {
    const canvasRef = useRef(null);
    const clicked = useRef(false);
    const textSprite = useRef(null);

    useEffect(() => {
        async function setup() {
            const view = canvasRef.current;
            if (!view) return;

            const app = new PIXI.Application({ view, resizeTo: window, backgroundColor: 0x111111 });
            await app.init({ view, resizeTo: window, backgroundColor: 0x111111 });

            // Load and display blocky initial image
            const tex = await PIXI.Assets.load('/assets/full.png');
            const sprite = PIXI.Sprite.from(tex);
            sprite.anchor.set(0.5);
            coverSprite(sprite, app.screen.width, app.screen.height);
            sprite.scale.x *= 8; // for pixelated zoom-in
            sprite.scale.y *= 8;
            sprite.alpha = 0;
            app.stage.addChild(sprite);

            gsap.to(sprite, { pixi: { alpha: 1 }, duration: 0.6 });


            // Add click instruction text
            const text = new PIXI.Text('Click anywhere to zoom out', {
                fontFamily: 'Arial',
                fontSize: 28,
                fill: 0xffffff,
                align: 'center',
            });
            text.anchor.set(0.5);
            text.x = app.screen.width / 2;
            text.y = app.screen.height * 0.8;
            text.alpha = 0;
            app.stage.addChild(text);
            textSprite.current = text;

            gsap.to(text, { alpha: 1, duration: 1, repeat: -1, yoyo: true });

            view.addEventListener('click', async () => {
                if (clicked.current) return;
                clicked.current = true;

                // Hide instruction
                gsap.to(text, { alpha: 0, duration: 0.5 });

                // Zoom-out animation
                await gsap.to(sprite, {
                    pixi: {
                        scaleX: sprite.scale.x / 8,
                        scaleY: sprite.scale.y / 8,
                    },
                    duration: 1,
                    ease: 'power2.inOut'
                });

                onZoomComplete(app, sprite);
            });
        }

        setup();
    }, []);

    // Called after zoom completes
    function onZoomComplete(app, sprite) {
        // app.stage.removeChild(sprite);
        app.stage.removeChild(textSprite.current);

        // Example: Replace sprite with video, or start pixel war logic here.
        // e.g., const videoTexture = PIXI.Texture.from('path/to/video.mp4');
        //       const videoSprite = new PIXI.Sprite(videoTexture);
        //       app.stage.addChild(videoSprite);
    }

    return <canvas ref={canvasRef} className="fixed inset-0" />;
}