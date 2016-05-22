// WORLD1.JS
define(['functions'], function(Functions) {

	var module = {
		scene: {},
		renderer: {},
		camera: {},
		controls: {},
		light: {},
		monster: {
			limbs: [],
			constraints: []
		}
	};

	module.init = function() {

		log("World1 module init");

		Physijs.scripts.worker = 'js/vendor/physijs_worker.js';
		Physijs.scripts.ammo = 'ammo.js';

		module.setScene();
		module.setRenderer();
		module.setCamera();
		module.setLight();

		module.setControls();

		// module.makeBackdrop();
		// module.makeGround();
		module.makeMonster();

		window.world = module;

		requestAnimationFrame(module.render);

	}

	module.render = function() {

		module.scene.simulate();
		module.renderer.render(module.scene, module.camera);
		module.controls.update();

		requestAnimationFrame(module.render);

	}

	module.setScene = function() {

		module.scene = new Physijs.Scene;
		// module.scene.setGravity(new THREE.Vector3(0, -5, -0.5));
		module.scene.setGravity(new THREE.Vector3(0, 0, 0));

	}

	module.setRenderer = function() {

		var renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});

		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFShadowMap;
		renderer.shadowMapAutoUpdate = true;
		renderer.setClearColor(0xbcbcbc, 1);

		renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
		renderer.setSize(window.innerWidth, window.innerHeight);

		module.renderer = renderer;

		$('#page').append(module.renderer.domElement);

		window.addEventListener('resize', function () {
			module.renderer.setSize(window.innerWidth, window.innerHeight);
		});

	}

	module.setCamera = function() {

		module.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        module.camera.position.set(2, 4, 10);
        module.camera.lookAt(module.scene.position);

        module.scene.add(module.camera);

		window.addEventListener('resize', function () {
			module.camera.aspect = window.innerWidth / window.innerHeight;
			module.camera.updateProjectionMatrix();
		});

	}

	module.setLight = function() {

		var light = new THREE.DirectionalLight(0xffffff);

		light.position.set(0, 100, 60);
		light.castShadow = true;
		light.shadow.camera.left = -60;
		light.shadow.camera.top = -60;
		light.shadow.camera.right = 60;
		light.shadow.camera.bottom = 60;
		light.shadow.camera.near = 1;
		light.shadow.camera.far = 1000;
		light.shadow.bias = -.0001
		light.shadow.mapWidth = light.shadow.mapHeight = 1024;

		module.scene.add(light);

	}

	module.setControls = function() {

		module.controls = new THREE.OrbitControls(module.camera, module.renderer.domElement);

	}

	module.makeBackdrop = function() {

		$('#page').css('background-image', 'url(elements/moon1.jpg)');

	}

	module.makeGround = function() {

		var jsonLoader = new THREE.JSONLoader();

		jsonLoader.load('elements/landscape.json', function(geometry) {

			var material = Physijs.createMaterial(new THREE.MeshPhongMaterial({
				shading: THREE.FlatShading
			}), 0.4, 0.6);

			var floor = new Physijs.ConcaveMesh(geometry, material, 0);
			var normals = new THREE.FaceNormalsHelper(floor, 2, 0x00ff00, 1);

			floor.geometry.dynamic = true;
			floor.receiveShadow = true;

			module.scene.add(floor);
			module.scene.add(normals);

		});

	}

	module.makeMonster = function() {

		// BODY

		var geometry = new THREE.BoxGeometry(1, 1, 1);
		var material = Physijs.createMaterial(new THREE.MeshLambertMaterial({
			color: 0xff0000
		}), 0.4, 0.8);
		var body = new Physijs.BoxMesh(geometry, material, 0.5);

		body.geometry.dynamic = true;
		body.castShadow = true;

		body.position.x = 0;
		body.position.y = 2;
		body.position.z = 0;

		module.scene.add(body);
		module.monster.limbs.push(body);

		// LEG 1

		var geometry = new THREE.BoxGeometry(1, 1.5, 1);
		var material = Physijs.createMaterial(new THREE.MeshLambertMaterial({
			color: 0xff0000
		}), 0.4, 0.8);
		var leg1 = new Physijs.BoxMesh(geometry, material, 0.5);

		leg1.geometry.dynamic = true;
		leg1.castShadow = true;

		leg1.position.x = 0;
		leg1.position.y = 2;
		leg1.position.z = -1;

		module.scene.add(leg1);
		module.monster.limbs.push(leg1);

		// CONSTRAINT 1

		var constraint1 = new Physijs.HingeConstraint(body, leg1, new THREE.Vector3(0, 2, -0.5), new THREE.Vector3(0, 0, 1));

		module.scene.addConstraint(constraint1);
		module.monster.constraints.push(constraint1);

		constraint1.setLimits(-90*Math.PI/180, 90*Math.PI/180, 0.1, 0);
		constraint1.enableAngularMotor(1, 10);

		// LEG 2

		var geometry = new THREE.BoxGeometry(1, 1, 1);
		var material = Physijs.createMaterial(new THREE.MeshLambertMaterial({
			color: 0xff0000
		}), 0.4, 0.8);
		var leg2 = new Physijs.BoxMesh(geometry, material, 0.5);

		leg2.geometry.dynamic = true;
		leg2.castShadow = true;

		leg2.position.x = 1;
		leg2.position.y = 2.25;
		leg2.position.z = -1;

		module.scene.add(leg2);
		module.monster.limbs.push(leg2);

		// CONSTRAINT 2

		var constraint2 = new Physijs.HingeConstraint(leg1, leg2, new THREE.Vector3(0.5, 2, -1), new THREE.Vector3(1, 0, 0));

		module.scene.addConstraint(constraint2);
		module.monster.constraints.push(constraint2);

		constraint2.setLimits(-90*Math.PI/180, 90*Math.PI/180, 0.1, 0);
		constraint2.enableAngularMotor(1, 10);

	}

	return module;

});