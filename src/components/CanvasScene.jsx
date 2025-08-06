import React, { useRef, useEffect } from 'react';
import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

// Pixel art settings
PIXI.Application.autoDensity = true;
PIXI.Application.resolution = window.devicePixelRatio || 1;
PIXI.Application.roundPixels = true;
PIXI.Application.scaleMode = "nearest";

export default function CanvasScene() {
    const canvasRef = useRef(null);
    const clicked = useRef(false);

    useEffect(() => {
        async function setup() {
            const view = canvasRef.current;
            if (!view) return;

            const app = new PIXI.Application();
            await app.init({ view: view, resizeTo: window });

            const frames = [];
            for (let i = 0; i < 59; i++) {
                frames.push(await PIXI.Assets.load(`/assets/frame_${i.toString().padStart(2,'0')}_delay-0.1s.png`));
            }

            const sprite = new PIXI.AnimatedSprite(frames);
            sprite.anchor.set(0.5);
            sprite.position.set(app.screen.width / 2, app.screen.height / 2);
            sprite.scale.set(8);
            sprite.alpha = 0;
            sprite.animationSpeed = 0.1;
            sprite.play();
            app.stage.addChild(sprite);

            gsap.to(sprite, { pixi: { alpha: 1 }, duration: 0.8 });

            // Add click anywhere handler to zoom out
            view.addEventListener('pointerdown', async () => {
                if (clicked.current) return;
                clicked.current = true;

                // optional fade text if added previously
                // gsap.to(textRef.current, { pixi: { alpha: 0 }, duration: 0.5 });

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

    function onZoomComplete(app, sprite) {
        console.log('zoom complete - proceed with backend logic');
    }

    return <canvas ref={canvasRef} className="fixed inset-0" />;
}
