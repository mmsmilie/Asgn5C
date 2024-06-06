import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const grass_texture = "./textures/grass_seamless.png";
const sky_texture = "./textures/sky_seamless.png";

const Tree1 = "./objects/Tree.glb";
const Tree2 = "./objects/Tree2.glb";
const Tree3 = "./objects/Tree3.glb";
const SheepTex = "./animals/Sheep.glb";

let player, sheepMixer;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let walkAction, idleAction, activeAction, previousAction;

function main() {
    
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas,
        alpha: true,
    });

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const fov = 105;
    const aspect = 2; // the canvas default
    const near = 0.1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 4, 4);

    // Controls
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 2, 0);
    controls.update();

    // Added grass plane
    const planeSize = 100;

    const grass_loader = new THREE.TextureLoader();
    const texture = grass_loader.load(grass_texture);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -0.5;
    scene.add(mesh);

    // Add skybox
    const sky_loader = new THREE.TextureLoader();
    const bgTexture = sky_loader.load(sky_texture);
    const skyGeo = new THREE.SphereGeometry(50, 50, 50);
    const skyMat = new THREE.MeshBasicMaterial({
        map: bgTexture,
        side: THREE.BackSide,
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);

    // Add lights
    const skyColor = 0xb1e1ff; // light blue
    const groundColor = 0xb97a20; // brownish orange
    const intensity = 2;
    const hemisphereLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(hemisphereLight);

    // Create sun and moon directional lights
    const sunLight = new THREE.DirectionalLight(0xffff00, 1);
    scene.add(sunLight);
    
    const moonLight = new THREE.DirectionalLight(0x8888ff, 0.5);
    scene.add(moonLight);

    const sunGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    const moonGeometry = new THREE.SphereGeometry(1, 32, 32);
    const moonMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    scene.add(moon);

    function generatePositions(count, xOffset, zOffset) {
        const positions = [];
        for (let i = 0; i < count; i++) {
            positions.push({ x: Math.random() * 50 - 25 + xOffset, y: 0, z: Math.random() * 50 - 25 + zOffset });
        }
        return positions;
    }

    const tree1APositions = generatePositions(10, 15, 15);
    const tree1BPositions = generatePositions(10, -15, -15);
    const tree1CPositions = generatePositions(10, -15, 15);
    const tree1DPositions = generatePositions(10, 15, -15);

    const tree2APositions = generatePositions(10, 15, 15);
    const tree2BPositions = generatePositions(10, -15, -15);
    const tree2CPositions = generatePositions(10, -15, 15);
    const tree2DPositions = generatePositions(10, 15, -15);

    const tree3APositions = generatePositions(10, 15, 15);
    const tree3BPositions = generatePositions(10, -15, -15);
    const tree3CPositions = generatePositions(10, -15, 15);
    const tree3DPositions = generatePositions(10, 15, -15);

    loadTrees(Tree1, tree1APositions);
    loadTrees(Tree1, tree1BPositions);
    loadTrees(Tree1, tree1CPositions);
    loadTrees(Tree1, tree1DPositions);

    loadTrees(Tree2, tree2APositions);
    loadTrees(Tree2, tree2BPositions);
    loadTrees(Tree2, tree2CPositions);
    loadTrees(Tree2, tree2DPositions);

    loadTrees(Tree3, tree3APositions);
    loadTrees(Tree3, tree3BPositions);
    loadTrees(Tree3, tree3CPositions);
    loadTrees(Tree3, tree3DPositions);

    // Load Trees Function
    function loadTrees(path, positions) {
        const loader = new GLTFLoader();
        loader.load(path, function (gltf) {
            positions.forEach(pos => {
                const clone = gltf.scene.clone();
                clone.position.set(pos.x, pos.y, pos.z);
                clone.rotation.set(0, Math.random() * 2 * Math.PI, 0);
                scene.add(clone);
            });
        }, undefined, function (error) {
            console.error(error);
        });
    }

    // Rendering
    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

    const loader = new GLTFLoader();
    loader.load(SheepTex, function (gltf) {
        player = gltf.scene;
        player.scale.set(0.5, 0.5, 0.5);
        scene.add(player);

        // Set up animation mixer
        sheepMixer = new THREE.AnimationMixer(player);
        const animations = gltf.animations;

        // Assuming index 0 is idle and index 1 is walk (adjust as necessary)
        idleAction = sheepMixer.clipAction(animations[3]);
        walkAction = sheepMixer.clipAction(animations[5]);

        walkAction.timeScale = 0.5; // Adjust this value to control the speed

        activeAction = idleAction;
        activeAction.play();

    });

    // Key event listeners
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);

    function onKeyDown(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                moveForward = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                moveBackward = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                moveRight = true;
                break;
        }
    }
    
    function onKeyUp(event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                moveBackward = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                moveRight = false;
                break;
        }
    }

    function setAction(toAction) {
        if (toAction !== activeAction) {
            previousAction = activeAction;
            activeAction = toAction;
    
            previousAction.fadeOut(0.5);
            activeAction.reset();
            activeAction.fadeIn(0.5);
            activeAction.play();
        }
    }


    let previousTime = 0;
    function render(currentTime) {
        currentTime *= 0.001; // Convert time to seconds
        const deltaTime = currentTime - previousTime;
        previousTime = currentTime;
    
        const delta = deltaTime;

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        if (player) {
            // Update player position
            const speed = 2.0;
            if (moveForward) player.position.z -= speed * delta;
            if (moveBackward) player.position.z += speed * delta;
            if (moveLeft) player.position.x -= speed * delta;
            if (moveRight) player.position.x += speed * delta;
    
            // Update player rotation
            if (moveForward || moveBackward || moveLeft || moveRight) {
                const direction = new THREE.Vector3();
                direction.set(
                    (moveRight ? 1 : 0) - (moveLeft ? 1 : 0),
                    0,
                    (moveBackward ? 1 : 0) - (moveForward ? 1 : 0)
                ).normalize();
    
                if (direction.length() > 0) {
                    player.rotation.y = Math.atan2(direction.x, direction.z);
                }
            }
    
            // Switch between walking and idle animations
            if (!moveForward && !moveBackward && !moveLeft && !moveRight) {
                setAction(idleAction);
                controls.target.set(player.position.x, player.position.y, player.position.z);
                controls.update();
            } else {
                setAction(walkAction);
                const relativeCameraOffset = new THREE.Vector3(0, 5, -10);
                const cameraOffset = relativeCameraOffset.applyMatrix4(player.matrixWorld);
                camera.position.lerp(cameraOffset, 0.1);
                camera.lookAt(player.position);
            }
    
            // Update animation
            if (sheepMixer) sheepMixer.update(delta);

 
        }
        
        // Animate sun and moon
        const sunPosition = getCircularPosition(currentTime, 50, 0, 0.1);
        sun.position.set(sunPosition.x, sunPosition.y, sunPosition.z);
        sunLight.position.set(sunPosition.x, sunPosition.y, sunPosition.z);
        
        moon.position.set(-sunPosition.x, -sunPosition.y, -sunPosition.z);
        moonLight.position.set(-sunPosition.x, -sunPosition.y, -sunPosition.z);
        
        // Interpolate light intensity
        const sunIntensity = Math.max(0, Math.sin(currentTime * 0.1));
        const moonIntensity = Math.max(0, Math.sin(currentTime * 0.1 + Math.PI));
        sunLight.intensity = sunIntensity;
        moonLight.intensity = moonIntensity;
    
        // Blend light colors based on intensity
        const blendedColor = blendColors(new THREE.Color(0xffff00), new THREE.Color(0x8888ff), moonIntensity);
        sunLight.color = blendedColor;
    
        // Adjust the factor to make the night color show up faster
        const skyTransitionFactor = Math.pow(moonIntensity, 0.2);
    
        // Update sky color based on sun intensity
        const skyColorDay = new THREE.Color(0xb1e1ff);
        const skyColorNight = new THREE.Color(0x000033);
        sky.material.color = blendColors(skyColorDay, skyColorNight, skyTransitionFactor);
        sky.material.needsUpdate = true;
    
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    
    

    function getCircularPosition(time, radius, zOffset, speed) {
        return {
            x: Math.cos(time * speed) * radius,
            y: Math.sin(time * speed) * radius,
            z: zOffset,
        };
    }

    function blendColors(color1, color2, blendFactor) {
        return new THREE.Color(
            color1.r * (1 - blendFactor) + color2.r * blendFactor,
            color1.g * (1 - blendFactor) + color2.g * blendFactor,
            color1.b * (1 - blendFactor) + color2.b * blendFactor
        );
    }

    requestAnimationFrame(render);
}

main();
