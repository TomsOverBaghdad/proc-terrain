import earcut from "earcut";
import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CreateSceneClass } from "./createScene";

// If you don't need the standard material you will still need to import it since the scene requires it.
import "@babylonjs/core/Materials/standardMaterial";

import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";

import "@babylonjs/core/Lights/Shadows/shadowGeneratorSceneComponent";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Color4 } from "@babylonjs/core/Maths/math.color";

import { HexMap, Hex } from "./hex";

export class DefaultSceneWithTexture implements CreateSceneClass {
    createScene = async (
        engine: Engine,
        canvas: HTMLCanvasElement
    ): Promise<Scene> => {
        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new Scene(engine);

        // load debuggers and instpectors if needed

        // void Promise.all([
        //     import("@babylonjs/core/Debug/debugLayer"),
        //     import("@babylonjs/inspector"),
        // ]).then((_values) => {
        //     console.log(_values);
        //     scene.debugLayer.show({
        //         handleResize: true,
        //         overlay: true,
        //         globalRoot: document.getElementById("#root") || undefined,
        //     });
        // });

        // This creates and positions a free camera (non-mesh)
        const camera = new ArcRotateCamera(
            "MainCamera",
            -Math.PI / 2, // where it's positioned on the ground (-PI / 2 looking up the z axis)
            Math.PI / 5, // how high up it is, kinda like a sun (0 being directly above looking down the y axis, PI being directly below looking up the y axis)
            100,
            new Vector3(40, 0, 20),
            scene
        );

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        const renderHex = (hex: Hex) => {
            // create hex vertecies
            const shape = [];
            for (let i = 0; i < 6; i++) {
                const angle_deg = 60 * i - 30;
                const angle_rad = (Math.PI / 180) * angle_deg;
                const x = hex.radius * Math.cos(angle_rad);
                const z = hex.radius * Math.sin(angle_rad);
                shape.push(
                    new Vector3(
                        x + hex.horizontalPosition(),
                        0,
                        z + hex.verticalPosition()
                    )
                );
            }
            let testColor = hex.terrain;
            if (hex.q == 0 && hex.r == 0) testColor = new Color4(1, 0, 0);
            if (hex.q == 29 && hex.r == 29) testColor = new Color4(1, 0, 0);
            const faceColors = [
                testColor, // top
                // GROUND, // side
            ];
            // build hex
            const depth = hex.elevation;
            const hexMesh = MeshBuilder.ExtrudePolygon(
                "Hex",
                { shape, depth: 1, faceColors },
                scene,
                earcut
            );
            hexMesh.position.y = depth;
        };

        const hexMap = new HexMap();
        hexMap.hexes.forEach((rows) => {
            rows.forEach((hex) => {
                renderHex(hex);
            });
        });

        const light = new DirectionalLight(
            "light",
            new Vector3(0, -1, 1),
            scene
        );
        light.intensity = 0.7;
        light.position.y = 10;

        return scene;
    };
}

export default new DefaultSceneWithTexture();
