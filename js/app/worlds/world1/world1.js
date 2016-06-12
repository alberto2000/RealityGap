// WORLD1.JS
define(['functions', 'socketio'], function(Functions, io) {

	var module = {
		scene: {},
		renderer: {},
		camera: {},
		controls: {},
		light: {},
		floor: {},
		monster: {
			limbs: [],
			constraints: []
		},
		socket: {},
		cameraRotation: false
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
		module.makeGround();
		module.makeFabric();
		module.makeMonster();

		window.world = module;

		requestAnimationFrame(module.render);

		module.socketInit();

	}

	module.socketInit = function() {

		module.socket = io();

		module.socket.on('status-update', function(data) {
			log("status-update:");
			log(data);
		});

		module.socket.on('motor-update', function(data) {

			var motorCount = module.monster.constraints.length;
			var motorId = data.motorId;

			if ((motorId + 1) > motorCount) {
				return false;
			}

			var motor = module.monster.constraints[motorId];
			var newPosition = data.newPosition;
			var newSpeed = data.newSpeed;
			var calcSpeed = newSpeed / 10;
			var pre = 1;

			if (newPosition < motor.lastPosition) pre = -1;

			log("motor" + motorId + " to " + newPosition);

			motor.enableAngularMotor(pre * calcSpeed, 10);

			motor.lastPosition = newPosition;

		});

	}

	module.render = function() {

		module.scene.simulate();
		module.renderer.render(module.scene, module.camera);
		module.controls.update();

		if (module.cameraRotation) {

			var timer = Date.now() * 0.0001;

			module.camera.position.x = Math.cos(timer) * 200;
			module.camera.position.y = 100;
			module.camera.position.z = Math.sin(timer) * 200;
			module.camera.lookAt(new THREE.Vector3(0, -2, 0));

		}

		requestAnimationFrame(module.render);

	}

	module.setScene = function() {

		module.scene = new Physijs.Scene();
		module.scene.setGravity(new THREE.Vector3(0, -5, -0.5));
		// module.scene.setGravity(new THREE.Vector3(0, 0, 0));

	}

	module.setRenderer = function() {

		var renderer = new THREE.WebGLRenderer({
			antialias: false
		});

		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFShadowMap;
		renderer.shadowMapAutoUpdate = true;
		renderer.setClearColor(0x000000, 1);

		renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
		renderer.setSize(window.innerWidth, window.innerHeight);

		module.renderer = renderer;

		$('#page').append(module.renderer.domElement);

		window.addEventListener('resize', function () {
			module.renderer.setSize(window.innerWidth, window.innerHeight);
		});

	}

	module.setCamera = function() {

		module.camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, -500, 1000);
		
		module.camera.position.x = 2;
		module.camera.position.y = 0;
		module.camera.position.z = 2;

		module.camera.zoom = 45;

		module.camera.updateProjectionMatrix();

        module.scene.add(module.camera);

        module.camera.lookAt(new THREE.Vector3(0, -2, 0));

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

			geometry.mergeVertices();

			var material = Physijs.createMaterial(new THREE.MeshNormalMaterial({
				
			}), 1, 0.6);

			var floor = new Physijs.BoxMesh(geometry, material, 0);
			var normals = new THREE.FaceNormalsHelper(floor, 2, 0x00ff00, 1);

			floor.geometry.dynamic = true;
			floor.receiveShadow = true;

			floor.position.y = -2;

			module.floor = floor;

			normals.update();

			module.scene.add(floor);
			module.scene.add(normals);

		});

	}

	module.makeFabric = function() {

		var jsonLoader = new THREE.JSONLoader();

		jsonLoader.load('elements/fabric.json', function(geometry) {

			geometry.mergeVertices();

			var material = Physijs.createMaterial(new THREE.MeshNormalMaterial({
				
			}), 1, 0.6);

			var fabric = new Physijs.BoxMesh(geometry, material, 0);

			fabric.geometry.dynamic = true;
			fabric.receiveShadow = true;

			fabric.position.y = -3.75;

			module.fabric = fabric;

			module.scene.add(fabric);

		});


	}

	module.makeMonster = function() {

		// BODY

		var geometry = new THREE.BoxGeometry(2, 1, 1);
		var material = Physijs.createMaterial(new THREE.MeshNormalMaterial(), 1, 0.1);
		var body = new Physijs.BoxMesh(geometry, material, 0.5);

		body.geometry.dynamic = true;
		body.castShadow = true;

		body.position.x = 0;
		body.position.y = 0;
		body.position.z = 0;

		body.name = 'body';

		module.scene.add(body);

		module.monster.limbs.push(body);

		// LEG 1

		var geometry = new THREE.BoxGeometry(2, 1, 1);
		var material = Physijs.createMaterial(new THREE.MeshNormalMaterial(), 1, 0.1);
		var leg1 = new Physijs.BoxMesh(geometry, material, 0.5);

		leg1.geometry.dynamic = true;
		leg1.castShadow = true;

		leg1.position.x = 1;
		leg1.position.y = -0.5;
		leg1.position.z = 1;

		leg1.name = 'leg1';

		module.scene.add(leg1);

		module.monster.limbs.push(leg1);

		// CONSTRAINT 1

		var constraint1 = new Physijs.HingeConstraint(body, leg1, new THREE.Vector3(0, 0, 0.5), new THREE.Vector3(0, 0, 1));

		constraint1.lastPosition = 90;

		module.scene.addConstraint(constraint1);
		module.monster.constraints.push(constraint1);

		constraint1.setLimits(-90*Math.PI/180, 90*Math.PI/180, 1, 0);

		// LEG 2

		var geometry = new THREE.BoxGeometry(1, 1, 1);
		var material = Physijs.createMaterial(new THREE.MeshNormalMaterial(), 1, 0.1);
		var leg2 = new Physijs.BoxMesh(geometry, material, 0.5);

		leg2.geometry.dynamic = true;
		leg2.castShadow = true;

		leg2.position.x = 1.5;
		leg2.position.y = -0.25;
		leg2.position.z = -0.5;

		leg2.name = 'leg2';

		module.scene.add(leg2);

		module.monster.limbs.push(leg2);

		// CONSTRAINT 2

		var constraint2 = new Physijs.HingeConstraint(body, leg2, new THREE.Vector3(1, -0.25, -0.5), new THREE.Vector3(1, 0, 0));

		constraint2.lastPosition = 90;

		module.scene.addConstraint(constraint2);
		module.monster.constraints.push(constraint2);

		constraint2.setLimits(-90*Math.PI/180, 90*Math.PI/180, 1, 0);
		constraint2.enableAngularMotor(1, 10);

		// LEG 3

		var geometry = new THREE.BoxGeometry(1, 1, 1);
		var material = Physijs.createMaterial(new THREE.MeshNormalMaterial(), 1, 0.1);
		var leg3 = new Physijs.BoxMesh(geometry, material, 0.5);

		leg3.geometry.dynamic = true;
		leg3.castShadow = true;

		leg3.position.x = -1;
		leg3.position.y = -0.25;
		leg3.position.z = -1;

		leg3.name = 'leg3';

		module.scene.add(leg3);

		module.monster.limbs.push(leg3);

		// CONSTRAINT 3

		var constraint3 = new Physijs.HingeConstraint(body, leg3, new THREE.Vector3(-1, -0.25, -0.5), new THREE.Vector3(0, 0, 1));

		constraint3.lastPosition = 90;

		module.scene.addConstraint(constraint3);
		module.monster.constraints.push(constraint3);

		constraint3.setLimits(-90*Math.PI/180, 90*Math.PI/180, 1, 0);

		// LEG 4

		var geometry = new THREE.BoxGeometry(1, 2, 1);
		var material = Physijs.createMaterial(new THREE.MeshNormalMaterial(), 1, 0.1);
		var leg4 = new Physijs.BoxMesh(geometry, material, 0.5);

		leg4.geometry.dynamic = true;
		leg4.castShadow = true;

		leg4.position.x = -2;
		leg4.position.y = 0.75;
		leg4.position.z = -1.25;

		leg4.name = 'leg4';

		module.scene.add(leg4);

		module.monster.limbs.push(leg4);

		// CONSTRAINT 4

		var constraint4 = new Physijs.HingeConstraint(leg3, leg4, new THREE.Vector3(-1.5, 0.25, -1.25), new THREE.Vector3(1, 0, 0));

		constraint4.lastPosition = 90;

		module.scene.addConstraint(constraint4);
		module.monster.constraints.push(constraint4);

		constraint4.setLimits(-90*Math.PI/180, 90*Math.PI/180, 1, 0);

	}

	return module;

});